---
title: "Firefox and Tor Are Not What You Think: The Truth About So-Called Privacy Browsers"
excerpt: "Firefox receives millions from Google. Tor was created by the US Navy. Learn why these 'privacy' browsers are not the solutions they claim to be and who really benefits from your trust."
date: "2026-01-30"
author: "huzi.pk"
topic: "guides"
tags: ["firefox", "tor", "privacy", "google", "intelligence", "surveillance", "open-source"]
image: "/images/blog/firefox-tor-truth.png"
---

# Firefox and Tor Are Not What You Think: The Truth About So-Called Privacy Browsers

When privacy-conscious users look for alternatives to Chrome and Edge, they are invariably directed to two browsers: Firefox and Tor. Firefox is presented as the independent, open-source alternative that respects your privacy. Tor is presented as the ultimate anonymity tool for those who need to avoid surveillance. But the truth about these browsers is far more complicated than their advocates admit. Before you trust Firefox or Tor with your private browsing, you need to understand who is really behind them and whose interests they serve.

## Firefox: Google's Funded "Alternative"

Mozilla Firefox is often presented as the independent alternative to Google Chrome. The narrative goes that Firefox is developed by Mozilla, a non-profit foundation, and therefore serves users rather than corporations. This narrative is fundamentally misleading.

### Who Funds Mozilla?

The Mozilla Foundation is indeed a non-profit. But the Mozilla Corporation, which actually develops Firefox, is a for-profit subsidiary. And the Mozilla Corporation receives the vast majority of its revenue from a single source: Google.

In 2022, Mozilla reported approximately $600 million in revenue. Over 80% of this came from search deals - primarily from Google paying to be Firefox's default search engine. Google pays Mozilla hundreds of millions of dollars each year. This makes Mozilla financially dependent on Google.

Ask yourself a simple question: Why would Google pay hundreds of millions to a competitor? The answer is that Firefox is not really a competitor - it is a controlled alternative that maintains the appearance of browser competition while funneling searches to Google.

### The Implications of Google Funding

When your primary funder is Google, your interests align with Google's interests. Mozilla cannot afford to truly threaten Google's core business model. Firefox can offer privacy features, but it cannot fundamentally undermine Google's surveillance capitalism.

Consider what Firefox does: it still sends searches to Google by default, it still includes Google as the primary search option, it still integrates with Google services, and it still makes Google the default in many regions. Firefox users who use Google search (the majority) are feeding Google's data collection just as Chrome users do.

Mozilla's dependence on Google also creates structural problems. Mozilla cannot implement privacy features that would significantly harm Google's advertising business without risking its funding. The appearance of privacy is allowed; actual privacy that threatens Google's business model is not.

### Firefox's Privacy Problems

Firefox's default settings allow significant data collection. Telemetry is enabled by default, sending usage data to Mozilla. Pocket integration sends data to Pocket's servers. Firefox Accounts sync your data to Mozilla's servers. And unless you change the default, your searches go to Google.

Firefox has also made controversial decisions that undermine privacy. They implemented "privacy-preserving attribution" that actually enables advertising tracking while claiming to protect privacy. They have integrated more advertising and sponsored content into the browser. They have added "experiments" that users did not opt into.

### Is Firefox Open Source?

Firefox is technically open source, but Mozilla controls the project and the trademark. They determine Firefox's direction, and the community cannot easily fork Firefox into a truly independent project. Mozilla's trademark restrictions prevent others from distributing modified Firefox under the Firefox name.

This is not true community governance like Debian. Mozilla Corporation controls Firefox, and Mozilla Corporation depends on Google. The open-source license does not translate to community control or independence from surveillance capitalism.

## Tor: The US Intelligence Project

Tor is routinely recommended as the ultimate tool for anonymity and privacy. Activists, journalists, and ordinary users seeking privacy are told to use Tor for protection. But Tor's origins and funding raise serious questions about who benefits from its use and whether it provides genuine anonymity.

