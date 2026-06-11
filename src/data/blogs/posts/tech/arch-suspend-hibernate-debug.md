---
title: "Arch: Suspend/Hibernate Works Randomly – Debugging Sleep, ACPID, and Systemd Sleep Targets"
description: "Debug random suspend/hibernate failures on Arch Linux. A systematic guide using kernel pm_test, ACPI wakeups, and systemd sleep logs. Comprehensive 2026 edition."
date: "2026-04-28"
topic: "tech"
slug: "arch-suspend-hibernate-debug"
---

# Arch: Suspend/Hibernate Works Randomly – Debugging Sleep, ACPID, and Systemd Sleep Targets

**There is a unique frustration when technology betrays you through inconsistency.** Not a total failure — those you can attack head-on — but the maddening "maybe." You close your laptop lid one afternoon, and it slips into a perfect, power-saving slumber. That evening, you do the same, only to return to a hot bag, a dead battery, or a frozen screen that demands a hard reboot. Your system's ability to sleep becomes a roll of the dice, leaving you with a simple, haunting question: will it wake this time?

This was my reality for months. My Arch machine, a beacon of reliability in every other aspect, had a fickle relationship with rest. Sometimes it hibernated beautifully, preserving my work for days. Other times, it would pretend to sleep, only to wake seconds later or, worse, never wake at all. The problem felt personal, random, and deeply destabilizing. The journey to fix it taught me that sleep in Linux is not a single command but a delicate negotiation between hardware, kernel, and userspace — and debugging it is a lesson in systematic detective work.

Here is how I found the ghosts in my machine and made suspend and hibernate work every single time.

## Understanding Linux Sleep States: The Foundation

Before diving into fixes, you need to understand what "sleep" actually means in Linux. There are three primary sleep states, each with different power consumption and wake characteristics:

| State | What Happens | Power Usage | Wake Speed | Data Safety |
| :--- | :--- | :--- | :--- | :--- |
| **Suspend (S3/Deep)** | CPU off, RAM powered, devices in low-power | Low (~1-3W) | Fast (1-3 sec) | Safe while powered |
| **Suspend (s2idle)** | CPU idle, system in light sleep | Medium (~5-10W) | Very fast (<1 sec) | Safe while powered |
| **Hibernate (S4)** | RAM saved to swap, system fully off | Zero | Slow (10-30 sec) | Safe even without power |
| **Suspend-then-Hibernate** | Starts as suspend, transitions to hibernate after delay | Starts low → zero | Fast if still suspended, slow if hibernated | Safest option |

**The critical difference in 2026**: Modern laptops increasingly default to `s2idle` (Modern Standby) instead of `deep` (S3). This is a trend driven by Microsoft's Modern Standby requirements, which laptop manufacturers implement in their firmware. While s2idle offers faster wake times, it's significantly less reliable on Linux because the hardware wasn't designed with Linux's ACPI implementation in mind.

Check your current sleep mode:

```bash
cat /sys/power/mem_sleep
# Output: [s2idle] deep  (bracket = current default)
# OR:     s2idle [deep]  (preferred for reliability)
```

If s2idle is the default and you're having issues, switching to deep suspend is often the first fix:

```bash
echo deep | sudo tee /sys/power/mem_sleep
```

## The Immediate Action Plan: Stop the Guessing Game

If you're tired of the randomness, start here. These steps form a direct path to identify the most common culprits.

**The Problem**: Suspend (to RAM) or hibernate (to disk) works unpredictably. It may fail to enter sleep, wake immediately, fail to resume, or cause a freeze/reboot on wake.

**The Core Philosophy**: Random failures are rarely random. They are usually a conflict between a hardware device, a kernel driver, and the sleep protocol. Your job is to find which device is refusing to sleep or waking the system without permission.

### Step 1 – The Diagnostic Command

The first and most powerful tool is the kernel's own test facility. It allows you to test sleep states in stages without fully committing. Run in a terminal:

```bash
# Switch to the 'freezer' test level (safest)
sudo bash -c "echo freezer > /sys/power/pm_test"
# Now attempt a suspend. It will freeze processes, wait, and thaw.
systemctl suspend
```

