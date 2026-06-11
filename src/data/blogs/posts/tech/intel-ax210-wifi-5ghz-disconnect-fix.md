---
title: "Intel AX210: WiFi Randomly Disconnects on 5 GHz Only – iwlwifi Module Options and Power Saving"
description: "Fixing random 5 GHz WiFi disconnects on the Intel AX210 by disabling aggressive power saving and tuning iwlwifi module options. Complete 2026 guide with firmware analysis and advanced troubleshooting."
date: "2026-04-28"
topic: "tech"
slug: "intel-ax210-wifi-5ghz-disconnect-fix"
---

# Intel AX210: WiFi Randomly Disconnects on 5 GHz Only – iwlwifi Module Options and Power Saving

There's a special kind of frustration that lives in the silent spaces between clicks. It's the moment your video call freezes, right as a loved one's laughter begins. It's the agonizing pause in a crucial download, the "buffering" circle that feels like a taunt. And when this digital ghosting happens only on the fast, modern 5 GHz band of your shiny Intel AX210 WiFi card, while the older 2.4 GHz chugs along faithfully, the frustration turns into a puzzle. A puzzle that feels deeply personal.

If you're here, cradling a cup of chai, wrestling with this exact phantom in your Linux machine, you're not alone. Thousands of users across the Arch, Fedora, Ubuntu, and Debian communities have reported the same maddening pattern: a solid 2.4 GHz connection but an unreliable, randomly-dropping 5 GHz link. The AX210 is a marvel — a key to the doors of Wi-Fi 6E — but its dance with the Linux iwlwifi driver can sometimes stumble, especially on the 5 GHz frequency. The culprit, more often than not, is an overzealous attempt to be polite — a feature called power saving.

Today, let's walk through this not just as a technical fix, but as a conversation between your machine and the invisible waves it tries to catch. We'll find the harmony — and we'll go deeper than any forum post you've read before.

## Understanding the Intel AX210: What Makes It Special (and Problematic)

The Intel Wi-Fi 6E AX210 (code-named "Typhoon Peak") is Intel's first WiFi card to support the 6 GHz band, making it a tri-band adapter capable of connecting to 2.4 GHz, 5 GHz, and 6 GHz networks. It supports WiFi 6E (802.11ax), theoretical speeds up to 2.4 Gbps, and Bluetooth 5.3 — all in an M.2 2230 form factor that fits most modern laptops.

On Windows, the AX210 generally works flawlessly thanks to Intel's mature, proprietary driver stack. On Linux, the open-source `iwlwifi` driver handles it, and while it's come a long way, certain firmware versions and power management configurations still create the infamous 5 GHz disconnect problem.

**Key identifiers for the AX210:**

| Detail | Value |
| :--- | :--- |
| **PCI ID** | 8086:2725 |
| **Driver** | iwlwifi (with iwlmvm) |
| **Firmware** | linux-firmware package (look for `iwlwifi-ty-a0-gf-a0-*.ucode`) |
| **Supported Bands** | 2.4 GHz, 5 GHz, 6 GHz |
| **Max Speed** | 2.4 Gbps (160 MHz channel, 2x2 MIMO) |
| **Bluetooth** | 5.3 (via Intel AX210 combined module) |

You can confirm your card with:

```bash
lspci -nn | grep -i "network"
# Or for USB variants:
lsusb | grep -i "intel"
```

## The Quick Fix First: A Calm Hand on the Shoulder

Before we dive into the why, here's the how. If you need relief right now, these are the most potent remedies. Open your terminal — that's our gateway. The goal is to pass a quiet instruction to the iwlwifi kernel module to ease its power-saving grip.

### For immediate, temporary testing (lasts until reboot):

```bash
sudo modprobe -r iwlmvm iwlwifi
sudo modprobe iwlwifi power_save=0 swcrypto=1 11n_disable=8
```

**This trilogy of options is our first prayer:**

