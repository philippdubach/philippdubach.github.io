---
title: Counting Cards with Computer Vision
date: 2025-07-06
images:
- https://static.philippdubach.com/ograph/ograph-blackjack.jpg
description: Built a real-time blackjack odds calculator using Claude Code AI, YOLOv11
  vision, and Monte Carlo simulation for card detection.
keywords:
- Claude Code
- computer vision
- YOLOv11
- Monte Carlo simulation
- blackjack odds
- object detection
- machine learning
- Python coding
- card detection
- AI programming
- data annotation
- transfer learning
- real-time detection
- Roboflow
- gaming AI
tags:
- Project
draft: false
aliases:
- /2025/07/06/counting-cards-with-computer-vision/

---
After installing [Claude Code](https://www.anthropic.com/claude-code)
>the agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster through natural language commands

I was looking for a task to test its abilities. Fairly quickly we wrote [less than 200 lines of python code predicting black jack odds](https://gist.github.com/philippdubach/741cbd56498e43375892966ca691b9c2) using Monte Carlo Simulation. When I went on to test this little tool on [Washington Post's](https://games.washingtonpost.com/games/blackjack) online Black Jack (I also didn't know that existed!) I quickly noticed how impractical it was to manually input all the card values on the table manually. What if the tool would also automatically recognize the cards that are on the table and calculate the odds from it? I have never done anything with computer vision so this seemed like a good challenge. 
{{< img src="classification.gif" alt="alt text here" width="80%" >}}
To get to any reasonable result we have to start with classification where we "teach" the model to categorize data by showing them lots of examples with correct labels. But where do the labels come from? I manually annotated [409 playing cards across 117 images](https://universe.roboflow.com/cards-agurd/playing_card_classification) using Roboflow Annotate (at first I only did half as much - why this wasn't a good idea we'll see in a minute). Once enough screenshots of cards were annotated we can train the model to recognize the cards and predict card values on tables it has never seen before. I was able to use a [NVIDIA T4 GPU](https://www.nvidia.com/en-us/data-center/tesla-t4/) inside Google Colab which offers some GPU time for free when capacity is available.
{{< img src="gpu_setup_colab.png" alt="alt text here" width="80%" >}}
During training, the algorithm learns patterns from this example data, adjusting its internal parameters millions of times until it gets really good at recognizing the differences between categories (in this case different cards). Once trained, the model can then make predictions on new, unseen data by applying the patterns it learned. With the annotated dataset ready, it was time to implement the actual computer vision model. I chose to run inference on [Ultralytics' YOLOv11](https://docs.ultralytics.com/de/models/yolo11/) pre-trained model, a state-of-the-art object detection algorithm. I set up the environment in Google Colab following the ["How to Train YOLO11 Object Detection on a Custom Dataset"](https://colab.research.google.com/github/roboflow-ai/notebooks/blob/main/notebooks/train-yolo11-object-detection-on-custom-dataset.ipynb) notebook. After extracting the annotated dataset from Roboflow, I began training the model using the pre-trained YOLOv11s weights as a starting point. This approach, called [transfer learning](https://en.wikipedia.org/wiki/Transfer_learning), allows the model to leverage patterns already learned from millions of general images and adapt them to this specific task.
I initially set it up to [run for 350 epochs](https://docs.ultralytics.com/guides/model-training-tips/#other-techniques-to-consider-when-handling-a-large-dataset), though the model's built-in early stopping mechanism kicked in after 242 epochs when no improvement was observed for 100 consecutive epochs. The best results were achieved at epoch 142, taking around 13 minutes to complete on the Tesla T4 GPU.
The initial results were quite promising, with an overall mean Average Precision (mAP) of 80.5% at IoU threshold 0.5. Most individual card classes achieved good precision and recall scores, with only a few cards like the 6 and Queen showing slightly lower precision values.
{{< img src="run1_results.png" alt="Training results showing confusion matrix and loss curves" width="80%" >}}
However, looking at the confusion matrix and loss curves revealed some interesting patterns. While the model was learning effectively (as shown by the steadily decreasing loss), there were still some misclassifications between similar cards, particularly among the numbered cards. This highlighted exactly why I mentioned earlier that annotating only half the amount of data initially "wasn't a good idea" - more training examples would likely improve these edge cases and reduce confusion between similar-looking cards. My first attempt at solving the remaining accuracy issues was to add another layer to the workflow by sending the detected cards to Anthropic's Claude API for additional OCR processing.
{{< img src="claude_vision_workflow_results.png" alt="Roboflow workflow with Claude API integration" width="80%" >}}
This hybrid approach was very effective - the combination of YOLO's object detection to dynamically crop down the Black Jack table to individual cards with Claude's advanced vision capabilities yielded 99.9% accuracy on the predicted cards. However, this solution came with a significant drawback: the additional API layer consumed valuable time and the large model's processing overhead, making it impractical for real-time gameplay.
Seeking a faster solution, I implemented the same workflow [locally using easyOCR](https://github.com/JaidedAI/EasyOCR) instead. EasyOCR seems to be really good at extracting black text on white background but [might struggle with everything else](https://stackoverflow.com/questions/68261703/how-to-improve-accuracy-prediction-for-easyocr). While it was able to correctly identify the card numbers when it detected them, it struggled to recognize around half of the cards in the first place - even when fed pre-cropped card images directly from the YOLO model. This inconsistency made it unreliable for the application.
Rather than continue band-aid solutions, I decided to go back and improve my dataset. I doubled the training data by adding another 60 screenshots with the same train/test split as before. More importantly, I went through all the previous annotations and fixed many of the bounding polygons. I noticed that several misidentifications were caused by the model detecting face-down dealer cards as valid cards, which happened because some annotations for face-up cards inadvertently included parts of the card backs next to them. The improved dataset and cleaned annotations delivered what I was hoping for: The confusion matrix now shows a much cleaner diagonal pattern, indicating that the model now correctly identifies most cards without the cross-contamination issues we saw earlier.
{{< img src="run_best.png" alt="Final training results with improved dataset" width="80%" >}}
Both the training and validation losses converge smoothly without signs of overfitting, while the precision and recall metrics climb steadily to plateau near perfect scores. The mAP@50 reaches an impressive 99.5%. Most significantly, the confusion matrix now shows that the model has virtually eliminated false positives with background elements. The "background" column (rightmost) in the confusion matrix is now much cleaner, with only minimal misclassifications of actual cards as background noise.
{{< img src="local_run_interference_visual.png" alt="Real-time blackjack card detection and odds calculation" width="80%" >}}
With the model trained and performing, it was time to deploy it and play some blackjack. Initially, I tested the system using [Roboflow's hosted API](https://docs.roboflow.com/deploy/serverless-hosted-api-v2), which took around 4 seconds per inference - far too slow for practical gameplay. However, running the model locally on my laptop dramatically improved performance, achieving inference times of less than 0.1 seconds per image (1.3ms preprocess, 45.5ms inference, 0.4ms postprocess per image). I then [integrated the model with MSS](https://python-mss.readthedocs.io/) to capture a real-time feed of my browser window. The system automatically overlays the detected cards with their predicted values and confidence scores
{{< img src="black_jack_odds_demo.gif" alt="Overview of selected fitted curves" width="80%" >}}
The final implementation successfully combines the pieces: the computer vision model detects and identifies cards in real-time, feeds this information to the Monte Carlo simulation, and displays both the card recognition results and the calculated odds directly on screen - do not try this at your local (online) casino!