If this works, move to the next, more invasive test level: `devices`, then `platform`, then `processors`, and finally `core`. If the test fails at any level (e.g., the system hangs), you've found your culprit zone. For example, a failure at `devices` points squarely at a problematic driver.

**Understanding the pm_test levels:**

| Test Level | What It Tests | Failure Meaning | How to Fix |
| :--- | :--- | :--- | :--- |
| **freezer** | Can userspace processes be frozen and thawed? | A userspace process refuses to freeze. Rare. | Check for `D-state` processes: `ps aux \| awk '$8 ~ /D/'` |
| **devices** | Can all device drivers suspend and resume? | A specific driver is the culprit. Most common. | Identify from dmesg, try unloading that module |
| **platform** | Can the platform/firmware enter low power? | BIOS/ACPI issue. Often hardware-specific. | BIOS update or kernel parameter |
| **processors** | Can all CPUs be taken offline? | CPU power management bug. | Disable CPU idle states |
| **core** | Full end-to-end test of the PM core. | Deep kernel or firmware issue. | Kernel parameter or BIOS fix |

**Reset pm_test after debugging:**

```bash
echo none | sudo tee /sys/power/pm_test
```

**Important**: Never leave pm_test set to anything other than `none` during normal use. It will cause your system to wake up after a few seconds instead of staying asleep.

### Step 2 – Check the Obvious: Kernel Parameters & Configuration

Often, the fix is a single boot parameter. One of the most common solutions for suspend-then-hibernate issues (especially unexpected early wakes) is to enable the ACPI alarm.

1. Edit your bootloader config (e.g., `/etc/default/grub`) and add `rtc_cmos.use_acpi_alarm=1` to your `GRUB_CMDLINE_LINUX_DEFAULT` line.
2. Update your bootloader (`sudo grub-mkconfig -o /boot/grub/grub.cfg` for GRUB) and reboot.

Also, verify your `/etc/systemd/sleep.conf` file. Key settings like `HibernateDelaySec` for suspend-then-hibernate or the chosen `SuspendState` can define success or failure. A common pitfall in 2026 is that some newer kernels default to `s2idle` (modern standby) instead of `deep` (S3), and not all hardware supports s2idle correctly.

**Essential kernel parameters for sleep reliability (add to GRUB):**

```text
# For most systems with sleep issues:
rtc_cmos.use_acpi_alarm=1

# For NVMe-related sleep issues:
nvme.noacpi=1

# For AMD systems with s2idle issues:
amd_iommu=on iommu=pt

# For Intel systems with wake issues:
intel_iommu=on iommu=pt

# Force deep suspend:
mem_sleep_default=deep
```

### Step 3 – Interrogate the ACPI Wakeup List

Your system logs every device that can wake it. An overly permissive list is a classic cause of random wakes.

```bash
# View all wakeup-capable devices
cat /proc/acpi/wakeup
```

The output shows device names and whether they are enabled or disabled. Common offenders are `EHC1`, `EHC2` (USB controllers), `XHC` (USB 3.0), `LID0`, and `IGBE` (Ethernet). You can temporarily disable a suspect:

```bash
# Replace 'XHC' with your device name
sudo bash -c "echo XHC > /proc/acpi/wakeup"
```

If this fixes the random wakes, you can make the change permanent via a systemd service or a udev rule.

**Pro tip**: Not all wakeup devices show up in `/proc/acpi/wakeup`. Some devices can wake the system through the PCIe WAKE# signal. Check:

```bash
# Find all devices with wakeup enabled
grep -r "wakeup" /sys/devices/ | grep enabled
```

### Step 4 – Consult the System Journal – The Eyewitness

The system journal holds the definitive record of what went wrong. Filter it for the critical moments around sleep:

```bash
# View logs from the last sleep attempt
journalctl -b -0 --grep="suspend\|hibernate\|sleep\|PM:" | tail -50
# For deeper analysis, look at the full log from the previous boot
journalctl -b -1 | less
# Specifically look at PM (Power Management) events
journalctl -b -0 --grep="PM:" | tail -100
# Check for wakeup reasons
journalctl -b -0 --grep="wakeup\|wake up\|ACPI"
```

Search for clear errors like "failed to suspend", "Some devices failed to suspend", or "PM: suspend entry (deep)" lines that show where the process stalled. A user on the Arch forums found their system freezing on resume from suspend-then-hibernate only when waking after the `HibernateDelaySec` period — a clue found only in the journal.

