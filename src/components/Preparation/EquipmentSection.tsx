import React from 'react';
import {Equipment} from '../../types/Equipment/Equipment';
import {BaseEquipment} from "../../types/Equipment/EquipmentClassHierarchy";

interface EquipmentSectionProps {
    equipment: BaseEquipment[];
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({equipment}) => (
    <div className="equipment-section">
        <h3 className="section-header">Equipment</h3>
        <div className="equipment-grid">
            {equipment.map((item, index) => (
                <div key={index} className="equipment-item">
                    <div className="equipment-header">
                        <h4>{item.name}</h4>
                    </div>
                    <div className="equipment-stats">
                        {item.boostAttack > 0 && (
                            <div className="equipment-stat">
                                <span>Attack Boost:</span>
                                <span>+{item.boostAttack}</span>
                            </div>
                        )}
                        {item.boostDefence > 0 && (
                            <div className="equipment-stat">
                                <span>Defence Boost:</span>
                                <span>+{item.boostDefence}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);