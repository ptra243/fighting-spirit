// types/Player/Player.ts
import {Character} from "../Character/Character";
import {Action} from "../Actions/Action";

// Define the player structure as a TypeScript type
export interface Player {
    gold: number;
    availableActions: Action[];
    preparationPointsLeft: number;
}

// Create factory function to create a new player
export const createPlayer = (character: Character, gold: number = 0): Player => ({
    gold,
    availableActions: [],
    preparationPointsLeft: 3
});

// Utility functions for player operations
export const playerUtils = {
    addGold: (player: Player, amount: number): Player => ({
        ...player,
        gold: player.gold + amount
    }),

    spendGold: (player: Player, amount: number): { success: boolean; player: Player } => {
        if (player.gold >= amount) {
            return {
                success: true,
                player: {
                    ...player,
                    gold: player.gold - amount
                }
            };
        }
        return { success: false, player };
    },

    addAction: (player: Player, action: Action): Player => ({
        ...player,
        availableActions: [...player.availableActions, action]
    }),

    usePreparationPoint: (player: Player): { success: boolean; player: Player } => {
        if (player.preparationPointsLeft > 0) {
            return {
                success: true,
                player: {
                    ...player,
                    preparationPointsLeft: player.preparationPointsLeft - 1
                }
            };
        }
        return { success: false, player };
    }
};
