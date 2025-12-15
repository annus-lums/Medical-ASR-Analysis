"use client";

import React, { useState, useEffect } from "react";
import {
  ScatterChart as RechartsScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

interface ScatterChartProps {
  data: any;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        Loading chart...
      </div>
    );
  }

  // Transform data for Recharts
  let chartData =
    data[xKey]?.map((x: number, i: number) => ({
      x,
      y: data[yKey][i],
      text: data.pred_text?.[i] || "",
    })) || [];

  // Filter outliers for cleaner visualization
  if (xKey === "duration_sec") {
    chartData = chartData.filter((d: any) => d.x <= 400);
  }
  if (yKey === "wer") {
    chartData = chartData.filter((d: any) => d.y <= 5.0);
  }

  // For performance: sample data if dataset is too large
  const MAX_POINTS = 5000;
  let sampledData = chartData;
  let isSampled = false;

  if (chartData.length > MAX_POINTS) {
    isSampled = true;
    const step = Math.ceil(chartData.length / MAX_POINTS);
    sampledData = chartData.filter((_: any, i: number) => i % step === 0);
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsScatter>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            label={{ value: xLabel, position: "insideBottom", offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            stroke="#6b7280"
          />
          <ZAxis range={[30, 30]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-800">
                      {xLabel}:{" "}
                      {typeof payload[0].value === "number"
                        ? payload[0].value.toFixed(3)
                        : payload[0].value}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {yLabel}:{" "}
                      {typeof payload[1].value === "number"
                        ? payload[1].value.toFixed(3)
                        : payload[1].value}
                    </p>
                    {payload[0].payload.text && (
                      <p className="text-xs text-gray-600 mt-1 max-w-xs truncate">
                        {payload[0].payload.text}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter data={sampledData} fill="#667eea" fillOpacity={0.6} />
        </RechartsScatter>
      </ResponsiveContainer>
      {isSampled && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Showing {sampledData.length.toLocaleString()} of{" "}
          {chartData.length.toLocaleString()} data points for performance
        </p>
      )}
    </>
  );
};

export default ScatterChart;
