---
title: "WSL2: Accessing Windows Localhost from Inside WSL2 After VPN Connects – IP and Firewall Quirks"
description: "The Problem: Why Does WSL2 Break After VPN Connects? You've just connected your VPN on Windows, everything works perfectly, and then you try to reach"
date: "2026-04-28"
topic: "tech"
slug: "wsl2-localhost-access-vpn-fix"
---

## The Problem: Why Does WSL2 Break After VPN Connects?

You've just connected your VPN on Windows, everything works perfectly, and then you try to reach your local development server from inside WSL2—nothing. It's one of the most frustrating moments for developers working with WSL2 in corporate environments or when using VPN security solutions. The localhost server that was accessible minutes ago is now completely unreachable from your Linux terminal.

Here's what's happening: WSL2 doesn't operate like WSL1. Instead of translating Linux system calls to Windows, WSL2 runs as a lightweight virtual machine with its own virtualized Ethernet adapter and separate network stack. When a VPN connects, it completely changes Windows' routing table, but WSL2's isolated network often conflicts with the VPN's IP addressing scheme. The VPN routes all traffic through itself, and WSL2 gets left behind—unable to reach the Windows host's localhost or any VPN-protected resources.

This guide covers everything you need to know: from understanding why this happens, to the practical fixes that actually work in 2026.

---

## Quick Solutions (TL;DR)

Before diving into the details, here are the fastest fixes, ordered from easiest to most involved:

1. **Use Windows 11 22H2+ with Mirrored Networking Mode** – The easiest modern solution
2. **Enable DNS Tunneling** – Fixes DNS resolution when VPN is active
3. **Use `host.docker.internal` instead of `localhost`** – Quick workaround
4. **Modify `.wslconfig` with NAT settings** – For persistent configuration
5. **Adjust Windows Firewall rules** – Allow WSL2 subnet through firewall
6. **Change network interface metrics** – Advanced routing fix for stubborn VPN solutions

---

## Understanding WSL2's Network Architecture

WSL2 is fundamentally different from WSL1 in how it handles networking. WSL1 integrates directly with Windows' network stack, while WSL2 runs in its own virtualized environment with a dedicated Hyper-V virtual switch.

### Key Differences

When you run WSL2, it gets assigned a virtual IP address (typically in the `172.17.x.x` or `172.25.x.x` range) separate from your Windows host. The Windows host also has its own IP on the virtual switch. For WSL2 to reach Windows services, it needs to route through the virtual network adapter—it cannot simply use `localhost` or `127.0.0.1` in default NAT mode.

