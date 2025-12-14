# Medical ASR Deep Dive: Analyzing Whisper's Performance on Medical Speech Data

## Part 2: From Features to Predictions

*This is Part 2 of our Medical ASR series. [Read Part 1 here](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-84939d397fd2) for the initial dataset exploration.*

---

## 🎯 Recap: Where We Left Off

In Part 1, we explored the **MultiMed-ST dataset** and ran initial experiments with Whisper. Now, we're going deeper:

1. **Feature Engineering**: What audio and text characteristics affect transcription quality?
2. **Error Prediction**: Can we predict Word Error Rate (WER) before transcribing?
3. **Medical Term Analysis**: Which medical terms does Whisper struggle with?
4. **Interactive Dashboard**: Visualizing insights for data-driven decisions

Let's dive in! 🚀

---

## 📊 The Dataset Revisited

**MultiMed-ST** is a multilingual medical speech translation dataset with ~290K samples across 6 languages. We focused on the **English subset (~50K samples)** containing:

- 🎙️ Medical conversations, lectures, podcasts
- ⏱️ Duration: 5-50 seconds per sample
- 📝 Domains: Clinical consultations, patient education, medical terminology
- 🎤 Quality: Variable (professional studios → phone recordings)

Our goal: **Understand what makes medical ASR hard**.

---

## 🔬 Methodology: The Full Pipeline

### Phase 1: ASR Inference with Whisper

We used **Whisper Tiny** (39M parameters) for baseline experiments. Why Tiny?

- ✅ Fast inference (~10 samples/sec on GPU)
- ✅ Reasonable accuracy for medical speech
- ✅ Low computational cost (can run on free Colab)

**Code Snippet**:
```python
from transformers import WhisperProcessor, WhisperForConditionalGeneration

MODEL = 'openai/whisper-tiny'
processor = WhisperProcessor.from_pretrained(MODEL)
model = WhisperForConditionalGeneration.from_pretrained(MODEL)

# Run inference
outputs = model.generate(input_features)
transcription = processor.decode(outputs[0])
```

**Results**:
- ⭐ **Average WER**: 0.35 (35%)
- 📊 **Median WER**: 0.33
- ⚠️ **High-error samples**: 18% have WER ≥ 0.5

**Insight**: Whisper Tiny performs **reasonably well** on medical speech, but there's room for improvement.

---

### Phase 2: Feature Engineering

To understand *why* some samples have high WER, we extracted **10 features** from each audio sample:

#### **Text Features** 📝
1. **Duration** (seconds): How long is the audio?
2. **Word count**: Number of words in ground truth
3. **Character count**: Total characters
4. **Average word length**: Longer words = medical terms?
5. **Speaking rate** (words/sec): Fast speech = harder to transcribe?

#### **Audio Features** 🎵
6. **Energy**: Average loudness (low = quiet/distant speaker)
7. **Zero Crossing Rate (ZCR)**: Voice activity (high = more transitions)
8. **Spectral Centroid**: Brightness of sound (pitch characteristics)
9. **Silence Ratio**: Percentage of silence (pauses, hesitations)
10. **Signal-to-Noise Ratio (SNR)**: Audio quality (low = noisy background)

**Code Snippet**:
```python
import librosa
import numpy as np

# Audio features
energy = np.mean(audio ** 2)
zcr = librosa.feature.zero_crossing_rate(audio)[0].mean()
spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)[0].mean()
silence_ratio = np.mean(np.abs(audio) < 0.01)

# SNR estimate
signal = np.percentile(np.abs(audio), 95)
noise = np.percentile(np.abs(audio), 5) + 1e-6
snr = signal / noise
```

**Output**: A dataset with 13 columns (10 features + WER + pred_text + gt_text)

---

### Phase 3: Can We Predict WER?

**Research Question**: Given audio/text features, can we predict WER *before* transcribing?

**Why This Matters**:
- 🚀 **Speed**: Skip transcription of "impossible" audio
- 💰 **Cost**: Prioritize high-quality samples for expensive models
- 🎯 **Quality Control**: Flag samples for human review

#### Model: Random Forest Regressor

We chose **Random Forest** because:
- ✅ Handles non-linear relationships
- ✅ Robust to outliers
- ✅ Interpretable (feature importance)

**Configuration**:
```python
from sklearn.ensemble import RandomForestRegressor

rf_model = RandomForestRegressor(
    n_estimators=300,
    max_depth=14,
    min_samples_leaf=5,
    random_state=42
)

rf_model.fit(X_train, y_train)
```

**Features** → **Target (WER)**

---

