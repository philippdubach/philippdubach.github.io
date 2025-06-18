---
title: "Modeling Glycemic Response with XGBRegressor"
date: 2025-05-30
tags: ["Project"]
draft: true
---

Earlier this year I wrote about how [I built a CGM data reader](/2025/01/02/i-built-a-cgm-data-reader/) afer wearing a continuous glucose monitor myself.
<a href="https://static.philippdubach.com/pdf/Modeling_Postprandial_Glycemic_Response_in_Non_Diabetic_Adults_Using_XGBRegressor.pdf">
{{< img src="working_paper_overview.jpg" alt="Overview of Working Paper Pages" width="80%" >}}</a>

In the process I decided to write this [Working Paper](https://static.philippdubach.com/pdf/Modeling_Postprandial_Glycemic_Response_in_Non_Diabetic_Adults_Using_XGBRegressor.pdf). The paper represents an exercise in applying machine learning techniques to medical applications. The methodologies employed were largely inspired by Zeevi et al.’s approach: [Personalized Nutrition by Prediction of Glycemic Responses](https://www.cell.com/cell/fulltext/S0092-8674(15)01481-6?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS0092867415014816%3Fshowall%3Dtrue).
The complete code, Jupyter notebooks, processed datasets, and supplementary results are available in my [GitHub repository](https://github.com/philippdubach/glucose-response-analysis).
<br>_ _


_(10/06/205) Update: Today I came across Marcel Salathé's [LinkedIn post](https://www.linkedin.com/posts/salathe_myfoodrepo-digitalhealth-precisionnutrition-activity-7337806988082393088-2Lsu?utm_source=share&utm_medium=member_ios&rcm=ACoAADeInT4BJMhtg5DSjxX1jVtIAs5w_KxZm-g) on a publication out of EPFL: [Personalized glucose prediction using in situ data only](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1539118/full)._

> _With data from over 1,000 participants of the Food & You digital cohort, we show that a machine learning model using only food data from myFoodRepo and a glucose monitor can closely track real blood sugar responses to any meal (correlation of 0.71)._

_As expected Singh et. al. achieve a substantially better predictive performance (R = 0.71 vs R² = 0.46). Besides probably higher methodological rigor and scientific quality, the most critical difference is sample size - their 1'000+ participants versus my 19 participants (from the [Hall dataset](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2005143)) represents a fundamental difference in statistical power and generalizability. They adressed one of the shortcomings I faced by leveraging a large digital nutritional cohort from the ["Food & You" study](https://pubmed.ncbi.nlm.nih.gov/38033170/) comprising over 1000 participants (including high-resolution data of nutritional intake of more than 46 million kcal collected from 315'126 dishes over 23'335 participant days, 1'470'030 blood glucose measurements, 49'110 survey responses, and 1'024 samples for gut microbiota analysis)._

_Apart from that I am super happy to observe the following similarities at a first glance:
(1) Both aim to predict postprandial glycemic responses using machine learning, with a focus on personalized nutrition applications.
(2) Both employ XGBoost regression as their primary predictive algorithm and use similar performance metrics (R², RMSE, MAE, Pearson correlation).
(3) Both extract comprehensive feature sets including meal composition (macronutrients), temporal features, and individual characteristics.
(4) Both use mathematical approaches to characterize glucose responses - I used Gaussian curve fitting, while Singh et. al. use incremental area under the curve (iAUC).
(5) Both employ cross-validation techniques for model evaluation and hyperparameter tuning.
(6) SHAP Analysis: Both use SHAP for model interpretability and feature importance analysis._