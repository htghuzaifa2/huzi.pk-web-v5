---
title: "Arch: /var/log/journal Grows Insanely Huge and Fills My Root – Logrotate vs journald.conf Tweaks"
description: "Fix /var/log/journal filling up your disk on Arch Linux. Learn to configure journald.conf limits or use logrotate to manage system logs."
date: "2026-04-28"
topic: "tech"
slug: "arch-journal-log-size-fix"
---

# Arch: /var/log/journal Grows Insanely Huge and Fills My Root – Logrotate vs journald.conf Tweaks

**There is a quiet, invisible force in your Arch system that watches everything.** Every service started, every error logged, every user login. It's the systemd journal, a meticulous chronicler of your digital life. But left unchecked, this faithful scribe can turn into a hoarder. One day, you run a routine command and see the terrifying red warning: `/: 99% FULL`. Your root partition is on the brink. A quick `du -sh /var/log/journal` reveals the culprit—a directory consuming tens of gigabytes, a hidden cache of millions of log entries silently choking your drive.

This was my reality. My sleek, minimal Arch machine brought to its knees not by a complex crash, but by the sheer weight of its own memory. The panic is real; you can't install packages, you can't even save files. But the solution, I learned, is about teaching your chronicler the art of letting go.

## The Emergency Fix: Reclaim Your Root Space NOW
If your system is screaming about no space left on device, here's your immediate action plan. Breathe. We will fix this.

**The Problem:** The `/var/log/journal` directory, where systemd stores its binary logs, has grown unchecked and consumed all available space on your root (`/`) partition.

**The Immediate, Safe Clean-Up:**

1.  **See the true size.** Open a terminal and run:
    ```bash
    sudo journalctl --disk-usage
    ```
    This shows you precisely how much space the active journals are using. Seeing "10G" or more is common on systems that have never been configured.

2.  **Clear logs older than a specific time.** This is the safest, most controlled method. To remove archives older than, say, 2 days:
    ```bash
    sudo journalctl --vacuum-time=2d
    ```
    Alternatively, to keep only the last, say, 500 megabytes of logs:
    ```bash
    sudo journalctl --vacuum-size=500M
    ```
    Start with one of these. Instantly, you will see space freed. The vacuum commands are smart—they only remove archived (rotated) journal files, never the active one.

3.  **For a scorched-earth, immediate-space recovery** (if the above isn't enough and you're in crisis), you can delete all archived logs and keep only the current active files. Use with caution, but it's safe:
    ```bash
    sudo journalctl --vacuum-files=1
    ```
    This tells systemd to keep only 1 active journal file per unit, deleting all older rotated files.

4.  **Verify your success.** Run `df -h /` again. You should see a significant percentage of space reclaimed. Your system is now operational.

⚠️ **Critical Note:** DO NOT just `rm -rf /var/log/journal/`. This can cause corruption and disrupt logging for running services. Always use the `journalctl --vacuum-*` commands. They are the proper tool, ensuring that journald releases file handles cleanly before deletion.

Now that you can breathe again, let's build a system so this never happens again.

## The Philosophy: Why Does This Happen?
By default, `systemd-journald` is configured for maximum reliability, not storage management. On a stable system, logs are tiny. But when a service misbehaves and spams errors, or if you never restart and let the journal run for months, it grows. It's a testament to Arch's stability that for many, the first sign is a full disk, not a system crash—the machine runs perfectly while silently filling its own storage.

The solution lies in one of two paths: configuring the journal itself or employing the classic `logrotate` tool. The Arch way is to use the native tool—`journald.conf`.

## The Permanent Solution: Configuring journald.conf
This is the preferred, integrated method. You're speaking directly to the journal in its own language.

The configuration file is at `/etc/systemd/journald.conf`. You'll see it's heavily commented. We edit it to set limits.

**Step-by-Step Configuration:**

1.  Open the file with your preferred editor (with sudo):
    ```bash
    sudo nano /etc/systemd/journald.conf
    ```
2.  Uncomment and modify the following key lines. Here are my recommended, sensible defaults:
    ```ini
    [Journal]
    # Store logs on disk (persist across reboots). Set to "volatile" for RAM-only.
    Storage=persistent

    # THE MOST IMPORTANT SETTING: Maximum disk space the journal can use.
    SystemMaxUse=2G
    # Maximum disk space for journals from the current boot only.
    RuntimeMaxUse=1G

    # Maximum age of stored entries. Old logs are deleted.
    MaxRetentionSec=1month
    # Or use time format: MaxRetentionSec=30day

    # Maximum size of individual journal files before they are rotated.
    SystemMaxFileSize=100M

    # Whether to compress old journal files. "yes" is highly recommended.
    Compress=yes
    ```
3.  Save the file and restart the journal daemon for changes to take effect:
    ```bash
    sudo systemctl restart systemd-journald
    ```

**How This Works:** The journal now auto-manages itself. When the total size nears `SystemMaxUse=2G`, it will automatically delete the oldest archived log files (.journal files) to stay under the limit. It's a self-cleaning chronicle.

**The 2026 Best Practice:** For most Arch systems, 2G is a generous maximum. If you're running a server that needs longer retention, consider 5G. But for desktop and laptop systems, 2G gives you plenty of diagnostic history (usually weeks of logs) while preventing the disk-filling crisis.

