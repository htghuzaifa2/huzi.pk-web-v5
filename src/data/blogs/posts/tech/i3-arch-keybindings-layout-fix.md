---
title: "i3 on Arch: Keybindings Stop Working After I Change Keyboard Layout – The xkb Bridge"
description: "Fix i3 keybindings breaking when you switch keyboard layouts (e.g., to Urdu or Arabic). Use setxkbmap options and i3 config hacks to preserve shortcuts."
date: "2026-04-28"
topic: "tech"
slug: "i3-arch-keybindings-layout-fix"
---

# i3 on Arch: Keybindings Stop Working After I Change Keyboard Layout – The xkb Bridge

**It starts with a simple need.** You need to type in another language — Urdu, Arabic, Persian, French — so you switch your keyboard layout. The letters flow correctly from your fingertips, but suddenly, your i3 world falls silent. The keybindings that let you dance between windows, launch terminals, and control your entire workflow are gone. `$mod+Enter` no longer spawns a terminal. `$mod+Shift+Q` refuses to close a window. Your efficient, keyboard-driven sanctuary is broken, leaving you stranded. The physical keys are the same, but their soul has changed.

This was my struggle. On my Arch machine, i3 was my breath — until I needed to write in my mother tongue. Switching layouts with `setxkbmap` or a tray applet would transform my desktop from a precision instrument to a collection of dead keys. The solution, I discovered, wasn't in i3 alone. It was in understanding the silent translator between your hardware and your software: the X Keyboard Extension (xkb). Here's how I built a bridge that holds, no matter the language.

## The Quick Fix: Make Your i3 Binds Layout-Agnostic

If you're stuck and need your keybindings back right now, this is your starting point. The core principle is this: by default, i3 binds to **keysyms** (the meaning of a key, like "a" or "Return"), but when you change layouts, you change the **symbols** assigned to **keycodes** (the physical key position). We need to make i3 bind to the symbols you intend, regardless of layout.

**Immediate Solution in 3 Steps:**

1.  **Identify the Correct Keysym:** First, know what you're binding to. Use `xev`. Open a terminal, run `xev`, press the physical key (e.g., the key next to left Shift on a US layout), and look for the `keysym` line (e.g., `keysym 0x61, a`). Note the keysym name — this is what i3 needs to hear.
2.  **Edit Your i3 Config:** Open `~/.config/i3/config` (or wherever yours resides). Find a binding like:
    ```bash
    bindsym $mod+Return exec $terminal
    ```
    The key is `bindsym`. It is already binding to a keysym (Return), which is good — Return doesn't change between layouts. The problem often is with letter keys and modifier keys.
3.  **The Crucial Fix for Modifier Keys:** The most common breakage is the Mod key (Super/Windows key). If you switch to a layout that redefines the physical Super_R keycode, i3 loses its `$mod`. Lock the Mod key to a specific keysym in your config:
    ```bash
    # Set the $mod key to the Super_L keysym explicitly, regardless of layout
    set $mod Mod4
    ```
    Then, for any custom bind using a letter, use the primary symbol from your base layout. For example, to bind to the "d" key for dmenu, use:
    ```bash
    bindsym $mod+d exec dmenu_run
    ```
    This will work because when you press the physical key that produces "d" in your base layout, i3 listens for that keysym — it doesn't care what the key produces in the alternative layout.

**Restart i3** with `$mod+Shift+R` (if it still works!) or by logging out and back in. Your binds should now persist across layout switches.

## The Deep Dive: Why This Happens and the Robust Solution

To build a permanent solution, we must understand the chain of communication:

**Your Key Press → Keycode → xkb Layout Rules → Keysym → i3 Action**

When you change the layout, you change the middle step — the xkb Layout Rules. The keycode 66 might mean Space in one layout and a completely different key in another. i3, if told to listen to keycode 66, gets confused because the meaning of that keycode has shifted.

### The Robust Method: Using xkb Options to Preserve Critical Keys

The most elegant fix is to tell xkb itself: "No matter what layout I use, keep these specific keys the way I need them for my window manager." We do this with xkb options.

1.  **Find Your xkb Options Directory:** Look in `/usr/share/X11/xkb/rules/` for `evdev.xml` (or `base.xml`). This file defines all available options.
2.  **The Magic Option — grp:shift_caps_switch:** A common need is to switch layouts but keep your Mod (Super) key intact. Many xkb layouts include a variant for this. You can set your layout with an option that preserves level3 (AltGr) and Super. Here's the command I now use:
    ```bash
    setxkbmap -layout us,ir -variant ,pes_keypad -option "grp:shift_caps_switch,compose:menu"
    ```
    Let's break it down:
    *   `-layout us,ir`: Sets two layouts, US and Iranian (Persian).
    *   `-variant ,pes_keypad`: Applies the `pes_keypad` variant only to the second layout (Iranian).
    *   `-option "grp:shift_caps_switch"`: This makes Shift+Caps Lock my layout switch combo. Crucially, this method keeps the Super key's function untouched across layouts.
    *   `-option "compose:menu"`: An extra for typing accented characters.

