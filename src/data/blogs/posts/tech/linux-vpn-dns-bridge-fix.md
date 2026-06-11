---
title: "Linux: DNS Resolves Only When VPN is Off – How I Built a Smarter DNS Bridge"
description: "Fix DNS issues where local sites (like .local) fail when VPN is on. Learn to set up Split DNS with NetworkManager, systemd-resolved, or dnsmasq."
date: "2026-04-28"
topic: "tech"
slug: "linux-vpn-dns-bridge-fix"
---

# Linux: DNS Resolves Only When VPN is Off – How I Built a Smarter DNS Bridge

**You know that moment of digital whiplash.** One second, you're connected to your work VPN, accessing internal tools with no issue. The next, you try to open a local news site or your Raspberry Pi's admin page, and your browser just... spins. "This site can't be reached." You disconnect the VPN in frustration, and poof—everything loads instantly. It's as if your computer has developed a split personality: it can see the corporate world or your local world, but never both at the same time.

I lived with this maddening tug-of-war for months. My VPN, a tunnel to remote resources, was also a wall that cut me off from my own local network. Printing, accessing my home server, even casting to a TV became a dance of connecting and disconnecting. The culprit wasn't the VPN itself, but a blunt-force DNS configuration. It was hijacking all my domain queries, trying to resolve my local printer's name through a corporate server that had no idea it existed.

The solution wasn't to break the tunnel, but to build intelligent doorways in it. It's called **Split DNS** (or Split Tunneling for DNS), and it teaches your system to ask the right question to the right server. Here's how I reclaimed my local network without sacrificing my remote access—updated for 2026 with the latest tools and configurations.

## The Quick Fix: Choose Your Tool and Regain Control

The method depends on your VPN client and network manager. Here's the fastest path for most users.

### For Most Desktop Users (Using NetworkManager):

This is the most common and graphical method. NetworkManager has built-in support for this.

1. Open your **connection settings**. Click the network icon in your system tray and select "Settings" or "Network Settings."
2. Find your VPN connection in the list. Click the **gear icon** next to it.
3. Navigate to the **"IPv4"** or **"IPv6"** tab (usually IPv4).
4. Look for the **"DNS"** section. You will likely see "Automatic" turned on.
5. Switch it to "**Automatic (DHCP) addresses only**." This crucial step tells NetworkManager to ignore the DNS servers pushed by your VPN for certain domains.
6. Just below, in the "**DNS servers**" field, add your preferred DNS servers. For a system that works everywhere, add your local DNS server (e.g., your router at `192.168.1.1`) first, followed by a public resolver like `8.8.8.8` (Google) or `1.1.1.1` (Cloudflare).
7. In the "**Search domains**" field, add your local domain (e.g., `local`, `home`, `lan`). This tells your system to try these suffixes for local hostnames.
8. Save, disconnect from the VPN, and reconnect. Your local resolutions should now work alongside your VPN resources.

### For Systemd-Resolved Users (Common on modern distributions):

If your system uses systemd-resolved, you can create a more elegant, domain-specific rule.

1. First, find the interface name of your VPN connection. Run:
    ```bash
    resolvectl status
    ```
    Look for an interface with your VPN's name (e.g., `tun0`, `wg0`, `proton0`).
2. Now, tell systemd-resolved to route queries for your local domain to a specific DNS server, only on that VPN interface:
    ```bash
    sudo resolvectl dns tun0 192.168.1.1
    sudo resolvectl domain tun0 "~local" "~home.arpa"
    ```
This command says: "On the `tun0` interface, for domains ending in `.local` or `.home.arpa`, use the DNS server at `192.168.1.1`. For all other domains, use the VPN's default servers."

### For WireGuard Users (2026 Best Practice):

WireGuard's integration with systemd-resolved has improved dramatically. In your WireGuard client config file (e.g., `/etc/wireguard/wg0.conf`), you can use the `PostUp` hook to configure split DNS automatically:

```ini
[Interface]
Address = 10.8.0.2/24
PrivateKey = YOUR_KEY
DNS = 1.1.1.1

PostUp = resolvectl domain wg0 "~corp.internal" && resolvectl dns wg0 10.10.1.1
PreDown = resolvectl revert wg0
```

