# Medical ASR Dashboard

A modern, interactive dashboard for analyzing Word Error Rate (WER) in Medical Automatic Speech Recognition using the MultiMed-ST dataset.

![Dashboard Preview](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)

## 🚀 Features

- **8 Key Performance Indicators (KPIs)**: Track average WER, median, 90th percentile, high-WER rate, duration, word count, speaking rate, and SNR
- **Interactive Visualizations**: Scatter plots, histograms, and feature distributions using Recharts
- **Feature Analysis**: Compare WER against 9 different audio and text features
- **Error Examples**: Filter and view transcription errors by severity (low/medium/high WER)
- **Responsive Design**: Beautiful gradients, smooth animations, and mobile-friendly layout
- **Fast & Modern**: Built with Next.js 14, React 18, and TypeScript

## 📊 Dashboard Components

### KPI Cards
- Average WER, Median WER, 90th Percentile WER
- High-WER Rate (% of samples with WER ≥ 0.5)
- Audio characteristics (duration, word count, speaking rate, SNR)

### Visualizations
1. **WER vs Feature Scatter Plot**: Explore correlations between WER and selected features
2. **WER Distribution Histogram**: Understand error distribution across dataset
3. **Feature Distribution**: Analyze individual feature distributions
4. **Error Examples**: View actual transcription errors filtered by WER level

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- (Optional) Your WER prediction dataset CSV

### Setup

```bash
cd dashboard

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
# Build static export for deployment
npm run build

# The output will be in the 'out' directory
# Ready to deploy to Vercel, Netlify, GitHub Pages, etc.
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Next.js and deploy!

**Or use Vercel CLI:**

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy the 'out' folder to Netlify
netlify deploy --prod --dir=out
```

### GitHub Pages

1. Add to `next.config.js`:
```js
basePath: '/your-repo-name',
```

2. Build and deploy:
```bash
npm run build
# Push the 'out' directory to gh-pages branch
```

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx             # Main dashboard page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── KPICard.tsx          # KPI card component
│   │   ├── ScatterChart.tsx     # Scatter plot component
│   │   ├── HistogramChart.tsx   # Histogram component
│   │   ├── ErrorExamples.tsx    # Error examples list
│   │   └── FeatureSelector.tsx  # Feature dropdown
│   └── utils/
│       └── dataProcessor.ts     # Data processing utilities
├── public/                      # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🔧 Using Your Own Data

To use your actual WER prediction dataset:

1. **Prepare your CSV** with columns:
   - `wer`, `duration_sec`, `word_count`, `char_count`, `avg_word_len`
   - `speaking_rate`, `energy`, `zcr`, `spectral_centroid`, `silence_ratio`, `snr`
   - `pred_text`, `gt_text`

2. **Option A: Replace sample data in `dataProcessor.ts`**
   ```typescript
   // Load from API or import CSV
   import csvData from '@/data/wer_data.json'
   
   export const processData = (rawData: any): DataPoint => {
     return csvData // Your actual data
   }
   ```

3. **Option B: Add file upload feature**
   - Install `papaparse`: `npm install papaparse @types/papaparse`
   - Add file input in `page.tsx`
   - Parse CSV and pass to components

4. **Option C: Fetch from API**
   ```typescript
   useEffect(() => {
     fetch('/api/wer-data')
       .then(res => res.json())
       .then(data => setData(processData(data)))
   }, [])
   ```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to change color scheme:

```typescript
colors: {
  primary: { ... },  // Main brand color
  accent: { ... },   // Accent color
}
```

### Gradients
Modify gradient classes in `globals.css`:

```css
.card-gradient {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

## 📊 Sample Data

The dashboard includes synthetic sample data (500 samples) for demonstration. Features are generated with realistic correlations:

- Duration: 5-50 seconds
- Speaking rate: 2-4 words/second
- WER: Influenced by duration, SNR, and speaking rate
- Medical context: Sample transcriptions

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use for your projects!

## 🔗 Related

- [MultiMed-ST Dataset](https://huggingface.co/datasets/leduckhai/MultiMed-ST)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [Medium Blog Post](https://medium.com/@aminqasmi78/modelling-multimed-speech-data-english-84939d397fd2)

## 📧 Contact

For questions or feedback, reach out via GitHub issues or email.

---

Built with ❤️ using Next.js, React, TypeScript, and TailwindCSS

