"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistogramChartProps {
  data: number[];
  xLabel: string;
  color?: string;
}

const HistogramChart: React.FC<HistogramChartProps> = ({
  data,
  xLabel,
  color = "#4facfe",
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  // Create histogram bins
  const createHistogram = (values: number[], numBins: number = 20) => {
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;

    const bins: { range: string; count: number; x: number }[] = [];

    for (let i = 0; i < numBins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      const count = values.filter((v) => v >= binStart && v < binEnd).length;

      bins.push({
        range: `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`,
        count,
        x: binStart,
      });
    }

    return bins;
  };

  if (!isClient) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        Loading chart...
      </div>
    );
  }

  const histogramData = createHistogram(data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={histogramData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="x"
          tickFormatter={(value) => value.toFixed(2)}
          label={{ value: xLabel, position: "insideBottom", offset: -5 }}
          stroke="#6b7280"
        />
        <YAxis
          label={{ value: "Count", angle: -90, position: "insideLeft" }}
          stroke="#6b7280"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-lg">
                  <p className="text-sm font-semibold text-gray-800">
                    Range: {payload[0].payload.range}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    Count: {payload[0].value}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HistogramChart;
