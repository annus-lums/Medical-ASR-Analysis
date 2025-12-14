# Medical ASR Dashboard - Quick Start Guide

## 🚀 Getting Started

### Step 1: Prepare Your Data

If you have your WER prediction CSV file(s), convert them to JSON:

```bash
# From the project root directory
python convert_data.py
```

This will:
- Look for `wer_prediction_dataset_extended.csv`, OR
- Merge `wer_prediction_train.csv`, `wer_prediction_val.csv`, `wer_prediction_test.csv`
- Output to `dashboard/public/data/wer_data.json`

### Step 2: Install Dependencies

```bash
cd dashboard
npm install
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Build for Production

```bash
npm run build
```

The static site will be in the `out/` directory.

## 📤 Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub:
```bash
git add .
git commit -m "Add medical ASR dashboard"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js
6. Click "Deploy"

**Root Directory**: Set to `dashboard` if deploying only the dashboard

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from dashboard directory
cd dashboard
vercel

# Follow prompts
# For production: vercel --prod
```

### Option 3: Manual Deploy

```bash
cd dashboard
npm run build

# Upload the 'out' directory to any static hosting:
# - Netlify
# - GitHub Pages
# - AWS S3
# - Firebase Hosting
```

## 🔧 Using Your Own Data

### Method 1: Convert CSV to JSON (Recommended)

Run the Python script as shown in Step 1.

### Method 2: Load from API

Edit `dashboard/src/app/page.tsx`:

```typescript
useEffect(() => {
  fetch('/api/wer-data')
    .then(res => res.json())
    .then(data => setData(processData(data)))
}, [])
```

### Method 3: Import JSON Directly

Place your JSON in `dashboard/public/data/wer_data.json`

Edit `dashboard/src/utils/dataProcessor.ts`:

```typescript
import werData from '@/../../public/data/wer_data.json'

export const processData = (rawData: any): DataPoint => {
  return werData as DataPoint
}
```

## 🎨 Customization

### Change Colors

Edit `dashboard/tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        // ... more shades
      }
    }
  }
}
```

### Change Gradients

Edit `dashboard/src/app/globals.css`:

```css
.card-gradient {
  background: linear-gradient(135deg, #yourcolor1 0%, #yourcolor2 100%);
}
```

### Add New Features

1. Add to `features` array in `page.tsx`
2. Ensure data exists in your CSV/JSON
3. Charts will automatically update

## 📊 Data Format

Your CSV should have these columns:

**Required:**
- `wer` (float): Word Error Rate
- `duration_sec` (float): Audio duration
- `word_count` (int): Number of words
- `pred_text` (string): Predicted transcription
- `gt_text` (string): Ground truth transcription

**Optional (for full features):**
- `char_count`, `avg_word_len`, `speaking_rate`
- `energy`, `zcr`, `spectral_centroid`, `silence_ratio`, `snr`

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

### Data Not Loading

1. Check JSON format matches `DataPoint` interface
2. Check browser console for errors
3. Verify file path: `public/data/wer_data.json`

## 🌐 Free Hosting Options

- **Vercel**: Best for Next.js (recommended)
- **Netlify**: Great for static sites
- **GitHub Pages**: Free, but needs base path config
- **Cloudflare Pages**: Fast CDN
- **Render**: Free tier available

## 📝 Environment Variables

No environment variables needed for basic deployment!

For API integration, create `.env.local`:

```
NEXT_PUBLIC_API_URL=https://your-api.com
```

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Recharts Docs](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Need help? Check the main README or create an issue!

