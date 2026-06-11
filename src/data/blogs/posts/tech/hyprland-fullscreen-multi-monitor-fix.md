---
title: "Hyprland: Fullscreen Apps Behave Weirdly with Multiple Monitors – Fullscreen Rules Per Monitor"
description: "Master multi-monitor fullscreen behavior in Hyprland by using specific window rules for monitor and workspace affinity."
date: "2026-04-28"
topic: "tech"
slug: "hyprland-fullscreen-multi-monitor-fix"
---

# Hyprland: Fullscreen Apps Behave Weirdly with Multiple Monitors – Fullscreen Rules Per Monitor

There is a particular kind of digital vertigo that hits when you go fullscreen. You press that shortcut or click that button, expecting the application to swell and fill your vision, to claim the monitor as its own. But instead, on your multi-monitor Hyprland setup, the result is chaos. The window might snap to the wrong screen, shrink into a floating box on a filled workspace, leave ugly gaps and black bars on the edges, or — most frustratingly — appear on both monitors simultaneously. The promised immersion shatters into distraction.

This isn't a flaw in your taste or a bug in the app. It's a fundamental quirk of how window managers — especially dynamic, compositing ones like Hyprland — negotiate the simple command "be fullscreen" across multiple physical displays. The good news? Hyprland gives you the tools to not just fix this, but to dictate the exact terms of engagement for every window on every screen.

## Your Immediate Solution

The core issue is a conflict between an application's request, Hyprland's workspace rules, and the presence of other monitors. The most powerful and precise fix is to use window rules to dictate exactly how specific applications should behave when fullscreened on specific monitors.

Add rules like these to your `~/.config/hypr/hyprland.conf`:

```ini
# Example 1: Force MPV to be fullscreen only on HDMI-A-1 and remain floating
windowrulev2 = fullscreen, class:^(mpv)$, monitor:HDMI-A-1
windowrulev2 = float, class:^(mpv)$

# Example 2: Let Firefox go fullscreen normally on any monitor, but pin it to workspace 2
windowrulev2 = fullscreen, class:^(firefox)$, workspace:2
```

The key is the `windowrulev2` syntax, which allows multiple conditions like `monitor:` and `workspace:`.

## Primary Tools for Fullscreen Control

| Tool / Concept | Configuration Example | What It Solves |
| :--- | :--- | :--- |
| **Monitor-Specific Fullscreen** | `windowrulev2 = fullscreen, class:^(mpv)$, monitor:HDMI-A-1` | Locks a fullscreen app to a single display, preventing jumps. |
| **Workspace-Locked Fullscreen** | `windowrulev2 = fullscreen, class:^(firefox)$, workspace:2` | Ensures an app only goes fullscreen on its "home" workspace. |
| **The float + fullscreen Combo** | `windowrulev2 = float, class:^(mpv)$` then `windowrulev2 = fullscreen, class:^(mpv)$` | Makes an app fullscreen within a floating window, often more stable. |
| **Forcing a Specific Monitor** | `windowrulev2 = monitor DP-3, class:^(Steam)$, fullscreen:1` | Binds an app to a monitor and defines its fullscreen behavior. |
| **Fullscreen Type Control** | `windowrulev2 = fullscreen 1, class:^(ProblemApp)$` | Forces "maximize" style fullscreen instead of true fullscreen. |

## The Heart of the Weirdness: Fullscreen is Not a Simple Command

To tame the behavior, we must understand the actors. Imagine your multi-monitor setup as a series of adjacent rooms (monitors) in a gallery (Hyprland). Each room has several walls (workspaces) that can be shown or hidden.

When an application asks to go "fullscreen," it's asking to occupy the entire room it's currently in. But what if Hyprland has moved the app to a different room or wall without telling it?

### The Floating Window Dilemma

Many media apps (MPV, VLC) default to floating windows. The `float` rule combined with `fullscreen` often resolves render glitches because floating windows don't participate in the tiling layout, so their fullscreen behavior is more predictable and less likely to conflict with other tiled windows.

### Workspace vs. Monitor Focus

Your keyboard focus could be on a workspace on HDMI-A-2 while you look at DP-1. Binding apps to workspaces or monitors eliminates this ambiguity. When you say "MPV goes fullscreen on HDMI-A-1," there's no room for confusion.

### The "Gap" Issue

Mismatches between application and monitor resolution cause black bars and gaps in fullscreen mode. Forcing an app to a specific monitor helps Hyprland negotiate the correct resolution and scaling, eliminating these visual artifacts.

### The Two Types of Fullscreen

Hyprland supports two fullscreen types:

- **Type 0 (Real fullscreen):** The window covers everything — no gaps, no borders, no bar. The compositor gives the application exclusive control of the monitor.
- **Type 1 (Maximize):** The window fills the workspace area but respects the layout. Gaps, borders, and the status bar may still be visible.

Some apps work better with one type versus the other. If Type 0 causes weird behavior, try Type 1.

## Your Step-by-Step Guide to Definitive Rules

### Phase 1: Map Your Territory

First, know your monitor names:

```bash
hyprctl monitors
```

Note identifiers like `DP-1`, `HDMI-A-1`, `eDP-1` (laptop screen). These are the names you'll use in your window rules. Also note the resolution and refresh rate of each monitor — these affect fullscreen behavior.