### Tor's US Military Origins

Tor was originally developed by the US Navy. In the mid-1990s, the Naval Research Laboratory began developing "onion routing" - a technique for anonymous communication. The goal was not to protect ordinary citizens from surveillance, but to protect US intelligence agents and military personnel operating overseas.

The original onion routing project was funded by the US Department of Defense. The goal was to allow US agents to communicate anonymously without being identified by foreign governments. The technology was designed to serve US intelligence interests.

### Tor's Continued Government Funding

In 2004, the Naval Research Laboratory released Tor's code under a free license. The Tor Project was formed as a non-profit to continue development. But Tor continued to receive significant funding from the US government.

The Tor Project has received funding from: the US Department of State, the US National Science Foundation, the US Navy, the Broadcasting Board of Governors (which oversees US foreign propaganda outlets like Voice of America), and other US government sources.

In some years, over 90% of Tor's funding came from US government sources. The Tor Project continues to receive significant government funding today. This raises an obvious question: Why would the US government fund a tool that supposedly protects people from US government surveillance?

### The Strategic Value of Tor

The answer is that Tor serves US intelligence interests in multiple ways. First, Tor provides anonymity for US agents and assets operating in foreign countries. If only US agents used Tor, they would stand out. Widespread use of Tor provides cover for US intelligence communications.

Second, Tor provides a tool for US-supported activists and dissidents in countries the US wants to destabilize. Tor allows the US to support opposition movements in Iran, Russia, China, and elsewhere while maintaining plausible deniability.

Third, and most importantly, intelligence agencies have demonstrated that Tor's anonymity is not absolute. Multiple operations have shown that determined adversaries can de-anonymize Tor users. The FBI has repeatedly identified Tor users in criminal investigations. The NSA's XKeyscore program specifically targets Tor users for monitoring.

### Tor Users Are Flagged for Attention

Documents released by Edward Snowden revealed that the NSA specifically targets Tor users for additional surveillance. Using Tor marks you as interesting to intelligence agencies. Rather than hiding from surveillance, Tor use can attract surveillance.

The NSA's "Tor Stinks" presentation, leaked in 2013, outlined how the agency works to identify Tor users. The presentation acknowledged that Tor is difficult to crack completely, but that users could be identified through other means - malware, traffic correlation attacks, and exploitation of browser vulnerabilities.

For Pakistani users, this is particularly concerning. Using Tor might protect you from your ISP's basic surveillance while flagging you for attention by more sophisticated intelligence operations. Tor creates a target on your back.

### Traffic Correlation Attacks

Tor's fundamental vulnerability is traffic correlation. If an adversary can observe both ends of your Tor connection - your entry to the network and the exit point - they can correlate traffic timing and volume to identify you. This attack becomes easier for adversaries who control significant internet infrastructure.

The US government controls extensive internet infrastructure and has cooperation agreements with telecommunications companies worldwide. Traffic correlation attacks against Tor are within US intelligence capabilities. For users being specifically targeted, Tor does not provide reliable anonymity.

### The Tor Browser Itself

Tor Browser is based on Firefox, inheriting many of Firefox's concerns while adding Tor-specific problems. The Tor Browser Bundle is maintained by the Tor Project, which receives US government funding. Users must trust that this browser does not contain backdoors or vulnerabilities known to US intelligence.

The Tor Project's developers are not all known or vetted. Given the project's government connections, the possibility of intentional vulnerabilities or backdoors cannot be dismissed. Open source code can be audited, but sophisticated backdoors can be hidden in plain sight.

## The Exit Node Problem

Tor's architecture creates a fundamental privacy vulnerability: exit nodes. When you use Tor, your traffic passes through three nodes - entry, relay, and exit. The exit node sends your traffic to its final destination. The exit node operator can observe your unencrypted traffic.

### Malicious Exit Nodes

