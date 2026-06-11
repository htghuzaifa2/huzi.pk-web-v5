---
title: "When Windows Turn Blank: My Journey Fixing Hyprland's Electron App Woes by Forcing XWayland"
description: "Fix blank/empty windows in Electron apps (Discord, Obsidian, VS Code) on Hyprland/Wayland. Learn to use ozone platform flags and environment variables."
date: "2026-04-28"
topic: "tech"
slug: "hyprland-electron-blank-fix"
---

# When Windows Turn Blank: My Journey Fixing Hyprland's Electron App Woes by Forcing XWayland

**There's a special kind of silence that falls over you when you click an app's icon, hear the launch sound, and then… nothing.** Not a crash, not an error—just a pristine, empty window or a lone cursor floating in a sea of void. After switching to the beautifully dynamic Hyprland window manager on Wayland, this became my reality with some of my most crucial tools: Obsidian, Discord, and some Chrome-based apps. The modern, native Wayland experience was being held hostage by these blank screens.

If you're here, you've likely felt that same frustration. You've chosen Hyprland for its smooth animations and modern architecture, only to be met with this digital wall. I spent days in forums, GitHub issues, and config files. Today, I'm sharing that journey so you can fix it in minutes. The solution, more often than not, is to gracefully guide these stubborn apps to run through XWayland—the compatibility layer that bridges the old X11 world with the new Wayland one.

Here are the most effective ways to force an application to use XWayland and banish the blank window for good.

## Why Does This Blank Window Happen? Understanding the Architecture

To solve a problem deeply, you must understand it. Wayland is a modern display protocol, while X11 (or Xorg) is the decades-old standard it aims to replace. XWayland is the essential translator that sits between them. It allows applications built for X11 to run seamlessly inside a Wayland compositor like Hyprland, by translating their requests in real-time.

