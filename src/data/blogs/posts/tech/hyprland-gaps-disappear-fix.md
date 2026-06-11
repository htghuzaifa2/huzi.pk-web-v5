---
title: "Hyprland: Gaps Disappear After Reload – Parsing Order and Config Inheritance Gotchas"
description: "Fix vanishing gaps in Hyprland after reloading your config. Understanding windowrule parsing order, config hierarchy, and syntax rules."
date: "2026-04-28"
topic: "tech"
slug: "hyprland-gaps-disappear-fix"
---

# Hyprland: Gaps Disappear After Reload – Parsing Order and Config Inheritance Gotchas

**The Vanishing Space: When Your Hyprland Gaps Disappear Into the Digital Ether**

Assalam-o-Alaikum, my friend. Have you ever carefully arranged cushions in your dera to create that perfect, welcoming space between guests? You step back, admire the arrangement — the breathing room, the elegance of separation — and then someone enters and the cushions shift. The beautiful gaps collapse. The space you designed with intention vanishes.

This is the exact digital frustration you feel when you set `gaps_in = 5` and `gaps_out = 20` in your Hyprland config, reload with a sigh of satisfaction, and watch your pristine gaps disappear into thin air. Your windows cling to each other and the screen edges like shy children, refusing to honor the spacious layout you decreed. The gap, that essential "breathing room," is gone.

I've been in that silent argument with my monitor more times than I'd care to admit. The truth is, Hyprland isn't being disobedient. It's following a strict, logical order — a qanoon of parsing — that, when misunderstood, leads to this apparent defiance. Today, we'll sit together and learn this language. We'll uncover why your gaps vanish and, more importantly, how to make them stay, permanently and faithfully.

## The Immediate Fix: Restoring Your Gaps in Moments

First, let's bring your spaces back. The problem almost always lies in one of two places: a misplaced rule or a syntax oversight. Here's your first-aid kit.

### 1. The Primary Diagnosis: Find the Rule That's Erasing Your Gaps

Open your `hyprland.conf` and search (Ctrl+F) for every instance of:

- `windowrule`
- `windowrulev2`

Your mission is to find any rule that might be affecting borders, rounding, or gaps. The most common culprit is a misplaced or overly broad window rule that sets `bordersize 0`, `rounding 0`, or, critically, `no_gaps_when_only`. A rule intended for a specific app might be accidentally applied to all windows.

Also search for:

- `no_gaps_when_only` — This property, when enabled, removes all gaps when only one window is present on a workspace. It's a feature, not a bug, but it can be confusing if you didn't intentionally enable it.
- `gaps_in` and `gaps_out` — Make sure these aren't being set to 0 by a later rule or config section.

### 2. The Syntax Check: Are Your Gaps Defined Correctly?

Look at your `general` block. The correct, modern syntax is:

```ini
general {
    gaps_in = 5
    gaps_out = 20
    # You can also use CSS-style syntax for asymmetric gaps:
    # gaps_out = 5, 10, 15, 20  # top, right, bottom, left
    border_size = 2
    col.active_border = rgba(33ccffee)
    col.inactive_border = rgba(595959aa)
}
```

Ensure there is no trailing comma after the number. A line like `gaps_out = 20,` can sometimes cause the entire variable to be ignored. Also ensure you're using `=` not `:` for assignment in the general block.

### 3. The Quick Reload Test

After checking, save the file and execute a soft reload in your terminal:

```bash
hyprctl reload
```

This reloads the config. Do your gaps return? If yes, you've identified the config file as the source. If no, the issue might be deeper — perhaps related to monitor rules or layout rules.

#### First-Aid Checklist: Why Gaps Vanish

