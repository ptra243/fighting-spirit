import React from 'react';
import {StatItemProps} from "../../types/ui/Preparation/StatInterfaceDefinitions";

export const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <div className="stat-item">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);