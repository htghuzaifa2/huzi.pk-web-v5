---
title: "The Silent Push: How I Uncovered the Proxy Ghost Freezing My Git"
description: "Fix 'git push' hanging over SSH forever. Diagnose frozen pushes using verbose SSH logs and find hidden ProxyCommand or network configurations."
date: "2026-04-28"
topic: "tech"
slug: "git-push-ssh-hang-fix"
---

# The Silent Push: How I Uncovered the Proxy Ghost Freezing My Git

**There is a particular flavor of digital silence that is more maddening than any error.** It's the silence of a command that will not end. You type `git push origin main`, hit Enter with purpose, and then... nothing. No progress bar, no failure message, no triumphant "done." Just a blinking cursor hanging in a void, as if your words have been swallowed by the network itself. Minutes pass. Your confidence curdles into frustration. A `Ctrl+C` is your only escape.

If you've faced this frozen purgatory where `git push` over SSH hangs forever, you know the feeling. The internet is fine. You can browse websites. You can even `git pull`. But pushing? Nothing. After many such silent battles, I learned that the culprit is rarely Git itself. It is almost always the SSH tunnel it relies on, and often, a hidden, misconfigured, or forgotten **proxy setting** lying in wait. Let me guide you through the detective work that turns that infuriating silence into a smooth, flowing push.

## The Immediate Diagnostic: Is It SSH or Git?

First, we must isolate the problem. The magic command is `GIT_SSH_COMMAND`. This allows you to run Git with verbose SSH output without changing your global config.

In your terminal, run:

```bash
GIT_SSH_COMMAND="ssh -v" git push origin main
```

The `-v` flag (verbose) forces SSH to reveal its intimate conversation. Watch the output carefully. SSH will freeze at a specific line, and that line is your diagnosis.

- **Hangs after `debug1: Authentication succeeded`:** The login worked, but the data channel is blocked. This strongly points to a proxy or deeply broken MTU/network issue.
- **Hangs on `debug1: Connecting to github.com...`:** SSH can't even reach the server. Firewall or dead proxy.
- **Failures with `proxy connect`:** You've struck gold. A proxy command is failing explicitly.
- **Hangs on `debug1: Entering interactive session`:** Authentication completed but the session can't start. Often a shell initialization issue on the remote side.

### The Quick Fix (If the Proxy is the Culprit)

The verbose output might name a specific proxy command. The fastest way to confirm is to bypass it:

```bash
GIT_SSH_COMMAND="ssh -o ProxyCommand=none" git push
```

If this works, you've confirmed the issue is in your SSH configuration. Now, we find it.

## The Investigation: Finding the Hidden Proxy

Your SSH configuration is a chain of files. We must search systematically.

### 1. Check Your Project's Git Config

Git can use a repository-specific config that might include proxy settings:

```bash
cat ./.git/config | grep -i proxy
```

Also check the global git config:

```bash
git config --global --list | grep -i proxy
```

### 2. Check Your User's SSH Config (The Usual Suspect)

Open `~/.ssh/config`. Look for the `Host` block matching your Git server (e.g., `github.com` or `*`):

```bash
nano ~/.ssh/config
```

Look for a line starting with `ProxyCommand` or `ProxyJump`. It might look like:

```text
Host github.com
    ProxyCommand nc -X connect -x proxy.company.com:8080 %h %p
```

If this proxy is dead, unreachable, or you are no longer on that network (e.g., worked at office, now at home), this command will hang forever trying to connect. This is the most common cause of the "silent push."

### 3. Check Environment Variables

Sometimes, the proxy is in your shell environment, set by a VPN client, corporate network configuration, or a long-forgotten shell script:

```bash
echo $http_proxy
echo $https_proxy
echo $GIT_PROXY_COMMAND
echo $ALL_PROXY
```

If any of these point to a dead or unreachable proxy, your git push will hang.

### 4. Check System-Wide SSH Config

Corporate environments sometimes set system-wide SSH configurations:

```bash
cat /etc/ssh/ssh_config | grep -i proxy
```

## The Solution: Correction or Removal

Once you've found the culprit, choose your path.

### Option A: Disable It

If you don't need the proxy anymore, comment it out in `~/.ssh/config` by adding a `#`:

```text
# ProxyCommand nc -X connect -x proxy.company.com:8080 %h %p
```