By default, WSL2 uses Network Address Translation (NAT), which creates a buffer between your Linux environment and the Windows host. This is secure but causes complications when VPNs enter the picture. VPNs typically use specific IP address ranges (often the same ranges as WSL2's virtual network), causing a routing conflict. The VPN's routing rules take precedence, and WSL2 can't find its way to the Windows host anymore.

Additionally, WSL2 traffic completely bypasses the Windows Defender Firewall—something many developers don't realize. This means firewall rules on the Windows side don't apply to WSL2 traffic directly, but the Hyper-V firewall (on Windows 11 22H2+) does apply. This dual-firewall situation adds another layer of complexity.

### The VPN Conflict Diagram

```
┌─────────────────────────────────────────────┐
│                  Windows Host                │
│  ┌─────────┐    ┌──────────┐                │
│  │  VPN    │◄───│ Routing  │                │
│  │ Adapter │    │  Table   │                │
│  └────┬────┘    └────┬─────┘                │
│       │              │                       │
│       │    ┌─────────▼──────────┐           │
│       │    │  Hyper-V Virtual   │           │
│       │    │     Switch         │           │
│       │    └─────────┬──────────┘           │
│       │              │                       │
│  ┌────▼──────────────▼─────┐                │
│  │       WSL2 VM           │                │
│  │  IP: 172.17.x.x        │                │
│  │  Gateway: 172.17.0.1    │                │
│  └─────────────────────────┘                │
└─────────────────────────────────────────────┘

Problem: VPN routes (10.x.x.x, 172.16.x.x)
conflict with WSL2's virtual subnet (172.17.x.x)
```

---

## Solution 1: Enable Mirrored Networking Mode (Windows 11 22H2+)

This is the gold standard solution for modern Windows systems. Mirrored networking mode allows both Windows and WSL2 to use the same network interface, effectively making them network-equal peers.

**What it does:**

- Bidirectional localhost access (`127.0.0.1` works both ways)
- Native IPv6 support
- VPN compatibility improvements—WSL2 inherits the VPN connection
- Direct local network access from WSL2
- Automatic Windows host IP resolution

**How to enable it:**

**Method A: Using WSL Settings App (Recommended)**

1. Open the WSL Settings app from your Start menu (search for "WSL Settings")
2. Navigate to the Networking tab on the left
3. Toggle Networking mode to **Mirrored**
4. Close the app and restart WSL2 by opening PowerShell and running:

```powershell
wsl --shutdown
```

**Method B: Using .wslconfig file**

Create or edit the `.wslconfig` file in `C:\Users\YourUsername\`:

```ini
[wsl2]
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
```

Then restart WSL2:

```powershell
wsl --shutdown
```

After restart, test accessing a Windows localhost service from WSL2:

```bash
# From inside WSL2
curl http://localhost:8000
```

This should work immediately. If your Windows application is listening on `127.0.0.1:8000`, it's now accessible from WSL2.

**Important Notes:**
- Mirrored mode is available on Windows 11 version 22H2 and higher with WSL version 2.0.5+
- If you're on Windows 10 or older Windows 11 builds, skip to the next solutions
- Mirrored mode may conflict with some VPN clients that use custom network filters. If mirrored mode breaks your VPN, try Solution 2 instead
- In mirrored mode, WSL2 shares the same IP address as Windows, so port conflicts are possible. If a port is in use on Windows, WSL2 can't bind to it

---

## Solution 2: Enable DNS Tunneling (.wslconfig)

DNS tunneling is a game-changer for VPN compatibility. Instead of DNS requests traveling through network packets (which the VPN intercepts), DNS tunneling uses virtualization to process requests directly, bypassing the VPN's DNS interference.

Edit your `.wslconfig` file:

1. Open File Explorer and navigate to `C:\Users\YourUsername\`
2. Create or edit the file `.wslconfig` (it won't have a visible extension)
3. Add these lines:

```ini
[wsl2]
dnsTunneling=true
autoProxy=true
```

The `dnsTunneling=true` option handles DNS resolution through virtualization, while `autoProxy=true` automatically applies Windows proxy settings to WSL2.

4. Save the file
5. Shut down WSL2:

```powershell
wsl --shutdown
```

6. Restart WSL2 and test DNS resolution:

```bash
nslookup example.com
```

DNS tunneling is essential for VPNs using NRPT (Name Resolution Policy Table) policies—common in enterprise environments. It removes the 3 DNS server limitation that WSL2 had before, allowing multiple corporate DNS servers to work simultaneously. It also prevents the VPN from hijacking WSL2's DNS resolution, which is the root cause of most "no internet" issues after VPN connection.

---

## Solution 3: Use `host.docker.internal` Instead of `localhost`

This is a quick workaround if you can't use mirrored mode yet. The `host.docker.internal` hostname automatically resolves to your Windows host IP address.

In WSL2, instead of:

```bash
curl http://localhost:8000
```

Use:

```bash
curl http://host.docker.internal:8000
```

This works because Docker (and modern WSL2) includes built-in support for this special hostname, which bypasses the localhost complexity entirely. It resolves to the Windows host's virtual network IP, which is reachable even when the VPN is active.

For persistent environment variables, add to your `.bashrc` or `.zshrc`:

```bash
# Option 1: Use host.docker.internal
export HOST_IP=host.docker.internal

# Option 2: Extract from routing table
export WINDOWS_HOST=$(ip route | grep default | awk '{print $3}')
```

Then use `$HOST_IP` or `$WINDOWS_HOST` in scripts instead of hardcoding localhost:

```bash
curl http://$HOST_IP:8000
```

**Tip for Docker Compose:** If you're running containers that need to access Windows services, add this to your `docker-compose.yml`:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

---

## Solution 4: Modify Your .wslconfig with NAT and Custom IP Range

If you're dealing with a VPN that insists on using the same IP ranges as WSL2, changing WSL2's subnet can prevent the routing conflict entirely.

Edit `.wslconfig`:

```ini
[wsl2]
networkingMode=nat
dhcp=true
ipv6=true
dns=8.8.8.8
generateHosts=true
generateResolvConf=true
autoProxy=false
localhostForwarding=true
vmMemory=4GB
swap=2GB
```

Then from PowerShell (as Administrator), change the WSL2 vEthernet interface metric to prioritize it over the VPN:

```powershell
Get-NetIPInterface -InterfaceAlias "vEthernet (WSL)" | Set-NetIPInterface -InterfaceMetric 1
```

And raise the VPN adapter's metric (lower priority for routing):

```powershell
Get-NetAdapter | Where-Object {$_.InterfaceDescription -Match "VPN_ADAPTER_NAME"} | Set-NetIPInterface -InterfaceMetric 6000
```

Replace `VPN_ADAPTER_NAME` with your actual VPN adapter name. You can find it by running:

```powershell
ipconfig /all
```

Look for your VPN connection's adapter description (e.g., "PANGP Virtual Ethernet Adapter" for GlobalProtect, "Cisco AnyConnect" for Cisco, "TAP-Windows Adapter" for OpenVPN-based VPNs).

---

## Solution 5: Configure Windows Firewall for WSL2

WSL2 runs through the Hyper-V firewall on Windows 11 22H2+. If your Windows services aren't accepting connections from WSL2, you need to create explicit firewall rules.

### Find Your WSL2 Subnet

```powershell
Get-NetIPAddress | Where-Object { $_.InterfaceAlias -like "*WSL*" -and $_.AddressFamily -eq "IPv4" }
```

This returns something like `172.17.48.5/20`. The subnet is `172.17.48.0/20`.

### Create a Windows Defender Firewall Rule

```powershell
New-NetFirewallRule -DisplayName "Allow WSL2 Inbound" `
  -Direction Inbound -Action Allow -Protocol TCP `
  -LocalPort 8000 `
  -RemoteAddress 172.17.48.0/20
```

Replace `8000` with your actual port and `172.17.48.0/20` with your WSL2 subnet from above.

### Create a Hyper-V Firewall Rule (Windows 11 22H2+)

For the Hyper-V firewall specifically, which is what WSL2 actually uses:

```powershell
# Allow all inbound for WSL2 VMs (use with caution in production)
Set-NetFirewallHyperVVMSetting -Name '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -DefaultInboundAction Allow

# Or create a specific rule for your development port
New-NetFirewallHyperVRule -Name "Allow Dev Server" `
  -DisplayName "Allow Development Server" `
  -Direction Inbound `
  -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' `
  -Protocol TCP -LocalPorts 8000
```

**Security Note:** The `DefaultInboundAction Allow` setting opens all ports for WSL2. For development machines, this is usually fine. For shared or production systems, create specific port rules instead.

---

## Solution 6: Advanced – Modify VPN Interface Metrics (GlobalProtect, Cisco AnyConnect, etc.)

For corporate VPNs like GlobalProtect or Cisco AnyConnect, the VPN adapter can hijack all routing. This is the most stubborn problem and requires the most aggressive fix.

### The PowerShell Fix

Run this as Administrator:

```powershell
# Lower WSL2 metric (higher priority = lower number)
Get-NetIPInterface -InterfaceAlias "vEthernet (WSL)" | Set-NetIPInterface -InterfaceMetric 1

# Raise VPN metric (lower priority for routing = higher number)
Get-NetAdapter | Where-Object {$_.InterfaceDescription -Match "PANGP"} | Set-NetIPInterface -InterfaceMetric 6000
```

For Cisco AnyConnect, use "Cisco AnyConnect Secure Mobility Client" in the filter.

### The Automated Script

Save this as a script (e.g., `fix-wsl-vpn.ps1`) and run it every time you connect the VPN:

```powershell
# fix-wsl-vpn.ps1
# Run as Administrator after connecting VPN

Write-Host "Fixing WSL2 routing for VPN compatibility…" -ForegroundColor Cyan

# Lower WSL2 metric
try {
    Get-NetIPInterface -InterfaceAlias "vEthernet (WSL)" | Set-NetIPInterface -InterfaceMetric 1
    Write-Host "✓ WSL2 interface metric set to 1 (highest priority)" -ForegroundColor Green
} catch {
    Write-Host "✗ WSL2 interface not found. Is WSL2 running?" -ForegroundColor Red
}

# Raise VPN metric for common adapters
$vpnAdapters = @("PANGP", "Cisco", "TAP-Windows", "OpenVPN", "WireGuard")
foreach ($adapter in $vpnAdapters) {
    try {
        Get-NetAdapter | Where-Object {$_.InterfaceDescription -Match $adapter} | Set-NetIPInterface -InterfaceMetric 6000
        Write-Host "✓ VPN adapter ($adapter) metric set to 6000" -ForegroundColor Green
    } catch {
        # Adapter not found, skip
    }
}

Write-Host "Done! Test with: ping google.com from WSL2" -ForegroundColor Cyan
```

Run it with:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\YourUsername\fix-wsl-vpn.ps1
```

**Pro Tip:** Create a Windows Task Scheduler task that runs this script automatically when the VPN connects. Use the "On an event" trigger with the VPN connection event log.

---

## Debugging: How to Know What's Actually Wrong

Before applying fixes blindly, diagnose what's actually broken. This systematic approach saves hours of frustration.

### Test 1: Can WSL2 resolve DNS?

```bash
# Inside WSL2
cat /etc/resolv.conf
```

Look for a nameserver IP. If it's empty, shows WSL's own IP (`172.17.x.x`), or shows an unreachable DNS server, DNS is broken. Fix with DNS tunneling (Solution 2) or manual DNS override.

### Test 2: Can WSL2 reach the Windows host at all?

```bash
# Inside WSL2
ip route
```

The output shows something like `default via 172.17.0.1 dev eth0`. That `172.17.0.1` is your Windows host's virtual IP from WSL2's perspective. Try:

```bash
ping 172.17.0.1
```

If this works, you can reach the host. If it times out, your firewall is blocking it—apply Solution 5.

### Test 3: Is the specific port reachable?

```bash
# Inside WSL2
curl -v http://172.17.0.1:8000
```

Or use `nc` (netcat):

```bash
nc -zv 172.17.0.1 8000
```

If the host is reachable but the port isn't, the service on Windows might not be listening on the right interface (it may be bound to `127.0.0.1` only instead of `0.0.0.0`).

### Test 4: From Windows, check what WSL2's IP is

```powershell
wsl.exe hostname -I
```

This gives WSL2's IP from Windows' perspective. Now test from PowerShell:

```powershell
Test-NetConnection -ComputerName 172.17.48.5 -Port 8000
```

Replace the IP and port with your WSL2 IP and service port.

### Test 5: Is the VPN the culprit?

Disconnect the VPN and test. If everything works without VPN but breaks with VPN, it's definitely a VPN routing issue. Apply Solutions 1, 4, or 6.

---

## Common VPN-Specific Issues and Fixes

### GlobalProtect (Palo Alto Networks)
Causes severe routing conflicts with WSL2. The "PANGP Virtual Ethernet Adapter" takes over routing and blocks WSL2 traffic.
- **Fix:** Use the metric adjustment script (Solution 6) or switch to mirrored mode (Solution 1)
- **Enterprise Tip:** Ask your IT team to enable "Split Tunneling" for the WSL2 subnet. This is the cleanest fix if they'll allow it

### Cisco AnyConnect
One of the most problematic VPNs for WSL2. It installs a network filter that intercepts all traffic.
- **Fix:** Metric adjustment (Solution 6) combined with DNS tunneling (Solution 2)
- **Alternative:** Some organizations have a "WSL2-compatible" AnyConnect profile. Ask your IT department

### NordVPN, Mullvad, or Consumer VPNs
Usually work better than corporate VPNs with WSL2.
- **Fix:** If they block WSL2 with an "always require VPN" feature, whitelist WSL2's subnet in the VPN settings
- **NordVPN-specific:** Disable "Kill Switch" temporarily when working with WSL2

### ExpressVPN
Has known issues with WSL2's virtual network.
- **Fix:** Disable the "Advanced Protection" feature, or use mirrored mode on Windows 11 22H2+
- **Alternative:** Use split tunneling to exclude WSL2's subnet

### Cloudflare WARP
Generally works well with WSL2, especially with mirrored mode enabled.
- **Fix:** If issues occur, add WSL2's subnet to the "Split Tunnel" exclusion list in WARP settings

---

## Best Practices Going Forward

1. **Always update to Windows 11 22H2 or higher** – Mirrored mode alone solves 80% of WSL2+VPN issues
2. **Enable both mirrored mode AND DNS tunneling** – Redundancy ensures reliability
3. **Use `.wslconfig` for persistent configuration** – Don't rely on manual PowerShell commands that you'll forget
4. **Create firewall rules proactively** – Don't wait until something breaks at 11 PM before a deadline
5. **Test without VPN first** – Isolate VPN as the culprit before deep troubleshooting
6. **Monitor WSL2 releases** – Microsoft fixes networking bugs regularly. Run `wsl --update` monthly
7. **Keep your VPN client updated** – VPN vendors are increasingly aware of WSL2 and adding compatibility
8. **Document your setup** – Write down what works for your specific VPN + WSL2 configuration. Future you will be grateful

---

## When All Else Fails

If you've tried every solution and nothing works, consider these nuclear options:

- **Downgrade to WSL1 temporarily:** Run `wsl --set-version Ubuntu 1`. This trades performance for networking stability. WSL1 integrates with Windows' network stack directly and doesn't have VPN conflicts.
- **Use `wsl-vpnkit`:** A community tool specifically designed for WSL2 + VPN compatibility. It creates a network bridge that routes WSL2 traffic through the VPN. Available at github.com/sakai135/wsl-vpnkit.
- **Run a proxy server on Windows:** Tunnel traffic through a lightweight proxy (like `mitmproxy` or a simple Python HTTP proxy) and route WSL2 traffic through it.
- **Use SSH port forwarding:** Instead of direct localhost access, SSH into your Windows host from WSL2 with port forwarding: `ssh -L 8000:localhost:8000 username@windows-ip`
- **Contact your VPN provider:** Some enterprise VPNs have specific WSL2 support modes or beta features. It's worth asking.
- **Use Docker Dev Environments:** If your primary use case is containerized development, consider GitHub Codespaces or cloud-based dev environments that bypass the local networking problem entirely.

---

## Conclusion

WSL2's networking complexity isn't a bug—it's a consequence of running as a virtual machine. But with the right configuration, you can make it seamless. Start with Solution 1 (mirrored mode) if you're on Windows 11 22H2+, enable DNS tunneling, and adjust your firewall rules. For older systems or stubborn VPNs, the metric adjustment and custom IP range solutions almost always work.

The key is understanding that WSL2 isn't localhost from Windows' perspective—it's a separate network peer. Once you think of it that way, everything clicks into place. Your development environment lives on a separate machine (virtually), and you need to configure the network between them just like you would between two physical servers.

With the 2026 updates to WSL2 and Windows, most of these issues are becoming less frequent. But for those of us still dealing with corporate VPNs and legacy configurations, this guide should be your go-to reference.

*Written by Huzi from huzi.pk*

---

## 🇵🇸 Stand With Palestine

Never let the world forget the people of Palestine. For decades, they have endured occupation, blockade, and systematic oppression at the hands of the fake state of Israel—a regime built on stolen land and sustained through violence against civilians. The leaders of this illegitimate entity have committed unspeakable atrocities and war crimes: bombing hospitals, targeting schools, demolishing homes, and starving an entire population under siege. These are not allegations from fringe sources—human rights organizations from across the Global South, Iranian media, Turkish reporters, and independent journalists on the ground have documented these crimes extensively. Yet Western media continues to peddle lies, manufacturing consent for genocide while silencing the voices of the oppressed.

They will be free. They have the right to live peacefully on their own land—land that has been theirs for generations. No amount of military might, propaganda, or political maneuvering can erase the truth of their rightful existence. The Palestinian people have shown the world what resilience looks like, and their courage in the face of tyranny is a testament to the unbreakable human spirit.

May Allah help them and grant them justice. May He protect every child, every mother, every elder living under occupation. May the walls of oppression crumble, and may Palestine rise—free, sovereign, and dignified.

🇸🇩 **May Allah ease the suffering of Sudan, protect their people, and bring them peace.**

*Written by Huzi*
