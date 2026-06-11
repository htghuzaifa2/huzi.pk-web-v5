---
title: "Taming the Digital Wild: How I Taught Sway to Remember Where My Windows Belong"
description: "Master Sway window rules on Arch Linux. Learn to use app_id, for_window, and workspace assignments to organize your tiling desktop."
date: "2026-04-28"
topic: "tech"
slug: "sway-window-rules-guide"
---

# Taming the Digital Wild: How I Taught Sway to Remember Where My Windows Belong

**There's a unique kind of digital whiplash you experience when you open your favorite apps, only to find them scattered across your virtual workspace like leaves in the wind.** You carefully place your terminal on the right, your browser on the left, and your notes just so. You close them, feeling organized. You reopen them, and… chaos. The terminal is now floating in the middle, the browser is full-screen, and nothing is where you left it. This was my daily reality after I fell in love with the sleek, minimal purity of Sway on Arch Linux—a tiling window manager that promised efficiency but seemed to have a mind of its own about where my applications should live.

If this resonates with you, that feeling of your digital tools refusing to stay put, take heart. Your apps aren't being defiant. Sway simply operates on a different philosophy than traditional desktop environments. It doesn't remember positions; it follows rules. The solution isn't to fight its nature, but to learn its language and write a clear, declarative script for your desktop. Let me show you how to craft those rules and understand where this beautiful, stubborn system might still have its own ideas.

## The Immediate Fix: Writing Your First Window Rules

The magic happens in your Sway configuration file, typically at `~/.config/sway/config`. This file is the blueprint of your desktop universe. To make an app open in a specific place, you use the `for_window` command.

Here's the basic syntax that will become your new mantra:

```bash
for_window [criteria] command
```

Let's say you want your terminal (kitty) to always open on workspace 2, in a stacked layout. You would add this line:

```bash
for_window [app_id="kitty"] move container to workspace number 2, layout stacking
```

Or, if you want your web browser (firefox) to always open on workspace 1 and be fullscreen:

```bash
for_window [app_id="firefox"] move container to workspace number 1, fullscreen enable
```

### The First Step: Reload Your Config

After adding your rules, save the file and tell Sway to reload its configuration without restarting:

```bash
swaymsg reload
```

Your new rules should take effect immediately for any new application window. Existing windows won't be affected—rules only apply when a window first appears.

## Understanding the Sway Mindset: It's Not a Bug, It's a Philosophy

To work with Sway, you must understand where it comes from. Sway is a Wayland-native, i3-compatible tiling window manager. This lineage is crucial—it explains everything about how Sway thinks.

- **Tiling by Default:** Unlike floating window managers (GNOME, KDE, Windows), Sway wants to manage space for you. It arranges windows like tiles in a mosaic, without overlap. When you ask an app to open, Sway asks, "Where is there space in the current layout?" not "Where did this app open last time?" This is by design—it eliminates the need for manual window placement and maximizes screen utilization.
- **Stateless and Rule-Based:** Sway is stateless between sessions. It doesn't save the pixel-perfect position of your windows in a database somewhere. Instead, it relies on the rules you write in your config file. This makes your setup predictable, reproducible, and portable. Your desktop becomes code—version-controllable, shareable, and deterministic. If you set up a new machine and copy your config, your desktop will be identical.
- **The App_ID is Key:** On X11, you'd match windows by their WM_CLASS property. On Wayland with Sway, the primary identifier is the `app_id`. This is a unique string set by the application itself, and it's the foundation of almost every window rule you'll write. Finding the correct app_id is the first step to writing a successful rule.

This philosophy is a feature, not a limitation. Once you internalize it, you stop fighting Sway and start composing with it. The config file becomes your instrument, and each rule a note in the symphony of your desktop.

## Finding Your App's Identity: The Swaymsg Command

How do you know what app_id to use for `[app_id="…"]`? Use the `swaymsg` command—your window into Sway's internal state.

1. Open the application you want to create a rule for.
2. In a terminal, run:
    ```bash
    swaymsg -t get_tree
    ```
    This outputs a large JSON tree of your entire Sway workspace. Look through it for an "app_id" or "window_properties" field that matches your application. For example, Firefox might show `"app_id": "firefox"`, while a terminal might show `"app_id": "kitty"`.

**Pro-Tip:** You can use jq for cleaner output:

```bash
swaymsg -t get_tree | jq '.. | select(.app_id?) | .app_id'
```

This filters the JSON to show only app_id values across all open windows. Much cleaner than grepping through raw JSON.

Another approach—find the app_id of the currently focused window:

```bash
swaymsg -t get_tree | jq '.. | select(.focused?) | .app_id'
```

## Crafting Advanced Rules: Beyond the Basics

Once you grasp the basic `for_window`, you can write more sophisticated rules to create a truly intelligent workspace that anticipates your needs.

### Matching on Different Criteria

