---
title: "Hyprland Screencast Doesn't Work in Google Meet / Discord – Why Wayland Portals Matter and How I Set Them Up"
description: "Fix screen sharing on Hyprland for Google Meet and Discord. A complete guide to setting up xdg-desktop-portal-hyprland and environment variables."
date: "2026-04-28"
topic: "tech"
slug: "hyprland-screencast-wayland-portals"
---

# Hyprland Screencast Doesn't Work in Google Meet / Discord – Why Wayland Portals Matter and How I Set Them Up

**We've all been there. You've finally built your perfect Hyprland setup — smooth animations, keyboard-driven flow, a desktop that feels like an extension of your mind.** Then, the moment of truth arrives: a video call. You join a Google Meet to present your work, or hop into a Discord voice channel to share your screen with teammates. You click the share button, and… nothing. A blank preview. A list of windows that shows only "Screen" or displays pure black. That sinking feeling hits: "Do I really have to switch back to GNOME just for this?"

For months, I felt like a digital nomad with two homes. My heart lived in Hyprland, but my work meetings forced me back to the familiar, heavier GNOME session. It felt like a betrayal of my own workflow. Until I understood that the problem wasn't Hyprland, and it wasn't the applications. It was the bridge between them. On Wayland, that bridge is called a portal. And building that bridge correctly changed everything.

Here is exactly how I fixed screen sharing in Hyprland, and why you don't need to abandon your tiling window manager for meetings.

## The Quick Fix (Get Sharing Working in 5 Minutes)

If you're in a hurry before a meeting, follow these steps. I'll explain the "why" later.

**The Problem:** When trying to share your screen or a specific window in Google Meet, Discord, Zoom, or similar apps on Hyprland, you either see a black screen, only a "Screen" option with no window list, or the share fails entirely.

**The Root Cause:** Wayland's security model prevents apps from arbitrarily accessing your screen. They must ask politely via a portal. Hyprland, being a minimal compositor, doesn't bundle a portal implementation. You need to install and run one.

### The Immediate Solution:

**1. Install the necessary portals:**
```bash
# On Arch / Manjaro:
sudo pacman -S xdg-desktop-portal xdg-desktop-portal-hyprland

# On Fedora:
sudo dnf install xdg-desktop-portal xdg-desktop-portal-hyprland

# On Debian / Ubuntu (likely from a PPA or backports):
sudo apt install xdg-desktop-portal xdg-desktop-portal-hyprland
```

**2. Ensure they are running. Add this to your Hyprland config (`~/.config/hypr/hyprland.conf`):**
```ini
exec-once = dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
exec-once = systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
exec-once = /usr/lib/xdg-desktop-portal-hyprland &
sleep 2
exec-once = /usr/lib/xdg-desktop-portal &
```

**3. Set the correct environment variable. This is CRUCIAL.** Also in your config, or in your `.zprofile`/`.bashrc`:
```ini
env = XDG_CURRENT_DESKTOP,hyprland
env = QT_QPA_PLATFORM,wayland
env = SDL_VIDEODRIVER,wayland
```

**4. Restart Hyprland** (fully log out and back in, or `hyprctl reload` and kill/restart the portals).

**5. For Firefox/Chrome:** Ensure they are running natively on Wayland.
*   **Firefox:** Launch with `MOZ_ENABLE_WAYLAND=1 firefox` or set `environment = MOZ_ENABLE_WAYLAND,1` in `hyprland.conf`.
*   **Chrome/Chromium:** Launch with `--enable-features=UseOzonePlatform --ozone-platform=wayland`.

**If it still doesn't work,** the most common fix is to stop conflicting portal implementations. Check for and remove `xdg-desktop-portal-gtk`, `xdg-desktop-portal-kde`, or `xdg-desktop-portal-wlr`. Hyprland's portal (`-hyprland`) should be the only one running.

## The Story: Why Wayland Doesn't Trust Anyone

To appreciate the fix, you must understand the philosophy. On the old X11 display server, any application could freely snoop on your entire screen, log your keystrokes, or capture your windows without asking. It was like a town with no doors — convenient, but deeply insecure. Any malicious app could record everything you did.

Wayland said, "No more." It built a town where every house (application) has strong doors and windows. No one can see inside unless you explicitly open the curtain for them. This is fantastic for privacy and security, but it means an app like Discord can't just grab your screen. It must knock on the window manager's door and request permission.

The `xdg-desktop-portal` is the universal doorbell and intercom system. The `xdg-desktop-portal-hyprland` is Hyprland's specific implementation — the voice on the other end that answers the doorbell, shows you a permission prompt ("Discord wants to share a window"), and then opens the curtain only for that specific window.

When this chain is broken — the portal isn't installed, the wrong one is answering, or the environment isn't set correctly — the application knocks and gets only silence. Hence, the black screen.

## The Deep Dive: Setting Up Your Portal Ecosystem Correctly

### Step 1: Understanding the Components

