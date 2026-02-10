---
title: Modeling Glycemic Response with XGBoost
date: 2025-05-30
lastmod: 2026-02-10
images:
- https://static.philippdubach.com/ograph/ograph-xgboost.jpg
seoTitle: "Predicting Glycemic Response with XGBoost and CGM Data"
description: "A hands-on project predicting postprandial glucose curves with XGBoost, Gaussian curve fitting, and 27 engineered features from CGM data. Code on GitHub."
keywords:
- predict glycemic response machine learning
- XGBoost glucose prediction
- postprandial glucose response prediction
- CGM data machine learning
- precision nutrition glucose prediction
tags:
- Project
categories:
- Medicine
- AI
type: Project
draft: false
aliases:
- /2025/05/30/modeling-glycemic-response-with-xgboost/

faq:
- question: Can machine learning predict blood sugar responses to individual meals?
  answer: Machine learning models like XGBoost can predict certain aspects of postprandial glucose response, particularly the amplitude (how high blood sugar rises after eating). Using features such as meal macronutrients, individual characteristics, and CGM-derived metrics, the model achieved an R-squared of 0.46 for amplitude prediction. However, predicting the timing and duration of the glucose response proved far more difficult, suggesting that meal composition alone provides limited information about when and how long blood sugar stays elevated.
- question: Why use Gaussian curve fitting for glucose response modeling?
  answer: 'Fitting each postprandial glucose response to a normalized Gaussian function simplifies the prediction problem from modeling an entire glucose curve to predicting just three parameters: amplitude (how high glucose rises), time-to-peak (when it peaks), and curve width (how long the response lasts). This approximation works well for most glucose responses in non-diabetic individuals, though some curves fit better than others due to variation between individuals and meals.'
- question: How much data do you need to predict glycemic responses accurately?
  answer: Sample size is one of the most critical factors in glucose prediction accuracy. A model trained on 112 standardized meals from 19 non-diabetic subjects achieved moderate amplitude prediction (R-squared of 0.46). In comparison, the EPFL Food and You study with over 1,000 participants achieved a correlation of 0.71. Studies that reach R-squared values above 0.7 typically require datasets with more than 1,000 participants, showing that individual glycemic prediction at scale demands large and diverse training data.
- question: What features matter most for predicting postprandial glucose response?
  answer: 'In XGBoost-based glucose prediction, 27 engineered features were used across multiple categories: meal composition (carbohydrates, protein, fat, and their interaction terms), participant characteristics (age, BMI), and CGM statistical features calculated over 24-hour and 4-hour windows, including time-in-range and glucose variability metrics. While macronutrients are primary drivers, pre-meal glucose state and individual metabolic characteristics provide additional predictive signal for amplitude prediction.'
- question: What is the best machine learning model for predicting glucose levels from meal data?
  answer: XGBoost is a strong choice for tabular health data because it handles mixed data types, provides built-in feature importance, and performs well without requiring massive datasets. For postprandial glucose prediction specifically, XGBoost with hyperparameter tuning and cross-validation is widely used in the literature. Newer deep learning approaches and foundation models are showing promise for larger-scale glucose prediction tasks, particularly when richer temporal data from continuous glucose monitors is available.
---
<br>

