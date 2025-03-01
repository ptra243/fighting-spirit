//
// // context/GameManagerContext.tsx
// import React, { createContext, useContext, useState } from 'react';
// import { GameManager } from '../GameManagerLogic';
// import { Player } from '../types/Player/Player';
// import { PreparationEvent } from '../types/Preparation/PreparationEvent';
//
// interface GameManagerContextType {
//     gameManager: GameManager;
//     player: Player;
//     currentEvents: PreparationEvent[];
//     refreshEvents: () => void;
//     handleEventComplete: (event: PreparationEvent) => void;
//     canSelectActions: boolean;
// }
//
// const GameManagerContext = createContext<GameManagerContextType | undefined>(undefined);
//
// export const GameManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [gameManager] = useState(() => new GameManager(/* initial params */));
//     const [player] = useState(() => new Player(gameManager.player));
//     const [currentEvents, setCurrentEvents] = useState<PreparationEvent[]>([]);
//     const [canSelectActions, setCanSelectActions] = useState(false);
//
//     const refreshEvents = () => {
//         if (player.preparationPointsLeft > 0) {
//             // Get all available events
//             const allEvents = gameManager.getAllPreparationEvents();
//             // Randomly select 3 events
//             const selectedEvents = [];
//             for (let i = 0; i < 3; i++) {
//                 const randomIndex = Math.floor(Math.random() * allEvents.length);
//                 selectedEvents.push(allEvents[randomIndex]);
//                 allEvents.splice(randomIndex, 1);
//             }
//             setCurrentEvents(selectedEvents);
//         }
//     };
//
//     const handleEventComplete = (event: PreparationEvent) => {
//         if (player.usePreparationPoint()) {
//             event.execute(player);
//             refreshEvents();
//
//             // If no preparation points left, allow action selection
//             if (player.preparationPointsLeft === 0) {
//                 setCanSelectActions(true);
//             }
//         }
//     };
//
//     return (
//         <GameManagerContext.Provider value={{
//             gameManager,
//             player,
//             currentEvents,
//             refreshEvents,
//             handleEventComplete,
//             canSelectActions
//         }}>
//             {children}
//         </GameManagerProvider>
//     );
// };
