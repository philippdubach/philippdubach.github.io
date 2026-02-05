---
title: Weather Forecasts Have Improved a Lot
seoTitle: "AI Weather Forecasting: How DeepMind's WeatherNext 2 Works"
date: 2025-11-22
images:
- https://static.philippdubach.com/ograph/ograph-weather.jpg
external_url: https://ourworldindata.org/weather-forecasts
description: "Four-day forecasts now match one-day accuracy from 30 years ago. How AI models like WeatherNext 2 use CRPS training to preserve extreme weather signals."
keywords:
- AI weather forecasting accuracy
- WeatherNext 2 Google DeepMind
- weather forecast improvement history
- neural weather prediction models
- CRPS loss weather forecasting
categories:
- AI
type: Commentary
draft: false
aliases:
- /2025/11/22/weather-forecasts-have-improved-a-lot/

---
Reading the press release for Google DeepMind's [WeatherNext 2](https://deepmind.google/discover/blog/weathernext-2-our-most-advanced-weather-forecasting-model/), I wondered: have weather forecasts actually improved over the past years?

Turns out they have, dramatically. [A four-day forecast today matches the accuracy of a one-day forecast from 30 years ago](https://ourworldindata.org/weather-forecasts). Hurricane track errors that once exceeded 400 nautical miles for 72-hour forecasts now sit below 80 miles. The [European Centre for Medium-Range Weather Forecasts reports three-day forecasts now reach 97% accuracy](https://charts.ecmwf.int), with seven-day forecasts approaching that threshold.

Google's new model accelerates this trend. [The hurricane model performed remarkably well this season when tested against actual paths](https://arstechnica.com/science/2025/11/googles-new-weather-model-impressed-during-its-first-hurricane-season/). WeatherNext 2 generates forecasts 8 times faster than its predecessor with resolution down to one hour. Each prediction takes under a minute on a single TPU compared to hours on a supercomputer using physics-based models. The speed comes from a smarter training approach. WeatherNext 2 (along with [neuralgcm](https://www.nature.com/articles/s41586-024-07744-y)) uses a continuous ranked probability score (CRPS) objective rather than the L2 losses common in earlier neural weather models. The method adds random noise to parameters and trains the model to minimize L1 loss while maximizing differences between ensemble members with different noise initializations.

This matters because L2 losses blur predictions when models roll out autoregressively over multiple time steps. Spatial features degrade and the model truncates extremes. [Models trained with L2 losses struggle to forecast high-impact extreme weather at moderate lead times](https://news.ycombinator.com/item?id=45957193). The CRPS objective preserves the sharp spatial features and extreme values needed for cyclone tracking and heat wave prediction. These improvements stem from better satellite and ground station data, faster computers running higher-resolution models, and improved communication through apps and online services. AI systems like WeatherNext 2 and Pangu-Weather (which performs forecasts up to 10,000 times faster than traditional methods) are accelerating progress that has been building for decades.

<!--
FAQ Schema candidates:

Q: How much have weather forecasts improved over the past 30 years?
A: Weather forecasts have improved dramatically. A four-day forecast today matches the accuracy of a one-day forecast from 30 years ago. Hurricane track errors that once exceeded 400 nautical miles for 72-hour forecasts now sit below 80 miles. The European Centre for Medium-Range Weather Forecasts reports three-day forecasts now reach 97% accuracy.

Q: How fast is Google DeepMind's WeatherNext 2 compared to traditional models?
A: WeatherNext 2 generates forecasts 8 times faster than its predecessor with resolution down to one hour. Each prediction takes under a minute on a single TPU, compared to hours on a supercomputer using physics-based models. AI systems like WeatherNext 2 and Pangu-Weather perform forecasts up to 10,000 times faster than traditional methods.

Q: Why does the CRPS training objective improve AI weather forecasts?
A: The CRPS (continuous ranked probability score) objective preserves sharp spatial features and extreme values needed for cyclone tracking and heat wave prediction. Earlier neural weather models used L2 losses that blur predictions when models roll out over multiple time steps, causing spatial features to degrade and extreme values to be truncated. CRPS training avoids this problem.

Q: What improvements enable more accurate weather forecasting?
A: Three factors drive forecast improvements: better satellite and ground station data providing higher-resolution observations, faster computers running higher-resolution models, and improved methods including AI systems. Neural weather models overcome traditional limitations by learning transformations from data rather than relying on hand-coded physics.
-->