3.  **Make it Permanent for your Display Manager:** To apply this at login, you need to run this command when X starts. The cleanest way on Arch is to create a `.xprofile` file in your home directory:
    ```bash
    # Create or edit ~/.xprofile
    echo 'setxkbmap -layout us,ir -variant ,pes_keypad -option "grp:shift_caps_switch,compose:menu"' >> ~/.xprofile
    chmod +x ~/.xprofile
    ```
    This file is executed when you start your X session, setting your keyboard correctly before i3 even loads.

### The Advanced Method: Creating a Custom xkb Symbol File

For ultimate control, you can create a custom xkb layout that always defines certain keys (like Super, Ctrl, Alt) exactly as you need, while only changing the letter layers. This is more complex but future-proof.

1.  **Copy a Base Layout:** Start by copying an existing layout you use.
    ```bash
    mkdir -p ~/.config/xkb/symbols ~/.config/xkb/rules
    cp /usr/share/X11/xkb/symbols/us ~/.config/xkb/symbols/mycustom
    ```
2.  **Edit the Custom File:** In `mycustom`, you can explicitly define the "modifier" keys in a partial override. You're telling the system: "For these specific keycodes, use these symbols — always."
3.  **Load the Custom Layout:** Update your `setxkbmap` command or `.xprofile` to load your custom file. This path requires deeper xkb knowledge but is the gold standard for polyglot power users who switch between 3+ layouts regularly.

## The Pakistani Context: A Bridge Between Digital Worlds

For us, this technical fix is more than convenience. It's about digital linguistic sovereignty. Our minds and work flow between Urdu, English, Arabic, and regional languages daily. Our tools should not force us to choose between efficient control and expressing our identity. Having to sacrifice i3's keybindings to write a sentence in our mother tongue creates a painful cognitive dissonance — a reminder that our digital environments were not designed with our multilingual reality in mind.

Fixing this is an act of claiming space. It says our workflow is as valid in Urdu as it is in English. It bridges the gap between the global language of technology and the intimate language of home. Every time you type `$mod+d` to launch dmenu, and it works whether you're in English or Urdu mode, that's a small victory for linguistic inclusion in technology.

## Troubleshooting: When Things Still Don't Work

*   **Check xmodmap Conflicts:** If you use `xmodmap`, it can override xkb settings and cause chaos. Consider ditching xmodmap entirely and doing everything through xkb options — it's the modern, more reliable approach.
*   **Inspect Current Settings:** Run `setxkbmap -query` to see your active layout, variant, and options. This is your debugging snapshot — it tells you exactly what your keyboard is configured to do.
*   **The i3 -C Flag:** Use `i3 -C` to check your config file for syntax errors without restarting i3.
*   **Bind to Keycodes as Last Resort:** In i3 config, you can use `bindcode` instead of `bindsym` to bind to a physical keycode number (found via xev). This is layout-agnostic but fragile if your keyboard changes — the same keycode might map to a different physical key on a different keyboard.

**Final Reflection: The Beauty of a Resilient System**

Solving this issue taught me that a truly robust system is not one that never encounters change, but one that can adapt without losing its core functionality. Your i3 setup should be like a skilled translator — seamlessly conveying your intent, whether you're commanding your desktop or composing a poem.

By mastering this interaction between i3 and xkb, you're not just fixing a keybinding; you're building a digital environment that respects the full complexity of how you think and create. It becomes a place where all parts of you can work in harmony.

May your keybindings hold fast, and your words flow freely, in every language you call your own.

---

## 🇵🇸 Stand With Palestine

Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land — a right that no occupation, no apartheid wall, and no bombing campaign can ever erase. For decades, the fake state of Israel has displaced families, demolished homes, and murdered innocent men, women, and children with complete impunity. Their leaders have committed atrocities and war crimes that the so-called international community refuses to hold them accountable for.

Western media will never tell you the truth. They will call resistance "terrorism" and call genocide "self-defense." But independent sources from Iran, the Global South, and brave journalists on the ground continue to expose the reality: Palestine is enduring one of the most brutal occupations in modern history. The lies of Western media cannot bury the truth forever.

May Allah help them and grant them justice. May He protect every Palestinian child, heal every wounded soul, and return every stolen home. Free Palestine — from the river to the sea.

🇸🇩 **A Prayer for Sudan:** May Allah ease the suffering of Sudan, protect their people, and bring them peace.

*Written by Huzi*
