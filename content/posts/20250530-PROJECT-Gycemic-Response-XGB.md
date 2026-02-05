---
title: Modeling Glycemic Response with XGBoost
date: 2025-05-30
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
Earlier this year I wrote how [I built a CGM data reader](/posts/i-built-a-cgm-data-reader/) after wearing a continuous glucose monitor myself. Since I was already logging my macronutrients and learning more about molecular biology in an [MIT MOOC](https://ocw.mit.edu/courses/res-7-008-7-28x-molecular-biology/) I became curious if given a meal's macronutrients (carbs, protein, fat) and some basic individual characteristics (age, BMI), these could serve as features in a regressor machine learning model to predict the curve parameters of the postprandial glucose curve (how my blood sugar levels change after eating). I came across a paper on [Personalized Nutrition by Prediction of Glycemic Responses](https://pdub.click/2512231c) which used machine learning to predict individual glycemic responses from meal data, exactly what I had in mind. Unfortunately, neither the data nor the code were publicly available. And - I wanted to predict my _own_ glycemic response curve. So I decided to build my own model. In the process I wrote this [working paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5914902).
<a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5914902">
{{< img src="working_paper_overview.jpg" alt="Overview of Working Paper Pages" width="80%" >}}</a>
The paper represents an exercise in applying machine learning techniques to medical applications. The methodologies employed were largely inspired by [Zeevi et al.](https://www.cell.com/cell/fulltext/S0092-8674(15)01481-6?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0092867415014816%3Fshowall%3Dtrue)'s approach. I quickly realized that training a model on my own data _only_ was not very promising if not impossible. To tackle this, I used the publicly available [Hall dataset](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2005143) containing continuous glucose monitoring data from 57 adults, which I narrowed down to 112 standardized meals from 19 non-diabetic subjects with their respective glucose curve after the meal (full methodology in the paper).
{{< img src="cgm-workflow-graph.jpg" alt="Overview of the CGM pipeline workflow" width="80%" >}}
Rather than trying to predict the entire glucose curve, I simplified the problem by fitting each postprandial response to a normalized Gaussian function. This gave me three key parameters to predict: amplitude (how high glucose rises), time-to-peak (when it peaks), and curve width (how long the response lasts). 
{{< img src="cgm-fitted-curve-large1.jpg" alt="Overview of single fitted curve of cgm measurements" width="80%" >}}
The Gaussian approximation worked surprisingly well for characterizing most glucose responses. While some curves fit better than others, the majority of postprandial responses were well-captured, though there's clear variation between individuals and meals. Some responses were high amplitude, narrow width, while others are more gradual and prolonged. 
{{< img src="example-fitted-cgm-measurements.jpg" alt="Overview of selected fitted curves" width="80%" >}}
I then trained an XGBoost regressor with 27 engineered features including meal composition, participant characteristics, and interaction terms. XGBoost was chosen for its ability to handle mixed data types, built-in feature importance, and strong performance on tabular data. The pipeline included hyperparameter tuning with 5-fold cross-validation to optimize learning rate, tree depth, and regularization parameters. Rather than relying solely on basic meal macronutrients, I engineered features across multiple categories and implemented CGM statistical features calculated over different time windows (24-hour and 4-hour periods), including time-in-range and glucose variability metrics. Architecture wise, I trained three separate XGBoost regressors - one for each Gaussian parameter. 

While the model achieved moderate success predicting amplitude (R² = 0.46), it completely failed at predicting timing - time-to-peak prediction was essentially random (R² = -0.76), and curve width prediction was barely better (R² = 0.10). Even the amplitude prediction, while statistically significant, falls well short of an R² > 0.7. Studies that have achieved better predictive performance typically used much larger datasets (>1000 participants). For my original goal of predicting my own glycemic responses, this suggests that either individual-specific models trained on extensive personal data, or much more sophisticated approaches incorporating larger training datasets, would be necessary. 

The complete code, Jupyter notebooks, processed datasets, and supplementary results are available in my [GitHub repository](https://github.com/philippdubach/glucose-response-analysis).
<br>_ _

_(10/06/2025) Update: Today I came across Marcel Salathé's [LinkedIn post](https://www.linkedin.com/posts/salathe_myfoodrepo-digitalhealth-precisionnutrition-activity-7337806988082393088-2Lsu?utm_source=share&utm_medium=member_ios&rcm=ACoAADeInT4BJMhtg5DSjxX1jVtIAs5w_KxZm-g) on a publication out of EPFL: [Personalized glucose prediction using in situ data only](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1539118/full)._

> _With data from over 1,000 participants of the Food & You digital cohort, we show that a machine learning model using only food data from myFoodRepo and a glucose monitor can closely track real blood sugar responses to any meal (correlation of 0.71)._

_As expected Singh et. al. achieve a substantially better predictive performance (R = 0.71 vs R² = 0.46). Besides probably higher methodological rigor and scientific quality, the most critical difference is sample size - their 1'000+ participants versus my 19 participants (from the [Hall dataset](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2005143)) represents a fundamental difference in statistical power and generalizability. They addressed one of the shortcomings I faced by leveraging a large digital nutritional cohort from the ["Food & You" study](https://pubmed.ncbi.nlm.nih.gov/38033170/) (including high-resolution data of nutritional intake of more than 46 million kcal collected from 315'126 dishes over 23'335 participant days, 1'470'030 blood glucose measurements, 49'110 survey responses, and 1'024 samples for gut microbiota analysis)._

_Apart from that I am excited to - at a first glance - observe the following similarities:
(1) Both aim to predict postprandial glycemic responses using machine learning, with a focus on personalized nutrition applications.
(2) Both employ XGBoost regression as their primary predictive algorithm and use similar performance metrics (R², RMSE, MAE, Pearson correlation).
(3) Both extract comprehensive feature sets including meal composition (macronutrients), temporal features, and individual characteristics.
(4) Both use mathematical approaches to characterize glucose responses - I used Gaussian curve fitting, while Singh et. al. use incremental area under the curve (iAUC).
(5) Both employ cross-validation techniques for model evaluation and hyperparameter tuning.
(6) SHAP Analysis: Both use SHAP for model interpretability and feature importance analysis._<a id="update">

{{< disclaimer type="medical" >}}
