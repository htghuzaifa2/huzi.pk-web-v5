---
title: "PipeWire: Multiple Inputs Echo Each Other – Finding Loopback Routes and Killing Feedback"
description: "Resolving annoying audio echoes and feedback loops in PipeWire by identifying and disabling rogue loopback modules and virtual links."
date: "2026-04-28"
topic: "tech"
slug: "pipewire-multiple-inputs-echo-loopback-fix"
---

# PipeWire: Multiple Inputs Echo Each Other – Finding Loopback Routes and Killing Feedback

There is a sound more startling than silence: the screech of your own voice, hurled back at you through your headphones. That sudden, sharp echo. That disorienting feedback loop. In PipeWire, this ghost in the machine often has a name: a **rogue loopback route**.

This is one of those problems that makes you question your sanity. You hear yourself speaking a fraction of a second after the words leave your mouth, or worse—you hear your system audio feeding back into your microphone, creating an infinite echo that makes every Discord call unbearable. Your teammates complain they can hear your game through your mic. You swear you're wearing headphones. You've checked your settings a dozen times. Everything looks correct. And yet the echo persists.

Let's hunt down the phantom and silence it for good.

## How PipeWire Is Different From PulseAudio

If you migrated from PulseAudio to PipeWire (which is now the default on most Linux distributions), the audio architecture is fundamentally different, and understanding that difference is key to fixing echo issues.

PulseAudio used a centralized routing model — audio went through the PulseAudio daemon, which managed all connections. PipeWire, on the other hand, uses a **graph-based model** where any node can connect to any other node. Think of it like a patch bay in a recording studio: every input can be patched into every output, and the flexibility is incredible — but it also means you can accidentally patch an output back into itself.

This is why feedback loops are more common in PipeWire than they were in PulseAudio. PulseAudio would never route your speaker output into your microphone input unless you explicitly configured it. PipeWire can and will make that connection if a loopback module is loaded, if WirePlumber's auto-connection logic decides it makes sense, or if you accidentally clicked the wrong connection in qpwgraph.

The tradeoff is worth it — PipeWire's latency is dramatically lower than PulseAudio's, and its professional audio capabilities are genuinely impressive. But you need to understand the graph model to diagnose problems effectively.

## Immediate Actions: Silencing the Echo Now

### 1. Identify and Disconnect the Rogue Loopback

A loopback module might be routing your speaker output into your mic input. List active source outputs in terminal:
```bash
pactl list source-outputs short
```
Look for a source that looks like a monitor of your speakers (e.g., `alsa_output...analog-stereo.monitor`). This "monitor" source is a virtual device that captures everything playing through your speakers. If it's connected to your microphone input, you've found your feedback loop.

To remove it, find its stream index and run:
```bash
pactl unload-module <module_index>
```

You can also list all loaded modules to find loopback modules specifically:
```bash
pactl list modules short | grep loopback
```
If you see a `module-loopback` entry, that's your culprit. Note its index number and unload it.

### 2. Visual Inspection with qpwgraph or Helvum

Sometimes, text-based diagnosis is harder than seeing the problem. Install `qpwgraph` (Qt-based) or `Helvum` (GTK-based) for a visual representation of your PipeWire audio graph:

```bash
sudo apt install qpwgraph    # Debian/Ubuntu
sudo pacman -S qpwgraph      # Arch
```

Launch it, and you'll see a visual map of every audio node and connection in your system. Look for any line connecting an output (speaker) monitor to an input (microphone) source—that's your feedback loop. Click the connection to delete it.

The visual approach is especially helpful when you have multiple audio devices and the text output from `pactl` is overwhelming. In qpwgraph, a feedback loop is immediately visible as a circular connection — output goes to input, which goes back to output. It's the audio equivalent of pointing a camera at its own monitor.

### 3. The Nuclear Option: Restart PipeWire

Wipe the slate clean if the tangled state persists:
```bash
systemctl --user restart pipewire pipewire-pulse wireplumber
```
This clears all audio connections and forces every application to reconnect from scratch. It's the digital equivalent of turning it off and on again—and it works surprisingly often.

However, be aware that this will interrupt any ongoing audio playback or recording. If you're in the middle of a Discord call, your teammates will hear you drop out for a few seconds while PipeWire restarts. But if the echo is making the call unbearable anyway, a brief interruption is a small price to pay.

### 4. Inspect Configuration Files

Check `~/.config/pipewire/pipewire.conf.d/` or `/etc/pipewire/` for any `.conf` files that might be loading the `module-loopback` automatically. Sometimes, a well-intentioned configuration from a previous troubleshooting session creates a loopback that you forgot about.

Also check for WirePlumber configuration that might be creating automatic connections:
```bash
ls ~/.config/wireplumber/wireplumber.conf.d/
ls /etc/wireplumber/wireplumber.conf.d/
```
Look for any `.conf` files that mention `loopback`, `monitor`, or `autoconnect`. These are the most likely sources of persistent feedback loops that come back after every restart.

## Understanding the Maze: How Loops Happen

