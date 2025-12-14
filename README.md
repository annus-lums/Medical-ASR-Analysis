# Medical ASR Project - Final Phase Deliverables

![Project Status](https://img.shields.io/badge/Status-Complete-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)

## 🎯 Project Overview

**Objective**: Analyze Word Error Rate (WER) patterns in Medical Automatic Speech Recognition using the MultiMed-ST dataset and OpenAI's Whisper model.

**Dataset**: MultiMed-ST English subset (~50K samples)  
**Model**: Whisper Tiny (39M parameters)  
**Key Metric**: Word Error Rate (WER)

---

## ✅ What's Been Completed

### ✓ All Proposed Tasks from Initial Presentation

| **Task** | **Status** | **Files** |
|----------|-----------|-----------|
| **Stage 1: Data Prep & Exploration** |
| Load & clean English subset | ✅ Done | `transripion.ipynb` |
| Compute summary stats | ✅ Done | `transripion.ipynb` |
| Visualize data balance | ✅ Done | Dashboard |
| **Stage 2: Error Analysis** |
| Compute WER/CER for ASR | ✅ Done | `transripion.ipynb` |
| Correlate errors with features | ✅ Done | `med-asr (3).ipynb` |
| Identify misrecognized terms | ✅ Done | `term_error_analysis.py` |
| **Stage 3: Modeling** |
| Predict WER from features | ✅ Done | `med-asr (3).ipynb` |
| Feature importance analysis | ✅ Done | `med-asr (3).ipynb` |
| **Stage 4: Deliverables** |
| Interactive dashboard | ✅ Done | `dashboard/` (React) |
| Blog post | ✅ Done | `MEDIUM_BLOG_POST.md` |

### 🎉 Beyond Original Scope

- ✅ **Modern React Dashboard** (deployable on Vercel)
- ✅ **Medical Term Error Analysis** script
- ✅ **Complete Documentation** (150+ pages)
- ✅ **Deployment Guide** for free hosting
- ✅ **Data Conversion Script** (CSV → JSON)

---

## 📂 Project Files

```
Project/
├── 📊 Data Analysis & Modeling
│   ├── transripion.ipynb              # ASR inference & feature extraction
│   ├── med-asr (3).ipynb              # WER prediction modeling
│   ├── ds-project-dataanalysis.ipynb  # Exploratory data analysis
│   └── wer_dashboard.html             # Legacy HTML dashboard
│
├── 🛠️ Utilities & Scripts
│   ├── convert_data.py                # CSV to JSON converter
│   └── term_error_analysis.py         # Medical term error analysis
│
├── 📱 Modern Dashboard (React + Next.js)
│   └── dashboard/
│       ├── src/
│       │   ├── app/                   # Next.js pages
│       │   ├── components/            # React components
│       │   └── utils/                 # Data processing
│       ├── public/                    # Static assets
│       ├── package.json
│       └── README.md
│
└── 📚 Documentation
    ├── README.md                      # This file
    ├── PROJECT_ANALYSIS.md            # Comprehensive project analysis
    ├── COMPLETE_DOCUMENTATION.md      # Full technical documentation
    ├── DEPLOYMENT_GUIDE.md            # Dashboard deployment guide
    └── MEDIUM_BLOG_POST.md            # Blog post for Medium
```

---

## 🚀 Quick Start

### 1. Run ASR Inference (Google Colab Recommended)

```bash
# Upload transripion.ipynb to Colab
# Enable GPU: Runtime → Change runtime type → GPU
# Run all cells (2-4 hours for full dataset)
```

**Output**: `wer_prediction_dataset_extended.csv`

### 2. Train WER Prediction Model

```bash
# Open med-asr (3).ipynb in Colab or Jupyter
# Load the CSV from step 1
# Run all cells (~10 minutes)
```

**Output**: Feature importance plots, model metrics, dashboard data

### 3. Launch Dashboard

```bash
# Convert CSV to JSON
python convert_data.py

# Install dependencies
cd dashboard
npm install

# Run development server
npm run dev
```

**Open**: [http://localhost:3000](http://localhost:3000)

### 4. Analyze Medical Terms

```bash
python term_error_analysis.py wer_prediction_dataset_extended.csv
```

**Output**: `term_error_analysis.json`

---

## 📊 Key Results

### Whisper Performance
- **Average WER**: 0.35 (35%)
- **Median WER**: 0.33
- **90th Percentile**: 0.65
- **High-Error Rate**: 18% (WER ≥ 0.5)

### Feature Correlations
1. **Duration** (0.32): Longer audio → higher WER ⏱️
2. **Speaking Rate** (0.24): Faster speech → higher WER 🗣️
3. **SNR** (0.15): Noisy audio → higher WER 📊
4. **Energy** (0.11): Quiet audio → higher WER 🔉
5. **Word Count** (0.09): More words → higher WER 📝

### WER Prediction Model
- **Algorithm**: Random Forest Regressor
- **Test R²**: 0.022 (very low)
- **Test MAE**: 0.321
- **Conclusion**: Simple features cannot predict WER accurately ❌
- **Insight**: But feature importance reveals useful patterns ✅

### Medical Term Analysis
- **Term Recall**: 87% (better than word-level 65%)
- **Most Missed**: hypertension, diabetes, medication
- **Most Hallucinated**: patient, treatment, condition

---

## 🎨 Dashboard Features

### 📈 8 KPI Metrics
- Average WER, Median WER, 90th Percentile WER
- High-WER Rate, Avg Duration, Avg Word Count
- Speaking Rate, Avg SNR

### 📊 Interactive Visualizations
- **Scatter Plot**: WER vs selected feature
- **Histograms**: WER distribution, feature distributions
- **Error Examples**: Filter by WER level (low/medium/high)

### 🎯 Technology
- **Next.js 14**: Static site generation
- **React 18**: Component-based UI
- **TypeScript**: Type safety
- **TailwindCSS**: Modern styling
- **Recharts**: Data visualization

### 🚀 Deployment
- **Vercel**: Free hosting (recommended)
- **Netlify**: Alternative free hosting
- **GitHub Pages**: Static site hosting

**See**: `DEPLOYMENT_GUIDE.md` for step-by-step instructions

---

## 📖 Documentation Guide

### For Understanding the Project
→ Read `PROJECT_ANALYSIS.md` first (15 min read)

### For Technical Details
→ Read `COMPLETE_DOCUMENTATION.md` (comprehensive, 60+ min)

### For Deploying Dashboard
→ Read `DEPLOYMENT_GUIDE.md` (quick start, 5 min)

### For Writing Blog Post
→ Use `MEDIUM_BLOG_POST.md` as template (ready to publish)

---

## 🤔 FAQ

### **Q: Can I rerun the modeling code on my Mac?**
**A**: Yes, but not recommended. 
- **Colab** (recommended): 2-4 hours with free GPU
- **Mac M1/M2** (CPU-only): 8-12 hours, no GPU acceleration
- **Solution**: Use Colab for inference, Mac for analysis/modeling

### **Q: Do I need to download the full dataset?**
**A**: No! 
- Use `streaming=True` in `load_dataset()` to avoid download
- Dataset streams directly from HuggingFace
- Only caches processed samples

### **Q: How do I use my own WER prediction data?**
**A**: 
1. Place your CSV in project root
2. Run `python convert_data.py`
3. Dashboard will load from `dashboard/public/data/wer_data.json`

### **Q: Can I deploy the dashboard for free?**
**A**: Yes!
- **Vercel**: Unlimited free static sites
- **Netlify**: 100GB/month free bandwidth
- **GitHub Pages**: Free for public repos
- **Cloudflare Pages**: Free tier available

### **Q: What if I want to analyze other languages?**
**A**: 
- Change `'English'` to `'German'`, `'French'`, etc. in `load_dataset()`
- Whisper supports 99+ languages
- Dashboard works with any language

### **Q: How do I cite this work?**
**A**:
```bibtex
@misc{medical-asr-2024,
  author = {Your Name},
  title = {Medical ASR Analysis with Whisper and MultiMed-ST},
  year = {2024},
  publisher = {GitHub},
  url = {https://github.com/yourusername/medical-asr}
}
```

---

## 🔮 Future Enhancements

### Immediate Next Steps
1. **Fine-tune Whisper** on medical data (LoRA/QLoRA)
2. **Use larger models** (Whisper Small/Medium)
3. **Add confidence scores** to prediction features
4. **Integrate MedSpaCy** for better term extraction

### Research Directions
1. **Domain adaptation** per medical specialty
2. **Error correction** with medical NLP
3. **Multimodal ASR** (audio + clinical notes)
4. **Multilingual analysis** across all MultiMed-ST languages

---

## 🎓 Learning Resources

### Whisper & ASR
- [Whisper Paper](https://arxiv.org/abs/2212.04356)
- [HuggingFace Whisper Guide](https://huggingface.co/docs/transformers/model_doc/whisper)
- [ASR Evaluation Metrics](https://arxiv.org/abs/example)

### Medical NLP
- [MedSpaCy Documentation](https://github.com/medspacy/medspacy)
- [SciSpaCy](https://allenai.github.io/scispacy/)
- [UMLS (Medical Vocabulary)](https://www.nlm.nih.gov/research/umls/)

### Dashboard Development
- [Next.js Tutorial](https://nextjs.org/learn)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## 🤝 Contributing

Found a bug? Have an improvement?

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📧 Contact

**Author**: [Your Name]  
**Email**: aminqasmi78@gmail.com  
**Blog**: [Medium](https://medium.com/@aminqasmi78)  
**LinkedIn**: [Your Profile]

---

## 🙏 Acknowledgments

- **Dataset**: Le Duc Khai et al. for MultiMed-ST
- **Model**: OpenAI for Whisper
- **Libraries**: HuggingFace, librosa, jiwer, scikit-learn
- **Community**: Medical NLP researchers and practitioners

---

## 📝 Citation

```bibtex
@misc{multimed-st-2023,
  title={MultiMed-ST: Multilingual Medical Speech Translation},
  author={Le Duc Khai and others},
  year={2023},
  url={https://huggingface.co/datasets/leduckhai/MultiMed-ST}
}

@article{whisper2022,
  title={Robust Speech Recognition via Large-Scale Weak Supervision},
  author={Radford, Alec and Kim, Jong Wook and Xu, Tao and others},
  journal={arXiv preprint arXiv:2212.04356},
  year={2022}
}
```

---

**Last Updated**: December 2024  
**Project Status**: ✅ Complete  
**Next Phase**: Fine-tuning & Domain Adaptation

---

<div align="center">

### ⭐ If this project helped you, please star it on GitHub! ⭐

Made with ❤️ for Medical AI Research

[📖 Docs](./COMPLETE_DOCUMENTATION.md) • [🚀 Deploy](./DEPLOYMENT_GUIDE.md) • [📝 Blog](./MEDIUM_BLOG_POST.md) • [🐛 Issues](https://github.com/yourusername/medical-asr/issues)

</div>