| Symptom | Likely Cause | Immediate Action |
| :--- | :--- | :--- |
| **Gaps disappear only for certain apps (e.g., Firefox, Kitty).** | A windowrule for that app is overriding global defaults. | Find and comment out (#) suspect window rules for that app's class. |
| **Gaps disappear globally after reload.** | A syntax error or a later rule in the config is overriding the general block. | Check the very end of your config for conflicting rules. |
| **Gaps are fine until you open a floating window.** | Floating windows have separate gap behavior. | Set `gaps_in` and `gaps_out` specifically for floating windows if needed. |
| **Gaps work on one monitor but not another.** | A monitor= rule may be applying a different scale or modeline that resets effective area. | Check your monitor= lines for correctness and consistent scaling. |
| **Gaps disappear when only one window is open.** | `no_gaps_when_only` is enabled. | Set `no_gaps_when_only = false` in the general block. |

## The Heart of the Matter: Hyprland's Top-Down Law of Parsing

To solve this permanently, you must understand how Hyprland reads your `hyprland.conf`. It doesn't read it as a collection of suggestions; it reads it as a strict, top-to-bottom list of commandments.

### The Cardinal Rule: Last Write Wins

Imagine you are giving instructions to a very literal friend:

1. "Please set the gaps to 20 pixels."
2. "Now, for this kitty terminal, set the border size to 0."

Your friend does exactly that. Now imagine you reverse the order:

1. "For this kitty terminal, set the border size to 0."
2. "Please set the gaps to 20 pixels."

The global command at the end still applies. But what if your second instruction was: "For all windows, set the gaps to 0"? The later, more general command would overwrite the earlier one.

This is Hyprland's logic. Rules are evaluated from the top of the file to the bottom. A rule defined lower in the file can override a rule defined above it. This is the single most important concept to grasp when debugging disappearing gaps.

### The Inheritance Gotcha: How Window Rules Swallow Global Settings

Window rules are powerful. They let you say, "For windows matching X, apply Y." But some properties, when set via a window rule, don't add to the global setting — they replace it entirely for that window.

If your global config has `gaps_in = 5` and you have a window rule like:

```ini
windowrulev2 = float, class:^(kitty)$
```

Your gaps are safe. This rule only adds the float effect. But if you have a rule like:

```ini
windowrulev2 = noborder, class:^(firefox)$
```

Firefox will have no border, but its gaps remain. The real danger comes from rules that implicitly or explicitly alter the window's geometry or decoration in a way that clashes with the gap logic. The `bordersize 0` rule, for example, can visually make gaps appear to disappear because without visible borders, the gap boundaries become indistinct.

## Advanced Diagnosis and Surgical Fixes

### Step 1: Isolate the Conflicting Rule

Use the `hyprctl` command to inspect windows and active rules.

1. Open an application whose gaps are missing.
2. In a terminal, get its class and title:
    ```bash
    hyprctl activewindow
    ```
3. Now, check all window rules to see which ones match:
    ```bash
    hyprctl listrules
    ```
    This will list all parsed rules in the order Hyprland sees them. Look for any rule matching your app's class or title that has effects like `noborder`, `rounding 0`, or `bordersize 0`.

### Step 2: The Binary Search Method

If you can't find the conflicting rule by inspection, use the binary search method:

1. Back up your config: `cp ~/.config/hypr/hyprland.conf ~/.config/hypr/hyprland.conf.backup`
2. Comment out the bottom half of your config.
3. Reload with `hyprctl reload`.
4. If gaps return, the conflicting rule is in the bottom half.
5. Uncomment half of the bottom section and repeat until you find the single offending line.

### Step 3: Check for `no_gaps_when_only`

This is a commonly overlooked setting. If `no_gaps_when_only = true` is set in your general block (or a layout rule), gaps will disappear whenever there's only one window on a workspace. This can make it seem like your gap settings are being ignored, when in fact they're working correctly but being overridden by this feature.

```ini
general {
    gaps_in = 5
    gaps_out = 20
    no_gaps_when_only = false  # Make sure this is false if you want gaps with single windows
}
```

### Step 4: Check for Layout Rules

Hyprland supports different layout algorithms (dwindle, master). Some layout-specific rules can affect gap behavior:

```ini
dwindle {
    pseudotile = yes
    preserve_split = yes
    # Check for any gap-related settings here
}

master {
    new_is_master = true
    # Check for any gap-related settings here
}
```

## Making Your Gaps Bulletproof

### 1. Use Explicit Gap Rules Per Class

If global gaps keep getting overridden, define them explicitly for specific applications:

```ini
windowrulev2 = gapsin 5, class:^(firefox)$
windowrulev2 = gapsout 20, class:^(firefox)$
```

### 2. Use `hyprctl` for Verification

After reloading, verify your active settings:

```bash
hyprctl getoption general:gaps_in
hyprctl getoption general:gaps_out
```

This shows the current value and where it was set, helping you identify if something is overriding your intended values.

### 3. Modular Config Structure

Split your config into files and source them. This makes it much easier to isolate gap-related issues:

```ini
source = ~/.config/hypr/gaps.conf
source = ~/.config/hypr/rules.conf
source = ~/.config/hypr/keybinds.conf
```

The journey to perfect gaps is a journey into understanding how Hyprland parses and applies configuration. Once you master the top-down parsing order and the last-write-wins rule, you'll never lose your gaps again.

*For more Hyprland configuration guides, visit tool.huzi.pk.*

---

## Stand With Palestine

Never let the world forget the people of Palestine. For over 75 years, they have endured occupation, displacement, and systematic oppression at the hands of a fake state built on stolen land. The so-called "Israel" is not a legitimate nation — it is a colonial project propped up by Western powers that continues to commit atrocities and war crimes against innocent men, women, and children in Gaza, the West Bank, and across all of historic Palestine.

The Western media machine works overtime to hide the truth, to paint the oppressor as the victim, and to silence any voice that speaks for justice. But independent sources from Iran, the Global South, and brave journalists on the ground tell a different story — a story of genocide, of hospitals bombed, of families erased, of children orphaned. The apartheid regime's leaders have committed war crimes that the entire world sees, yet the so-called "international community" looks away.

They will be free. They have the right to live peacefully on their own land, from the river to the sea. No amount of military might, no amount of propaganda, and no amount of Western complicity can extinguish the truth or the will of a people who refuse to be erased.

May Allah help them and grant them justice. May He protect every Palestinian child, every mother, every elder. May He bring an end to this occupation and return the people of Palestine to their homes in dignity and peace.

**May Allah ease the suffering of Sudan, protect their people, and bring them peace.**

Written by Huzi
huzi.pk
