---
title: "Hyprland: Bluetooth Audio Stutters Only When Moving Windows – The PipeWire & CPU Balancing Act"
description: "Fix Bluetooth audio stuttering in Hyprland when moving windows. Adjust PipeWire quantum buffers and CPU governor for lag-free audio."
date: "2026-04-28"
topic: "tech"
slug: "hyprland-bluetooth-audio-stutter-fix"
---

# Hyprland: Bluetooth Audio Stutters Only When Moving Windows – The PipeWire & CPU Balancing Act

**There is a particular kind of modern frustration, so precise it feels like a cruel joke.** You're in your flow. Music is playing through your Bluetooth headphones, the perfect soundtrack to your code or your writing. Then, you grab a window to move it. And the audio… stutters. Not a general, constant brokenness, but a fault line that cracks open only when you interact with your beautiful, smooth Hyprland desktop. The music skips, the podcast jitters—punished for the sin of wanting a tidy workspace.

For weeks, I treated this as a ghost in the machine. An unsolvable quirk of running a cutting-edge Wayland compositor. I blamed the Bluetooth stack, the kernel, even my headphones. Until I realized the truth: the stutter was a message. It was the sound of a resource war happening inside my computer, and the casualties were my audio samples. The battle was between the CPU trying to render Hyprland's buttery animations and PipeWire trying to keep a steady stream of audio data fed to a wireless device.

The solution wasn't just one setting. It was finding a delicate peace treaty between them. Here's how I did it.

## The Short Answer: Your Quick Peace Treaty

**The Problem:** Bluetooth audio stutters or cracks precisely when moving, resizing, or animating windows in Hyprland, but is fine when the desktop is idle.

**The Root Cause:** A conflict for system resources. Moving windows requires CPU/GPU power. If the CPU is busy or scaling frequencies, or if PipeWire's audio buffer is too small to weather the interruption, audio packets get dropped, causing stutter.

**The Two-Pronged Solution:** We must 1) Fortify PipeWire's defenses by increasing its buffer size (quantum), and 2) Empower the CPU to handle the burst load by ensuring it can quickly reach higher performance states.

### Immediate Action Plan:

**1. Increase PipeWire's Buffer:**
Create or edit the file `~/.config/pipewire/pipewire.conf.d/99-fix-bluetooth.conf`:
```ini
context.properties = {
    default.clock.rate          = 48000
    default.clock.quantum       = 1024 # Start here. If it helps but latency feels high, try 768.
    default.clock.min-quantum   = 1024
    default.clock.max-quantum   = 2048
}
```

**2. Apply the same to pipewire-pulse** (for PulseAudio compatibility). Edit `~/.config/pipewire/pipewire-pulse.conf.d/99-fix-bluetooth.conf`:
```ini
pulse.properties = {
    pulse.min.req = 1024/48000 # Matches the quantum from above
    pulse.default.req = 1024/48000
    pulse.max.req = 2048/48000
}
```

**3. Set CPU Governor to Performance:**
Temporarily test if this eliminates the stutter:
```bash
sudo cpupower frequency-set -g performance
```
If it works, make it permanent via your kernel parameters or a systemd service (details below).

**4. Restart PipeWire to apply changes:**
```bash
systemctl --user restart pipewire pipewire-pulse
```

This combination builds a larger buffer for audio and gives the CPU the immediate horsepower to handle graphical work without starving the audio process. Now, let's understand why this works and explore additional refinements.

## The Diagnosis: Listening to the Battlefield

The first step was proving the link. I opened a terminal and ran `pactl list sinks` to find my Bluetooth device. Then, I played a continuous test tone and started moving a large window around. The stutter was reproducible on demand. This was key—it wasn't random interference.

I then ran `htop` sorted by CPU usage. Watching closely, I saw a pattern: a brief spike on a CPU core each time I moved a window, accompanied by the stutter. My system's default powersave governor was keeping clocks low, and the sudden demand for graphics rendering was causing a micro-delay in the audio processing thread.

