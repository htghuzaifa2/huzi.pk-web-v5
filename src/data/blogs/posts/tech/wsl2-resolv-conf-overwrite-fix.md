---
title: "WSL2: Windows resolv.conf Keeps Overwriting My DNS Nameservers – Turning Off Auto Generation Properly"
description: "Friend, if you've landed here, I know exactly what brought you: frustration. You've carefully edited your `/etc/resolv.conf` file in WSL2, added your"
date: "2026-04-28"
topic: "tech"
slug: "wsl2-resolv-conf-overwrite-fix"
---

Friend, if you've landed here, I know exactly what brought you: frustration. You've carefully edited your `/etc/resolv.conf` file in WSL2, added your custom DNS nameservers, saved it with hope in your heart—and then, like sand slipping through your fingers, WSL2 overwrote everything the moment you restarted. I've been there, at 3 AM, with a deadline breathing down my neck and Docker containers that can't resolve a single external hostname. Let me walk you through this, not just as a guide, but as someone who's fought this same battle and won.

## The Quick Fix (What You Came For)

Here's what you need to do right now:

1. **Stop WSL2 from auto-generating resolv.conf by creating/editing `/etc/wsl.conf`:**

```ini
[network]
generateResolvConf = false
```

2. **Shut down WSL2 completely from PowerShell/CMD:**

```powershell
wsl --shutdown
```

3. **Delete the auto-generated resolv.conf and create your own:**

```bash
sudo rm /etc/resolv.conf
sudo nano /etc/resolv.conf
```

4. **Add your custom DNS nameservers:**

