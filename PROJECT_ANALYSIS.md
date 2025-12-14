# Medical ASR Project - Comprehensive Analysis

## 📊 Project Overview
**Dataset**: MultiMed-ST (English subset)  
**Model**: OpenAI Whisper Tiny  
**Goal**: Analyze WER patterns and predict transcription quality from audio/text features

---

## ✅ What's Been Completed

### Phase 1: Data Preparation & ASR Inference
**File**: `transripion.ipynb`

**What it does:**
1. **Loads the dataset** from HuggingFace (`leduckhai/MultiMed-ST`, English split)
2. **Runs Whisper inference** using the `whisper-tiny` model
3. **Computes WER** (Word Error Rate) for each audio sample
4. **Extracts features**:
   - **Text features**: duration, word count, character count, speaking rate, avg word length
   - **Audio features**: energy, zero-crossing rate, spectral centroid, silence ratio, SNR
5. **Generates dataset**: `wer_prediction_dataset_extended.csv` with predictions and features

**Key Technical Details:**
- Uses streaming mode (no full download needed)
- Processes audio at 16kHz sampling rate
- Features extracted using librosa
- WER calculated using jiwer library

### Phase 2: WER Prediction Modeling
**File**: `med-asr (3).ipynb`

**What it does:**
1. **Loads train/val/test splits** of the WER prediction dataset
2. **Trains Random Forest Regressor** to predict WER from features:
   ```python
   Features: [duration_sec, word_count, char_count, avg_word_len, 
              speaking_rate, energy, zcr, spectral_centroid, 
              silence_ratio, snr]
   Target: wer
   ```
3. **Model Performance**:
   - **Validation R²**: -8.83 (poor - model predicting worse than mean)
   - **Test R²**: 0.022 (very low predictive power)
   - **Test MAE**: 0.321 (average error of 32.1% WER points)

**Interpretation:**
- **WER is highly variable** and hard to predict from simple acoustic/text features
- **Feature importance** shows some features matter more than others
- Suggests ASR errors are **context-dependent** and require deeper linguistic analysis

### Phase 3: Dashboard Creation
**File**: `wer_dashboard.html`

**Current Features:**
- 8 KPI cards (avg WER, median, P90, high-WER rate, duration, words, speaking rate, SNR)
- Interactive feature selector
- Scatter plot: WER vs selected feature
- WER distribution histogram
- Feature distribution histogram
- Error examples filtered by WER level (high/medium/low)

**Technology**: Pure HTML + Plotly.js (client-side rendering)

---

## 🔍 Gap Analysis: Proposed vs Actual

| **Proposed Task** | **Status** | **Notes** |
|-------------------|-----------|-----------|
| **Descriptive Analytics** |
| Duration distribution | ✅ Done | Feature extracted |
| Transcript length | ✅ Done | Word/char counts |
| Recording context | ❌ Missing | Not extracted from dataset |
| **Diagnostic Analytics** |
| Duration vs WER correlation | ✅ Done | Scatter plots available |
| Misrecognized terms | ⚠️ Partial | Examples shown, but no term-level analysis |
| Context difficulty | ❌ Missing | No context feature available |
| **Modeling** |
| WER prediction from features | ✅ Done | RF model trained (poor performance) |
| **Deliverables** |
| Interactive dashboard | ✅ Done | Basic HTML dashboard |
| Blog post | ⚠️ Phase 1 only | Need Phase 2 update |

---

## 📈 Model Explanation

### What the Random Forest Model Does:
The model attempts to **predict WER** (how many errors Whisper makes) **before transcribing**, based on:

1. **Duration**: Longer audio = more opportunity for errors
2. **Speaking rate**: Fast speech = harder to transcribe
3. **Audio quality**: Low SNR, high silence = poor quality
4. **Spectral features**: Voice characteristics

### Why Performance is Poor:
1. **ASR errors are semantic**: Words that sound similar but have different meanings
2. **Medical terminology**: Specialized vocabulary not in features
3. **Context matters**: "patient has a mass" vs "patient attends mass" 
4. **Limited features**: No linguistic or phonetic features
5. **Whisper is good**: Low average WER (0.3-0.4) means little variance to predict

### Better Approaches:
- **Confidence scores** from Whisper decoder
- **Phoneme-level features** (pronunciation difficulty)
- **Medical term density** (custom vocabulary matching)
- **Language model perplexity** (how unusual is the text?)

---

## 🎯 Missing Components

### 1. Recording Context Analysis
**Not extracted because**: The dataset doesn't clearly label recording contexts in metadata. Would need:
- Manual annotation or
- NLP-based context classification (conversation vs lecture vs narration)

### 2. Medical Term Error Analysis
**What's needed**:
- Extract medical terms using MedSpaCy or UMLS
- Compare GT vs Predicted at term level
- Identify most confused terms (e.g., "hypertension" → "hypotension")

### 3. Advanced Visualizations
**Current dashboard is basic**. Could add:
- Term confusion matrix
- WER heatmaps by duration/SNR bins
- Time-series analysis (if timestamp available)
- Audio waveform + error highlighting

---

## 💻 Running the Code

### Option 1: Google Colab (Recommended)
**Pros:**
- Free GPU/TPU access
- Dataset streams from HuggingFace (no local download)
- Already configured environment

**Cons:**
- Session timeouts (need to babysit long runs)
- Need HuggingFace + W&B API keys

**Time Estimate**:
- **transripion.ipynb**: ~2-4 hours for full English test set (~50K samples)
- **med-asr.ipynb**: ~10-15 minutes (just training RF)

### Option 2: Mac Local (Not Recommended)
**Pros:**
- No internet dependency after download
- Full control

**Cons:**
- **4GB audio download** required
- No GPU acceleration (Whisper on CPU = very slow)
- May need 16GB+ RAM
- Estimated time: **8-12 hours** for full inference

**Setup**:
```bash
pip install datasets transformers librosa evaluate jiwer torch accelerate
python -c "from datasets import load_dataset; ds = load_dataset('leduckhai/MultiMed-ST', 'English', split='test')"
```

### Recommendation:
**Use Colab** with streaming mode. The notebooks are already configured for this.

---

## 🚀 Next Steps

1. **Create modern React dashboard** (Vercel-deployable)
2. **Add term-level error analysis** (if time permits)
3. **Write comprehensive blog post** covering:
   - Dataset insights
   - Whisper performance on medical speech
   - Why WER prediction is hard
   - Lessons learned

---

## 📊 Key Insights for Blog

### Dataset Characteristics:
- Average duration: ~X seconds
- Average WER: ~0.3-0.4 (Whisper performs well!)
- High-WER rate: ~X% (failure cases)

### Model Findings:
1. **Simple features don't predict ASR errors well**
2. **Duration and speaking rate are most important** (but still weak)
3. **Need linguistic/semantic features** for better prediction

### Medical ASR Challenges:
- Specialized terminology
- Acronyms and abbreviations
- Similar-sounding drug names
- Accents and recording quality variance