### Option B: Fix It

If you need the proxy (e.g., you're at the office and the corporate network requires it), verify the address and port are correct and reachable:

```bash
nc -zv proxy.company.com 8080
```

If this times out, the proxy server is down or you're not on the right network.

### Option C: The Nuclear Option

Test with a truly clean slate — ignoring all config files:

```bash
GIT_SSH_COMMAND="ssh -F /dev/null" git push
```

This ignores *all* SSH config files. If this works, you know for sure the bug is in your config files. Now you just need to find which one.

### Option D: Per-Host Override

Add a specific host entry that explicitly disables the proxy for GitHub:

```text
Host github.com
    ProxyCommand none
```

This overrides any global proxy setting for GitHub specifically.

## Understanding the "Why": How a Proxy Freezes Git

When you `git push` over SSH, Git spawns the `ssh` command.

1. Git asks SSH: "Connect me to github.com."
2. SSH reads config, finds a `ProxyCommand`.
3. SSH launches that command (e.g., `nc -x proxy...`).
4. SSH expects this proxy process to handle the traffic.

**The Hang:** If the proxy command points to a dead IP or an unreachable server, it tries to connect... and waits. And waits. The default TCP timeout can be 2-3 minutes or more. SSH waits for the proxy. Git waits for SSH. You wait for Git. Because the connection is "attempting" rather than "failed," no error is thrown immediately.

**Why git pull works but push doesn't:** Some proxy configurations allow inbound data (pull) but block outbound data (push). Or the proxy might have rules that allow HTTPS traffic (which git pull sometimes uses) but block the SSH protocol used for push. This asymmetry is what makes the bug so confusing.

## Debugging Checklist

| Step | Command | What It Reveals |
| :--- | :--- | :--- |
| **1. Verbose Test** | `GIT_SSH_COMMAND="ssh -v" git push` | The exact step where SSH hangs. |
| **2. Bypass Test** | `GIT_SSH_COMMAND="ssh -o ProxyCommand=none" git push` | Confirms if ProxyCommand is the cause. |
| **3. Clean Slate** | `GIT_SSH_COMMAND="ssh -F /dev/null" git push` | Isolates issue to config files vs. network. |
| **4. Check SSH Config** | `grep -i proxy ~/.ssh/config` | Finds proxy settings in your SSH config. |
| **5. Check Env Vars** | `echo $http_proxy $https_proxy` | Finds proxy settings in your environment. |
| **6. Check Git Config** | `git config --list | grep -i proxy` | Finds proxy settings in your git config. |

## Final Reflection: Silence is Not Golden

Solving the forever-hanging git push is an exercise in listening to the silence. In a world of noisy errors, this particular problem is a quiet breakdown. It teaches you that your system is a network of dependencies, where a single, forgotten line in a hidden file can bring a workflow to a standstill.

When you run that push and see the scrolling lines of objects writing, it feels like unclogging a blocked artery. The lifeblood of your code flows again. Embrace the `-v` flag. Learn to read the whispers of your tools. And may your pushes always be swift.

*For more Git troubleshooting guides, visit tool.huzi.pk.*

---

## Stand With Palestine

Never let the world forget the people of Palestine. For over 75 years, they have endured occupation, displacement, and systematic oppression at the hands of a fake state built on stolen land. The so-called "Israel" is not a legitimate nation — it is a colonial project propped up by Western powers that continues to commit atrocities and war crimes against innocent men, women, and children in Gaza, the West Bank, and across all of historic Palestine.

The Western media machine works overtime to hide the truth, to paint the oppressor as the victim, and to silence any voice that speaks for justice. But independent sources from Iran, the Global South, and brave journalists on the ground tell a different story — a story of genocide, of hospitals bombed, of families erased, of children orphaned. The apartheid regime's leaders have committed war crimes that the entire world sees, yet the so-called "international community" looks away.

They will be free. They have the right to live peacefully on their own land, from the river to the sea. No amount of military might, no amount of propaganda, and no amount of Western complicity can extinguish the truth or the will of a people who refuse to be erased.

May Allah help them and grant them justice. May He protect every Palestinian child, every mother, every elder. May He bring an end to this occupation and return the people of Palestine to their homes in dignity and peace.

**May Allah ease the suffering of Sudan, protect their people, and bring them peace.**

Written by Huzi
huzi.pk
