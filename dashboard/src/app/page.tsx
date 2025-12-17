"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  MessageSquare,
  Volume2,
  Zap,
  Signal,
} from "lucide-react";
import KPICard from "@/components/KPICard";
import ScatterChart from "@/components/ScatterChart";
import HistogramChart from "@/components/HistogramChart";
import ErrorExamples from "@/components/ErrorExamples";
import FeatureSelector from "@/components/FeatureSelector";
import MedicalTermsWordCloud from "@/components/MedicalTermsWordCloud";
import { processData, calculateKPIs } from "@/utils/dataProcessor";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [selectedFeature, setSelectedFeature] =
    useState<string>("duration_sec");
  const [werFilter, setWerFilter] = useState<"low" | "medium" | "high">("high");
  const [data, setData] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [isChangingFeature, setIsChangingFeature] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Try to load real data from JSON file
    fetch("/data/wer_data.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Data file not found");
        }
        return res.json();
      })
      .then((realData) => {
        console.log("✅ Loaded real data from wer_data.json");
        const processedData = processData(realData);
        setData(processedData);
        setKpis(calculateKPIs(processedData));
      })
      .catch((error) => {
        console.log("⚠️ Could not load real data, using synthetic sample data");
        console.log("💡 To use your actual data:");
        console.log("   1. Run: python convert_data.py");
        console.log("   2. Restart dashboard: npm run dev");

        // Fallback to sample data
        const processedData = processData({ wer: [] });
        setData(processedData);
        setKpis(calculateKPIs(processedData));
      });
  }, []);

  const features = [
    { value: "duration_sec", label: "Duration (sec)" },
    { value: "speaking_rate", label: "Speaking Rate" },
    { value: "energy", label: "Energy" },
    { value: "snr", label: "Signal-to-Noise Ratio" },
    { value: "word_count", label: "Word Count" },
    { value: "avg_word_len", label: "Avg Word Length" },
    { value: "zcr", label: "Zero Crossing Rate" },
    { value: "spectral_centroid", label: "Spectral Centroid" },
    { value: "silence_ratio", label: "Silence Ratio" },
  ];

  // Handle feature change with loading state
  const handleFeatureChange = (newFeature: string) => {
    setIsChangingFeature(true);
    // Small delay to show loading state
    setTimeout(() => {
      setSelectedFeature(newFeature);
      setIsChangingFeature(false);
    }, 100);
  };

  // Show loading state during hydration
  if (!isClient || !data || !kpis) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-pulse">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Loading Dashboard...
                </h1>
                <p className="text-gray-600">Please wait</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Medical ASR Analysis
        </h1>
        <p className="text-lg text-gray-600">
          Word Error Rate (WER) Dashboard for MultiMed-ST Dataset
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <p className="text-gray-500">
            📊 Data Showing for {data.wer.length.toLocaleString()} samples
          </p>
          {/* {data.wer.filter((w: number) => w > 5.0).length > 0 && (
            <p className="text-orange-600">
              ⚠️ {data.wer.filter((w: number) => w > 5.0).length} outliers
              detected (WER {">"} 5.0)
            </p>
          )} */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Average WER"
            value={kpis.avgWer.toFixed(3)}
            icon={<Activity className="w-6 h-6" />}
            gradient="card-gradient"
            tooltip="Mean word error rate across all samples"
          />
          <KPICard
            title="Median WER"
            value={kpis.medianWer.toFixed(3)}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="card-gradient-blue"
            tooltip="Median WER (robust to outliers)"
          />
          <KPICard
            title="90th %ile WER"
            value={kpis.p90Wer.toFixed(3)}
            icon={<AlertCircle className="w-6 h-6" />}
            gradient="card-gradient-orange"
            tooltip="90th percentile WER — worst-case behavior"
          />
          <KPICard
            title="High-WER Rate"
            value={`${kpis.highWerPct.toFixed(1)}%`}
            icon={<AlertCircle className="w-6 h-6" />}
            gradient="card-gradient"
            tooltip="Percentage of utterances with WER ≥ 0.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Avg Duration"
            value={`${kpis.avgDuration.toFixed(2)}s`}
            icon={<Clock className="w-6 h-6" />}
            gradient="card-gradient-blue"
            tooltip="Average audio duration in seconds"
          />
          <KPICard
            title="Avg Word Count"
            value={kpis.avgWords.toFixed(1)}
            icon={<MessageSquare className="w-6 h-6" />}
            gradient="card-gradient-green"
            tooltip="Average number of words per utterance"
          />
          <KPICard
            title="Speaking Rate"
            value={kpis.avgSpeakingRate.toFixed(2)}
            icon={<Volume2 className="w-6 h-6" />}
            gradient="card-gradient-purple"
            tooltip="Words spoken per second (speech tempo)"
          />
          <KPICard
            title="Avg SNR"
            value={kpis.avgSnr.toFixed(1)}
            icon={<Signal className="w-6 h-6" />}
            gradient="card-gradient-orange"
            tooltip="Average signal-to-noise ratio (higher is cleaner)"
          />
        </div>

        {/* Feature Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <FeatureSelector
            features={features}
            selectedFeature={selectedFeature}
            onFeatureChange={handleFeatureChange}
          />
          {isChangingFeature && (
            <div className="mt-2 flex items-center gap-2 text-sm text-primary-600">
              <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
              <span>Updating charts...</span>
            </div>
          )}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              WER vs {features.find((f) => f.value === selectedFeature)?.label}
            </h3>
            {isChangingFeature && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Loading chart...
                  </span>
                </div>
              </div>
            )}
            <ScatterChart
              data={data}
              xKey={selectedFeature}
              yKey="wer"
              xLabel={
                features.find((f) => f.value === selectedFeature)?.label || ""
              }
              yLabel="WER"
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {features.find((f) => f.value === selectedFeature)?.label}{" "}
              Distribution
            </h3>
            {isChangingFeature && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Loading chart...
                  </span>
                </div>
              </div>
            )}
            <HistogramChart
              data={
                selectedFeature === "duration_sec"
                  ? (data[selectedFeature] as number[]).filter(
                      (v: number) => v <= 100
                    )
                  : (data[selectedFeature as keyof typeof data] as number[])
              }
              xLabel={
                features.find((f) => f.value === selectedFeature)?.label || ""
              }
              color="#4facfe"
            />
            {selectedFeature === "duration_sec" &&
              (data.duration_sec as number[]).filter((v: number) => v > 400)
                .length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {
                    (data.duration_sec as number[]).filter(
                      (v: number) => v > 400
                    ).length
                  }{" "}
                  outliers (duration {">"} 400s) excluded
                </p>
              )}
          </div>
        </div>

        {/* WER Distribution and Error Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              WER Distribution
            </h3>
            <HistogramChart
              data={data.wer.filter((w: number) => w <= 5.0)}
              xLabel="WER"
              color="#667eea"
            />
            {/* {data.wer.filter((w: number) => w > 5.0).length > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {data.wer.filter((w: number) => w > 5.0).length} outliers (WER > 5.0) excluded from visualization
              </p>
            )} */}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <ErrorExamples
              data={data}
              filter={werFilter}
              onFilterChange={setWerFilter}
            />
          </div>
        </div>

        {/* Medical Terms Word Cloud */}
        <div className="mt-8">
          <MedicalTermsWordCloud />
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600">
          <p className="text-sm">
            Medical ASR Dashboard | MultiMed-ST Dataset | Whisper Model Analysis
          </p>
          <p className="text-xs mt-2">
            Built with Next.js, React, and Recharts
          </p>
        </div>
      </div>
    </main>
  );
}
