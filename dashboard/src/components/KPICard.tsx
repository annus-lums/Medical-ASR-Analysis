import React from "react";

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  tooltip: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  gradient,
  tooltip,
}) => {
  return (
    <div
      className={`${gradient} rounded-xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative group cursor-help`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-sm opacity-90">{title}</p>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default KPICard;