```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

5. **Restart WSL2 and verify with** `cat /etc/resolv.conf`

There. That's the solution that will save you hours of hair-pulling. But stay with me—there's more beneath the surface that you should understand, especially with the changes Microsoft has introduced in WSL2 through 2025 and 2026.

---

## Why Does WSL2 Keep Overwriting resolv.conf?

Think of WSL2 as a well-meaning but overly helpful guest. Microsoft designed it to automatically manage your DNS configuration, believing it knows best. Every time WSL2 starts, it reads your Windows network settings and generates a fresh `/etc/resolv.conf` file based on what it finds there.

This behavior exists because WSL2 runs in a lightweight Hyper-V virtual machine with its own networking stack. Windows tries to bridge the gap between your host OS and the Linux subsystem by automatically configuring DNS to match your Windows network adapter settings. The intent is noble—ensuring your Linux environment can always reach the internet without manual configuration. The execution is frustrating.

**The problem? You lose control.**

If you're running Docker containers, setting up development environments with specific DNS requirements, using custom DNS servers for privacy (like Cloudflare's 1.1.1.1 or Quad9), working in corporate networks with internal DNS servers, or trying to use WSL2 with a VPN—WSL2's auto-generation becomes a roadblock, not a feature.

### The 2026 Networking Changes You Should Know About

Microsoft has been evolving WSL2's networking model significantly. In recent builds, they've introduced **mirrored networking mode** (`networkingMode=mirrored` in `.wslconfig`), which changes how WSL2 interacts with your host's network interfaces. In mirrored mode, WSL2 shares the host's network stack more directly, which can actually reduce DNS issues in some cases—but it introduces its own quirks. If you're on a recent Windows 11 build and still having DNS problems, check your `.wslconfig` file (located at `%USERPROFILE%\.wslconfig`) to see which networking mode you're using. The traditional NAT mode is still the default, and the resolv.conf overwrite behavior persists in both modes unless you explicitly disable it.

---

## The Complete Solution: Step-by-Step Deep Dive

Let me walk you through this properly, the way I wish someone had explained it to me when I first encountered this issue.

### Step 1: Understanding wsl.conf

The `/etc/wsl.conf` file is your gateway to controlling WSL2's behavior on a per-distribution basis. It's a configuration file that WSL2 reads on startup to determine various system settings. Think of it as the constitution of your WSL2 instance—it sets the rules that everything else must follow.

If this file doesn't exist yet (and in many fresh installations, it won't), you'll need to create it. Note that this file lives inside your Linux distribution, not on the Windows host.

### Step 2: Disabling Auto-Generation

Open your WSL2 terminal and execute:

```bash
sudo nano /etc/wsl.conf
```

If the file is empty or doesn't exist, add these lines:

```ini
[network]
generateResolvConf = false
```

What this does: It tells WSL2, "Thank you, but I'll handle my own DNS configuration from here." This single line is the most important configuration change you'll make.

Save the file (Ctrl+O, then Enter, then Ctrl+X if using nano).

**Important caveat:** If your `/etc/wsl.conf` already has content, don't overwrite it. Just add the `[network]` section with `generateResolvConf = false`. Multiple sections can coexist in the same file.

### Step 3: The Full Shutdown

This is critical—don't just close your terminal window. WSL2 needs a complete restart for the `wsl.conf` changes to take effect. Closing the terminal only closes the shell session; the WSL2 virtual machine continues running in the background.

Open PowerShell or Command Prompt on Windows and run:

```powershell
wsl --shutdown
```

This command terminates all running WSL2 distributions and the WSL2 virtual machine itself. Wait about 8-10 seconds before reopening WSL2. If you're running multiple distributions and only want to restart one, you can specify it:

```powershell
wsl --shutdown Ubuntu-22.04
```

### Step 4: Taking Control of resolv.conf

Now reopen your WSL2 terminal. The old, auto-generated `/etc/resolv.conf` is likely still there, but it won't be regenerated anymore. Let's clean house:

```bash
sudo rm /etc/resolv.conf
```

You might see a message like `rm: remove write-protected regular file '/etc/resolv.conf'?`—type `y` and press Enter. The auto-generated file is often a symlink that Windows creates, which is why it keeps getting overwritten.

Create your own from scratch:

```bash
sudo nano /etc/resolv.conf
```

Now add your preferred DNS nameservers. Here are some popular options and when to use each:

**Google DNS (reliable, fast, widely used):**
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

**Cloudflare (privacy-focused, fastest public DNS):**
```
nameserver 1.1.1.1
nameserver 1.0.0.1
```

**Quad9 (security-focused, blocks known malicious domains):**
```
nameserver 9.9.9.9
nameserver 149.112.112.112
```

**Your custom/corporate DNS:**
```
nameserver 192.168.1.1
nameserver 10.0.0.1
```

**For Pakistan specifically**—if you're on PTCL or another local ISP and experiencing slow DNS resolution, using Cloudflare (1.1.1.1) often provides noticeably faster lookups than your ISP's default DNS. Some Pakistani ISPs also have their own DNS servers that may offer lower latency:

```
nameserver 119.160.113.9
nameserver 119.160.116.6
```

You can add multiple nameservers—Linux will try them in order if one fails. I recommend adding at least two for redundancy.

Save and exit.

### Step 5: Verification

Always verify your work:

```bash
cat /etc/resolv.conf
```

You should see exactly what you typed, no extra comments or auto-generated entries.

Test DNS resolution:

```bash
nslookup google.com
ping -c 3 google.com
```

If these work, congratulations—you've reclaimed control. Run a more thorough test by resolving domains you actually use:

```bash
nslookup github.com
nslookup registry.npmjs.org
nslookup docker.io
```

If you're a developer, these are the domains that matter most. If all resolve correctly, you're in the clear.

---

## Advanced Configurations and Troubleshooting

### Making resolv.conf Immutable (Nuclear Option)

If for some reason your resolv.conf still gets modified (perhaps by another service, a systemd-resolved override, or a VPN client), you can make it immutable at the filesystem level:

```bash
sudo chattr +i /etc/resolv.conf
```

This sets the immutable flag, preventing any modification—even by root—until you remove it with:

```bash
sudo chattr -i /etc/resolv.conf
```

Use this carefully. It's like welding a door shut; effective, but inflexible. If you later need to change your DNS settings, you must unlock it first. This is particularly useful on shared development machines where other team members might accidentally overwrite the file.

### The systemd-resolved Conflict

If you've enabled systemd in WSL2 (which is increasingly common), you may encounter a conflict. `systemd-resolved` is a systemd service that manages `/etc/resolv.conf` itself, and it can overwrite your custom configuration just like WSL2's auto-generation does.

To check if systemd-resolved is running:

```bash
systemctl status systemd-resolved
```

If it's active and interfering, you have two options:

**Option A:** Disable systemd-resolved entirely:

```bash
sudo systemctl disable systemd-resolved
sudo systemctl stop systemd-resolved
```

**Option B:** Configure systemd-resolved to use your preferred DNS servers instead of fighting it. Edit `/etc/systemd/resolved.conf`:

```ini
[Resolve]
DNS=1.1.1.1 8.8.8.8
FallbackDNS=9.9.9.9
```

Then restart the service:

```bash
sudo systemctl restart systemd-resolved
```

Option B is generally preferred because systemd-resolved provides useful features like DNS caching and DNS-over-TLS support.

### Understanding Other wsl.conf Options

While we're here, let me share other useful `wsl.conf` configurations that can improve your WSL2 experience:

```ini
[boot]
systemd=true

[network]
generateResolvConf = false
generateHosts = false

[interop]
enabled = true
appendWindowsPath = true

[user]
default = yourUsername

