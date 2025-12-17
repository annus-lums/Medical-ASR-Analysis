"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import cloud from "d3-cloud";

interface TermData {
  term: string;
  missed_count: number;
  total_occurrences: number;
  miss_rate: number;
}

interface TermErrorData {
  summary: {
    term_recall: number;
    total_gt_terms: number;
    total_missed: number;
    total_hallucinated: number;
    samples_analyzed: number;
  };
  top_missed_terms_rare: TermData[];
}

interface WordCloudWord {
  text: string;
  size: number;
  missed_count: number;
  total_occurrences: number;
  miss_rate: number;
  x?: number;
  y?: number;
  rotate?: number;
}

export default function MedicalTermsWordCloud() {
  const [isClient, setIsClient] = useState(false);
  const [termData, setTermData] = useState<TermErrorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<WordCloudWord[]>([]);
  const [hoveredWord, setHoveredWord] = useState<WordCloudWord | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#38f9d7",
    "#fa709a",
    "#fee140",
    "#30cfd0",
  ];

  useEffect(() => {
    setIsClient(true);
    fetch("/data/term_error_analysis.json")
      .then((res) => res.json())
      .then((data: TermErrorData) => {
        setTermData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading term error data:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!termData || !isClient) return;

    const width = 1200;
    const height = 600;

    // Prepare words data with larger sizes
    const wordsData: WordCloudWord[] = termData.top_missed_terms_rare
      .slice(0, 50)
      .map((term) => ({
        text: term.term,
        size: Math.max(24, Math.min(96, term.missed_count * 6)), // Increased size multiplier
        missed_count: term.missed_count,
        total_occurrences: term.total_occurrences,
        miss_rate: term.miss_rate,
      }));

    // Generate word cloud layout
    const layout = cloud()
      .size([width, height])
      .words(wordsData as any)
      .padding(3)
      .rotate(() => (Math.random() > 0.6 ? 0 : -90))
      .font("Inter, sans-serif")
      .fontSize((d: any) => d.size)
      .on("end", (layoutWords: any[]) => {
        setWords(layoutWords as WordCloudWord[]);
      });

    layout.start();
  }, [termData, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Loading medical terms...</span>
        </div>
      </div>
    );
  }

  if (!termData) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">No term error data available</p>
          <p className="text-sm mt-2">
            Run term_error_analysis.py to generate data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Term Recall</p>
          <p className="text-2xl font-bold text-blue-700">
            {(termData.summary.term_recall * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
          <p className="text-xs text-gray-600 mb-1">Total Missed</p>
          <p className="text-2xl font-bold text-red-700">
            {termData.summary.total_missed.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <p className="text-xs text-gray-600 mb-1">Total Terms</p>
          <p className="text-2xl font-bold text-green-700">
            {termData.summary.total_gt_terms.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-100">
          <p className="text-xs text-gray-600 mb-1">Hallucinated</p>
          <p className="text-2xl font-bold text-orange-700">
            {termData.summary.total_hallucinated.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Word Cloud */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Most Frequently Missed Medical Terms
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Size indicates frequency of errors. Hover to see details.
          </p>
        </div>
        <div className="w-full relative -mx-2">
          <svg
            ref={svgRef}
            width="100%"
            height="600"
            viewBox="0 0 1200 600"
            className="mx-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform="translate(600, 300)">
              {words.map((word, i) => (
                <text
                  key={i}
                  style={{
                    fontSize: word.size,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "600",
                    fill: colors[i % colors.length],
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  textAnchor="middle"
                  transform={`translate(${word.x},${word.y}) rotate(${word.rotate})`}
                  onMouseEnter={() => setHoveredWord(word)}
                  onMouseLeave={() => setHoveredWord(null)}
                  className="hover:opacity-80"
                >
                  {word.text}
                </text>
              ))}
            </g>
          </svg>
          
          {/* Tooltip */}
          {hoveredWord && (
            <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-10 min-w-[200px]">
              <p className="font-semibold text-lg mb-2">{hoveredWord.text}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Missed:</span>
                  <span className="font-semibold text-red-400">
                    {hoveredWord.missed_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total:</span>
                  <span className="font-semibold">
                    {hoveredWord.total_occurrences}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Miss Rate:</span>
                  <span className="font-semibold text-orange-400">
                    {(hoveredWord.miss_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top 10 List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Top 10 Most Problematic Terms
        </h4>
        <div className="space-y-2">
          {termData.top_missed_terms_rare.slice(0, 10).map((term, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
                  {idx + 1}
                </span>
                <span className="font-semibold text-gray-800">{term.term}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Missed</p>
                  <p className="font-semibold text-red-600">
                    {term.missed_count}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-gray-700">
                    {term.total_occurrences}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Miss Rate</p>
                  <p className="font-semibold text-orange-600">
                    {(term.miss_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
