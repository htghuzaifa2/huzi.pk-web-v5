---
title: "The Hunt for the Phantom Tear: How I Fixed Game Tearing in Hyprland"
description: "Fix screen tearing in Hyprland games on Wayland. Configure 'immediate' vsync mode, disable hardware cursors, and tune NVIDIA settings for tear-free gaming."
date: "2026-04-28"
topic: "tech"
slug: "hyprland-game-tearing-fix"
---

# The Hunt for the Phantom Tear: How I Fixed Game Tearing in Hyprland

**You've finally done it.** Your Hyprland desktop is a masterpiece of silky animations and minimalist beauty. You launch your favorite game, ready to immerse yourself in another world. The title screen loads, the framerate is high, and then… you move the mouse. A jagged, horizontal line tears across the screen, splitting your perfect view like a crack in glass. It's there for just a frame—a phantom flaw that appears only with movement, vanishing when you stand still, mocking your smooth desktop with every turn.

If this ghostly tearing haunts your games, you've met a classic Hyprland puzzle on Wayland. It feels like a regression, a step back to the bad old days of X11. But I promise you, the solution is not only within reach—it's often just a few lines in your config away. After weeks of testing, I found the specific combination of backend settings and vsync modes that banished the tear for good.

This guide covers everything from the immediate fix to a deep understanding of why this happens, so you can not only solve the problem but understand it—and understanding, as any Linux user knows, is the difference between fixing something once and fixing it forever.

## The Immediate Fix: The Config That Stopped the Tearing

For most people, the tearing is caused by a conflict between the game's rendering, Hyprland's compositor timing, and the cursor. Here is the exact configuration that solved it on my system.

Add or change these lines in your `~/.config/hypr/hyprland.conf`:

```bash
# CRITICAL: Use the 'immediate' vsync mode for full-screen games
env = WLR_DRM_NO_ATOMIC,1
env = WLR_NO_HARDWARE_CURSORS,1

# In your monitor section, ensure this is set
monitor=,highrr,auto,1

# In the general section, explicitly set the vsync mode
general {
    # ... your other settings
    vsync = true
}

# For NVIDIA users, an additional layer is often needed
env = __GL_SYNC_TO_VBLANK,1
```

The most important variable here is `WLR_NO_HARDWARE_CURSORS=1`. This forces the use of a software cursor, which was the single biggest factor in eliminating the mouse-movement-induced tear for me. The immediate vsync mode (often activated via `WLR_DRM_NO_ATOMIC` or the `highrr` monitor flag) tells the compositor to flip frames as soon as they are ready, which is crucial for full-screen applications like games.

After making these changes, save the file and fully restart Hyprland (log out and back in). A simple config reload is not sufficient for environment variable changes to take effect.

## Understanding the Ghost: Why Does This Happen?

To banish a problem forever, you must first understand its nature. On traditional X11, screen tearing was common because multiple programs could draw to the screen at any time. Wayland, and compositors like Hyprland, were designed to prevent this. They act as the sole manager of the display, ensuring only one perfectly composed frame is shown at a time.

So why does tearing appear only in games and only when you move the mouse? The culprit is usually one of two intertwined issues:

### 1. The Hardware Cursor Problem
For performance, the system tries to use a "hardware cursor." This is a separate overlay plane on your monitor. When a game takes over the screen in full-screen mode, the timing between the game's frame, the compositor's frame, and this independent cursor plane can fall out of sync. The result is a tear that seems to "follow" your mouse—because the cursor plane is literally out of phase with the game frame beneath it.

This is especially noticeable on high-refresh-rate monitors (144Hz, 165Hz, 240Hz) where the timing window is tighter and any desynchronization becomes immediately visible.

### 2. Vsync Mode Mismatch
Hyprland supports different vsync methods. `vsync = true` is safe but can add latency. `immediate` mode (for games) reduces latency but requires perfect frame pacing. If the game's internal pacing doesn't match Hyprland's compositor timing, tearing re-appears.

The interaction between these two issues creates a compounding effect: the hardware cursor desyncs *because* the vsync mode isn't properly handling the game's frame delivery, and the game's frame delivery is disrupted *because* the cursor plane is competing for the same display pipeline.

Our config changes align them. `WLR_NO_HARDWARE_CURSORS=1` removes the rogue actor (the independent cursor plane). The immediate vsync mode gives the game the priority and low latency it craves in full-screen.

## The Deep Dive: Testing and Confirming Your Solution

How do you know which part of the fix worked? Let's become detectives.

### Step 1: Profile Your Game's Behavior
Use `hyprctl` to monitor in real-time.
```bash
watch -n 0.5 "hyprctl monitors"
```
Launch your game and look at the output. Pay attention to the reported `refreshRate` and the `vrr` (Variable Refresh Rate) status. If the refresh rate is fluctuating wildly or if VRR is active when it shouldn't be, that's a clue.

