---
title: Bitcoin Security
seoTitle: "Bitcoin 51% Attack: $6.77B Cost and the Derivatives Loophole"
date: 2026-01-02
categories:
- Finance
- Tech
type: Commentary
images:
- https://static.philippdubach.com/ograph/ograph-bitcoin-security.jpg
external_url: https://hal.science/hal-04616643v1
description: "Academic paper finds Bitcoin 51% attack costs $6.77B. Derivatives enable attack profits via shorting. Analysis of why attacks haven't happened yet."
keywords:
- Bitcoin 51% attack cost
- Bitcoin derivatives security risk
- proof of work security economics
- cryptocurrency double spend attack
- Bitcoin hash rate attack
draft: false
aliases:
- /2026/01/02/bitcoin-security/

faq:
- question: How much would a 51% attack on Bitcoin cost?
  answer: According to a 2024 paper by Farokhnia and Goharshady, acquiring over 50% of Bitcoin's hash rate would cost approximately $6.77 billion in hardware. With only 30% of hash power, an attacker could achieve 95% success probability within 34 days at a cost of about $2.9 billion. These figures represent less than 0.5% of Bitcoin's market cap.
- question: Can someone profit from attacking Bitcoin through derivatives?
  answer: 'Yes, theoretically. The attack pays for itself if an attacker shorts Bitcoin through futures or options before crashing its price. Monthly Bitcoin derivatives volume on unregulated exchanges exceeds $2 trillion, providing sufficient liquidity to monetize a price crash. However, practical obstacles exist: a leveraged short held for 34 days has high probability of liquidation given Bitcoin''s volatility.'
- question: Do you need 51% of hash power to attack Bitcoin successfully?
  answer: No. The 2024 paper challenges this common assumption. With 30% of Bitcoin's hash power, an attacker has over 95% probability of reverting six blocks within 34 days. Six confirmations is the finality standard most practitioners rely on, meaning less than majority control can still compromise transaction finality.
- question: What actually prevents a 51% attack on Bitcoin?
  answer: Practical obstacles rather than fundamental economic barriers. Acquiring 43% of the pre-attack hash rate requires roughly two years of Bitmain's production capacity. Power requirements approach 9.5 gigawatts. Short positions face liquidation risk during the weeks-long attack period. The market appears to rely on these practical constraints rather than the theoretical unprofitability of attacks.
---
Bitcoin's security model rests on one assumption: attacking the network costs more than any attacker could gain. A [2024 paper by Farokhnia and Goharshady](https://hal.science/hal-04616643v1) does the math on this assumption and finds it wanting. 

>For roughly $6.77 billion in hardware, an attacker could control over 50% of Bitcoin's hash rate. With 30% of hash power, success probability exceeds 95% within 34 days at a cost of about $2.9 billion. 

These are large absolute numbers, but relatively small: Bitcoin's $1.78 trillion market cap and the monthly derivatives volume that now regularly exceeds $2 trillion on unregulated exchanges alone. The attack pays for itself if you short Bitcoin before crashing its price.
{{< img src="bitcoin_attack_cost1.png" alt="Bar chart showing cost to acquire Bitcoin hash power by percentage, from $0.75B for 10% to $6.77B for 51%" width="80%" >}}
The paper challenges three assumptions the crypto community has treated as fact. (1) That you need 51% of hash power to attack successfully. Not true. With 30%, you have high probability of reverting six blocks, enough to shatter the six-confirmation finality standard most practitioners rely on. (2) Acquiring majority hash power is prohibitively expensive. It is expensive but represents less than 0.5% of Bitcoin's market cap. (3) miners have no incentive to attack since they depend on BTC-denominated rewards. This ignores derivatives entirely.

In simple terms an attack would work like this: An attacker acquires put options or other shorting instruments on Bitcoin. They then use their hash power to mine secretly, building an alternative chain. When their chain exceeds the public chain in length, they publish it. The network switches to the longer chain. Transactions in the replaced blocks get reverted. Price crashes. The short position prints money.

David Rosenthal, writing on [his blog](https://blog.dshr.org/), offers a detailed skeptic's view of whether this attack is actually feasible. His analysis is worth reading because he identifies practical obstacles the paper's theoretical framework glosses over. Acquiring 43% of the pre-attack hash rate means buying roughly two years of Bitmain's production capacity beyond what's needed to replace obsolete equipment. The purchase would be noticed. Power requirements approach 9.5 gigawatts, roughly double what [Meta's planned Louisiana 5GW data center](https://www.reuters.com/technology/meta-invest-10-billion-louisiana-data-center-2024-12-04/) will need by 2030. That power doesn't (yet) exist in deployable form.

The short position presents its own problems. Patrick McKenzie's [explainer on perpetual futures](https://www.bitsaboutmoney.com/archive/perpetual-futures-explained/) describes how crypto derivatives actually work: frequent settlements, margin requirements, liquidation risk. A leveraged short held for 34 days has high probability of getting liquidated before the attack succeeds, given Bitcoin's volatility. In nine of twelve months in 2025, an initial 10X leveraged short would have been liquidated within the month. Even if the attack succeeds, the resulting crash would likely trigger automatic deleveraging, reducing winnings precisely when they should be largest.

{{< readnext slug="crypto-mean-reversion-trading" >}}

An insider attack looks more plausible on paper. A large mining pool already controls the hash rate. The October 2025 liquidation event on crypto exchanges saw [$19 billion in forced liquidations](https://www.theguardian.com/technology/2025/dec/29/crypto-end-of-year-fall-cuts-trump-optimism). This demonstrates both the volatility of the market and its capacity to absorb large directional moves. But an insider who stops contributing to the public chain for weeks becomes visible. The hash rate is public data. A 30% drop would trigger immediate investigation.

The paper's contribution, in my opinion, is making explicit what the derivatives market implies: Bitcoin's security depends not just on proof-of-work economics but on the assumption that attackers cannot profit from price crashes. That assumption gets weaker as the derivatives market grows. [Monthly Bitcoin futures volume on unregulated exchanges](https://www.theblock.co/data/crypto-markets/futures) has exceeded $2 trillion in recent months. The paper's calculations used April 2024 data. Since then, Bitcoin's hash rate has roughly doubled to around 1,100 EH/s, increasing attack costs proportionally. But derivatives volumes have grown too.
{{< img src="bitcoin_attack_scale1.png" alt="Log scale comparison showing attack costs of $2.9-6.8B versus $2T monthly derivatives volume and $1.78T market cap" width="80%" >}}
The next halving arrives in April 2028. Mining rewards drop to 1.5625 BTC per block. Miners whose equipment is fully depreciated might view an attack as an exit strategy, particularly if they can monetize it through derivatives. Some large miners are already [pivoting to AI data center hosting](https://www.wsj.com/tech/ai/bitcoin-miners-thrive-off-a-new-side-hustle-retooling-their-data-centers-for-ai-bdc408a9), suggesting they see diminishing returns from mining alone. Core Scientific plans to exit Bitcoin mining entirely by 2028.

What actually prevents this attack? Probably the practical difficulties Rosenthal identifies rather than any fundamental economic barrier. The market should price these risks but appears not to. Bitcoin trades as if 51% attacks are theoretical rather than economically viable. That may remain true as long as practical obstacles hold.