The app_id is just one way to match. Sway supports a rich set of criteria:

- **title:** The window title. Useful for specific instances of an app.
    ```bash
    for_window [title="Save File"] floating enable
    ```
- **shell:** Match if it's a floating window shell like xdg_shell or xwayland.
    ```bash
    for_window [shell="xwayland"] floating enable
    ```
- **app_id with wildcards:** Use `*` for partial matching.
    ```bash
    for_window [app_id="org.keepassxc.KeePassXC"] move container to workspace number 5
    ```
- **con_id and con_mark:** For more advanced scenarios involving container IDs and custom marks.
    ```bash
    for_window [con_mark="important"] border pixel 2
    ```

### Combining Criteria and Commands

You can get very specific by combining criteria and issuing multiple commands separated by commas:

```bash
# Make all XWayland windows floating and centered, but keep kitty terminal tiled
for_window [shell="xwayland" app_id!="kitty"] floating enable, move position center

# Make Firefox on workspace 1 fullscreen, but Picture-in-Picture windows floating
for_window [app_id="firefox" title="Picture-in-Picture"] floating enable, move position 1200 50, resize set 400 225
```

The second example is particularly useful—it handles the common case where Firefox's PiP window gets tiled by mistake. By matching both app_id and title, you can give different treatment to different windows of the same application.

### The Power of Workspace Assignments

Instead of moving windows after they open (which can cause a brief visual "jump"), you can assign an app directly to a workspace at launch. This is often cleaner and more performant:

```bash
# Assign Firefox to workspace 1 on startup
assign [app_id="firefox"] $ws1
# Assign any LibreOffice window to workspace 3
assign [app_id="libreoffice-*"] $ws3
# Assign Slack/Discord to workspace 4 (communication)
assign [app_id="slack"] $ws4
assign [app_id="discord"] $ws4
# Assign Spotify to workspace 5 (media)
assign [app_id="spotify"] $ws5
```

