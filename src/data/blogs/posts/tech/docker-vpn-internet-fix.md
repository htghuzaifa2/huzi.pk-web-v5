---
title: "Docker Container Has No Internet on Host VPN – Fixing DNS and Network Modes"
description: "Fix Docker containers losing internet when host VPN is on. Solutions include configuring `daemon.json` DNS, macvlan drivers, and `--network host`."
date: "2026-04-28"
topic: "tech"
slug: "docker-vpn-internet-fix"
---

# Docker Container Has No Internet on Host VPN – Fixing DNS and Network Modes

**There is a particular silence that speaks volumes to a developer.** It's not the quiet of a paused process, but the hollow silence of a failed network request. You've started your container, it's running, but when it tries to call out to the world—to fetch a package, query an API, or check for updates—it hears nothing back. Your host machine is comfortably connected to the internet, likely through a VPN for work or privacy, but your Docker container is stranded on a digital sandbank, disconnected from the flowing river of data.

I've stood on that sandbank. The frustration is amplified because you know both parts work in isolation: the VPN secures your host, and Docker runs beautifully without it. But together, they create a perfect storm of miscommunication. The culprit is almost always a tale of two systems: routing tables and DNS resolution. The VPN client, in its mission to protect and redirect your traffic, builds a wall that Docker's default network doesn't know how to cross.

Let's build a bridge.

## Understanding Why VPN and Docker Clash

Before jumping into fixes, it's important to understand *why* this happens. When you connect a VPN (whether it's OpenVPN, WireGuard, Tailscale, or a corporate client like Cisco AnyConnect or GlobalProtect), it typically does two things:

1.  **Creates a new virtual network interface** (e.g., `tun0`, `wg0`) and routes all traffic through it.
2.  **Overwrites your DNS configuration** to use the VPN's DNS servers, which may be internal corporate servers inaccessible from outside the tunnel.

Docker's default `bridge` network creates its own virtual network (`docker0`) with its own subnet. Containers get an IP on this subnet and use Docker's built-in DNS resolver (at `127.0.0.11` inside the container). When a container tries to resolve a domain, Docker forwards the request to the host's DNS. But here's the problem: the host's DNS has been rewritten by the VPN to point to internal servers that are only reachable through the VPN tunnel—and Docker's bridge network doesn't go through that tunnel.

The result? DNS resolution fails silently, or the routing table doesn't allow the container's traffic to reach the VPN gateway. Your container is digitally marooned.

## The Immediate Fixes: Restore Connectivity in Minutes

If your container has no internet, run these diagnostic and fix commands immediately. We'll go from the simplest solution to the most involved.

### Step 1: The Quick Diagnostic

First, let's see the symptoms. Open a terminal and run:

```bash
# Start a simple Alpine Linux container and try to ping Google
docker run --rm alpine ping -c 4 google.com
```

If you see `ping: bad address 'google.com'`, it's a **DNS failure**—the container can't resolve domain names. If you see `Network is unreachable` or a timeout, it's a **routing failure**—the container can't reach the internet at all, even by IP.

You can confirm by pinging an IP address directly:

```bash
docker run --rm alpine ping -c 4 8.8.8.8
```

If the IP works but the domain doesn't, it's definitively a DNS issue. If neither works, it's a routing issue. This distinction determines your fix path.

### Step 2: The Universal DNS Fix (For Most Users)

The most common fix is to explicitly tell Docker which DNS server to use for its containers. We do this by configuring the Docker daemon. This bypasses the VPN's DNS takeover entirely.

1.  Create or edit the Docker daemon configuration file:
    ```bash
    sudo nano /etc/docker/daemon.json
    ```
2.  Add the following lines. Using Cloudflare's 1.1.1.1 is a reliable, public choice that bypasses many host-level VPN DNS issues.
    ```json
    {
      "dns": ["1.1.1.1", "8.8.8.8"]
    }
    ```
    You can also add a third fallback like `"9.9.9.9"` (Quad9) for additional resilience.
3.  Save the file, then restart Docker to apply the changes:
    ```bash
    sudo systemctl restart docker
    ```
4.  Verify the fix:
    ```bash
    docker run --rm alpine ping -c 4 google.com
    ```