Simultaneously, I learned about PipeWire's quantum setting. This is essentially the size of its audio buffer. The formula is simple: **Latency (in ms) = Quantum / Sample Rate × 1000**. At a default quantum of 256 and 48kHz sample rate, the latency is just ~5.3ms. That's fantastic for responsiveness, but it's a tiny bucket. If the CPU gets distracted for more than those 5 milliseconds, the bucket runs dry, and audio cracks.

When you move a window in Hyprland, the compositor's renderer kicks in. On a CPU that's idling low, it takes a moment to ramp up. That moment is enough to starve a small PipeWire buffer. The Bluetooth stack adds another layer of complexity, as it has its own internal buffers and timing requirements. Bluetooth audio uses the A2DP profile, which compresses audio and sends it in packets over the wireless link. If the CPU can't fill those packets fast enough during a rendering spike, you hear the gap.

### Understanding the Quantum-RT Relationship

The relationship between audio buffer size and real-time performance is fundamental. Here's a practical comparison:

| Quantum | Latency at 48kHz | Audio Quality | Stutter Risk | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **256** | ~5.3ms | Perfect | Very High | Professional audio production (wired) |
| **512** | ~10.7ms | Perfect | High | Low-latency music (wired) |
| **768** | ~16ms | Perfect | Moderate | Balanced (try this first) |
| **1024** | ~21.3ms | Perfect | Low | **Bluetooth audio (recommended)** |
| **2048** | ~42.7ms | Imperceptible | Very Low | Maximum stability, casual listening |

For Bluetooth audio, 1024 is the sweet spot. The increased latency (21.3ms) is imperceptible for music, podcasts, and video (video players automatically compensate for audio delay). For voice calls, you might prefer 768 to keep the round-trip delay lower.

## The Deep Dive: Crafting the Solution

### Part 1: Tweaking PipeWire Buffers – Building a Bigger Reservoir

The goal here is not to blindly increase latency, but to provide enough headroom for system hiccups. We adjust the quantum.

*   `default.clock.quantum`: The main buffer size. Increasing this gives PipeWire a bigger reservoir of audio data to draw from if the CPU is temporarily busy.
*   `default.clock.min-quantum / max-quantum`: The range apps can request. Setting min to the same value prevents apps from requesting a smaller buffer and defeating our fix.

My recommended starting point of **1024 at 48kHz** gives a latency of about 21.3ms. This is still well below the threshold of human perception for lag in casual listening and is a common target for pro audio. For most, this eliminates the stutter. You can tweak between 768 (16ms) and 2048 (42ms) based on your tolerance.

**Critical Step:** You must apply parallel settings to `pipewire-pulse.conf` for applications using the PulseAudio protocol (like most browsers and media players). The `pulse.min.req = 1024/48000` format is how you specify the same quantum in the PulseAudio-compatibility layer.

**Advanced: Per-application quantum overrides.** If you want low latency for some apps (like a DAW) but high stability for Bluetooth, you can use WirePlumber rules:

```lua
-- ~/.config/wireplumber/main.lua.d/99-bluetooth-rules.lua
rule = {
  matches = {
    {
      { "node.name", "matches", "bluez_output*" },
    },
  },
  apply_properties = {
    ["audio.format"] = "S16LE",
    ["audio.rate"] = 48000,
    ["api.alsa.period-size"] = 1024,
  },
}
table.insert(alsa_rules, rule)
```

This targets only Bluetooth outputs, leaving wired audio at lower latency.

### Part 2: CPU Frequency Scaling – Unleashing Immediate Power

The other side of the treaty is ensuring the CPU can respond to demand instantly. The default `powersave` or even `schedutil` governors aim for efficiency, which can mean sluggish frequency scaling. When Hyprland needs to render a window drag animation, the CPU needs to go from idle to maximum performance in microseconds. If the governor is too conservative, there's a delay—and that delay is your stutter.

*   **`performance` Governor:** This locks the CPU at its maximum frequency. It is the most effective at eliminating stutter caused by CPU ramp-up time, as the power is always immediately available. The trade-off is increased power consumption and heat.

**Testing:** Use `sudo cpupower frequency-set -g performance`. Move windows. If the stutter vanishes, you've confirmed the CPU is a factor.