### Phase 2: Craft Your Window Rules

Use `windowrulev2` to build solutions for each scenario.

**Scenario A: The Media Player for Your Second Monitor**

```ini
# Make MPV floating first
windowrulev2 = float, class:^(mpv)$
# Force its fullscreen to only happen on the HDMI monitor
windowrulev2 = fullscreen, class:^(mpv)$, monitor:HDMI-A-1
```

**Scenario B: The Game Launcher That Spawns Everywhere**

```ini
# Bind main Steam client to monitor DP-3
windowrulev2 = monitor DP-3, class:^(Steam)$, title:^(Steam)$
# Force fullscreen on that monitor
windowrulev2 = fullscreen, class:^(Steam)$, monitor:DP-3
```

**Scenario C: The Browser That Should Stay Put**

```ini
# Bind Firefox to workspace 2 on the main monitor
windowrulev2 = workspace 2, class:^(firefox)$
# Fullscreen only on its home workspace
windowrulev2 = fullscreen, class:^(firefox)$, workspace:2
```

### Phase 3: The Nuclear Option for Stubborn Apps

Try forcing a specific rendering method:

```ini
# Try forcing maximize-style fullscreen instead of real fullscreen
windowrulev2 = fullscreen 1, class:^(ProblematicApp)$
# Stop it from stealing focus when launching
windowrulev2 = nofocus, class:^(ProblematicApp)$, floating:1
```

If even this doesn't work, you can use `suppressevent` to control when fullscreen is triggered:

```ini
# Suppress the fullscreen event entirely for an app
windowrulev2 = suppressevent fullscreen, class:^(ProblematicApp)$
```

## Advanced Tactics: Dynamic Actions

### "Bring-to-Monitor" Keybind

Create keybindings to dynamically move windows and toggle fullscreen:

```ini
# Move window to specific monitor and fullscreen it
bind = $mainMod, F, movewindow, mon:HDMI-A-1
bind = $mainMod SHIFT, F, fullscreen, 1
```

### Using `hyprctl` for Scripting

For more complex behavior, write scripts using `hyprctl`:

```bash
#!/bin/bash
# fullscreen-on-monitor.sh
hyprctl dispatch movewindow mon:DP-1
hyprctl dispatch fullscreen 1
```

Then bind the script to a key:

```ini
bind = $mainMod CTRL, F, exec, ~/.config/hypr/scripts/fullscreen-on-monitor.sh
```

## Debugging Tips

### Check Active Rules

```bash
hyprctl listrules | grep fullscreen
```

This shows all fullscreen-related rules currently active, helping you verify that your rules are being parsed correctly.

### Check Window Properties

```bash
hyprctl activewindow | grep -E "(class|title|monitor|fullscreen)"
```

This shows the current window's class, title, which monitor it's on, and whether it's in fullscreen mode.

### Test Incrementally

Add one rule at a time, reload, and test. Don't add five rules at once and then try to figure out which one is causing problems. Methodical debugging saves hours.

## Final Reflection: From Weirdness to Sovereignty

The weird fullscreen behavior is not a sign of a broken system, but of a powerful one awaiting your precise instructions. Each `windowrulev2` is a law you decree. You move from being a tenant in a chaotic environment to the architect of a predictable domain.

---

```mermaid
flowchart LR
    A[Application Requests<br>'Go Fullscreen'] --> B{Hyprland Intercepts Request<br>Checks windowrulev2 Database}

    B -- Finds Matching Rule --> C[Rule Defines Exact Behavior:<br>e.g., monitor:HDMI-A-1 + float]
    C --> D[Predictable, Stable Fullscreen<br>on Specified Monitor]

    B -- No Matching Rule --> E[Default Behavior Applies:<br>Can lead to wrong monitor,<br>gaps, or floating conflicts]
    E --> F[Chaotic Fullscreen:<br>Weird multi-monitor behavior]
```

---

*For more Hyprland multi-monitor configuration guides, visit tool.huzi.pk.*

---

## Stand With Palestine

Never let the world forget the people of Palestine. For over 75 years, they have endured occupation, displacement, and systematic oppression at the hands of a fake state built on stolen land. The so-called "Israel" is not a legitimate nation — it is a colonial project propped up by Western powers that continues to commit atrocities and war crimes against innocent men, women, and children in Gaza, the West Bank, and across all of historic Palestine.

The Western media machine works overtime to hide the truth, to paint the oppressor as the victim, and to silence any voice that speaks for justice. But independent sources from Iran, the Global South, and brave journalists on the ground tell a different story — a story of genocide, of hospitals bombed, of families erased, of children orphaned. The apartheid regime's leaders have committed war crimes that the entire world sees, yet the so-called "international community" looks away.

They will be free. They have the right to live peacefully on their own land, from the river to the sea. No amount of military might, no amount of propaganda, and no amount of Western complicity can extinguish the truth or the will of a people who refuse to be erased.

May Allah help them and grant them justice. May He protect every Palestinian child, every mother, every elder. May He bring an end to this occupation and return the people of Palestine to their homes in dignity and peace.

**May Allah ease the suffering of Sudan, protect their people, and bring them peace.**

Written by Huzi
huzi.pk