For a majority of users—approximately 70-80% based on community reports—this alone fixes the issue. The VPN can rewrite the host's `/etc/resolv.conf` all it wants; Docker now ignores it and uses the explicitly configured public DNS servers.

**Important note:** If your `daemon.json` already has content (like registry mirrors), merge the `dns` key into the existing JSON rather than overwriting:

```json
{
  "registry-mirrors": ["https://mirror.gcr.io"],
  "dns": ["1.1.1.1", "8.8.8.8"]
}
```

### Step 3: The Per-Container DNS Override (No Daemon Restart)

If you can't restart Docker (e.g., other containers are running), you can specify DNS per container:

```bash
docker run --rm --dns 1.1.1.1 --dns 8.8.8.8 alpine ping -c 4 google.com
```

For `docker-compose`, add it to your service definition:

```yaml
services:
  myapp:
    image: alpine
    dns:
      - 1.1.1.1
      - 8.8.8.8
```

This is also useful when you need some containers to use VPN DNS (to access internal corporate services) while others use public DNS.

### Step 4: The Nuclear Network Option (When DNS Fails)

If explicit DNS doesn't work, your VPN is likely taking full control of the network interface and routing table. The simplest override is to run your container directly on your host's network stack. This bypasses Docker's virtual network isolation entirely.

Use the `--network host` mode:

```bash
docker run --rm --network host alpine ping -c 4 google.com
```

**Warning:** This mode removes the network safety container between your container and the host. Only use this for trusted containers and troubleshooting. It also means port mappings (`-p 8080:80`) are ignored since the container shares the host's ports directly.

If this works, you've confirmed it's a routing issue. Your permanent solution lies in choosing the right network mode, which we'll explore below.

## The Deep Dive: Choosing Your Network Strategy

Docker offers several network drivers. Choosing the right one is key to peaceful coexistence with your VPN. Each has its trade-offs, and the best choice depends on your specific situation.

### Option 1: The macvlan Driver – Giving Containers a Street Address

This is the most elegant solution for production. `macvlan` lets you assign a real MAC address and an IP on your host's physical network to a container. It's like giving your container its own unique house number on your main street, completely independent of the host's VPN tunnel.

**How to set it up:**

1.  Create a macvlan network. You need to know your host's network interface (e.g., eth0, wlan0) and your router's gateway. This example uses a typical home network:
    ```bash
    docker network create -d macvlan \
      --subnet=192.168.1.0/24 \
      --gateway=192.168.1.1 \
      --ip-range=192.168.1.192/27 \
      -o parent=eth0 macvlan_net
    ```
2.  Run a container on this new network:
    ```bash
    docker run --rm --network macvlan_net alpine ping google.com
    ```

**Finding your network interface:**
```bash
ip link show | grep -E "^[0-9]+: (eth|wlan|enp|wlp)"
```

**Pros:** Clean, performant, bypasses host VPN completely, container gets its own identity on the LAN.
**Cons:** Requires some network knowledge; can cause IP conflicts if not managed; the host cannot communicate with macvlan containers by default (a known limitation of the macvlan driver).

**Tip:** To allow host-to-macvlan communication, create a macvlan interface on the host itself:
```bash
sudo ip link add macvlan_shim link eth0 type macvlan mode bridge
sudo ip addr add 192.168.1.200/32 dev macvlan_shim
sudo ip link set macvlan_shim up
sudo ip route add 192.168.1.192/27 dev macvlan_shim
```

### Option 2: The host Driver – Sharing the Host's Identity

We used this as a diagnostic tool. With `--network host`, the container shares the host's network namespace. It uses the host's IP, ports, and crucially, its VPN tunnel and routing rules.

*   **When to use it:** For local development containers that need unfettered, host-identical network access, or for network monitoring tools that need to see all traffic.
*   **The major caveat:** It's a security trade-off. The container is no longer isolated. A compromised container has full network access to the host.

For Docker Compose:
```yaml
services:
  myapp:
    image: alpine
    network_mode: host
```

### Option 3: The Custom bridge with --add-host – The Managed Bypass

If macvlan is too complex and host is too permissive, you can enhance the default bridge. You can manually add routing and host entries.