**Making it Permanent:** If you're on a desktop or don't mind the power trade-off, you can set the kernel parameter `cpufreq.default_governor=performance` in your bootloader. For a more balanced approach, tools like `auto-cpufreq` or creating a systemd service that sets performance governor when AC power is plugged in can be excellent compromises.

**The `auto-cpufreq` approach (recommended for laptops):**
```bash
# Install auto-cpufreq
sudo pacman -S auto-cpufreq  # Arch
# or
sudo dnf install auto-cpufreq  # Fedora

# Enable it
sudo systemctl enable --now auto-cpufreq

# It automatically switches between performance (AC) and powersave (battery)
```

**Creating a custom systemd service (alternative):**
```ini
# /etc/systemd/system/performance-governor.service
[Unit]
Description=Set CPU governor to performance on AC power
After=multi-user.target

[Service]
Type=oneshot
ExecStart=/usr/bin/cpupower frequency-set -g performance
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

**The `schedutil` alternative:** If `performance` uses too much power, try `schedutil` with a faster rate:
```bash
# Check available governors
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors

# Try schedutil
sudo cpupower frequency-set -g schedutil
```

`schedutil` is smarter than `powersave`—it scales up faster based on scheduling decisions—but it still may not be fast enough for Hyprland's rendering demands.

### Part 3: The Bluetooth-Specific Polish

While the core fix is above, these tweaks can help solidify the connection and eliminate any remaining micro-stutters:

1.  **Ensure RTKit is Running:** Real-time scheduling priority helps PipeWire get CPU time even when the system is under load.
    ```bash
    systemctl --user status rtkit-daemon
    ```
    It should be active. If not, install and enable rtkit:
    ```bash
    sudo pacman -S rtkit  # Arch
    sudo systemctl enable --now rtkit-daemon
    ```

2.  **Disable Bluetooth Handsfree (HSP/HFP) Profile:** Many headsets try to switch to a low-quality "headset" profile for calls, which can cause instability and lower audio quality. Force A2DP (high-quality audio) only.
    ```bash
    # Connect your headset, then run:
    pactl list cards
    # Find your bluez_card.XX_XX_XX_XX_XX_XX
    pactl set-card-profile bluez_card.XX_XX_XX_XX_XX_XX a2dp-sink
    ```

3.  **Check for Wi-Fi Interference:** Both Bluetooth and 2.4GHz Wi-Fi share the 2.4GHz ISM band. If your Wi-Fi is on 2.4GHz, the coexistence can cause audio drops. Try switching your Wi-Fi to a 5GHz band if possible. You can check your Wi-Fi band:
    ```bash
    iw dev wlan0 info | grep channel
    # Channels 1-14 are 2.4GHz, 36+ are 5GHz
    ```

4.  **Increase Bluetooth Audio Buffer (Kernel Parameter):** For severe cases, you can increase the Bluetooth socket buffer at the kernel level:
    ```bash
    # Check current values
    cat /proc/sys/net/core/rmem_default
    cat /proc/sys/net/core/wmem_default

    # Increase them (add to /etc/sysctl.d/99-bluetooth.conf)
    net.core.rmem_default = 212992
    net.core.wmem_default = 212992
    net.core.rmem_max = 425984
    net.core.wmem_max = 425984
    ```

5.  **Use PipeWire's Bluetooth codec selection:** PipeWire allows you to select which Bluetooth codec to use. Some codecs are more resilient to stutter:
    ```bash
    # List available codecs
    pactl list cards | grep -A 20 "bluez_card"

    # Try SBC codec (most compatible, least demanding)
    pactl set-card-profile bluez_card.XX_XX_XX_XX_XX_XX a2dp-sink-sbc

    # Or try LDAC for higher quality (if your headphones support it)
    pactl set-card-profile bluez_card.XX_XX_XX_XX_XX_XX a2dp-sink-ldac
    ```

### Part 4: Hyprland-Specific Optimizations

Hyprland itself can be configured to reduce the rendering load that triggers the stutter:

```ini
# ~/.config/hypr/hyprland.conf