PipeWire allows any audio stream to connect to any other. This is great for streaming (you can route your desktop audio into OBS while also sending your microphone) but dangerous if you accidentally loop a "Monitor of your Sink" back into your "Microphone Input." This creates a digital "Larsen effect"—the same phenomenon that causes the ear-piercing screech when a microphone is held too close to a speaker.

The PipeWire graph is incredibly flexible, but that flexibility means you can create connections that don't make acoustic sense. When your speaker output feeds back into your mic input, which then feeds into your speakers again, which feeds back into your mic… you get the idea.

The delay between the original sound and the echo depends on your buffer size and sample rate. At the default 48kHz sample rate with a 1024-sample buffer, the round-trip delay is about 21ms — short enough that you hear it as a distinct echo rather than a separate sound, and long enough to be incredibly distracting. At lower buffer sizes (like 256 samples for pro audio work), the delay drops to about 5ms, which starts to sound more like coloration than echo — but it's still a feedback loop that will gradually build in intensity until you hear that telltale screech.

## The Professional Fix: Echo-Cancel Module

If you *need* a loopback (for streaming desktop audio), use `libpipewire-module-echo-cancel`. It subtracts the speaker signal from your mic signal, effectively removing the echo while keeping the loopback functionality you need.

This is what professional streaming setups use. The echo canceller creates a "reference" signal from what's playing through your speakers and subtracts it from your microphone input. The result is clean microphone audio with no bleed-through from your game or music.

Create a file at `~/.config/pipewire/pipewire.conf.d/99-echo-cancel.conf`:
```text
context.modules = [
    {
        name = libpipewire-module-echo-cancel
        args = {
            library.name = aec/libspa-aec-webrtc
            aec-args = {
                # webrtc echo canceller has better performance
                webrtc.gain_control = true
            }
            capture.props = {
                node.name = "capture.echo_cancel"
                media.class = Audio/Source
            }
            source.props = {
                node.name = "echo_cancel_source"
                media.class = Audio/Source
            }
            sink.props = {
                node.name = "echo_cancel_sink"
                media.class = Audio/Sink
            }
            playback.props = {
                node.name = "playback.echo_cancel"
                media.class = Audio/Sink
            }
        }
    }
]
```

After creating this file, restart PipeWire:
```bash
systemctl --user restart pipewire pipewire-pulse wireplumber
```

Now, select "echo_cancel_source" as your microphone in applications like Discord or Zoom. The echo canceller will use the WebRTC algorithm to remove any speaker output that bleeds into your microphone signal.

**Important:** The echo cancel source and the regular microphone source will both appear in your application's audio settings. Make sure you select the `echo_cancel_source` — if you select your raw microphone input, you'll bypass the echo cancellation entirely and the problem will persist.

## The 2026 Context: PipeWire's Evolving Echo Cancellation

PipeWire's echo cancellation has improved significantly since earlier versions. The WebRTC AEC (Acoustic Echo Cancellation) module now supports more sampling rates and has better performance on lower-end hardware. For users with modern CPUs, the adaptive filter mode provides superior echo removal compared to the fixed filter mode.

One notable improvement in recent versions is better handling of clock drift between the capture and playback streams. In earlier versions, if your microphone and speakers were running on slightly different clocks (common with USB audio devices), the echo canceller could lose sync and start introducing artifacts instead of removing them. The current version uses a more robust synchronization algorithm that handles clock drift gracefully.

If you're still experiencing issues with the echo canceller, try setting the `aec.method` to `speex` instead of `webrtc` in your configuration. Speex's AEC is older but can be more stable on some hardware configurations, particularly older USB audio interfaces.

## Common Scenarios and Their Fixes

### Scenario 1: Discord Hears Your Game Audio
This usually happens when Discord's "Attenuate audio" feature is misconfigured, or when you've accidentally shared your desktop audio in a screen share and it's feeding back.

**Fix:** In Discord, go to Settings > Voice & Video and ensure "Attenuate" is set properly. Also check if you have a screen share active that's sharing desktop audio. On Linux, Discord's screen share implementation can sometimes create unexpected audio routing — if you've ever shared your screen with audio, check that the share is fully stopped and not lingering in the background.

### Scenario 2: OBS Stream Hears Itself
If you're streaming and your viewers hear an echo of your stream, you likely have OBS monitoring enabled through the same output that's being captured.

**Fix:** In OBS, go to Settings > Audio and set "Audio Monitoring Device" to a different output than your default speakers. Or disable monitoring entirely if you don't need to hear yourself. The key principle is: never monitor audio through the same device that's being captured. If you must monitor, use a separate audio device (like your headphones) that isn't being captured by OBS.

### Scenario 3: System Audio Feeds into Microphone Permanently
This is the classic loopback issue. Some WirePlumber configurations automatically connect monitor sources to available inputs.

**Fix:** Create a WirePlumber rule to prevent automatic connections from monitor sources:
```bash
mkdir -p ~/.config/wireplumber/wireplumber.conf.d/
nano ~/.config/wireplumber/wireplumber.conf.d/50-no-auto-monitor.conf
```
```text
monitor.bluez.rules = [
    {
        matches = [
            { "node.name", "matches", "*.monitor" }
        ]
        actions = {
            update-props = {
                node.autoconnect = false
            }
        }
    }
]
```