- **`power_save=0`**: The main fix. It tells the card to stop aggressively dozing off, which can break its connection on 5 GHz. The iwlwifi driver's power management is designed for maximum battery savings, but on the AX210, it sometimes sends the card into such a deep slumber that it forgets to wake up when the router calls. The power save feature works by putting the WiFi radio into periodic sleep states (PS-Poll and U-APSD), but the timing between sleep and wake cycles can desynchronize with the access point's expectations, especially on the more timing-sensitive 5 GHz band.
- **`swcrypto=1`**: Enables software-based encryption instead of hardware crypto. Sometimes the AX210's hardware crypto engine gets overwhelmed during 5 GHz handshakes, especially on busy networks with many clients. Software crypto is slightly more CPU-intensive but dramatically more stable. The hardware crypto acceleration on the AX210 has been known to drop packets during rekeying events, which are more frequent on 5 GHz due to the higher data throughput.
- **`11n_disable=8`**: A specific tweak for 802.11n (a part of 5 GHz's tech) that disables TX aggregation. Aggregation bundles multiple frames together for efficiency, but on some AX210 firmware versions, this bundling causes dropped frames that cascade into full disconnects. The value `8` specifically disables TX A-MPDU (Aggregate MAC Protocol Data Unit) aggregation while keeping RX aggregation and other 802.11n features intact. Alternative values: `1` disables 802.11n entirely (too aggressive), `2` disables TX aggregation, `4` disables RX aggregation, `8` disables TX A-MPDU specifically.

If this brings a stable, unwavering 5 GHz connection, we've found our path. To make it permanent, we etch this instruction into the system's memory.

### The Permanent Solution:

Create a configuration file:

```bash
sudo nano /etc/modprobe.d/iwlwifi-fix.conf
```

In this new file, add this single line:

```text
options iwlwifi power_save=0 swcrypto=1 11n_disable=8
```

Save (Ctrl+X, then Y, then Enter in nano), reboot, and observe. For many, this is the sunset on a long storm.

**Verify the fix is active after reboot:**

```bash
cat /etc/modprobe.d/iwlwifi-fix.conf
# Should show: options iwlwifi power_save=0 swcrypto=1 11n_disable=8

# Check if modules loaded with your parameters:
dmesg | grep iwlwifi | head -20
```

## The Deep Dive: Why Does This Happen?

Technology isn't just circuits and code; it's a landscape of intentions. The AX210 is designed to be fast and efficient. The 5 GHz band, with its wider highways, is more susceptible to interference and requires a more consistent, powerful conversation with your router. The iwlwifi driver's default power management is like a conscientious friend who keeps lowering their voice to save energy, eventually becoming inaudible. The router stops hearing it, and the connection drops.

Think of it like this: The 2.4 GHz band is a bustling, forgiving bazaar. Sounds carry, persist, bounce off walls. A whisper still reaches the other side. The 5 GHz band is a pristine library — faster, clearer, but any whisper, any lapse in attention, breaks the spell. The AX210, trying to save every last milliwatt, sometimes whispers so softly on 5 GHz that the router simply stops listening.

### The Technical Mechanism Behind the Disconnect

When the AX210 enters a power-save state, it sends a notification to the access point (AP) saying "I'm going to sleep, buffer my packets." The AP acknowledges and starts queuing frames. When the card wakes up, it sends a PS-Poll or triggers a U-APSD delivery period. The AP then sends the buffered frames. Here's where it goes wrong on 5 GHz:

1. **Timing sensitivity**: 5 GHz networks use shorter guard intervals and wider channels. The timing window for the wake-up handshake is narrower than on 2.4 GHz. If the card takes too long to transition from sleep to active, the AP may have already dropped the buffered frames or reclassified the client as disconnected.
2. **Beamforming desync**: Many 5 GHz routers use MU-MIMO beamforming. When the AX210 wakes from power save, the beamforming matrix must be recalculated. Some AP firmware doesn't handle this recalculation gracefully, leading to a period of garbled frames that the card interprets as interference, triggering another sleep cycle — a vicious loop.
3. ** regulatory domain confusion**: The AX210's 6E-capable firmware has to handle complex regulatory domain calculations for DFS (Dynamic Frequency Selection) channels on 5 GHz. During a wake cycle, if the regulatory check takes too long, the connection can drop.

### The Firmware Factor in 2026

Intel has released multiple firmware updates for the AX210 since its launch, and the Linux kernel's `linux-firmware` package has tracked these closely. However, certain firmware versions (particularly around the 0x0082 and 0x0089 series) introduced regressions in 5 GHz stability. If you've recently updated your system and the disconnects started afterward, check your firmware version:

```bash
dmesg | grep iwlwifi | grep "firmware"
```

You'll see output like:

```
iwlwifi 0000:02:00.0: loaded firmware version 72.d588efea.0 ty-a0-gf-a0-72.ucode op_mode iwlmvm
```

**Known problematic firmware versions:**

| Firmware Version | Issue | Kernel Version Range |
| :--- | :--- | :--- |
| **0x0082** | 5 GHz disconnects after ~30 minutes of idle | 5.15 – 5.19 |
| **0x0089** | 5 GHz fails to reconnect after AP roaming | 6.1 – 6.3 |
| **0x0090** | Intermittent 5 GHz drops with WPA3-SAE | 6.5 – 6.7 |
| **0x0092+** | Mostly stable, occasional edge cases | 6.8+ |

If you're on a problematic version, sometimes downgrading the `linux-firmware` package to the previous version can help. On Arch Linux:

```bash
# Check cached versions
ls /var/cache/pacman/pkg/linux-firmware-*
# Install a specific older version
sudo pacman -U /var/cache/pacman/pkg/linux-firmware-YYYYMMDD-1-any.pkg.tar.zst
```

On Ubuntu/Debian:

```bash
# Check available versions
apt-cache madison linux-firmware
# Install a specific version
sudo apt install linux-firmware=VERSION
# Prevent auto-upgrade
sudo apt-mark hold linux-firmware
```

## Beyond the Basic Fix: Other Avenues to Explore

Sometimes, the soul of the problem is slightly different. Here are other paths to walk down if the first fix doesn't settle everything.

### 1. The Power Management Tango (NetworkManager)

Even with the module option set, sometimes other layers try to manage power. Ensure NetworkManager isn't overriding our fix. Check the status for your WiFi interface:

```bash
iwconfig
# Or the newer ip/iw equivalent:
iw dev
```

Look for the Power Management line. If it says `on`, we can turn it off directly:

```bash
sudo iwconfig wlan0 power off
# Or using iw:
sudo iw dev wlan0 set power_save off
```

To make this permanent across reboots, create a NetworkManager dispatcher script:

```bash
sudo nano /etc/NetworkManager/dispatcher.d/disable-wifi-powersave.sh
```

Add the following:

```bash
#!/bin/bash
if [ "$1" = "wlan0" ] && [ "$2" = "up" ]; then
    iwconfig wlan0 power off
fi
```

Make it executable:

```bash
sudo chmod +x /etc/NetworkManager/dispatcher.d/disable-wifi-powersave.sh
```

**Alternative: Use NetworkManager's built-in config:**

```bash
sudo nano /etc/NetworkManager/conf.d/default-wifi-powersave-on.conf
```

Add:

```ini
[connection]
wifi.powersave = 2
```

The value `2` disables WiFi power saving. Value `3` enables it (the default). This is cleaner than a dispatcher script and survives NetworkManager updates.

### 2. The PCIe Power State Lullaby

Modern PCs put PCIe devices into low-power states (ASPM — Active State Power Management) to save battery. Sometimes, the card falls too deep asleep to wake up properly. This is especially common on laptops where the BIOS and Linux disagree about who should manage PCIe power.

Edit the GRUB configuration:

```bash
sudo nano /etc/default/grub
```

Find the line starting with `GRUB_CMDLINE_LINUX_DEFAULT` and add `pcie_aspm=off` inside the quotes.

```text
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash pcie_aspm=off"
```

Update GRUB and reboot:

```bash
sudo update-grub   # Debian/Ubuntu
sudo grub-mkconfig -o /boot/grub/grub.cfg   # Arch
```

**Caution**: This may slightly impact battery life on laptops — typically 5-10% reduction. It's a trade-off for rock-solid stability. For desktop users, there's zero downside.

**Finer-grained ASPM control**: If you want to disable ASPM only for the WiFi card rather than system-wide, you can use the `pcie_aspm.policy` parameter combined with a per-device override:

```bash
# Check your WiFi card's PCIe address
lspci | grep -i "network"
# Example output: 02:00.0

# Disable ASPM for just this device
echo performance | sudo tee /sys/bus/pci/devices/0000:02:00.0/power/control
```

### 3. The Environment: Your Router's Role

Your router isn't just a passive observer in this drama. Its settings can make or break 5 GHz stability.

- **Channel Width**: Try setting your router's 5 GHz channel width to 80 MHz instead of 160 MHz. The AX210 supports 160 MHz, but wider channels are more prone to interference, and some routers handle them poorly when multiple clients are connected. In Pakistan, where apartment buildings have 15-20 visible WiFi networks, 160 MHz is almost always a bad idea — there simply isn't enough clean spectrum.
- **Channel Itself**: Find the least congested 5 GHz channel. Use `iw dev wlan0 scan` on Linux or a WiFi analyzer app on your phone. Avoid DFS (Dynamic Frequency Selection) channels (52-144) if your driver has issues with them — the AX210 sometimes struggles with DFS channel switching. The best non-DFS 5 GHz channels are typically 36, 40, 44, 48 (UNII-1) and 149, 153, 157, 161 (UNII-3).
- **WPA3 Compatibility**: If your router forces WPA3-SAE, try switching to WPA2/WPA3 mixed mode. Some AX210 firmware versions have known issues with pure WPA3 on 5 GHz that cause intermittent disconnects. WPA2/WPA3 mixed mode allows WPA2 for the initial association and upgrades to WPA3 for data encryption — this transition is where some firmware versions stumble.
- **Router Firmware**: Keep your router's firmware updated. Many router manufacturers (especially TP-Link and ASUS) have released updates specifically addressing AX210 compatibility. Check your router manufacturer's support page.

### 4. The 6 GHz Band: A New Frontier

If your router supports Wi-Fi 6E (6 GHz band), the AX210 can connect there instead. The 6 GHz band is far less congested than 5 GHz and doesn't have the same coexistence issues. However, this requires WPA3, and the Linux iwlwifi driver's 6 GHz support is still maturing. If you're running kernel 6.6 or later, it's worth trying.

**6 GHz considerations for Pakistani users**: Currently, Wi-Fi 6E routers are expensive in Pakistan (Rs. 25,000+ for a basic model) and the 6 GHz band requires regulatory approval. Pakistan's frequency regulatory body (PTA/FAB) has been slow to open the 6 GHz band for unlicensed use, so some AX210 firmware versions may restrict 6 GHz operation based on the regulatory domain. You can check your current regulatory domain:

```bash
iw reg get
```

If it shows "PK" (Pakistan) and 6 GHz is restricted, you may need to set your regulatory domain to a country that has approved 6 GHz (like the US) — but be aware this may not be legally compliant:

```bash
sudo iw reg set US
```

### 5. The iwlwifi Module Parameter Deep Dive

Beyond the three main fixes, there are additional iwlwifi parameters that some users have found helpful. These are more aggressive and should be tested individually:

```bash
# Test these one at a time
sudo modprobe -r iwlmvm iwlwifi
sudo modprobe iwlwifi power_save=0 swcrypto=1 11n_disable=8 disable_11ax=1
```

- **`disable_11ax=1`**: Disables WiFi 6 (802.11ax) and falls back to WiFi 5 (802.11ac). This can help if your router's OFDMA implementation is buggy. You lose WiFi 6 features but gain stability.
- **`fw_restart=1`**: Enables automatic firmware restart on error (this is usually the default). If your firmware is crashing and not recovering, ensure this is set.
- **`nvm_file`**: Specifies an alternate NVM (Non-Volatile Memory) file. Advanced users only.
- **`uapsd_disable=1`**: Disables U-APSD (Unscheduled Automatic Power Save Delivery). This is one of the power save mechanisms that can cause 5 GHz issues.

## Real-World Scenarios from the Pakistani Linux Community

### Scenario 1: The Karachi Co-Working Space

A developer working from a co-working space in Clifton had constant 5 GHz disconnects. The problem? Over 40 visible WiFi networks competing for the same 5 GHz channels. The fix was channel-width reduction (160 → 80 MHz) combined with `11n_disable=8` and manually selecting channel 149 on the router.

### Scenario 2: The Islamabad University Lab

A university lab with 25 Dell laptops all using AX210 cards experienced mass disconnects during online exams. The root cause was the router's WPA3-only mode combined with the AX210's firmware. Switching to WPA2/WPA3 mixed mode and applying the `swcrypto=1` parameter resolved the issue across all machines.

### Scenario 3: The Lahore Freelancer

A freelancer's HP laptop with AX210 would disconnect from 5 GHz every time Bluetooth headphones were connected. This was a coexistence issue — Bluetooth and WiFi 5 GHz share the same antenna on some HP models. The fix was `power_save=0` combined with using the 2.4 GHz band for WiFi when Bluetooth audio was needed, or switching to wired headphones.

## Monitoring and Diagnosing: Your Ongoing Toolkit

Even after fixing the issue, it's good to have monitoring tools ready:

```bash
# Real-time WiFi link quality monitoring
watch -n 1 "iwconfig wlan0 | grep -E 'Signal|Frequency|Bit Rate'"

# Connection event logging
journalctl -f | grep -E "iwlwifi|wlan0|NetworkManager"

# Detailed connection statistics
iw dev wlan0 link
# Shows: signal strength, TX bitrate, RX bitrate, SSID, etc.

# Check for firmware errors
dmesg | grep -i "iwlwifi.*error\|iwlwifi.*fail\|iwlwifi.*warn"
```

**What good signal strength looks like on 5 GHz:**

| Signal Level | Quality | Expected Speed |
| :--- | :--- | :--- |
| **-30 to -50 dBm** | Excellent | Full speed (800+ Mbps) |
| **-50 to -60 dBm** | Good | 500-800 Mbps |
| **-60 to -67 dBm** | Fair | 200-500 Mbps |
| **-67 to -70 dBm** | Weak | 50-200 Mbps |
| **Below -70 dBm** | Unreliable | Expect disconnects |

If your signal is consistently below -67 dBm on 5 GHz, consider moving closer to the router or adding a WiFi repeater before blaming the driver.

## Conclusion: From Fragmentation to Flow

Fixing the AX210's 5 GHz disconnects is about establishing trust. Trust between your hardware and its driver, between your machine and the network, between you and the invisible flow of information that connects you to your world. It's a negotiation — not a battle — and each parameter we tune is a word in a conversation that brings the system closer to harmony.

When your connection holds strong, when your video calls flow without a single freeze, when your downloads complete without interruption, you'll know that the patience was worth it. The AX210 is an exceptional piece of hardware. It just needed someone to understand its language.

Start with the simple `modprobe` fix. If it works, make it permanent. If it doesn't, walk through the deeper diagnostics — firmware version, PCIe ASPM, router configuration, and the advanced module parameters. The solution is out there, and with this guide, you have a systematic map to find it.

---

```mermaid
flowchart TD
    A[Start: WiFi Drops on 5GHz] --> B{Initial Diagnostics}
    B --> C[Check <code>iwconfig</code><br>Power Management status]
    B --> D[Test temporary fix:<br><code>modprobe power_save=0</code>]
    
    C -- "If 'on'" --> E[Disable via NetworkManager<br>or <code>iwconfig power off</code>]
    D -- "Stability Improved?" --> F[Make Permanent:<br>Create <code>iwlwifi-fix.conf</code>]
    
    F --> G{Still Disconnects?}
    G -- Yes --> H[Kernel Tweak:<br>Set <code>pcie_aspm=off</code> in GRUB]
    H --> I[Router Tweak:<br>Change 80/160MHz width]
    I --> J{Still Disconnects?}
    J -- Yes --> K[Advanced: Check firmware version<br>Try <code>disable_11ax=1</code>]
    K --> L[Last Resort:<br>Downgrade linux-firmware]
    
    G -- No --> M[🎉 Connection Restored]
    J -- No --> M
    L --> M
```

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