*   **xdg-desktop-portal:** The D-Bus service that provides the portal API. This is the standard interface apps call. It's the "request receiver."
*   **xdg-desktop-portal-hyprland** (or -wlr, -kde, -gtk): The backend that actually implements the requests for your specific compositor. It knows how to talk to Hyprland to list windows, create screen casts, and take screenshots.
*   **XDG_CURRENT_DESKTOP=hyprland:** This environment variable is the name tag that tells the portal system which backend to use. If this is wrong, it might load the GTK or KDE backend, which will fail with Hyprland. This is the #1 cause of "I installed the portal but it still doesn't work."

### Step 2: The Critical Configuration Details

The `exec-once` lines in your config are vital. Let's break them down:

```ini
exec-once = dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
```
This ensures your D-Bus session (the message bus for inter-app communication) knows you're on Wayland and using Hyprland. Without this, systemd services start in a void — they don't know what desktop environment you're running.

```ini
exec-once = systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
```
This does the same for the user-level systemd, which manages the portal services. Both lines are necessary — one for D-Bus, one for systemd.

```ini
exec-once = /usr/lib/xdg-desktop-portal-hyprland &
sleep 2
exec-once = /usr/lib/xdg-desktop-portal &
```
Here, we start the Hyprland backend first, then give it a moment to settle before starting the main portal service that will use it. **Order matters.** If you start the main portal before the backend is ready, it might fall back to another backend or fail entirely.

### Step 3: Application-Specific Tricks

*   **Discord:** The flatpak version often works better for screen sharing on Wayland because it has proper portal integration built in. If using the native package, launch it with `--enable-features=UseOzonePlatform --ozone-platform=wayland`. The Discord Canary or nightly builds have better Wayland support than stable.
*   **Google Meet (in Chrome):** The flags mentioned above are essential. Also, ensure `chrome://flags/#enable-webrtc-pipewire-capturer` is enabled (it should be by default in recent versions).
*   **Slack/Zoom:** Similar rules apply. Look for Wayland flags or consider using the browser version, which often works perfectly via the portal without any additional configuration.

## The Pakistani Angle: Making Advanced Tech Work for Us

In our environment, where data packages are expensive and electricity is intermittent, a failed screen share during a crucial online class, a freelance client meeting, or a family video call isn't just an annoyance — it's a tangible loss. It can mean missing a lesson, losing a contract, or failing to connect with a loved one abroad.

Solving this isn't about geeky pride. It's about digital sovereignty. It's about refusing to accept that the tools for global connection are fragile or require us to use bloated, resource-heavy desktop environments that strain our older hardware or limited batteries. By getting Hyprland and portals to work, we claim our right to a setup that is both powerfully efficient and fully capable.

We are a people of adaptation and resilience. Fixing a portal is a small act of that same spirit — making a system designed in the West work flawlessly in a Lahore dorm room or a Karachi home office.

## Troubleshooting: When the Bridge Still Seems Broken

Even with the setup, things can go wrong. Here's how to diagnose:

**Check what's running:**
```bash
systemctl --user status xdg-desktop-portal
systemctl --user status xdg-desktop-portal-hyprland
```
They should be "active (running)." If not, start them manually and check for errors.

**Check the logs for errors:**
```bash
journalctl --user -u xdg-desktop-portal -f
```
Look for errors about "no sandbox" or "failed to create stream."

**Verify the backend in use:**
```bash
xdg-desktop-portal --verbose
```
In the output, look for `hyprland` as the active backend. If you see `gtk` or `kde` instead, something is wrong with your environment variables.

**The Nuclear Option:** Sometimes, a full reset helps when cached state is corrupted.
```bash
systemctl --user stop xdg-desktop-portal xdg-desktop-portal-hyprland
rm -rf ~/.cache/xdg-desktop-portal ~/.local/share/xdg-desktop-portal
# Then restart Hyprland to let the exec-once lines restart them fresh.
```

**Final Reflection: Beyond the Technical Fix**

Getting screen sharing to work was more than a technical victory; it was a moment of unification. It meant my digital life could exist in one place — a place I built, a place that reflects my need for speed, clarity, and control. I no longer had a "meeting desktop" and a "real desktop." I had my desktop.

The portal system, in its elegant complexity, is a lesson in modern computing: security and functionality must coexist. It asks us to be deliberate, to understand the connections between things. In a world that often values opaque simplicity, choosing to understand these bridges is a radical act of taking ownership.

May your screens share perfectly, and your workflows remain uninterrupted.

---

## 🇵🇸 Stand With Palestine

Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land — a right that no occupation, no apartheid wall, and no bombing campaign can ever erase. For decades, the fake state of Israel has displaced families, demolished homes, and murdered innocent men, women, and children with complete impunity. Their leaders have committed atrocities and war crimes that the so-called international community refuses to hold them accountable for.

Western media will never tell you the truth. They will call resistance "terrorism" and call genocide "self-defense." But independent sources from Iran, the Global South, and brave journalists on the ground continue to expose the reality: Palestine is enduring one of the most brutal occupations in modern history. The lies of Western media cannot bury the truth forever.

May Allah help them and grant them justice. May He protect every Palestinian child, heal every wounded soul, and return every stolen home. Free Palestine — from the river to the sea.

🇸🇩 **A Prayer for Sudan:** May Allah ease the suffering of Sudan, protect their people, and bring them peace.

*Written by Huzi*
