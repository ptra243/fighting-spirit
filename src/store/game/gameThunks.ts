// src/store/gameThunks.ts
import {createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from "../types";
import {setGameStage} from "./gameSlice";
import {GameStage} from "../../types/GameStageTypes";
import type {Character} from '../../types/Character/Character';
import {createCharacter} from '../../types/Character/Character';
import {CharacterStats, createStats} from '../../types/Character/CharacterStats';
import {CharacterEquipment} from '../../types/Character/CharacterEquipment';
import {selectPlayerCharacter} from "../character/characterSelectors";
import {setAICharacter, setPlayerCharacter} from "../character/characterSlice";
import {startBattle} from "../battle/battleSlice";
import {EasyEnemies} from '../../types/Enemies/EasyEnemies';
import {MediumEnemies} from '../../types/Enemies/MediumEnemies';
import {HardEnemies} from '../../types/Enemies/HardEnemies';

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

    const updatedStats = createStats({
        hitPoints: Math.round(enemy.stats.hitPoints * scalingMultiplier),
        maxHitPoints: Math.round(enemy.stats.maxHitPoints * scalingMultiplier),
        attack: Math.round(enemy.stats.attack * scalingMultiplier),
        defence: Math.round(enemy.stats.defence * scalingMultiplier)
    });

    const baseStats = createStats({...updatedStats});

    return createCharacter({
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

        const playerCharacter = selectPlayerCharacter(state);

        // Create AI opponent
        const aiOpponent = createAI(currentBattle);
        dispatch(setAICharacter(aiOpponent));
        dispatch(startBattle());
    }
);

export const startNewGame = createAsyncThunk(
    'game/startNewGame',
    async (_, { dispatch }) => {
        const updatedStats = createStats({
            hitPoints: 100,
            maxHitPoints: 100,
            shield: 0,
            attack: 10,
            defence: 5,
            energy: 100,
            maxEnergy: 100,
            energyRegen: 10,
            hpRegen: 0
        });

        const baseStats = createStats({...updatedStats});

        const character = createCharacter({
            name: "Player",
            stats: baseStats,
            equipment: new CharacterEquipment()
        });

        dispatch(setPlayerCharacter(character));
        dispatch(setGameStage('BATTLE' as GameStage));
        dispatch(startBattle());
    }
);