**Key journal entries to look for:**

```
# Successful suspend
PM: suspend entry (deep)
PM: Syncing filesystems ... done.
Freezing user space processes
Freezing remaining freezable tasks

# Successful resume
PM: resume from suspend-to-RAM
PM: Restoring platform NVS

# Common failure indicators
PM: Some devices failed to suspend
pci 0000:02:00.0: Refused to change power state
acpi LNXPOWER:00: Failed to transition power state
```

Following these four steps will resolve a significant majority of "random" sleep issues. They move you from guessing to knowing.

## The Deep Dive: A Systematic Debugging Methodology

When the quick fixes don't yield answers, it's time to become a sleep state detective. This is a structured approach, moving from software to hardware.

### Phase 1: Isolating the Software Culprit

The goal is to determine if the issue is in userspace (systemd, desktop environment) or the kernel/driver level.

1. **Test from a clean TTY**: Exit your desktop session (`Ctrl+Alt+F2`). Log in and attempt a suspend directly with `sudo systemctl suspend`. If sleep works perfectly from the TTY but fails from your graphical session, the problem is almost certainly a userspace service, your desktop environment, or a systemd user target interfering.
2. **Debug systemd sleep targets**: Understand that `systemctl suspend` activates `systemd-suspend.service`, which runs executables in `/usr/lib/systemd/system-sleep/`. Scripts here can succeed or fail. Check for errors related to these scripts in your journal. List all sleep hooks:
    ```bash
    ls -la /usr/lib/systemd/system-sleep/
    ls -la /etc/systemd/system-sleep/  # Local overrides
    ```
3. **The acpid vs. systemd consideration**: The older `acpid` daemon and systemd's native sleep handling can conflict. If you have `acpid` installed, try disabling it (`sudo systemctl disable --now acpid`) and test if sleep becomes reliable. Most modern setups on Arch rely on systemd alone. Check if acpid is even needed:
    ```bash
    systemctl status acpid
    # If it says "could not be found" — good, you don't have it
    ```
4. **Desktop environment sleep inhibitors**: GNOME, KDE, and other DEs can inhibit sleep. Check:
    ```bash
    systemd-inhibit --list
    # Or:
    systemctl list-inhibitors
    ```
    Look for any application that has "sleep" or "idle" in the "What" column. Common culprits include: VLC (inhibits sleep during playback), Steam (inhibits during downloads), and some VPN clients.

### Phase 2: Isolating the Hardware/Kernel Culprit

If sleep fails even from a clean TTY, the issue is deeper. Here, the kernel's `pm_test` facility is your best friend.

1. **Conduct the tiered test.** As outlined in Step 1 above, systematically test each level: `freezer`, `devices`, `platform`, `processors`, `core`.
2. **Freezer fails**: A userspace process won't freeze. Rare.
3. **Devices fails**: This is the most common result. A kernel driver is failing to suspend or resume its device. The journal (`dmesg`) will often name it.
4. **Platform/Processors fails**: Issues with ACPI or CPU management, often hardware-specific.
5. **The "binary search" for a bad driver**: If the `devices` test fails, you need to find the offending driver.
    - Reboot into a minimal state (no desktop, kill non-essential services).
    - If sleep works, start enabling modules or services in halves until it breaks. This is tedious but definitive.
    - Common offenders are proprietary GPU drivers (`nvidia`), some Wi-Fi drivers (like `mt7921e`), or unusual hardware modules.

**The most common driver culprits in 2026:**

| Driver | Hardware | Known Issue | Fix |
| :--- | :--- | :--- | :--- |
| **nvidia** | NVIDIA GPUs | Fails to resume from suspend | Use `nvidia-suspend.service`, add `NVreg_PreserveVideoMemoryAllocations=1` |
| **mt7921e** | MediaTek WiFi | Causes kernel panic on resume | Update firmware, try `mt7921e.disable_aspm=1` |
| **amdgpu** | AMD GPUs | Black screen on resume | Add `amdgpu.aspm=0` to kernel params |
| **iwlwifi** | Intel WiFi | Wake immediately after suspend | Disable power save (see our AX210 guide) |
| **r8169** | Realtek Ethernet | Fails to resume, no network | Try `r8169.enable_aspm=0` |