Earlier this year I wrote how [I built a CGM data reader](/posts/i-built-a-cgm-data-reader/) after wearing a continuous glucose monitor myself. Since I was already logging my macronutrients and learning more about molecular biology in an [MIT MOOC](https://ocw.mit.edu/courses/res-7-008-7-28x-molecular-biology/), I became curious: given a meal's macronutrients (carbs, protein, fat) and some basic individual characteristics (age, BMI), could a machine learning model predict the shape of my postprandial glucose curve? I came across [Zeevi et al.](https://www.cell.com/cell/fulltext/S0092-8674(15)01481-6)'s paper on Personalized Nutrition by Prediction of Glycemic Responses, which used machine learning to predict individual glycemic responses from meal data. Exactly what I had in mind. Unfortunately, neither the data nor the code were publicly available. So I decided to build my own model. In the process I wrote this [working paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5914902).

<a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5914902">
{{< img src="working_paper_overview.jpg" alt="Overview of Working Paper Pages" width="80%" >}}</a>

The paper documents my attempt to build an open, reproducible glucose prediction pipeline, and what I learned about why that is harder than it sounds. The methodologies employed were largely inspired by [Zeevi et al.](https://www.cell.com/cell/fulltext/S0092-8674(15)01481-6?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0092867415014816%3Fshowall%3Dtrue)'s approach. This matters because the landscape of personalized nutrition is increasingly dominated by proprietary systems. Companies like ZOE, DayTwo, and Ultrahuman all run versions of this pipeline on closed data. Open-source alternatives remain scarce.

## Why not only use my own data?

I quickly realized that training a model only on my own CGM data was not going to work. Over several weeks of diligent logging, I collected roughly 40 meal-response pairs. To make matters worse, [Howard, Guo & Hall (2020)](https://doi.org/10.1093/ajcn/nqaa198) showed that two CGMs worn simultaneously on the same person can give discordant meal rankings for postprandial glucose, meaning some of the variance in the signal is measurement noise, not biology.

To get enough data, I used the publicly available [Hall dataset](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2005143) containing continuous glucose monitoring data from 57 adults, which I narrowed down to 112 standardized meals from 19 non-diabetic subjects with their respective glucose curve after the meal (full methodology in the paper).

{{< img src="cgm-workflow-graph.jpg" alt="Overview of the CGM pipeline workflow" width="80%" >}}

## Gaussian curve fitting

Rather than trying to predict the entire glucose curve, I simplified the problem by fitting each postprandial response to a normalized Gaussian function. This gave me three key parameters to predict: amplitude (how high glucose rises), time-to-peak (when it peaks), and curve width (how long the response lasts).

{{< img src="cgm-fitted-curve-large1.jpg" alt="Overview of single fitted curve of cgm measurements" width="80%" >}}

The Gaussian approximation worked surprisingly well for characterizing most glucose responses. While some curves fit better than others, the majority of postprandial responses were well-captured, though there is clear variation between individuals and meals. Some responses were high amplitude, narrow width, while others are more gradual and prolonged.

{{< img src="example-fitted-cgm-measurements.jpg" alt="Overview of selected fitted curves" width="80%" >}}

## XGBoost pipeline

I then trained an XGBoost regressor with 27 engineered features including meal composition, participant characteristics, and interaction terms. XGBoost was chosen for its ability to handle mixed data types, built-in feature importance, and strong performance on tabular data. The pipeline included hyperparameter tuning with 5-fold cross-validation to optimize learning rate, tree depth, and regularization parameters. Rather than relying solely on basic meal macronutrients, I engineered features across multiple categories and implemented CGM statistical features calculated over different time windows (24-hour and 4-hour periods), including time-in-range and glucose variability metrics. Architecture-wise, I trained three separate XGBoost regressors, one for each Gaussian parameter.

## Results

The model could predict *how high* my blood sugar rises after a meal with moderate accuracy (R² = 0.46, correlation = 0.73, p < 0.001). Not good enough for clinical guidance, which typically requires R² > 0.7, but meaningfully better than the multi-linear regression baseline (R² = 0.24).

The more telling result is what the model could not do. It had no idea *when* blood sugar would peak. The time-to-peak prediction was literally worse than guessing the average every time (R² = -0.76, p = 0.896). Curve width prediction was marginally better but still not useful (R² = 0.10). In other words: meal composition tells you something about the magnitude of your glucose spike, but almost nothing about its timing or duration. That is a meaningful finding in itself, consistent with the idea that temporal dynamics are driven by factors like gastric emptying, insulin sensitivity, and gut microbiome composition, none of which were captured in the feature set.

For context, [Cappon et al. (2023)](https://www.sciencedirect.com/science/article/abs/pii/S1746809423012429) trained a similar XGBRegressor on 3,296 meals from 927 healthy individuals and achieved a correlation of r = 0.48 for predicting glycemic response magnitude. Their larger dataset did not dramatically improve over my amplitude correlation of 0.73, but they also found systematic bias in predictions, suggesting that XGBoost captures the general direction well while missing individual-level variation. Separately, [Shin et al. (2025)](https://www.nature.com/articles/s41598-025-01367-7) tried a bidirectional LSTM on 171 healthy adults and achieved r = 0.43, worse than XGBoost on amplitude. Deep learning does not automatically win here, especially at small-to-medium dataset sizes. Data quantity matters more than model complexity.

A study on [glycemic prediction in pregnant women](https://www.nature.com/articles/s41522-025-00650-9) found that adding gut microbiome data increased explained variance in glucose peaks from 34% to 42%, underscoring that meal composition alone leaves a lot on the table.

The complete code, Jupyter notebooks, processed datasets, and supplementary results are available in my [GitHub repository](https://github.com/philippdubach/glucose-response-analysis).

<hr>

*(10/06/2025) Update: Today I came across Marcel Salathé's [LinkedIn post](https://www.linkedin.com/posts/salathe_myfoodrepo-digitalhealth-precisionnutrition-activity-7337806988082393088-2Lsu?utm_source=share&utm_medium=member_ios&rcm=ACoAADeInT4BJMhtg5DSjxX1jVtIAs5w_KxZm-g) on a publication out of EPFL: [Personalized glucose prediction using in situ data only](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1539118/full).*

> *With data from over 1,000 participants of the Food & You digital cohort, we show that a machine learning model using only food data from myFoodRepo and a glucose monitor can closely track real blood sugar responses to any meal (correlation of 0.71).*

*As expected, Singh et al. achieve substantially better predictive performance (R = 0.71 vs R² = 0.46). The most critical difference is sample size: their 1,000+ participants versus my 19 (from the [Hall dataset](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2005143)). They leveraged the ["Food & You" study](https://pubmed.ncbi.nlm.nih.gov/38033170/) with high-resolution nutritional intake data from more than 46 million kcal collected across 315,126 dishes, 1,470,030 blood glucose measurements, and 1,024 gut microbiota samples. Both studies use XGBoost, SHAP for interpretability, cross-validation for evaluation, and mathematical approaches to characterize glucose responses (Gaussian curve fitting in my case, incremental AUC in theirs). The methodological overlap is reassuring; what separates the results is data at scale.*

*The [CGMacros dataset](https://www.nature.com/articles/s41597-025-05851-7) (Das et al., Scientific Data, 2025) now provides the first publicly available multimodal dataset with CGM readings, food macronutrients, meal photos, activity data, and microbiome profiles for 45 participants. It even includes an XGBoost example script for predicting postprandial AUC. This is exactly the kind of open resource the field needs more of.*<a id="update">

{{< disclaimer type="medical" >}}