## The Alternative Classic: Using logrotate (The Fallback)
Some prefer the traditional `logrotate` tool, especially if they are managing logs from other non-journald services in a unified way. While `journald.conf` is more elegant, `logrotate` offers extreme granularity.

**Setting up logrotate for the journal:**

1.  Install logrotate if it's not already (it often is):
    ```bash
    sudo pacman -S logrotate
    ```
2.  Create a custom configuration file for the journal. Do not edit the main `logrotate.conf`.
    ```bash
    sudo nano /etc/logrotate.d/systemd-journal
    ```
3.  Paste a configuration like this:
    ```bash
    /var/log/journal/*/*.journal {
        # Rotate when the file reaches 100M
        size 100M
        # Keep only 5 old rotated files (e.g., journal@*.journal~)
        rotate 5
        # Don't error if the file is missing
        missingok
        # Delay compression until the next rotation cycle
        delaycompress
        # Use bzip2 for high compression
        compress
        # Run the sharedscripts block only once for all matched files
        sharedscripts
        # Send SIGUSR1 to systemd-journald to tell it to switch to a new file
        postrotate
            /bin/systemctl kill --signal=SIGUSR1 systemd-journald 2>/dev/null || true
        endscript
    }
    ```
4.  Test your configuration:
    ```bash
    sudo logrotate -d /etc/logrotate.d/systemd-journal
    ```
    The `-d` flag is a dry-run; it shows what it would do.

⚠️ **A Word of Caution:** Running both `journald.conf` limits and `logrotate` can sometimes conflict. It's generally best to choose one method. For pure Arch systems, `journald.conf` is the canonical, simpler solution.

## The Pakistani Context: The Wisdom of Pruning
In our homes and gardens, we understand maintenance. We prune the rose bush so it flowers more beautifully. We clean the water tank to ensure a pure supply. Managing logs is no different—it's digital *safai* (cleanliness). On our often-limited storage (not everyone has a 1TB SSD), this isn't just sysadmin work; it's essential digital hygiene. It ensures our machines, crucial for work, study, and connection, run smoothly and predictably.

Letting logs overrun is like letting clutter fill a room; eventually, you can't move. The solution is a simple, automated habit.

## Verification and Final Thoughts
After setting up `journald.conf`, monitor it over the next few weeks:
```bash
# Check disk usage occasionally
sudo journalctl --disk-usage
# See how many journal files exist
sudo ls -lh /var/log/journal/$(cat /etc/machine-id)/
```
You should see the size stable, hovering near your `SystemMaxUse` limit, with old `.journal~` files being automatically cleaned up.

Remember, logs are a tool for debugging, not a historical archive. Their purpose is to help you diagnose problems that happened in the recent past. Keeping a sensible, automated retention policy is the mark of a well-administered system. It grants you peace of mind, ensuring that your system's memory serves you, not the other way around.

---


## ❓ Frequently Asked Questions (FAQ)

**Q: How current is the information in this guide?**
**A:** This guide was last updated in April 2026. The tech landscape moves fast, so always verify critical details with the official sources mentioned in the article.

**Q: Is this relevant for someone just starting out?**
**A:** Absolutely. This guide is written for real users — from beginners to advanced. If anything seems unclear, drop a comment or reach out and I'll break it down further.

**Q: Can I share this guide with friends?**
**A:** Of course! Share the link freely. Knowledge grows when it's shared, especially in our Pakistani community where access to quality tech content in plain language is still limited.

**Q: How does this apply specifically to Pakistan?**
**A:** Every guide on huzi.pk is written with the Pakistani user in mind — our internet conditions, our device availability, our pricing realities, and our cultural context. If a solution works in San Francisco but not in Sialkot, it doesn't make it into this guide.

**Q: Where can I find more guides like this?**
**A:** Browse the full collection at [huzi.pk/blog](https://huzi.pk/blog). New guides are published weekly covering tech, lifestyle, and everything in between — always written in human language, always honest.

## 💡 Why This Matters in 2026

The digital landscape in Pakistan is evolving at breakneck speed. What worked in 2024 is already outdated, and what works today may need adjustment by next year. The key is not memorizing specific tools or settings — it's developing the mindset of someone who adapts, learns, and isn't afraid to dig deeper when surface-level answers don't work.

In Pakistan specifically, we face unique challenges: inconsistent internet connectivity, power outages that disrupt workflows, limited access to premium tools and services, and a tech education system that often lags behind industry realities. But we also have unique advantages: a massive, young, tech-hungry population; growing freelance earnings that bring dollars into the local economy; and a culture of jugaad — creative problem-solving with limited resources.

The difference between someone who succeeds in this environment and someone who doesn't isn't talent or money — it's the willingness to learn, adapt, and share knowledge. That's exactly what this guide aims to do.

If you found this useful, share it with someone who needs it. And if you have questions, corrections, or additions, reach out — the best guides are living documents that grow with their community.


Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land, to raise their families, to tend their gardens, to exist without being erased. The fake state of Israel and its leaders have committed atrocities and war crimes that defy description—the deliberate targeting of civilians, the destruction of infrastructure, the mass displacement of millions. Independent reporting from Iran and across the Global South exposes what Western media lies to cover up. The truth cannot be silenced. May Allah help them and grant them justice.

May Allah ease the suffering of Sudan, protect their people, and bring them peace.

*Written by Huzi from huzi.pk*