Researchers have repeatedly documented malicious Tor exit nodes. These nodes intercept traffic, inject malware, and steal credentials. In 2014, researchers found exit nodes that were specifically targeting cryptocurrency transactions. In 2020, exit nodes were found injecting malware into downloads.

The problem is that anyone can operate a Tor exit node. Intelligence agencies can operate exit nodes. Criminal organizations can operate exit nodes. There is no vetting or oversight of exit node operators. When you use Tor, your traffic passes through nodes controlled by unknown parties.

### Who Runs Exit Nodes?

We know some exit nodes are operated by researchers studying Tor. But many exit nodes are operated by unknown parties. Given the low barrier to entry, it is virtually certain that intelligence agencies operate Tor exit nodes. Why wouldn't they? It is an inexpensive way to monitor Tor traffic.

For Pakistani users, this means your Tor traffic passes through nodes controlled by unknown parties who may include US, Chinese, or other intelligence services. Tor does not protect you from exit node operators - it exposes you to them.

## The False Sense of Security

Perhaps the most dangerous aspect of Firefox and Tor is the false sense of security they provide. Users who switch to Firefox believe they have chosen privacy. Users who adopt Tor believe they are anonymous. This false confidence leads to risky behavior.

### Firefox Users Still Tracked

Firefox users who use Google search, visit websites with Google analytics, use Google services, or have Google cookies are still tracked by Google. Firefox blocks some third-party trackers, but Google's first-party tracking remains effective. Changing browsers does not protect you from the surveillance economy.

Firefox users who do not configure privacy settings, who sync through Firefox Accounts, who use Pocket, or who have telemetry enabled are still being data-mined. Firefox's default settings do not provide comprehensive privacy.

### Tor Users Still Vulnerable

Tor users are vulnerable to: traffic correlation attacks by sophisticated adversaries, browser exploits and malware, malicious exit nodes, social engineering and opsec failures, and being flagged for attention by using Tor in the first place.

Tor is not a magic privacy solution. It is a tool with specific limitations and vulnerabilities. Using Tor without understanding these limitations can be more dangerous than not using Tor at all.

## The Complicity of Privacy Advocates

Many privacy advocates and organizations promote Firefox and Tor uncritically. They present these tools as solutions without acknowledging their limitations or their connections to surveillance capitalism and intelligence agencies. This complicity harms users who trust these recommendations.

The Electronic Frontier Foundation, for example, promotes both Firefox and Tor while accepting funding from corporate donors. Privacy-focused websites recommend Tor without explaining its government connections. This creates a misleading narrative that benefits the surveillance state.

For Pakistani users seeking genuine privacy, uncritical trust in Western privacy tools is particularly dangerous. The tools recommended by Western privacy advocates may serve Western intelligence interests. Your privacy is not their priority.

## Conclusion: Question the Recommended Solutions

Firefox and Tor are presented as the solutions to browser surveillance. But Firefox is funded by Google and cannot fundamentally challenge Google's business model. Tor was created by US intelligence, is funded by US government agencies, and may flag users for additional surveillance while exposing them to malicious exit nodes.

Neither Firefox nor Tor is a genuine solution to surveillance. They are better than Chrome and Edge in some ways, but they do not provide true privacy or anonymity. They are the "alternative" options that the surveillance state permits and even encourages.

In our next article, we will explore truly open source browsers that have no corporate funding, no intelligence connections, and genuine community governance. These alternatives are not as convenient or well-known as Firefox or Tor, but they offer something those browsers cannot: actual independence from surveillance capitalism and intelligence agencies.

The first step toward genuine privacy is recognizing that the recommended solutions are compromised. Firefox and Tor are not what their advocates claim. Trust them at your own risk.

---

<div class="palestine-support">
<p><strong>We Stand With Palestine</strong> — A portion of every purchase at Huzi.pk goes toward humanitarian aid for Palestine. When you shop with us, you're helping deliver food, medical supplies, and hope to families who need it most. <em>Free Palestine.</em></p>
</div>