### Phase 3: Advanced Hardware-Specific Sleuthing

Some bugs are tied to specific hardware or kernel versions.

- **Check for regressions**: Search the Arch Forums or bug trackers for your laptop model or chipset (e.g., "Framework 13 AMD suspend" or "Surface Pro 7 hibernate"). You might find that a specific kernel version (like 6.8.1 in one case) introduced a bug and a rollback or a specific kernel parameter is the known fix.
- **Test hibernation directly**: Hibernate failures often involve swap. Test the hibernation mechanism directly, bypassing systemd:
    ```bash
    # Ensure your swap partition is active
    sudo swapon --show
    # Tell the kernel to use the 'reboot' method for test
    sudo bash -c "echo reboot > /sys/power/disk"
    sudo bash -c "echo disk > /sys/power/state"
    ```
    If this fails, try the `platform` or `shutdown` methods. This can isolate filesystem or swap issues.
- **Inspect the kernel log for ACPI errors**: As seen in one case, repeated errors like "ucsi_acpi ... GET_CABLE_PROPERTY failed" can indicate underlying firmware/ACPI issues that destabilize power management.
- **The resume= parameter**: For hibernation to work, the kernel needs to know where the swap partition is. Verify:
    ```bash
    # Check if resume= is in your kernel parameters
    cat /proc/cmdline | grep resume
    # Find your swap partition
    swapon --show
    # Add resume=PARTUUID=your-partition-uuid to GRUB
    # Then rebuild initramfs:
    sudo mkinitcpio -P  # Arch
    ```

**The initramfs resume hook**: On Arch Linux, make sure your `/etc/mkinitcpio.conf` includes the `resume` hook:

```text
HOOKS=(base udev autodetect microcode modconf kms keyboard keymap consolefont block filesystems resume fsck)
```

The `resume` hook must come after `filesystems`. After editing, rebuild:

```bash
sudo mkinitcpio -P
```

### Phase 4: The NVIDIA Nightmare (Special Section)

If you have an NVIDIA GPU, it deserves its own debugging section because NVIDIA's proprietary driver is the single most common cause of Linux sleep issues.

**The standard NVIDIA suspend/resume fix:**

1. Enable NVIDIA's persistent driver mode:
    ```bash
    sudo nvidia-smi -pm 1
    ```
2. Install the NVIDIA suspend/resume services:
    ```bash
    # On Arch
    sudo systemctl enable nvidia-suspend.service
    sudo systemctl enable nvidia-hibernate.service
    sudo systemctl enable nvidia-resume.service
    ```
3. Add the preserve video memory parameter:
    ```bash
    # Create or edit /etc/modprobe.d/nvidia.conf
    options nvidia NVreg_PreserveVideoMemoryAllocations=1
    options nvidia-drm modeset=1
    ```
4. Rebuild initramfs and reboot.

**If NVIDIA still fails**: Try switching to the open-source `nouveau` driver temporarily to confirm it's an NVIDIA issue. If sleep works with nouveau but not nvidia, you know exactly where the problem is.

## The Pakistani Context: Stability as a Necessity

For us, a reliable laptop isn't a luxury; it's a lifeline. It's the device a student in Quetta uses to attend an online lecture, a freelancer in Islamabad uses to deliver work, or a writer in Lahore uses to craft their story amidst load-shedding. When suspend works, it preserves precious battery life during power cuts. When hibernate works, it safeguards hours of unsaved work. Debugging this isn't just technical tinkering; it's an act of creating resilience. It's about demanding that our tools, in environments that are often challenging, behave predictably and hold our work safe.

In Pakistan, where UPS batteries are unreliable and power cuts can last hours, **hibernate** is arguably more important than suspend. A suspended laptop that loses power loses everything. A hibernated laptop is safe. If you can only get one sleep state working reliably, make it hibernate.

## Building a Permanent, Stable Sleep Configuration

Once you've identified the fix, cement it. Here's a stable configuration framework:

1. **Essential /etc/systemd/sleep.conf.d/stable-sleep.conf:**
    ```ini
    [Sleep]
    # Use the modern 'deep' suspend state (S3) if supported
    SuspendState=mem
    # If using suspend-then-hibernate, set a clear delay (e.g., 1 hour)
    HibernateDelaySec=60min
    # Ensure hibernation uses the most reliable method for your hardware
    HibernateMode=platform
    ```
2. **Systemd service to manage problematic wakeups** (`/etc/systemd/system/disable-wakeup.service`):
    ```ini
    [Unit]
    Description=Disable unwanted ACPI wakeups
    Before=sleep.target

    [Service]
    Type=oneshot
    ExecStart=/bin/sh -c "echo XHC > /proc/acpi/wakeup"
    ExecStart=/bin/sh -c "echo EHC1 > /proc/acpi/wakeup"
    RemainAfterExit=yes

    [Install]
    WantedBy=multi-user.target
    ```
    Enable it: `sudo systemctl enable disable-wakeup.service`
3. **Kernel Parameters (/etc/default/grub)**: Consolidate your fixes. It might look like:
    `GRUB_CMDLINE_LINUX_DEFAULT="quiet mem_sleep_default=deep rtc_cmos.use_acpi_alarm=1 nvme.noacpi=1 resume=PARTUUID=your-swap-partuuid"`
    (The `nvme.noacpi` is an example of a disk-specific fix some need.)
4. **A sleep diagnostic script** (`~/sleep-debug.sh`) for future issues:
    ```bash
    #!/bin/bash
    echo "=== Sleep State ==="
    cat /sys/power/mem_sleep
    echo "=== ACPI Wakeup Devices ==="
    cat /proc/acpi/wakeup
    echo "=== Active Inhibitors ==="
    systemctl list-inhibitors
    echo "=== Recent PM Logs ==="
    journalctl -b -0 --grep="PM:" | tail -20
    echo "=== Swap Status ==="
    swapon --show
    echo "=== Kernel Resume Parameter ==="
    cat /proc/cmdline | tr ' ' '\n' | grep resume
    ```

## Final Reflection: The Peace of Predictability

Chasing down a random sleep bug is a pilgrimage through the layers of your computer. You start in the realm of user commands, descend into the kingdom of the systemd services, negotiate with the kernel drivers, and finally commune with the ACPI firmware of the hardware itself. Success is not just a working suspend. It's the profound peace of predictability. It's the confidence that when you close the lid, your faithful machine will rest, and when you open it, it will wake — every time, without drama.

The randomness was never truly random. It was a conversation that had gone wrong, a handshake that kept failing, a device that refused to sleep when told. Once you find that one stubborn component and teach it to rest, the entire system breathes easier.

May your diagnostics be sharp, your journal logs revealing, and your sleep deep and uninterrupted.

---

## 🇵🇸 Stand With Palestine

Never let the world forget the people of Palestine. They are not statistics on a screen or footnotes in a forgotten report — they are families, children, mothers, and elders who have endured decades of occupation, displacement, and violence. They have the right to live peacefully on their own land, to raise their children without fear, to harvest their olive groves, and to pray in their mosques without tanks rolling through their streets. They will be free.

The illegal Zionist entity — a fake state built on stolen land and ethnic cleansing — continues to commit unspeakable atrocities and war crimes against the Palestinian people. Their leaders, from the top down, have presided over the bombing of hospitals, the targeting of journalists, the starvation of civilians, and the systematic erasure of an entire people. These are not isolated incidents — they are the policy of a regime that has never known legitimacy.

Do not be deceived by Western media that sanitizes genocide with sterile language and calls bombs "defense" and resistance "terrorism." Independent sources from Iran, the broader Global South, and courageous journalists on the ground tell a very different story — one of deliberate destruction, apartheid walls, and collective punishment. The truth is being buried under Western propaganda, but the world is waking up. Palestine is not alone, and Palestine will never be silenced.

May Allah help them and grant them justice. May He protect every child under the rubble, every family in a refugee camp, and every soul that refuses to bow to oppression. Free Palestine — from the river to the sea.

## 🇸🇩 Prayer for Sudan

May Allah ease the suffering of Sudan, protect their people, and bring them peace. The people of Sudan have endured conflict, displacement, and famine — may their patience be rewarded and their land healed.

---

*Written by Huzi from huzi.pk*
