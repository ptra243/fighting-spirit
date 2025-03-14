import {Character} from "../../types/Character/Character";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { CharacterStats } from '../../types/Character/CharacterStats';
import { IBuffBehaviour, IDamageOverTimeBehaviour } from '../../types/Actions/Behaviours/BehaviourUnion';

interface CharacterState {
    playerCharacter: Character | null;
    aiCharacter: Character | null;
    aiCharacters: Character[]; // Pool of available AI characters
    battleHistory: {
        playerHP: number;
        aiHP: number;
        timestamp: number;
    }[];
}

const initialState: CharacterState = {
    playerCharacter: null,
    aiCharacter: null,
    aiCharacters: [],
    battleHistory: []
};

// Stats utility functions
const statsUtils = {
    takeDamage: (stats: CharacterStats, damage: number, ignoreDefence = false): CharacterStats => {
        let remainingDamage = ignoreDefence ? damage : Math.max(damage - stats.defence, 1);
        let newShield = stats.shield;
        let newHitPoints = stats.hitPoints;

        if (newShield > 0) {
            if (newShield >= remainingDamage) {
                newShield -= remainingDamage;
                remainingDamage = 0;
            } else {
                remainingDamage -= newShield;
                newShield = 0;
            }
        }
        newHitPoints = Math.max(newHitPoints - remainingDamage, 0);

        return { ...stats, hitPoints: newHitPoints, shield: newShield };
    },

    restoreHealth: (stats: CharacterStats, amount: number): CharacterStats => ({
        ...stats,
        hitPoints: Math.min(stats.hitPoints + amount, stats.maxHitPoints)
    }),

    recoverEnergy: (stats: CharacterStats, amount: number): CharacterStats => ({
        ...stats,
        energy: Math.min(stats.energy + amount, stats.maxEnergy)
    }),

    spendEnergy: (stats: CharacterStats, amount: number): CharacterStats => ({
        ...stats,
        energy: Math.max(stats.energy - amount, 0)
    }),

    incrementActionCounter: (stats: CharacterStats): CharacterStats => ({
        ...stats,
        actionCounter: Math.min(100, stats.actionCounter + stats.speed)
    }),

    resetActionCounter: (stats: CharacterStats): CharacterStats => ({
        ...stats,
        actionCounter: 0
    })
};

const characterSlice = createSlice({
    name: 'character',
    initialState,
    reducers: {
        setPlayerCharacter: (state, action: PayloadAction<Character>) => {
            state.playerCharacter = action.payload;
        },
        setAICharacter: (state, action: PayloadAction<Character>) => {
            state.aiCharacter = action.payload;
        },
        setAICharacters: (state, action: PayloadAction<Character[]>) => {
            state.aiCharacters = action.payload;
        },
        recordBattleState: (state) => {
            if (state.playerCharacter && state.aiCharacter) {
                state.battleHistory.push({
                    playerHP: state.playerCharacter.stats.hitPoints,
                    aiHP: state.aiCharacter.stats.hitPoints,
                    timestamp: Date.now()
                });
            }
        },
        incrementActionCounter: (state, action: PayloadAction<{ target: 'player' | 'ai' }>) => {
            const character = action.payload.target === 'player' ? state.playerCharacter : state.aiCharacter;
            if (character) {
                const updatedStats = statsUtils.incrementActionCounter(character.stats);
                if (action.payload.target === 'player') {
                    state.playerCharacter = { ...character, stats: updatedStats };
                } else {
                    state.aiCharacter = { ...character, stats: updatedStats };
                }
            }
        },
        resetActionCounter: (state, action: PayloadAction<{ target: 'player' | 'ai' }>) => {
            const character = action.payload.target === 'player' ? state.playerCharacter : state.aiCharacter;
            if (character) {
                const updatedStats = statsUtils.resetActionCounter(character.stats);
                if (action.payload.target === 'player') {
                    state.playerCharacter = { ...character, stats: updatedStats };
                } else {
                    state.aiCharacter = { ...character, stats: updatedStats };
                }
            }
        },
        takeDamage: (state, action: PayloadAction<{
            target: 'player' | 'ai',
            damage: number,
            ignoreDefence?: boolean
        }>) => {
            const character = action.payload.target === 'player' ? state.playerCharacter : state.aiCharacter;
            if (character) {
                const updatedStats = statsUtils.takeDamage(character.stats, action.payload.damage, action.payload.ignoreDefence);
                if (action.payload.target === 'player') {
                    state.playerCharacter = { ...character, stats: updatedStats };
                } else {
                    state.aiCharacter = { ...character, stats: updatedStats };
                }
            }
        },
        restoreHealth: (state, action: PayloadAction<{
            target: 'player' | 'ai',
            amount: number
        }>) => {
            const character = action.payload.target === 'player' ? state.playerCharacter : state.aiCharacter;
            if (character) {
                const updatedStats = statsUtils.restoreHealth(character.stats, action.payload.amount);
                if (action.payload.target === 'player') {
                    state.playerCharacter = { ...character, stats: updatedStats };
                } else {
                    state.aiCharacter = { ...character, stats: updatedStats };
                }
            }
        },
        modifyEnergy: (state, action: PayloadAction<{
            target: 'player' | 'ai',
            amount: number,
            type: 'spend' | 'recover'
        }>) => {
            const character = action.payload.target === 'player' ? state.playerCharacter : state.aiCharacter;
            if (character) {
                const updatedStats = action.payload.type === 'spend' 
                    ? statsUtils.spendEnergy(character.stats, action.payload.amount)
                    : statsUtils.recoverEnergy(character.stats, action.payload.amount);
                if (action.payload.target === 'player') {
                    state.playerCharacter = { ...character, stats: updatedStats };
                } else {
                    state.aiCharacter = { ...character, stats: updatedStats };
                }
            }
        }
    }
});

export const {
    setPlayerCharacter,
    setAICharacter,
    setAICharacters,
    recordBattleState,
    incrementActionCounter,
    resetActionCounter,
    takeDamage,
    restoreHealth,
    modifyEnergy
} = characterSlice.actions;

export default characterSlice.reducer;