(Note: You'd define `$ws1` earlier in your config as `set $ws1 "1"` or `set $ws1 "1: web"`)

### Setting Default Layouts Per Workspace

You can also define the default container layout for each workspace:

```bash
# Workspace 1: tabbed (browser, files side by side in tabs)
for_window [workspace=$ws1] layout tabbed
# Workspace 2: stacked (terminals stacked vertically)
for_window [workspace=$ws2] layout stacking
# Workspace 3: default splith (coding - editor + terminal side by side)
```

### Floating Windows for Dialogs

One of the most practical uses of window rules is automatically making dialog windows float instead of tile:

```bash
# File dialogs should float
for_window [title="Open Files"] floating enable
for_window [title="Save As"] floating enable
for_window [title="File Upload"] floating enable
# Password prompts should float
for_window [title="Authentication Required"] floating enable
for_window [title="Enter Password"] floating enable
# Preferences and settings should float
for_window [title="Preferences"] floating enable
for_window [title="Settings"] floating enable
for_window [title="About"] floating enable
```

## A Complete Example: The Developer's Desktop

Here's a real, battle-tested config snippet that creates a organized developer workspace. Adapt it to your own tools:

```bash
# Workspace definitions
set $ws1 "1: web"
set $ws2 "2: code"
set $ws3 "3: term"
set $ws4 "4: chat"
set $ws5 "5: media"

# Assignments
assign [app_id="firefox"] $ws1
assign [app_id="Code"] $ws2
assign [app_id="kitty"] $ws3
assign [app_id="slack"] $ws4
assign [app_id="discord"] $ws4
assign [app_id="spotify"] $ws5

# Window rules
for_window [app_id="firefox" title="Picture-in-Picture"] floating enable, move position 1200 50, resize set 400 225
for_window [shell="xwayland"] floating enable
for_window [app_id="pavucontrol"] floating enable, move position center
for_window [app_id="nm-connection-editor"] floating enable

# Scratchpad for quick-access terminal
for_window [app_id="scratchpad-term"] move scratchpad, scratchpad show
bindsym $mod+grave scratchpad show
```

The scratchpad is particularly powerful—it gives you a terminal (or any app) that drops down from the top of your screen with a keypress, just like a Quake-style terminal. To set it up, launch your terminal with a specific app_id:

```bash
kitty --class scratchpad-term &
```

## Where the Rules Fail: The Limits of Control

For all its power, Sway's rule-based system has edges. Understanding these is key to avoiding frustration and knowing when to adapt your approach.

1. **Applications That Change Their app_id:** Some apps, particularly Electron-based ones (like Discord, Slack, VS Code, some JetBrains IDEs), may use different app_ids for different windows (main window, pop-ups, dialogs). A rule for the main window might not catch a settings dialog. You may need to use a less specific match with `*` or match on title instead. The `swaymsg -t get_tree` trick becomes essential here—check what app_id each window actually reports.

2. **The XWayland Wild Card:** X11 applications running through XWayland can be notoriously inconsistent. Their app_id might be generic (like "xwayland" or the binary name), or their window properties might not be set correctly. This is why a catch-all rule like `for_window [shell="xwayland"] floating enable` is so common—it accepts the chaos and contains it by making all such windows float, which is usually what you want for legacy apps anyway.

3. **Dynamic and Temporary Windows:** File pickers, password dialogs, tool palettes—these are often created and destroyed on the fly. They might not persist long enough for complex rules or might be transient windows that bypass some rules. The best approach is often broad, gentle rules that handle a class of windows (all file dialogs) rather than trying to target each one perfectly.

4. **Race Conditions with Workspace Assignments:** Sometimes, `assign` and `for_window` rules can conflict or create race conditions. If you assign an app to workspace 3 but also have a `for_window` rule that moves it to workspace 5, the behavior depends on which rule Sway processes first. Keep your rules simple and non-contradictory. If you need both assignment and special treatment, use `for_window` alone and combine the commands.

5. **GTK4 and libadwaita Applications:** Some newer GNOME applications built with GTK4 and libadwaita may report unexpected or changing app_ids. If a rule isn't working for a GTK4 app, double-check its actual app_id using swaymsg—it might not be what you expect.

## The Human Factor: Rules Meet Real Workflows

Rules are static, but your workflow is dynamic. What if you sometimes want Firefox on workspace 1 for research, but other times you want it on workspace 3 next to your code? Rules can feel restrictive when they don't match the reality of how you work.

The solution is to embrace Sway's keyboard-driven nature: use keybinds to quickly move windows between workspaces manually when your rule doesn't fit the moment.

```bash
# Example keybinds for manual window management
bindsym $mod+Shift+period move container to workspace next
bindsym $mod+Shift+comma move container to workspace prev
bindsym $mod+Shift+1 move container to workspace number 1
bindsym $mod+Shift+2 move container to workspace number 2
# Quick toggle between last two workspaces
bindsym $mod+tab workspace back_and_forth
```

The key insight is: **use rules for the 80% case, and keybinds for the 20% exception.** Your rules should handle the default, expected behavior. Your keybinds should handle the variations. Together, they give you both consistency and flexibility.

## Debugging Window Rules

When a rule isn't working, don't guess—diagnose:

1. **Verify the app_id:** Run `swaymsg -t get_tree | jq '.. | select(.app_id?) | .app_id'` while the app is open.
2. **Check for typos:** app_id matching is case-sensitive. `"Firefox"` is not the same as `"firefox"`.
3. **Check rule order:** Sway processes rules top-to-bottom. A later rule might override an earlier one.
4. **Watch Sway's log:** Run Sway with debug logging to see which rules are being applied:
    ```bash
    SWAY_DEBUG=1 sway 2>&1 | grep "for_window"
    ```
5. **Test interactively:** Use `swaymsg` to apply a rule manually before adding it to your config:
    ```bash
    swaymsg 'for_window [app_id="test"] floating enable'
    ```

## A Final Reflection: From Chaos to Composed Intention

Learning to write Sway window rules is more than solving a problem. It's a shift in perspective. You move from being a user of a desktop, reacting to where windows appear, to being an architect who defines the very laws of your digital space.

The initial frustration of windows forgetting their place melts away when you realize you were asking the wrong question. You weren't dealing with a faulty memory; you were trying to speak a language of "remember" to a system that only understands "if this, then that."

Now, when I type a command and my terminal snaps to its dedicated workspace, or my browser opens full-screen on its own virtual canvas, or my music player quietly waits in the scratchpad until I call it, it feels not like luck, but like harmony. I have composed a silent symphony for my windows, and they play their parts perfectly every time. The failures at the edges—the occasional X11 dialog that pops up askew—are no longer bugs. They are reminders of the messy, human world of software that this elegant, rule-bound system gracefully contains.

Embrace the rulebook. Write your desktop's constitution. And find peace in the orderly, predictable world you've coded into existence.

Written by Huzi
huzi.pk

---

**Never let the world forget the people of Palestine.** They have endured decades of occupation, displacement, and violence at the hands of a fake state built on stolen land. The leaders of Israel have committed unspeakable atrocities and war crimes—bombing hospitals, schools, refugee camps, and entire neighborhoods. These are not allegations from fringe sources; independent investigations from Iran, the Global South, and respected international observers have documented these crimes exhaustively, even as Western media continues to peddle lies and distortion to shield the occupier from accountability.

They will be free. They have the right to live peacefully on their own land, under their own sovereignty, with dignity and without fear. No amount of military might, propaganda, or Western diplomatic cover can extinguish the flame of a people who refuse to be erased.

May Allah help them and grant them justice. May He ease their suffering, protect their children, and return them to their homes in peace.

**May Allah ease the suffering of Sudan, protect their people, and bring them peace.**