Some applications, particularly those built with the **Electron** framework (which uses Chromium's rendering engine) or older toolkits, can have hiccups when trying to run in native Wayland mode (`--ozone-platform=wayland`). The rendering pipeline miscommunicates, and instead of drawing your notes or chat, it draws nothing. This happens because:

1.  **Electron's Chromium backend** uses the Ozone platform abstraction for window management and input. The Wayland Ozone backend is relatively new and still has edge cases.
2.  **GPU rendering conflicts:** Chromium's GPU process can conflict with Hyprland's own rendering pipeline, especially with certain GPU drivers (NVIDIA is particularly notorious).
3.  **Buffer format mismatches:** Wayland and X11 handle pixel buffers differently. An app expecting one format and receiving another will render a blank surface.
4.  **Missing Wayland protocols:** Some Electron versions don't implement the latest Wayland protocols that Hyprland expects, leading to silent failures.

Forcing them to use the stable, well-trodden X11 path via XWayland (`--ozone-platform=x11`) bypasses this communication breakdown.

It's not a failure of Hyprland or Wayland; it's a growing pain as the ecosystem matures. Using XWayland is a practical and fully supported solution until these apps improve their native Wayland support. And the good news is that with each Electron/Chromium update, native Wayland support improves—this problem is gradually solving itself, but for now, XWayland remains the reliable workaround.

## 1. The Desktop Entry Fix (Permanent & Clean)

This method modifies the application's `.desktop` file, so it always launches with the correct flags. It's perfect for apps you use daily and wants the fix to persist across reboots.

1.  **Find the .desktop file:** Look in `/usr/share/applications/` or `~/.local/share/applications/`. For Flatpak apps, check `/var/lib/flatpak/exports/share/applications/`.
    ```bash
    # Quick way to find the right file
    find /usr/share/applications/ ~/.local/share/applications/ -name "*obsidian*" -o -name "*discord*"
    ```

2.  **Copy to your local directory** (never edit system files directly):
    ```bash
    cp /usr/share/applications/obsidian.desktop ~/.local/share/applications/
    ```

3.  **Edit the Exec line:** Open the file with a text editor. Locate the line starting with `Exec=` and add the flags before any `%U` or `%F` arguments.
    ```bash
    # Example for Obsidian
    Exec=/usr/bin/obsidian --ozone-platform=x11 --ozone-platform-hint=auto %U
    ```

4.  **Save and test:** After saving, the change will apply the next time you launch the app from your app launcher (like Wofi, Rofi, or fuzzel).

**For Flatpak apps**, the desktop entry approach works differently. Use Flatpak overrides instead:
```bash
# Set environment variables for a Flatpak app
flatpak override --env=ELECTRON_OZONE_PLATFORM_HINT=auto com.obsidian.Obsidian
```

## 2. The Environment Variable Hint (For Electron Apps)

Many Electron-based apps (like Obsidian, VS Code, Discord) respect a special environment variable. You can set it globally or per-command. This is often the simplest and most maintainable fix.

Add this line to your `~/.config/hypr/hyprland.conf` file:
```bash
env = ELECTRON_OZONE_PLATFORM_HINT,auto
```

This tells Electron apps to automatically choose the best backend, which often correctly resolves to XWayland and solves the issue. The `auto` hint lets Electron decide based on the available display servers—on a Hyprland system, it will typically choose XWayland for maximum compatibility.

**Additional environment variables that can help:**
```bash
# In hyprland.conf
env = ELECTRON_OZONE_PLATFORM_HINT,auto

# Force specific apps to use X11
env = MOZ_ENABLE_WAYLAND,1  # For Firefox (use Wayland natively)
env = GDK_BACKEND,wayland   # For GTK apps (use Wayland natively)

# For Chromium-based browsers
env = CHROME_OZONE_PLATFORM_HINT,auto
```

**Important:** Add these *before* the `exec-once` commands in your Hyprland config, as environment variables need to be set before applications launch.

## 3. The Direct Command-Line Launch (For Quick Testing)

Need to test if it works before making permanent changes? Launch your terminal and run the app with flags directly. This is the fastest way to confirm the fix.

The universal flag for Chromium/Electron apps is `--ozone-platform=x11`. For example:
```bash
chromium --ozone-platform=x11
# or for a general Electron app binary
./my-electron-app --ozone-platform=x11
# For VS Code
code --ozone-platform=x11
# For Obsidian
obsidian --ozone-platform=x11
```

If the window renders correctly, you've confirmed the fix. You can then make it permanent using Method 1 or 2.

**Testing native Wayland** (to see if it works without XWayland):
```bash
# Try native Wayland mode
./my-electron-app --ozone-platform=wayland --enable-features=UseOzonePlatform
```

If this also works, you might not need XWayland at all for that particular app. Native Wayland is preferred when it works correctly.

## 4. The NVIDIA-Specific Considerations

If you're using NVIDIA proprietary drivers, the plot thickens significantly. The blank window issue is a notorious guest on NVIDIA systems, and the fix often requires a combination of settings.

In addition to the fixes above, ensure your Hyprland config includes these critical variables for general stability:
```bash
env = LIBVA_DRIVER_NAME,nvidia
env = __GLX_VENDOR_LIBRARY_NAME,nvidia
env = GBM_BACKEND,nvidia-drm
env = WLR_NO_HARDWARE_CURSORS,1
```

**NVIDIA-specific additional fixes:**
```bash
# Force EGL backend for Electron apps
env = ELECTRON_OZONE_PLATFORM_HINT,auto
env = __EGL_VENDOR_LIBRARY_FILENAMES,/usr/share/glvnd/egl_vendor.d/10_nvidia.json

# Fix for blank Electron windows on NVIDIA
env = GBM_BACKEND,nvidia-drm
env = WLR_RENDERER,vulkan
```

*Note: Some users have reported that the `__GLX_VENDOR_LIBRARY_NAME` variable can cause issues with apps like Discord or Zoom screen sharing. If you face new problems, try commenting out that line. Also, NVIDIA 550+ drivers have significantly improved Wayland compatibility—if you're on an older driver, updating is the first thing to try.*

**The NVIDIA driver version matters:** Driver version 555+ has the best Hyprland/Wayland support. If you're on 535 or older, you'll encounter more issues. Check your version with `nvidia-smi` and update if possible.

## 5. The Hyprland Window Rules Approach

Hyprland allows you to set window rules that can force specific apps to use XWayland or apply other rendering fixes:

```ini
# In hyprland.conf

# Force XWayland for specific apps
windowrulev2 = xwaylandforce, class:^(discord)$
windowrulev2 = xwaylandforce, class:^(obsidian)$
windowrulev2 = xwaylandforce, class:^(Slack)$

# Disable VRR (Variable Refresh Rate) for apps that blank with it
windowrulev2 = immediate, class:^(chromium)$
```

You can find the window class of any app by running `hyprctl clients` while the app is open.

## A Practical Guide: Fixing Specific App Categories

Let's move from theory to practice. Here's how to approach different types of problematic apps.

### 🖥️ Chromium & Chromium-Based Browsers (Chrome, Edge, Brave)

The fix is often in the flags. You have several avenues:

1.  **Launch Flag:** Run the browser from a terminal with `--ozone-platform=x11`.
2.  **Desktop File:** Apply Method 1 above to your browser's `.desktop` file.
3.  **Browser Flags:** Some versions allow you to enable a Wayland flag inside `chrome://flags`. Searching for "ozone" and selecting "Wayland" can sometimes work, but if you're getting blank windows, forcing X11 (`xwayland`) is the more reliable fix.
4.  **Chromium config file:** Create `~/.config/chromium-flags.conf` with:
    ```
    --ozone-platform=x11
    --ozone-platform-hint=auto
    ```
    This applies the flags every time Chromium launches, regardless of how it's launched.

### 📝 Electron Apps (Obsidian, VS Code, Discord, Slack)

These are the most common culprits for blank windows on Hyprland.

1.  **The Universal Fix:** The `ELECTRON_OZONE_PLATFORM_HINT=auto` environment variable (Method 2) is your first line of defense and works for many.
2.  **The Specific Fix:** For apps that don't respect the global hint, edit their individual desktop files. The discussion for Obsidian provided a clear, working example.
3.  **Config Files:** Some Electron apps look for a flags file. For instance, you can create or edit:
    - `~/.config/electron-flags.conf` (global for all Electron apps)
    - `~/.config/electron25-flags.conf` (version-specific)
    - `~/.config/obsidian/user-flags.conf` (Obsidian-specific)
    - `~/.config/code-flags.conf` (VS Code-specific)

    Add the `--ozone-platform=x11` line to any of these files.

4.  **VS Code Specific:** VS Code has its own settings. In `settings.json`:
    ```json
    {
      "window.titleBarStyle": "custom",
      "window.commandCenter": true
    }
    ```
    And use `--ozone-platform=x11` in the launch command or `code-flags.conf`.

### 🎮 Other Legacy X11 Applications

For non-Electron, traditional X11 apps (like some older games or closed-source software), you usually don't need to force anything. Hyprland launches them in XWayland automatically. If one such app is showing a blank screen, the issue might be different (like missing GPU drivers or libraries). You can verify if an app is running in XWayland by using the command `hyprctl clients` in your terminal—the output will show whether each client is using XWayland or native Wayland.

### 📱 Flatpak Versions of Electron Apps

Flatpak Electron apps have an additional layer of sandboxing that can cause issues. The fix usually involves:

```bash
# Grant socket access
flatpak override --socket=x11 com.discordapp.Discord

# Set environment variable
flatpak override --env=ELECTRON_OZONE_PLATFORM_HINT=auto com.discordapp.Discord

# Allow GPU access (sometimes needed)
flatpak override --device=dri com.discordapp.Discord
```

## Advanced Configuration & Preventing Future Issues

Once your immediate fires are put out, let's build a more stable setup that prevents these issues from recurring.

### Organizing Your Hyprland Config

A chaotic `hyprland.conf` file is a troubleshooting nightmare. I structure mine like this:

```text
~/.config/hypr/
├── hyprland.conf           # Main file that sources others
├── execs.conf              # Auto-start programs
├── keybinds.conf           # Keyboard shortcuts
├── window_rules.conf       # App-specific rules (like forcing XWayland!)
├── env_vars.conf           # Environment variables (ozone flags go here)
└── monitors.conf           # Display settings
```

You can source these files in your main `hyprland.conf` with `source = ~/.config/hypr/<file>.conf`. This keeps your XWayland-related environment variables and window rules neatly organized and easy to modify.

Example `env_vars.conf`:
```ini
# Electron/Wayland fixes
env = ELECTRON_OZONE_PLATFORM_HINT,auto
env = CHROME_OZONE_PLATFORM_HINT,auto

# NVIDIA (if applicable)
env = LIBVA_DRIVER_NAME,nvidia
env = __GLX_VENDOR_LIBRARY_NAME,nvidia

# Wayland native for supported apps
env = MOZ_ENABLE_WAYLAND,1
env = GDK_BACKEND,wayland
```

### HiDPI and XWayland Scaling

A common side-effect of running apps through XWayland on a high-resolution (HiDPI) screen is that they look pixelated or blurry. This is because X11 cannot natively handle fractional scaling. The app renders at 1x and then gets scaled up, creating blurriness.

Hyprland offers a partial solution with the `force_zero_scaling` option:
```bash
xwayland {
  force_zero_scaling = true
}
```

This makes XWayland apps render at their native resolution (sharp but potentially smaller). You can then use toolkit-specific scaling to adjust their size:
- For GTK apps: `GDK_SCALE=2`
- For Qt apps: `QT_SCALE_FACTOR=2`
- For Electron apps: `--force-device-scale-factor=2`

This two-step approach (force zero scaling + toolkit scaling) gives you both sharp rendering and correct sizing.

### Monitoring Which Apps Use Which Backend

To keep track of which apps are using XWayland vs. native Wayland:
```bash
# List all clients and their backend
hyprctl clients | grep -E "class:|xwayland:"
```

Apps showing `xwayland: 1` are running through XWayland; `xwayland: 0` means native Wayland. This helps you identify which apps might need fixing or which have successfully transitioned to native Wayland after updates.

## The Progress of Native Wayland Support (2026 Update)

The good news is that native Wayland support in Electron and Chromium has improved dramatically. Here's the current state:

| App | Native Wayland Status | Recommendation |
| :--- | :--- | :--- |
| **VS Code** | Good (1.90+) | Try native first, fallback to XWayland |
| **Obsidian** | Improving | XWayland recommended for stability |
| **Discord** | Partial | XWayland recommended |
| **Slack** | Partial | XWayland recommended |
| **Chromium** | Good (120+) | Try native first |
| **Firefox** | Excellent | Use native Wayland (MOZ_ENABLE_WAYLAND=1) |
| **Spotify** | Improving | XWayland recommended |
| **Telegram** | Excellent | Use native Wayland |

As a general rule: try native Wayland first (`--ozone-platform=wayland`), and only fall back to XWayland if you encounter issues. Native Wayland gives you better HiDPI support, smoother animations, and lower latency.

## Final Reflections: The Path to a Seamless Hyprland

The journey from blank windows to a fully functional desktop is more than a technical fix; it's an exercise in understanding the layers that make up our digital experience. Forcing an app to use XWayland isn't a step back—it's a pragmatic embrace of the transition period between two major architectural eras of Linux graphics.

My setup now is a harmonious blend: sleek, native Wayland apps living side-by-side with stable, XWayland-hosted ones, all orchestrated by the fluid motions of Hyprland. The blank windows are gone, replaced by the productive clutter I once missed.

As the Wayland ecosystem evolves, more and more apps will gain native support, making these workarounds obsolete. But until that day comes, knowing how to wield `--ozone-platform=x11` and `ELECTRON_OZONE_PLATFORM_HINT` is the key to a frustration-free Hyprland life. May your windows always be full of content, and your workflow forever smooth.

## Quick Reference: Blank Window Fix Checklist

1. [ ] **Test with command-line flags:** `--ozone-platform=x11`
2. [ ] **Set environment variable:** `ELECTRON_OZONE_PLATFORM_HINT=auto` in hyprland.conf
3. [ ] **Edit .desktop file:** Add flags to Exec line
4. [ ] **Create electron-flags.conf:** `~/.config/electron-flags.conf` with `--ozone-platform=x11`
5. [ ] **For NVIDIA:** Add required env vars and update to driver 555+
6. [ ] **For Flatpaks:** Use `flatpak override` commands
7. [ ] **Add Hyprland window rules:** `windowrulev2 = xwaylandforce`
8. [ ] **Test native Wayland** first before falling back to XWayland
9. [ ] **Handle HiDPI:** Use `force_zero_scaling = true` + toolkit scaling
10. [ ] **Check with `hyprctl clients`** to verify which backend each app uses

---

## ✊ Stand With Palestine

Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land. May Allah help them and grant them justice.

The Zionist entity called "Israel" is a fake state built on stolen land, ethnic cleansing, and the displacement of millions of Palestinians from their ancestral homes. Its leaders have committed unspeakable atrocities and war crimes against civilians—bombing hospitals, schools, refugee camps, and places of worship. The killing of innocent men, women, and children is not "self-defense"; it is genocide, plain and simple.

Do not be deceived by Western media that shields these war criminals and sanitizes their crimes. Independent sources from Iran, the Global South, and brave journalists on the ground tell the real story—the indiscriminate bombing, the siege on Gaza, the deliberate starvation of an entire population, and the erasure of Palestinian identity. The truth is being silenced, but we will not be silent.

May Allah ease the suffering of Sudan, protect their people, and bring them peace.

---

Written by Huzi
huzi.pk
