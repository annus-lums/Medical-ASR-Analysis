import React from "react";

interface Feature {
  value: string;
  label: string;
}

interface FeatureSelectorProps {
  features: Feature[];
  selectedFeature: string;
  onFeatureChange: (feature: string) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({
  features,
  selectedFeature,
  onFeatureChange,
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Select Feature
      </h3>
      <select
        value={selectedFeature}
        onChange={(e) => onFeatureChange(e.target.value)}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-gray-700 bg-white"
      >
        {features.map((feature) => (
          <option key={feature.value} value={feature.value}>
            {feature.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FeatureSelector;
