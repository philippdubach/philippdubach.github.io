---
title: AI Agents Build my Investment Reports
date: 2025-06-26
images:
- https://static.philippdubach.com/ograph/ograph-investment-report.jpg
description: A multi-agent AI system that auto-generates investment reports using
  specialized agents for news, portfolio performance, and market data.
keywords:
- AI agents
- investment reports
- multi-agent system
- agentic AI
- portfolio management
- automated trading
- Claude Sonnet
- Streamlit
- market data analysis
- news aggregation
- economic calendar
- portfolio performance
- financial automation
- investment research
- wealth management
tags:
- Project
categories:
- Finance
- AI
type: Project
draft: true
aliases:
- /2025/06/26/ai-agents-build-my-investment-reports/

---
How I built a multi-agent system that automatically generates personalized morning market reports. But what even are AI Agents? A term that seems to be [everything everywhere all at once](https://trends.google.com/trends/explore?date=today%205-y&q=Agentic%20AI&hl=en)right now. [According to Wikipedia](https://en.wikipedia.org/wiki/Agentic_AI) Agentic AI is a class of artificial intelligence
> that focuses on autonomous systems that can make decisions and perform tasks without human intervention. The independent systems automatically respond to conditions, to produce process results.

<a href="https://static.philippdubach.com/html/20250625_morning_report.html">
{{< img src="investment_report_sample.png" alt="Sample Overview of a Morning Report" width="80%" >}}</a>

This sounds like exactly what I was looking for to automate my morning routine of checking the WSJ, FT, local news, overnight market developments and asses todays economic events' impact on my portfolio.  Instead of doing all of this I would prefer to get a personalized daily report of what happened while I was asleep and what to watch for during the next trading day. So that's what I attempted to build - with AI Agents of course! Let's start with the final architecture.
{{< img src="agent_architecture_v3.png" alt="High-level Agentic Architecture" width="80%" >}}
 The interface is a Streamlit app (which I won't pretend I didn't build with Claude Code) where users can input or upload their current portfolio holdings. This then triggers multiple AI agents, represented by starburst symbols indicating Claude Sonnet 4 agents, that orchestrate various specialized components. The multi-agent approach orchestrates specialized AI agents across the pipeline: a ticker validation agent corrects portfolio inputs, news prioritization agents filter relevant headlines from multiple sources, and economic calendar agents identify market-moving events. Real-time market data flows through APIs into a portfolio performance engine that calculates returns across multiple time horizons. The central report generator synthesizes all analyses using structured templates user localization (geography, base currency etc.) and historical context (to avoid repetitive reports), before an HTML formatter creates the final professional output delivered via Streamlit (or as a daily email). If you want to see what the final report could look like, I have [uploaded a sample report](https://static.philippdubach.com/html/20250625_morning_report.html) _(as you can see from the footer included in this HTML template I think this could offer very interesting applications for wealth managers to offer this to their clients as they could leverage existing APIs to get data from their portfolio engines as well as integrate in-house research. Further, something similar could be integrated into the Client Advisor's CRM allowing them to understand an individual client's situation at a glance)_.

So why use multiple agents? Rather than using a single monolithic prompt, I decomposed the problem into specialized components. Each agent handles a specific domain - like having dedicated equity analysts, macro economists, and portfolio managers. This enables parallel processing, specialized expertise per task, and easier debugging when something breaks.
{{< img src="demo_report.gif" alt="Streamlit App" width="80%" >}}
Above you can see a short demo of the user interface - I built this because a couple of friends asked me if they could access the tool (I'm thinking about deploying this publicly once i find a way to make the prompts more efficient and hence curb the model costs which are currently ~$0.15 per report) - In a professional context this would be obsolete as it would be connected directly to the portfolio reporting engine.

Let's have a look at the individual components: (1) Data Integration Pipeline: The system pulls from multiple sources simultaneously: Market data, RSS feeds from AP / Reuters / WSJ / FT etc. for news, and Trading Economics for economic calendar data. The newswire aggregation handles different feed formats, cleans HTML content, and deduplicates articles. The economic calendar scraping uses Selenium to handle dynamic content. (2) Ticker Validation Agent: Corrects portfolio inputs (stocks listed in Paris for example need a .PA ending after the ticker). (3) News Prioritization Agent: Identifies relevant headlines for specific portfolios, understanding that Fed announcements for example impact tech stocks differently than utilities. (4) Economic Calendar Agent: Prioritizes market-moving events, knowing that non-farm payroll releases matter more than housing starts. (5) Portfolio Performance Engine: Calculates comprehensive metrics across timeframes, compares against benchmarks, and adjusts for user's base currency and location. (6) Report Generator: The central orchestrator that synthesizes all analyses into coherent narratives, maintaining consistency through structured templates and memory of previous reports.

The system generates comprehensive reports in 2-3 minutes, processing hundreds of news articles and real-time data for entire portfolios. The parallel architecture significantly reduces latency compared to sequential processing. Centralized configuration separates model settings, API parameters, and localization preferences. The modular prompt template system allows independent agent refinement and easy addition of new specialized agents. The architecture scales from individual investors to institutional portfolio managers.
Multi-agent coordination introduces complexity requiring comprehensive error handling and fallback mechanisms. Data quality varies across sources, demanding constant monitoring (potentially by an additional agent). Future enhancements could include technical analysis agents, sentiment analysis from social media, email delivery automation, and mobile interfaces. The HTML formatting already ensures consistent rendering across platforms.

This multi-agent system demonstrates how AI can transform investment research and sales workflows. By decomposing complex analysis into specialized agents, it provides  accurate and timely intelligence. The flexible architecture enables continuous improvement as well as modular adaptation for individual needs.