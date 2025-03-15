import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character } from '../../types/Character/Character';
import { RootState } from '../store';
import { CharacterStats, createStats } from '../../types/Character/CharacterStats';
import { IBuffBehaviour, IDamageOverTimeBehaviour } from '../../types/Actions/Behaviours/BehaviourUnion';
import { Equipment, EquipmentType, Weapon, Armor, Accessory } from '../../types/Equipment/EquipmentClassHierarchy';

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
    incrementActionCounter: (stats: CharacterStats): CharacterStats => ({
        ...stats,
        actionCounter: Math.min(100, stats.actionCounter + stats.speed)
    }),
    resetActionCounter: (stats: CharacterStats): CharacterStats => ({
        ...stats,
        actionCounter: 0
    })
};

// Equipment type guards
function isWeapon(equipment: Equipment): equipment is Weapon {
    return equipment.type === EquipmentType.WEAPON;
}

function isArmor(equipment: Equipment): equipment is Armor {
    return equipment.type === EquipmentType.ARMOR;
}

function isAccessory(equipment: Equipment): equipment is Accessory {
    return equipment.type === EquipmentType.ACCESSORY;
}

export const characterSlice = createSlice({
    name: 'character',
    initialState,
    reducers: {
        setPlayerCharacter: (state, action: PayloadAction<Character>) => {
            state.playerCharacter = action.payload;
        },
        setAICharacter: (state, action: PayloadAction<Character>) => {
            state.aiCharacter = action.payload;
        },
        updatePlayerStats: (state, action: PayloadAction<CharacterStats>) => {
            if (state.playerCharacter) {
                state.playerCharacter.stats = action.payload;
            }
        },
        updateAIStats: (state, action: PayloadAction<CharacterStats>) => {
            if (state.aiCharacter) {
                state.aiCharacter.stats = action.payload;
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
        addPlayerBuff: (state, action: PayloadAction<IBuffBehaviour>) => {
            if (state.playerCharacter) {
                state.playerCharacter.activeBuffs.push(action.payload);
            }
        },
        addAIBuff: (state, action: PayloadAction<IBuffBehaviour>) => {
            if (state.aiCharacter) {
                state.aiCharacter.activeBuffs.push(action.payload);
            }
        },
        addPlayerDOT: (state, action: PayloadAction<IDamageOverTimeBehaviour>) => {
            if (state.playerCharacter) {
                state.playerCharacter.activeDOTs.push(action.payload);
            }
        },
        addAIDOT: (state, action: PayloadAction<IDamageOverTimeBehaviour>) => {
            if (state.aiCharacter) {
                state.aiCharacter.activeDOTs.push(action.payload);
            }
        },
        addPlayerEquipment: (state, action: PayloadAction<Weapon | Armor | Accessory>) => {
            if (state.playerCharacter) {
                // Remove any existing equipment of the same type
                state.playerCharacter.equipment = state.playerCharacter.equipment.filter(eq => {
                    if (isWeapon(action.payload) && isWeapon(eq)) return false;
                    if (isArmor(action.payload) && isArmor(eq)) return false;
                    if (isAccessory(action.payload) && isAccessory(eq)) return false;
                    return true;
                });
                state.playerCharacter.equipment.push(action.payload);
            }
        },
        removePlayerEquipment: (state, action: PayloadAction<{ type: EquipmentType }>) => {
            if (state.playerCharacter) {
                state.playerCharacter.equipment = state.playerCharacter.equipment.filter(eq => {
                    if (action.payload.type === EquipmentType.WEAPON && isWeapon(eq)) return false;
                    if (action.payload.type === EquipmentType.ARMOR && isArmor(eq)) return false;
                    if (action.payload.type === EquipmentType.ACCESSORY && isAccessory(eq)) return false;
                    return true;
                });
            }
        },
        addBattleHistoryEntry: (state, action: PayloadAction<{ playerHP: number; aiHP: number }>) => {
            state.battleHistory.push({
                ...action.payload,
                timestamp: Date.now()
            });
        }
    }
});

export const {
    setPlayerCharacter,
    setAICharacter,
    updatePlayerStats,
    updateAIStats,
    incrementActionCounter,
    resetActionCounter,
    addPlayerBuff,
    addAIBuff,
    addPlayerDOT,
    addAIDOT,
    addPlayerEquipment,
    removePlayerEquipment,
    addBattleHistoryEntry
} = characterSlice.actions;

export const selectPlayerCharacter = (state: RootState) => state.character.playerCharacter;
export const selectAICharacter = (state: RootState) => state.character.aiCharacter;
export const selectBattleHistory = (state: RootState) => state.character.battleHistory;

export default characterSlice.reducer;