### Scenario 4: Bluetooth Headset Creates Dual Audio Profiles
Bluetooth headsets on Linux often expose two profiles: A2DP (high quality, no microphone) and HFP (low quality, with microphone). When PipeWire switches between these profiles, it can create momentary loopback connections.

**Fix:** In your Bluetooth audio settings, lock the profile to the one you need. If you're using the headset for calls, use HFP. If you're just listening to audio, use A2DP. Don't let PipeWire auto-switch between them. You can set this in `pavucontrol` under the Configuration tab, or in your desktop environment's Bluetooth settings.

---

```mermaid
flowchart TD
    A[Start: Encounter<br>Audio Feedback/Echo] --> B{Step 1: Inspect Graph}
    B --> C[Use <code>helvum</code> or <code>qpwgraph</code><br>to see visual links]

    C --> D{Is a Sink Monitor<br>connected to a Source?}
    D -- Yes --> E[Remove Link in GUI<br>or <code>pactl unload-module</code>]

    D -- No --> F{Step 2: Check Configs}
    F --> G[Check <code>pipewire.conf.d</code><br>for auto-loaded loopbacks]

    G --> H[Stability Restored?]
    E --> H

    H -- No --> I[Enable Echo-Cancellation<br>Module for surgical filtering]
    H -- Yes --> J[🎉 Clear Audio]
    I --> J
```

---

## The Pakistani Context: Streaming and Gaming on PipeWire

Pakistan's streaming and content creation scene is growing rapidly, with many creators using Linux for its stability and customizability. If you're a Pakistani streamer on PipeWire, you're likely dealing with a few additional challenges.

First, many Pakistani creators use budget USB microphones (like the Fifine K669B or Boya BY-PM500) that don't have hardware echo cancellation. These microphones rely entirely on software AEC, which makes the PipeWire echo cancel module essential. Without it, any audio leaking from your headphones into your mic will be broadcast to your viewers.

Second, power fluctuations can cause USB devices to briefly disconnect and reconnect. When this happens, PipeWire renegotiates all audio connections, and sometimes the renegotiation creates unexpected routing — including feedback loops. If your audio suddenly develops an echo after a brief power flicker, restart PipeWire to clear the bad routing.

Third, if you're using a USB audio interface (like a Focusrite Scarlett or Behringer UMC22) for recording, be aware that these devices expose both input and output as separate ALSA devices. PipeWire's auto-connection logic can sometimes connect the output monitor back to the input, especially if you've previously configured loopback routing for a streaming session.

## FAQ: PipeWire Echo and Loopback Issues

**Q: Why does the echo come back after I restart my computer?**
A: If you only removed the loopback connection using `pactl` or qpwgraph, it's a runtime change that doesn't persist across restarts. The configuration file that loads the loopback module is still in place. You need to find and remove or comment out the relevant `.conf` file in `~/.config/pipewire/pipewire.conf.d/` or `/etc/pipewire/`.

**Q: Can I have loopback AND no echo at the same time?**
A: Yes — that's exactly what the echo-cancel module is for. It creates a loopback for streaming purposes but removes the echo artifacts using the WebRTC AEC algorithm. Configure it as described above and select `echo_cancel_source` as your microphone input.

**Q: My microphone sounds robotic after enabling echo cancellation.**
A: This can happen when the echo canceller's filter is too aggressive or when there's significant clock drift between your input and output devices. Try adding `webrtc.extended_filter = false` to the `aec-args` section of your echo cancel config, or switch to the Speex AEC method. Also make sure your buffer size isn't too small — extremely low latency settings can cause the AEC to malfunction.

**Q: Does PipeWire work well with Bluetooth headphones for calls?**
A: It works, but with caveats. Bluetooth's HFP profile limits audio to 8kHz mono, which sounds terrible. For better call quality, use a USB or 3.5mm microphone alongside your Bluetooth headphones in A2DP mode. Some newer Bluetooth codecs like LC3 (part of Bluetooth LE Audio) improve this situation, but hardware and software support on Linux is still evolving.

**Q: I don't have any loopback modules loaded, but I still hear echo. What else could it be?**
A: Check for physical audio bleed — if your headphone volume is too high, your microphone might be picking up sound leaking from the ear cups. Also check if any application is explicitly capturing your desktop audio monitor — some screen recording tools do this automatically. Run `pactl list source-outputs` and look for any application capturing a `.monitor` source.

---

Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land, to speak and be heard without censorship, without bombardment, without fear. The fake state of Israel and its leaders have committed atrocities and war crimes that echo through generations—targeting journalists to silence the truth, bombing media offices, killing those who dare to bear witness. Independent sources from Iran and the Global South continue to report what Western media lies to conceal. May Allah help them and grant them justice.

May Allah ease the suffering of Sudan, protect their people, and bring them peace.

*Written by Huzi from huzi.pk*
