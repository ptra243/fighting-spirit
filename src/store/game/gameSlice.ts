// src/store/gameSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Character} from '../../types/Character/Character';
import {Player} from '../../types/Player/Player';
import {GameStage} from "../../types/GameStageTypes";
import {Action} from "../../types/Actions/Action";
import {setPlayerCharacter} from "../character/characterSlice";
import {createInitialPlayer} from "./utils";

interface GameState {
    player: Player | null;
    currentBattle: number;
    totalBattles: number;
    isGameOver: boolean;
    gameStage: GameStage;
    selectedActions: Action[];
    currentActionIndex: number;
    battleTurn: number;
    battleStatus: 'idle' | 'executing' | 'waiting' | 'finished';
    winner: 'player' | 'ai' | null;
    isInBattle: boolean;
}

const initialState: GameState = {
    player: createInitialPlayer(),
    currentBattle: 0,
    totalBattles: 10,
    isGameOver: false,
    gameStage: 'TRAVEL',
    selectedActions: [],
    currentActionIndex: 0,
    battleTurn: 0,
    battleStatus: 'idle',
    winner: null,
    isInBattle: false
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        initializeGame: (state, action: PayloadAction<Player>) => {
            state.player = action.payload;
            state.currentBattle = 0;
            state.isGameOver = false;
        },
        updatePlayerState: (state, action: PayloadAction<Player>) => {
            state.player = action.payload;
        },
        resetGame: (state) => {
            return initialState;
        },
        startBattle: (state) => {
            state.isInBattle = true;
            state.battleStatus = 'waiting';
            state.winner = null;
            state.battleTurn = 0;
        },
        endBattle: (state, action: PayloadAction<'player' | 'ai'>) => {
            state.isInBattle = false;
            state.battleStatus = 'finished';
            state.winner = action.payload;
            state.currentActionIndex = 0;
        },
        updatePlayerActions: (state, action: PayloadAction<Action[]>) => {
            if (state.player) {
                // Create new Action instances for each action
                state.player.availableActions = action.payload.map(actionData => new Action(actionData));
            }
        },
        setGameStage: (state, action: PayloadAction<GameStage>) => {
            state.gameStage = action.payload;
        },
        checkBattleEnd: (state, action: PayloadAction<{
            playerHP: number,
            aiHP: number
        }>) => {
            if (action.payload.playerHP <= 0) {
                state.winner = 'ai';
                state.battleStatus = 'finished';
                state.isInBattle = false;
            } else if (action.payload.aiHP <= 0) {
                state.winner = 'player';
                state.battleStatus = 'finished';
                state.isInBattle = false;
            }
        }
    }
});

export const {
    initializeGame,
    setGameStage,
    updatePlayerActions,
    startBattle,
    endBattle,
    checkBattleEnd,
    resetGame,
    updatePlayerState
} = gameSlice.actions;

export default gameSlice.reducer;