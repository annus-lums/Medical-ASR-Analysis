export interface DataPoint {
  wer: number[]
  duration_sec: number[]
  word_count: number[]
  speaking_rate: number[]
  energy: number[]
  snr: number[]
  zcr: number[]
  spectral_centroid: number[]
  silence_ratio: number[]
  avg_word_len: number[]
  char_count: number[]
  pred_text: string[]
  gt_text: string[]
}

export interface KPIs {
  avgWer: number
  medianWer: number
  p90Wer: number
  highWerPct: number
  avgDuration: number
  avgWords: number
  avgSpeakingRate: number
  avgSnr: number
}

export const processData = (rawData: any): DataPoint => {
  // If data is empty, return sample data for demo purposes
  // To use real data: run `python convert_data.py` from project root
  // This will create dashboard/public/data/wer_data.json
  if (!rawData.wer || rawData.wer.length === 0) {
    console.log('⚠️ No real data found, using synthetic sample data');
    console.log('💡 Run `python convert_data.py` to use your actual CSV data');
    return generateSampleData();
  }
  
  console.log(`✅ Loaded ${rawData.wer.length} real samples from CSV data`);
  return rawData as DataPoint;
}

export const calculateKPIs = (data: DataPoint): KPIs => {
  if (data.wer.length === 0) {
    return {
      avgWer: 0,
      medianWer: 0,
      p90Wer: 0,
      highWerPct: 0,
      avgDuration: 0,
      avgWords: 0,
      avgSpeakingRate: 0,
      avgSnr: 0,
    };
  }

  const avgWer = average(data.wer);
  const medianWer = median(data.wer);
  const p90Wer = percentile(data.wer, 90);
  const highWerPct = (data.wer.filter((w) => w >= 0.5).length / data.wer.length) * 100;
  const avgDuration = average(data.duration_sec);
  const avgWords = average(data.word_count);
  const avgSpeakingRate = average(data.speaking_rate);
  const avgSnr = average(data.snr);

  return {
    avgWer,
    medianWer,
    p90Wer,
    highWerPct,
    avgDuration,
    avgWords,
    avgSpeakingRate,
    avgSnr,
  };
}

const average = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

const median = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const percentile = (arr: number[], p: number): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

// Generate sample data for demonstration
const generateSampleData = (): DataPoint => {
  const n = 500; // 500 samples
  
  const data: DataPoint = {
    wer: [],
    duration_sec: [],
    word_count: [],
    speaking_rate: [],
    energy: [],
    snr: [],
    zcr: [],
    spectral_centroid: [],
    silence_ratio: [],
    avg_word_len: [],
    char_count: [],
    pred_text: [],
    gt_text: [],
  };

  for (let i = 0; i < n; i++) {
    // Generate correlated features
    const duration = 5 + Math.random() * 45; // 5-50 seconds
    const wordCount = Math.floor(duration * (2 + Math.random() * 2)); // 2-4 words/sec
    const speakingRate = wordCount / duration;
    const avgWordLen = 4 + Math.random() * 3; // 4-7 chars
    const charCount = Math.floor(wordCount * avgWordLen);
    
    // Audio features
    const snr = 5 + Math.random() * 15; // 5-20 SNR
    const energy = 0.001 + Math.random() * 0.05;
    const zcr = 0.05 + Math.random() * 0.15;
    const spectralCentroid = 1000 + Math.random() * 2000;
    const silenceRatio = 0.05 + Math.random() * 0.3;
    
    // WER influenced by features (but with noise)
    const baseWer = 0.2;
    const durationEffect = Math.max(0, (duration - 20) * 0.005);
    const snrEffect = Math.max(0, (15 - snr) * 0.01);
    const rateEffect = Math.max(0, (speakingRate - 3) * 0.02);
    const noise = (Math.random() - 0.5) * 0.3;
    
    const wer = Math.max(0, Math.min(1, baseWer + durationEffect + snrEffect + rateEffect + noise));
    
    data.wer.push(wer);
    data.duration_sec.push(duration);
    data.word_count.push(wordCount);
    data.speaking_rate.push(speakingRate);
    data.energy.push(energy);
    data.snr.push(snr);
    data.zcr.push(zcr);
    data.spectral_centroid.push(spectralCentroid);
    data.silence_ratio.push(silenceRatio);
    data.avg_word_len.push(avgWordLen);
    data.char_count.push(charCount);
    data.pred_text.push(`Sample medical transcription ${i} with predicted text about patient symptoms and diagnosis`);
    data.gt_text.push(`Sample medical transcription ${i} with ground truth text about patient symptoms and diagnosis`);
  }
  
  return data;
};
