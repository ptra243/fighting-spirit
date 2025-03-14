// src/store/gameThunks.ts
import {createAsyncThunk} from '@reduxjs/toolkit';
import {BattleManager} from '../BattleManager';
import {setBattleManager} from './gameSlice';
import {EasyEnemies} from '../types/Enemies/EasyEnemies';
import {MediumEnemies} from '../types/Enemies/MediumEnemies';
import {HardEnemies} from '../types/Enemies/HardEnemies';
import {Character} from '../types/Character/Character';
import {CharacterStats} from '../types/Character/CharacterStats';
import {reconstructCharacter} from "./characterThunks";
import {RootState} from "./types";


// Helper functions
const createAI = (currentBattle: number): Character => {
    const aiDifficultyFactor = currentBattle + 1;
    let chosenEnemy: Character;

    if (aiDifficultyFactor <= 3) {
        chosenEnemy = EasyEnemies[Math.floor(Math.random() * EasyEnemies.length)];
    } else if (aiDifficultyFactor <= 6) {
        chosenEnemy = MediumEnemies[Math.floor(Math.random() * MediumEnemies.length)];
    } else {
        chosenEnemy = HardEnemies[Math.floor(Math.random() * HardEnemies.length)];
    }

    return scaleEnemy(chosenEnemy, aiDifficultyFactor);
};

const scaleEnemy = (enemy: Character, difficultyFactor: number): Character => {
    const scalingMultiplier = 1 + (difficultyFactor * 0.1);

    const updatedStats = new CharacterStats({
        hitPoints: Math.round(enemy.stats.hitPoints * scalingMultiplier),
        maxHitPoints: Math.round(enemy.stats.maxHitPoints * scalingMultiplier),
        attack: Math.round(enemy.stats.attack * scalingMultiplier),
        defence: Math.round(enemy.stats.defence * scalingMultiplier)
    });

    const baseStats = new CharacterStats({...updatedStats});

    return new Character({
        ...enemy,
        baseStats: baseStats,
        stats: updatedStats
    });
};

export const loadNextBattle = createAsyncThunk(
    'game/loadNextBattle',
    async (_, {getState, dispatch}) => {
        const state = getState() as RootState;
        const {player, currentBattle, totalBattles} = state.game;

        if (!player) throw new Error('Player not initialized');
        if (currentBattle >= totalBattles) {
            throw new Error('All battles completed');
        }

        // Create AI opponent
        const aiOpponent = createAI(currentBattle);

        // Create new battle manager with both player and AI
        const newBattleManager = new BattleManager(
            reconstructCharacter(player.character),
            aiOpponent,
            currentBattle,
            dispatch
        );

        dispatch(setBattleManager(newBattleManager));
        return newBattleManager;
    }
);