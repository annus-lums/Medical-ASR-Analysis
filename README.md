# Medical ASR Analysis Project

This project analyzes Word Error Rate (WER) in Automatic Speech Recognition (ASR) systems for medical speech data using the MultiMed-ST dataset (English subset). It includes data processing, feature extraction, WER prediction modeling, error analysis, and an interactive dashboard for visualization.

**🔗 Repository**: [https://github.com/annus-lums/Medical-ASR-Analysis](https://github.com/annus-lums/Medical-ASR-Analysis)

**📝 Blog Posts**:
- [Part 1: Modelling MultiMed Speech Data (English)](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-84939d397fd2)
- [Part 2: Modelling MultiMed Speech Data (English)](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-part-2-d691cfe4ca06)

## Project Overview

- **Dataset**: MultiMed-ST (Multilingual Medical Speech Translation) - English subset
- **Model**: OpenAI Whisper (tiny variant)
- **Goal**: Analyze ASR performance on medical terminology, identify error patterns, and predict WER from audio/text features

## Project Structure

```
.
├── transcription.ipynb              # ASR inference and feature extraction
├── data-analysis-part1.ipynb        # Exploratory data analysis
├── modelling-wer.ipynb              # WER prediction model training
├── term_error_analysis.py           # Medical term error analysis script
├── convert_data.py                  # Data conversion for dashboard
├── dashboard/                       # Interactive web dashboard
│   ├── src/
│   │   ├── app/                    # Next.js app pages
│   │   ├── components/             # React components
│   │   └── utils/                  # Utility functions
│   └── public/
│       └── data/                   # Data files (JSON)
├── wer_prediction_train.csv        # Training data
├── wer_prediction_val.csv          # Validation data
└── wer_prediction_test.csv         # Test data
```

## Main Files

### 1. `transcription.ipynb`
- Loads MultiMed-ST dataset in streaming mode
- Performs ASR inference using Whisper model
- Extracts audio features (duration, energy, ZCR, spectral centroid, silence ratio, SNR)
- Extracts text features (word count, character count, average word length, speaking rate)
- Calculates WER per sample
- Outputs: `wer_prediction_dataset_extended.csv`

### 2. `data-analysis-part1.ipynb`
- Exploratory data analysis on the extracted features
- Visualizes distributions of duration, WER, and other features
- Analyzes correlations between features and WER

### 3. `modelling-wer.ipynb`
- Trains RandomForestRegressor to predict WER from features
- Features: duration, word count, character count, speaking rate, energy, ZCR, spectral centroid, silence ratio, SNR
- Evaluates model performance (R², MAE)
- Analyzes feature importance
- Prepares data for dashboard visualization

### 4. `term_error_analysis.py`
- Analyzes medical terminology errors in ASR outputs
- Identifies most frequently missed medical terms
- Calculates term-level recall and miss rates
- Filters rare terms (occurrence < 100) for focused analysis
- Outputs: `term_error_analysis.json`

**Usage:**
```bash
python term_error_analysis.py wer_prediction_test.csv
```

### 5. `convert_data.py`
- Merges train, validation, and test CSV files
- Converts merged CSV to JSON format for dashboard
- Outputs: `dashboard/public/data/wer_data.json`

**Usage:**
```bash
python convert_data.py
```

### 6. `dashboard/`
- Interactive React/Next.js dashboard for visualizing ASR performance
- **Features:**
  - KPI cards (average WER, median WER, P90 WER, high WER percentage)
  - WER vs feature scatter plots
  - Distribution histograms
  - Error examples with filtering
  - Medical term error word cloud
  - Top 10 most problematic medical terms

## Running the Dashboard

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup and Run

1. **Install dependencies:**
   ```bash
   cd dashboard
   npm install
   ```

2. **Prepare data (if not already done):**
   ```bash
   cd ..
   python convert_data.py
   python term_error_analysis.py wer_prediction_test.csv
   ```

3. **Build and start the dashboard:**
   ```bash
   cd dashboard
   npm run build
   npm start
   ```

4. **Access the dashboard:**
   Open `http://localhost:3000` in your browser

### Development Mode (Optional)
For development with hot-reload:
```bash
npm run dev
```

## Data Files

- `wer_prediction_train.csv` - Training set with features and WER
- `wer_prediction_val.csv` - Validation set with features and WER
- `wer_prediction_test.csv` - Test set with features and WER
- `term_error_analysis.json` - Medical term error statistics

## Key Findings

- Duration and speaking rate correlate with WER
- Rare medical terms have higher miss rates
- RandomForest model predicts WER with reasonable accuracy
- Most problematic terms: adipose, sjogren, cfs, tissue, etc.

## Requirements

**Python:**
- pandas
- numpy
- scikit-learn
- jiwer
- librosa
- transformers
- datasets

**Dashboard:**
- React 18
- Next.js 14
- Recharts
- TailwindCSS
- d3-cloud

## Links & Resources

- **GitHub Repository**: [Medical-ASR-Analysis](https://github.com/annus-lums/Medical-ASR-Analysis)
- **Live Dashboard**: [medical-asr-analysis.vercel.app](https://medical-asr-analysis.vercel.app)
- **Blog Post (Part 1)**: [Modelling MultiMed Speech Data](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-84939d397fd2)
- **Blog Post (Part 2)**: [Analysis & Dashboard](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-part-2-d691cfe4ca06)
- **Dataset**: [MultiMed-ST on Hugging Face](https://huggingface.co/datasets/leduckhai/MultiMed-ST)
- **Model**: [OpenAI Whisper](https://github.com/openai/whisper)
