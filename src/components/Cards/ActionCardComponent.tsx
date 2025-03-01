// ActionCard.tsx
import React from 'react';
import { Action } from '../../types/Actions/Action';
import '../../styles/ActionCardStyles.css'

interface ActionCardProps {
  action: Action;
  dragHandleProps?: any;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, dragHandleProps }) => {
// Create a utility function to parse and highlight text
  const highlightKeywords = (text: string) => {
    const keywords = {
      damageTypes: ['Physical', 'Magic', 'True', 'Pure'],
      statusEffects: ['Stun', 'Poison', 'Burn', 'Freeze'],
      targetTypes: ['Enemy', 'Ally', 'Self', 'All'],
    };

    // Create regex pattern for all keywords
    const keywordPattern = Object.values(keywords)
        .flat()
        .join('|');

    // Split considering keywords, numbers, and spaces
    const parts = text.split(new RegExp(`(\\b(?:${keywordPattern})\\b|\\b\\d+\\b|\\s+)`, 'g'))
        .filter(part => part); // Remove empty strings

    return parts.map((part, index) => {
      // Check if part is a number
      if (/^\d+$/.test(part)) {
        return <span key={index} className="number">{part}</span>;
      }

      // Check if part is a keyword
      const isKeyword = Object.values(keywords)
          .flat()
          .includes(part.trim());

      if (isKeyword) {
        return <span key={index} className="keyword">{part}</span>;
      }

      // Return regular text
      return part;
    });
  };




  return (
    <div
      className="action-card"
      {...dragHandleProps}
    >
      <div className="action-card-header">
        <h3>{action.name}</h3>
        <span className="action-cost">Cost: {action.energyCost}</span>
      </div>
      <div className="action-card-content">
        <p className="action-description">{action.description}</p>
        <div className="action-behaviours">
          {action.behaviours.map((behaviour, index) => (
              <div key={index} className="behaviour-line">
                {highlightKeywords(behaviour.getDescription())}
              </div>
          ))}
        </div>

      </div>
    </div>
  );
};