import React from "react";

interface ErrorExample {
  wer: number;
  pred: string;
  gt: string;
}

interface ErrorExamplesProps {
  data: any;
  filter: "low" | "medium" | "high";
  onFilterChange: (filter: "low" | "medium" | "high") => void;
}

const ErrorExamples: React.FC<ErrorExamplesProps> = ({
  data,
  filter,
  onFilterChange,
}) => {
  const getFilteredExamples = (): ErrorExample[] => {
    if (!data.wer || data.wer.length === 0) return [];

    const examples = data.wer
      .map((wer: number, i: number) => ({
        wer,
        pred: data.pred_text?.[i] || "",
        gt: data.gt_text?.[i] || "",
        index: i,
      }))
      .filter((item: any) => {
        if (filter === "high") return item.wer >= 0.5;
        if (filter === "medium") return item.wer >= 0.2 && item.wer < 0.5;
        return item.wer < 0.2;
      })
      .slice(0, 5);

    return examples;
  };

  const examples = getFilteredExamples();

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Error Examples
      </h3>

      <select
        value={filter}
        onChange={(e) =>
          onFilterChange(e.target.value as "low" | "medium" | "high")
        }
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-gray-700 bg-white mb-4"
      >
        <option value="high">High WER (≥ 0.5)</option>
        <option value="medium">Medium WER (0.2 – 0.5)</option>
        <option value="low">Low WER (&lt; 0.2)</option>
      </select>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {examples.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No examples found for this filter.
          </p>
        ) : (
          examples.map((example, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-primary-600">
                  WER: {example.wer.toFixed(3)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">
                    Predicted:{" "}
                  </span>
                  <span className="text-gray-600">
                    {example.pred.slice(0, 100)}...
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Ground Truth:{" "}
                  </span>
                  <span className="text-gray-600">
                    {example.gt.slice(0, 100)}...
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorExamples;