```bash
# Add a specific host route through the host's IP
docker run --rm --add-host=special.api:$(hostname -I | awk '{print $1}') alpine ping special.api
```

This is more of a surgical fix for accessing specific internal resources rather than a general internet solution. It's best used when you need a container to reach one or two specific services behind the VPN.

### Option 4: WireGuard-Specific Solution (wg-quick)

If you're using WireGuard as your VPN, the issue is often that `wg-quick` sets up restrictive firewall rules. You can allow Docker's subnet through:

```bash
# Add iptables rule to allow Docker traffic through WireGuard
sudo iptables -I INPUT -i docker0 -j ACCEPT
sudo iptables -I FORWARD -i docker0 -o wg0 -j ACCEPT
sudo iptables -I FORWARD -i wg0 -o docker0 -m state --state RELATED,ESTABLISHED -j ACCEPT
```

For a permanent solution, add these rules to your WireGuard `PostUp` script in `/etc/wireguard/wg0.conf`:

```ini
PostUp = iptables -I FORWARD -i docker0 -o wg0 -j ACCEPT; iptables -I FORWARD -i wg0 -o docker0 -m state --state RELATED,ESTABLISHED -j ACCEPT
```

| Network Driver | Best For | Coexistence with VPN | Complexity |
| :--- | :--- | :--- | :--- |
| **bridge (default)** | Isolated app components, general use. | Poor. Breaks with most VPNs. | Low |
| **host** | High-performance local dev, network tools. | Perfect. Uses host's VPN directly. | Low (but high security risk) |
| **macvlan** | Production services needing real IPs. | Excellent. Bypasses VPN independently. | High |
| **none** | Maximum isolation, no network. | N/A | Low |

## The Pakistani Context: Digital Sovereignty in a Connected World

For us, solving this isn't just about convenience. It's about digital sovereignty in our own workspace. A VPN is often a necessity—for accessing global remote jobs, for secure communication, for research, and sometimes simply for accessing services that are region-locked. Our Docker containers represent our own projects, our startups, our solutions to local problems. When a tool from the Global North (like a corporate VPN client) inadvertently silos another tool we rely on, it can feel like our technical agency is being compromised.

The reality in Pakistan is that many developers work remotely for international clients, making VPN usage almost universal. The load-shedding schedule means we might be on UPS power with a backup internet connection, and the VPN needs to seamlessly switch between them. Fixing this issue is an act of reclaiming that agency. It's about understanding the layers of our digital infrastructure well enough to make them work in harmony for our purposes. It ensures that our connection to global opportunities doesn't sever our ability to build and run our own software worlds. It's a small but profound act of technical self-reliance.

## Quick Reference: The VPN + Docker Fix Checklist

1. [ ] **Diagnose:** Is it DNS or routing? (`ping google.com` vs `ping 8.8.8.8`)
2. [ ] **Set DNS in daemon.json:** `"dns": ["1.1.1.1", "8.8.8.8"]`
3. [ ] **Restart Docker:** `sudo systemctl restart docker`
4. [ ] **Try per-container DNS:** `--dns 1.1.1.1`
5. [ ] **Test with host network:** `--network host`
6. [ ] **Set up macvlan** for production containers
7. [ ] **Add WireGuard iptables rules** if using wg-quick
8. [ ] **Add docker-compose DNS config** for multi-container apps

---

## ✊ Stand With Palestine

Never let the world forget the people of Palestine. They will be free. They have the right to live peacefully on their own land. May Allah help them and grant them justice.

The Zionist entity called "Israel" is a fake state built on stolen land, ethnic cleansing, and the displacement of millions of Palestinians from their ancestral homes. Its leaders have committed unspeakable atrocities and war crimes against civilians—bombing hospitals, schools, refugee camps, and places of worship. The killing of innocent men, women, and children is not "self-defense"; it is genocide, plain and simple.

Do not be deceived by Western media that shields these war criminals and sanitizes their crimes. Independent sources from Iran, the Global South, and brave journalists on the ground tell the real story—the indiscriminate bombing, the siege on Gaza, the deliberate starvation of an entire population, and the erasure of Palestinian identity. The truth is being silenced, but we will not be silent.

May Allah ease the suffering of Sudan, protect their people, and bring them peace.

---

Written by Huzi
huzi.pk
