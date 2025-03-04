// src/components/Travel/TravelScreen.tsx
import React, { useState } from 'react';
import { Player } from '../../types/Player/Player';

interface TravelScreenProps {
  player: Player;
  onContinueToBattle: (player: Player) => void;
}

type TravelEvent = 
  | 'SHOP'
  | 'LEVEL_UP'
  | 'CARD_MASTER'
  | 'RANDOM_ENCOUNTER';

export const TravelScreen: React.FC<TravelScreenProps> = ({ player, onContinueToBattle }) => {
  const [currentEvent, setCurrentEvent] = useState<TravelEvent | null>(null);

  const generateEvent = (): TravelEvent => {
    const events: TravelEvent[] = ['SHOP', 'LEVEL_UP', 'CARD_MASTER'];
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  };

  const handleEventComplete = (updatedPlayer: Player) => {
    setCurrentEvent(null);
    onContinueToBattle(updatedPlayer);
  };

  return (
    <div className="travel-screen">

      <button onClick={() => handleEventComplete(player)}>
        Continue to Battle
      </button>
      {/*{!currentEvent ? (*/}
      {/*  <div className="travel-options">*/}
      {/*    <h2>What would you like to do?</h2>*/}
      {/*    <button onClick={() => setCurrentEvent('SHOP')}>*/}
      {/*      Visit Shop*/}
      {/*    </button>*/}
      {/*    <button onClick={() => setCurrentEvent('LEVEL_UP')}>*/}
      {/*      Level Up*/}
      {/*    </button>*/}
      {/*    <button onClick={() => setCurrentEvent('CARD_MASTER')}>*/}
      {/*      Visit Card Master*/}
      {/*    </button>*/}
      {/*    <button onClick={() => handleEventComplete(player)}>*/}
      {/*      Continue to Battle*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*) : (*/}
      {/*  // Render specific event component based on currentEvent*/}
      {/*  {*/}
      {/*    'SHOP': <ShopEvent player={player} onComplete={handleEventComplete} />,*/}
      {/*    'LEVEL_UP': <LevelUpEvent player={player} onComplete={handleEventComplete} />,*/}
      {/*    'CARD_MASTER': <CardMasterEvent player={player} onComplete={handleEventComplete} />*/}
      {/*  }[currentEvent]*/}
      {/*)}*/}
    </div>
  );
};