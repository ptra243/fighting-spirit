// src/types/GameStage.ts
export type GameStage =
    | 'CLASS_SELECTION'  // Initial class choice
    | 'TRAVEL'          // Between battles - events, upgrades, shop
    | 'PREPARE'         // Current PreparationScreen
    | 'BATTLE'          // Battle itself
    | 'POST_BATTLE'     // Battle end screen