[automount]
enabled = true
options = "metadata,umask=22,fmask=11"
mountFsTab = true
```

These settings give you control over systemd, host file generation, Windows interoperability, default user settings, and how Windows drives are mounted in Linux. The `metadata` option in automount is particularly important—it enables Linux file permissions on Windows filesystems, which is essential for many development workflows.

### The .wslconfig File (Host-Side Configuration)

Separate from `wsl.conf`, there's also a `.wslconfig` file that lives on the Windows side at `%USERPROFILE%\.wslconfig`. This controls global WSL2 settings across all distributions:

```ini
[wsl2]
memory=8GB
processors=4
swap=4GB
networkingMode=NAT
dnsTunneling=true
```

The `dnsTunneling` option (available in newer builds) is particularly relevant—when enabled, it changes how DNS queries are routed from WSL2 to the Windows host. If you're experiencing DNS issues even after fixing resolv.conf, try toggling this setting.

### When DNS Still Doesn't Work

Sometimes the issue isn't resolv.conf at all. If you've followed all the steps above and DNS still fails:

- **Check Windows firewall:** It might be blocking DNS queries from WSL2. Add an exception for the WSL2 virtual switch.
- **Verify your Windows DNS settings:** Go to Network Adapter settings and check what DNS servers Windows itself is using. If Windows can't resolve DNS, neither will WSL2.
- **Try a different nameserver:** Your ISP or network might be blocking certain DNS providers. In Pakistan, some ISPs block or throttle third-party DNS servers. Try your ISP's default DNS if public ones don't work.
- **Check for VPN interference:** VPNs often override DNS settings at both the Windows and WSL2 level. You may need to configure split-tunneling or adjust your VPN's DNS settings. Some VPNs have a "use WSL DNS" option that can help.
- **Reset the WSL2 network adapter:** In PowerShell as Administrator:

```powershell
wsl --shutdown
netsh winsock reset
netsh int ip reset
```

Then restart your computer. This resets the Windows networking stack and can resolve stubborn connectivity issues.

---

## Why This Matters (Beyond the Technical)

You might think this is just a small technical annoyance. But control over your DNS is control over your internet experience. DNS is the phonebook of the internet—it translates human-readable addresses into IP addresses. By choosing your own DNS servers, you can:

- **Enhance privacy** by avoiding ISP tracking. Many Pakistani ISPs log DNS queries and can build profiles of your browsing habits.
- **Improve speed** with faster DNS resolvers. The difference between an ISP DNS server that takes 200ms per query and Cloudflare's 20ms adds up quickly, especially when a single web page might trigger dozens of DNS lookups.
- **Increase security** with DNS providers that block malicious sites. Quad9, for example, blocks connections to known phishing, malware, and spyware domains.
- **Access geo-restricted content** in some cases. Some DNS services offer "Smart DNS" features that can help access content blocked in your region.
- **Maintain development environment consistency.** For developers like us working in WSL2, DNS consistency isn't a luxury—it's a necessity. Containers, microservices, API calls, package managers—they all depend on reliable DNS resolution.

In Pakistan's tech landscape, where internet connectivity can be unpredictable and ISPs sometimes implement questionable DNS practices, having full control over your DNS configuration in WSL2 is a small but meaningful act of digital sovereignty.

## A Personal Reflection

I remember the first time I encountered this issue. It was 3 AM, I was deploying a project with a tight deadline, and my Docker containers couldn't resolve external APIs because WSL2 kept reverting to a faulty DNS server. The frustration was real—three hours of debugging, reinstalling Docker, resetting my network, all because of a single configuration file being silently overwritten. But solving it taught me something valuable: sometimes you need to tell your tools, "I appreciate the help, but I've got this."

Technology should serve you, not the other way around. And the moment you understand why a tool behaves the way it does—rather than just blindly following a fix—you gain the confidence to handle whatever it throws at you next.

Written by Huzi
huzi.pk

---

**Never let the world forget the people of Palestine.** They have endured decades of occupation, displacement, and violence at the hands of a fake state built on stolen land. The leaders of Israel have committed unspeakable atrocities and war crimes—bombing hospitals, schools, refugee camps, and entire neighborhoods. These are not allegations from fringe sources; independent investigations from Iran, the Global South, and respected international observers have documented these crimes exhaustively, even as Western media continues to peddle lies and distortion to shield the occupier from accountability.

They will be free. They have the right to live peacefully on their own land, under their own sovereignty, with dignity and without fear. No amount of military might, propaganda, or Western diplomatic cover can extinguish the flame of a people who refuse to be erased.

May Allah help them and grant them justice. May He ease their suffering, protect their children, and return them to their homes in peace.

**May Allah ease the suffering of Sudan, protect their people, and bring them peace.**