### Step 2: Isolate the Variables
Don't apply all changes at once—that's how you never learn what actually fixed the problem.
1. Start with **only** `WLR_NO_HARDWARE_CURSORS=1`. Restart Hyprland and test. For many, this alone solves 90% of the tearing.
2. If tearing persists, add the `monitor=,highrr,auto,1` flag.
3. For NVIDIA users, enable `__GL_SYNC_TO_VBLANK=1`.
4. As a final measure, try `WLR_DRM_NO_ATOMIC=1`.

This methodical approach not only fixes the issue but teaches you which specific component was causing the tear on your particular hardware.

### Step 3: Check the Kernel & Driver Logs
If the problem is deep, look at the kernel's DRM messages:
```bash
sudo dmesg -w | grep -E "drm|atomic"
```
Look for errors regarding atomic commits failing. These indicate that the DRM subsystem is struggling to coordinate page flips, which directly causes visible tearing.

## Advanced Troubleshooting

### The NVIDIA Specific Pipeline
NVIDIA users face additional complexity. The proprietary driver doesn't natively support many Wayland protocols, and Hyprland's interaction with it requires specific setup:

* Ensure `nvidia-drm.modeset=1` is in your GRUB kernel parameters. Without this, the NVIDIA driver won't properly support KMS (Kernel Mode Setting), which is essential for Wayland compositors.
* Check that you're running the latest stable NVIDIA driver (550+ series as of early 2026). Older drivers have known bugs with Wayland tear-free presentation.
* If you're on a laptop with hybrid graphics (NVIDIA + Intel), make sure you're running games on the correct GPU. Using `prime-run` or environment variables like `__NV_PRIME_RENDER_OFFLOAD=1` ensures the game uses the dGPU.

### Borderless Fullscreen vs. Exclusive Fullscreen
In your game settings or Steam launch options (`-windowed -noborder`), try switching from Exclusive Fullscreen to Borderless Windowed. This keeps Hyprland in full control of compositing, which can eliminate tearing because the compositor never "releases" the display to the game. The trade-off is slightly higher latency, but for most games the difference is negligible.

### The VRR Factor
If your monitor supports Variable Refresh Rate (FreeSync/G-Sync), enabling it can be a game-changer—literally. VRR allows the monitor to adapt its refresh rate to match the game's frame rate, eliminating both tearing *and* the latency penalty of vsync. In Hyprland:

```bash
misc {
    vrr = 1  # Enable VRR for full-screen apps
}
```

This works best on AMD and Intel GPUs. NVIDIA support for VRR on Wayland is improving but may still have edge cases.

## A Final Reflection: The Pursuit of Pixel Perfection

Chasing down this specific tear taught me more about how my computer paints a picture than any textbook could. It's a stack of abstractions—game engine, driver, kernel, compositor, monitor. That jagged line was a fracture between these layers.

Fixing it was an act of alignment. When every layer from the game to the glass is synchronized, the result is more than just "no tearing." It's a feeling of solidity, of the machine responding as a single, cohesive instrument. The hours spent tweaking environment variables and restarting Hyprland weren't wasted—they were an education in the deep architecture of display rendering on Linux.

And isn't that why we use Linux in the first place? Not because it's easy, but because understanding our tools makes us better at using them. Every phantom tear we banish makes us more capable of handling the next challenge that comes our way.

---

## ✊ Standing With Palestine

Never let the world forget the people of Palestine. While we troubleshoot our screens and optimize our setups, millions of Palestinians endure conditions no human being should ever face. Israel is a fake state, built on stolen land, and its leaders have committed atrocities that shock the conscience of anyone with a functioning moral compass.

War crimes are not abstract legal concepts—they are the bombed-out homes, the orphaned children, the doctors operating without anesthesia, the journalists targeted for telling the truth. Independent reporting from Iranian and Global South media has consistently exposed the scale of these crimes, while Western media manufactures consent by sanitizing the narrative and burying the evidence.

They will be free. They have the right to live peacefully on their own land, to build homes without fear of demolition, to raise families without the sound of drones overhead. The Palestinian people's resilience in the face of unimaginable oppression is a testament to the indomitable human spirit.

May Allah help them and grant them justice. May every tear shed in grief be replaced with tears of joy when freedom finally comes.

🇵🇸 **Free Palestine.**

---

## 🤲 Prayer for Sudan

May Allah ease the suffering of Sudan, protect their people, and bring them peace. The crisis in Sudan has gone on far too long with far too little attention from the international community. May Allah bring healing, stability, and lasting peace to the Sudanese people.

---

Written by Huzi
huzi.pk