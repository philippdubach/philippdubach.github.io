---
title: "I Built a CGM Data Reader"
date: 2025-01-02
tags: ["Project"]
draft: false
---

Last year I put a Continuous Glucose Monitor (CGM) sensor, specifically the [Abbott Freestyle Libre 3](https://www.freestyle.abbott), on my left arm. Why? I wanted to optimize my nutrition for an endurance cycling competitions. Where I live, the sensor is easy to get—without any medical prescription—and even easier to use. Unfortunately, Abbott's [FreeStyle LibreLink](https://apps.apple.com/us/app/freestyle-librelink-us/id1325992472) app is less than optimal (3,250 other people with an average rating of 2.9/5.0 seem to agree). To their defense, the web app LibreView does offer some nice reports which can be generated as PDFs—not very dynamic, but still something! What I had in mind was more in the fashion of the [Ultrahuman M1 dashboard](https://ultrahuman.com/m1). Unfortunately, I wasn't allowed to use my Libre sensor (EU firmware) with their app (yes, I spoke to customer service).

At that point, I wasn't left with much enthusiasm, only a coin-sized sensor in my arm. The LibreView website fortunately lets you download most of your (own) data in a CSV report (_there is also a [reverse engineered API](https://github.com/FokkeZB/libreview-unofficial)_), which is nice. So that's what I did: download the data, `pd.read_csv()` it into my notebook, calculate summary statistics, and plot the values.
{{< img src="libre-measurements.jpg" alt="Visualized CGM Datapoints" width="80%" >}}
After some interpolation, I now had the same view as the LibreLink app (which I had rejected earlier) provided. Yet, this setup allowed me to do further analysis and visualizations by adding other datapoints (workouts, sleep, nutrition) I was also collecting at that time:

- Blood sugar from [LibreView](https://www.libreview.com/): Measurement timestamps + glucose values
- Nutrition from [MacroFactor](https://macrofactorapp.com/): Meal timestamps + macronutrients (carbs, protein, and fat)
- Sleep data from [Sleep Cycle](https://sleepcycle.com/): Sleep start timestamp + time in bed + time asleep (+ sleep quality, which is a proprietary measure calculated by the app)
- Cardio workouts from [Garmin](https://connect.garmin.com/): Workout start timestamp + workout duration
- Strength workouts from [Hevy](https://www.hevyapp.com/): Workout start timestamp + workout duration

{{< img src="cgm-dashboard.jpg" alt="Final Dashboard" width="80%" >}}
After structuring those datapoints in a dataframe and normalizing timestamps, I was able to quickly highlight sleep (blue boxes with callouts for time in bed, time asleep, and sleep quality) and workouts (red traces on glucose measurements for strength workouts, green traces for cardio workouts) by plotting highlighted traces on top of the historic glucose trail for a set period. Furthermore, I was able to add annotations for nutrition events with the respective macronutrients.

I asked Claude to create some sample data and streamline the functions to reduce dependencies on the specific data sources I used. The resulting notebook is a comprehensive CGM data analysis tool that loads and processes glucose readings alongside lifestyle data (nutrition, workouts, and sleep), then creates an integrated dashboard for visualization. The code handles data preprocessing including interpolation of missing glucose values, timeline synchronization across different data sources, and statistical analysis with key metrics like time-in-range and coefficient of variation. The main output is a day-by-day dashboard that overlays workout periods, nutrition events, and sleep phases onto continuous glucose monitoring data, enabling users to identify patterns and correlations between lifestyle factors and blood sugar responses. 

You can find the complete [notebook](https://github.com/philippdubach/glucose-tracker/blob/fd5992961cfb4630dad439c782430190937414a3/notebooks/data_exploration.ipynb) as well as the sample data in my [GitHub repository](https://github.com/philippdubach/glucose-tracker/).