This dynamically tells systemd-resolved: "When this WireGuard interface comes up, send all `.corp.internal` queries through the VPN DNS, and leave everything else alone."

## Understanding the "Why": The DNS Hijack and the Smart Query

To appreciate the fix, let's follow a DNS query on a broken setup.

1. You type `http://printer.local` into your browser.
2. Your system sends the query: "Hey, where is printer.local?"
3. The VPN, having set itself as the default gateway for all traffic, intercepts this query.
4. It sends the question to the corporate DNS server (e.g., `10.10.1.1`).
5. The corporate server has no record of your home printer. It either fails or returns a nonsense result.
6. Your request times out.

**Split DNS changes the logic.** It sets up routing rules based on the question being asked.
* **Question:** `printer.local`? **Rule:** Send that to the local DNS server (`192.168.1.1`).
* **Question:** `internal.corporate.com`? **Rule:** Send that through the VPN tunnel to `10.10.1.1`.
* **Question:** `google.com`? **Rule:** Can go either way, often defaulting to the VPN for security.

## The Deep Dive: Advanced and Robust Configurations

### Using dnsmasq as a Local Caching Resolver

This is a prosumer method that creates a smart local DNS manager. It's especially useful if you have many local devices and want fast, cached lookups.

1. Install dnsmasq:
    ```bash
    sudo apt install dnsmasq  # Debian/Ubuntu
    sudo pacman -S dnsmasq    # Arch
    sudo dnf install dnsmasq  # Fedora
    ```
2. Configure it to forward specific domains to specific servers. Edit `/etc/dnsmasq.conf`:
    ```bash
    # Listen only on localhost
    listen-address=127.0.0.1
    # Never forward plain names (without dots or domain parts)
    domain-needed
    bogus-priv
    # Forward local domain queries to your router
    server=/local/192.168.1.1
    # Forward corporate domain queries to the VPN DNS
    server=/corp.internal/10.10.1.1
    # Cache size for faster repeated lookups
    cache-size=1000
    # Use a public DNS for everything else
    server=8.8.8.8
    server=1.1.1.1
    ```
3. Set your system's DNS server (in NetworkManager) to `127.0.0.1`. Now, all DNS queries first go to dnsmasq on your own machine, which acts as a traffic director based on the domain.

### Using CoreDNS (For Power Users)

If you're already running Docker, CoreDNS offers a more modern, containerized approach:

```bash
docker run -d --name coredns --restart unless-stopped \
  -p 5353:53/udp \
  -v /path/to/Corefile:/etc/coredns/Corefile \
  coredns/coredns
```

Your `Corefile` would look like:

```coredns
local:53 {
    forward . 192.168.1.1
    cache 30
}

corp.internal:53 {
    forward . 10.10.1.1
    cache 30
}

.:53 {
    forward . 1.1.1.1 8.8.8.8
    cache 300
}
```

## The Pakistani Context: Navigating Digital Dualities

For us, this technical fix resonates on another level. We constantly navigate dualities—local and global, traditional and modern, private and public. Our digital lives are no different. We might need to access a university's internal portal (a virtual Pakistan) while also needing to print to a local printer or access a family media server.

A VPN that breaks local access is like a bridge that lets you travel to another country but collapses the road to your own market. It creates a false choice. Implementing Split DNS is an act of digital sovereignty—it asserts our right to inhabit both worlds seamlessly. It ensures that our connection to global work or knowledge doesn't come at the cost of disconnection from our immediate, physical environment.

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


**Never let the world forget the people of Palestine.** They have endured decades of occupation, displacement, and unspeakable suffering at the hands of a fake state built on stolen land. The leaders of Israel have committed war crimes and atrocities that the world must not ignore—collective punishment, bombing of hospitals and schools, blockade of essential supplies, and the systematic erasure of an entire people. Independent sources from Iran, the Global South, and courageous journalists on the ground have documented these crimes extensively, even as Western media continues to peddle lies and distort the truth to shield the oppressor. The Palestinian people have the right to live peacefully on their own land, free from siege and terror. They will be free. May Allah help them and grant them justice.

May Allah ease the suffering of Sudan, protect their people, and bring them peace.

Written by Huzi
huzi.pk