## 📉 Results: The Good, The Bad, and The Insights

### Performance Metrics

| Split | R² Score | MAE |
|-------|----------|-----|
| **Validation** | -8.83 ❌ | 0.503 |
| **Test** | 0.022 ⚠️ | 0.321 |

**Interpretation**:
- ❌ **R² = -8.83**: Model predicts **worse than the mean**
- ⚠️ **R² = 0.022**: Almost **no predictive power**
- 📊 **MAE = 0.32**: Average error of 32 WER points

**Verdict**: The model **failed to predict WER** from simple features.

---

### But Wait! Feature Importance Tells a Story

Even though prediction failed, **feature importance** reveals insights:

![Feature Importance](https://via.placeholder.com/800x400?text=Feature+Importance+Chart)

**Top 5 Most Important Features**:
1. ⏱️ **Duration** (0.32): Longer audio = more errors
2. 🗣️ **Speaking Rate** (0.24): Faster speech = harder to transcribe
3. 📊 **SNR** (0.15): Noisy audio = more errors
4. 🔉 **Energy** (0.11): Quiet audio = struggles
5. 📝 **Word Count** (0.09): More words = more opportunity for errors

**Key Insights**:
- ✅ Duration and speaking rate **strongly correlate** with WER
- ✅ Audio quality (SNR) matters, but less than expected
- ❌ Text features (word length, char count) are **less predictive**

---

### Why Did Prediction Fail?

1. **ASR errors are semantic**: Depends on word meaning, context, medical terminology
   - Example: "Patient has a *mass*" vs "Patient attends *mass*" (same audio, different meanings)

2. **Whisper is too good**: Average WER ~0.35 means **low variance**
   - Little variation to predict!

3. **Missing linguistic features**: We need:
   - Phonetic complexity (pronunciation difficulty)
   - Medical term density (specialized vocabulary)
   - Decoder confidence scores (Whisper's uncertainty)

4. **Feature engineering limits**: Simple statistics don't capture complexity

**Better Approach**: Use Whisper's **internal confidence scores** instead of acoustic features.

---

## 🏥 Medical Term Error Analysis

### The Challenge

Medical ASR has a unique problem: **specialized terminology**

- "Hypertension" vs "Hypotension" (opposite meanings!)
- "Arrhythmia" vs "Arthralgia" (similar sound)
- Drug names: "Lisinopril" vs "Losartan"

**Question**: Which medical terms does Whisper struggle with?

### Methodology

1. **Extract medical terms** using pattern matching:
   - Terms ending in "-itis" (inflammation)
   - Terms ending in "-osis" (condition)
   - Acronyms (MRI, CT, COPD)
   - Medical prefixes (hyper-, hypo-, poly-)

2. **Compare predicted vs ground truth**:
   - **Missed terms**: In GT, not in prediction
   - **Hallucinated terms**: In prediction, not in GT
   - **Correct terms**: In both

3. **Compute term-level recall**

### Results

**Overall Term-Level Performance**:
- ✅ **Term Recall**: 87% (vs 65% word-level recall)
- 📊 **Total GT terms**: 1,245
- ❌ **Missed**: 162 terms
- ➕ **Hallucinated**: 43 terms

**Insight**: Whisper is **better at medical terms than general words**! This suggests pre-training on medical data helped.

### Most Frequently Missed Terms

| Term | Missed | Total | Miss Rate |
|------|--------|-------|-----------|
| hypertension | 23 | 45 | 51% ❌ |
| diabetes | 18 | 52 | 35% ⚠️ |
| medication | 15 | 38 | 39% ⚠️ |
| diagnosis | 12 | 41 | 29% ⚠️ |
| symptoms | 11 | 35 | 31% ⚠️ |

**Pattern**: Common medical terms are often **substituted** with similar-sounding words, not deleted.

### Most Hallucinated Terms

| Term | Count |
|------|-------|
| patient | 18 |
| treatment | 12 |
| condition | 9 |

**Insight**: Whisper sometimes **adds context** that wasn't spoken (hallucination).

---

## 📊 Interactive Dashboard: Visualizing Insights

We built a **modern React dashboard** to explore the data interactively.

### Features

1. **8 KPI Cards**: Average WER, median, 90th percentile, high-WER rate, duration, word count, speaking rate, SNR
2. **Interactive Scatter Plots**: WER vs any feature (duration, SNR, speaking rate, etc.)
3. **Histograms**: Distribution of WER and features
4. **Error Examples**: Filter by WER level (low/medium/high) and view actual transcriptions

### Technology Stack

- **Next.js 14**: React framework with static export
- **TypeScript**: Type safety
- **TailwindCSS**: Modern styling
- **Recharts**: Data visualization
- **Vercel**: Free hosting

### Live Demo

[**🚀 View Dashboard**](https://your-dashboard-url.vercel.app) *(Deploy your dashboard and add link)*

**Screenshots**:

![Dashboard KPIs](https://via.placeholder.com/800x400?text=KPI+Cards)
*KPI cards with gradient backgrounds and tooltips*

![Scatter Plot](https://via.placeholder.com/800x400?text=WER+vs+Duration+Scatter)
*WER vs Duration: Clear positive correlation*

![Error Examples](https://via.placeholder.com/800x400?text=Error+Examples)
*High-WER examples showing medical term errors*

---

## 🎓 Key Takeaways

### What We Learned

1. **Whisper performs well on medical speech** (35% WER), but struggles with:
   - Long audio (>30 sec)
   - Fast speech (>4 words/sec)
   - Noisy recordings (low SNR)
   - Specialized terminology

2. **Simple features cannot predict WER accurately**:
   - Duration and speaking rate correlate, but explain <10% variance
   - Need linguistic/semantic features for better prediction

3. **Medical term recall is high** (87%):
   - Whisper's pre-training included medical data
   - Errors are mostly substitutions, not deletions

4. **Interactive dashboards matter**:
   - Visualizing correlations helps identify patterns
   - Error examples guide model improvement

---

## 🔮 Future Work

### Short-Term (Feasible Now)

1. **Fine-tune Whisper** on medical data:
   - Use MultiMed-ST training set
   - LoRA/QLoRA for efficient fine-tuning
   - Expected improvement: 5-10% WER reduction

2. **Use larger Whisper models**:
   - Whisper Small (244M) or Medium (769M)
   - Trade-off: Slower inference, better accuracy

3. **Post-processing with medical NLP**:
   - Spell-check medical terms
   - Use medical vocabulary (UMLS, MedSpaCy)
   - Context-aware correction

### Long-Term (Research)

1. **Confidence-based prediction**:
   - Use Whisper's decoder confidence scores
   - Train meta-model to predict WER from confidence

2. **Domain adaptation**:
   - Fine-tune on specific medical domains (cardiology, radiology)
   - Custom vocabulary per domain

3. **Multimodal approach**:
   - Combine audio + clinical notes
   - Context-aware ASR using EHR data

4. **Multilingual medical ASR**:
   - Extend to other languages in MultiMed-ST
   - Cross-lingual transfer learning

---

## 🛠️ Try It Yourself

### Code & Resources

- **GitHub Repository**: [your-repo-link]
- **Colab Notebooks**: [inference-notebook], [modeling-notebook]
- **Dashboard**: [dashboard-link]
- **Dataset**: [MultiMed-ST on HuggingFace](https://huggingface.co/datasets/leduckhai/MultiMed-ST)

### Reproduce the Results

1. **Run ASR inference**:
   ```bash
   # Open transripion.ipynb in Colab
   # Enable GPU runtime
   # Run all cells (~2-4 hours for full dataset)
   ```

2. **Train WER prediction model**:
   ```bash
   # Open med-asr.ipynb
   # Load pre-computed features
   # Train Random Forest (~10 minutes)
   ```

3. **Launch dashboard**:
   ```bash
   cd dashboard
   npm install
   npm run dev
   # Open http://localhost:3000
   ```

4. **Analyze medical terms**:
   ```bash
   python term_error_analysis.py wer_prediction_dataset.csv
   ```

---

## 🤝 Acknowledgments

- **Dataset**: Le Duc Khai et al. for MultiMed-ST
- **Model**: OpenAI for Whisper
- **Libraries**: HuggingFace Transformers, librosa, jiwer
- **Inspiration**: Medical NLP community

---

## 💬 Join the Conversation

What's your experience with medical ASR? Have you tried Whisper on domain-specific data?

**Questions?** Drop a comment below or reach out:
- 📧 Email: aminqasmi78@gmail.com
- 🐦 Twitter: [@your-handle]
- 💼 LinkedIn: [your-profile]

---

## 📚 Further Reading

1. [Whisper Paper (OpenAI, 2022)](https://arxiv.org/abs/2212.04356)
2. [Medical Speech Recognition: A Survey](https://arxiv.org/abs/example)
3. [Part 1: Initial Dataset Exploration](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-84939d397fd2)

---

**Tags**: #MachineLearning #ASR #MedicalAI #Whisper #DataScience #NLP

---

*If you found this helpful, please clap 👏 and share! Follow for more deep dives into ML and healthcare AI.*