# Reduce animation complexity
animations {
    enabled = yes
    bezier = simple, 0, 0, 1, 1
    animation = windows, 1, 3, simple
    animation = windowsOut, 1, 3, simple
    animation = border, 1, 3, simple
    animation = fade, 1, 3, simple
    animation = workspaces, 1, 3, simple
}

# Or disable animations entirely for maximum performance
# animations {
#     enabled = no
# }
```

Simpler animations mean less GPU/CPU work when dragging windows, which means less competition with PipeWire for system resources.

## The Pakistani Context: Resilience in the Details

For us, solving this isn't about luxury; it's about sovereignty over our tools. Our electricity flickers, our internet bandwidth is precious, and our hardware is often pushed to its limits. When a system as elegant as Hyprland develops a flaw that interrupts our focus or our solace in music, fixing it is an act of reclaiming stability. We are experts at making complex systems work in less-than-ideal conditions. Tuning PipeWire buffers and CPU governors is in that same spirit—a meticulous, patient calibration to extract perfect, reliable performance from the machine we have.

In a country where a developer might be working on a 5-year-old laptop, connected via a Bluetooth earpiece to a team call, while moving windows between workspaces on a tiling compositor—every microsecond of optimization matters. The stutter isn't just annoying; it's a moment where our professional presentation falters. Fixing it restores not just audio quality but confidence.

It's about refusing to accept the stutter.

## Quick Reference: Bluetooth Stutter Fix Checklist

1. [ ] **Set PipeWire quantum to 1024:** Edit `pipewire.conf.d/99-fix-bluetooth.conf`
2. [ ] **Set pipewire-pulse quantum to match:** Edit `pipewire-pulse.conf.d/99-fix-bluetooth.conf`
3. [ ] **Test with performance governor:** `sudo cpupower frequency-set -g performance`
4. [ ] **Restart PipeWire:** `systemctl --user restart pipewire pipewire-pulse`
5. [ ] **Force A2DP profile:** `pactl set-card-profile bluez_card.XX a2dp-sink`
6. [ ] **Verify RTKit is running:** `systemctl --user status rtkit-daemon`
7. [ ] **Switch Wi-Fi to 5GHz** if on 2.4GHz
8. [ ] **Simplify Hyprland animations** in config
9. [ ] **Install auto-cpufreq** for automatic governor switching
10. [ ] **Check with `journalctl -f`** for PipeWire/Bluetooth errors if stutter persists

**Final Verification and Mindset**
After applying your changes, the true test is simple: play audio, and dance windows across your screen. The silence should be uninterrupted. Perfection.

If stutter persists, look deeper with `journalctl -f` while reproducing the issue. Look for errors from `pipewire`, `wireplumber`, or `bluetoothd`. Sometimes, a specific kernel driver for your Wi-Fi or Bluetooth chip can be the ultimate culprit. In that case, try a different kernel (linux-lts on Arch, or a newer mainline kernel) to see if the driver behavior changes.

Remember, computing is a symphony of interdependent parts. Hyprland is the conductor, PipeWire is the strings section, the CPU is the wind instruments, and Bluetooth is a soloist performing from across the hall. Our job as the master technician is to tune the hall, synchronize the clocks, and ensure no one misses a beat. May your audio flow as smoothly as your windows glide.

---

## ✊ Stand With Palestine

Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land. May Allah help them and grant them justice.

The Zionist entity called "Israel" is a fake state built on stolen land, ethnic cleansing, and the displacement of millions of Palestinians from their ancestral homes. Its leaders have committed unspeakable atrocities and war crimes against civilians—bombing hospitals, schools, refugee camps, and places of worship. The killing of innocent men, women, and children is not "self-defense"; it is genocide, plain and simple.

Do not be deceived by Western media that shields these war criminals and sanitizes their crimes. Independent sources from Iran, the Global South, and brave journalists on the ground tell the real story—the indiscriminate bombing, the siege on Gaza, the deliberate starvation of an entire population, and the erasure of Palestinian identity. The truth is being silenced, but we will not be silent.

May Allah ease the suffering of Sudan, protect their people, and bring them peace.

---

Written by Huzi
huzi.pk
