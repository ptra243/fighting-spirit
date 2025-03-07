// src/store/gameSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Character} from '../types/Character/Character';
import {Player} from '../types/Player/Player';
import {BattleManager} from '../BattleManager';
import {GameStage} from "../types/GameStageTypes";
import {CharacterStats} from "../types/Character/CharacterStats";
import {basicAttack, basicBlock} from '../types/Actions/PredefinedActions/KnightActions';
import {Action} from "../types/Actions/Action";
import {setAICharacter, setPlayerCharacter} from "./characterSlice";
import {AppDispatch, RootState} from './store';
import {reconstructAction} from "./characterThunks";

const createInitialPlayer = (): Player => {
    const character = new Character({
        name: "Hero",
        stats: new CharacterStats({
            maxHitPoints: 50,
            attack: 2,
            defence: 2,
            energyRegen: 2,
            energy: 1,
            speed: 25,
            maxEnergy: 10,
            hpRegen: 1,
            chargesPerTurn: 1,
        }),
        chosenActions: [basicAttack(), basicAttack(), basicBlock()],
        sprite: 'knight.jpg'
    });
    return new Player(character, 10);
};

interface GameState {
    player: Player | null;
    battleManager: BattleManager | null;
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
    battleManager: null,
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
        setBattleManager: (state, action: PayloadAction<BattleManager>) => {
            state.battleManager = action.payload;
        },
        updatePlayerState: (state, action: PayloadAction<Player>) => {
            state.player = action.payload;
        },
        updateGamePlayerCharacter: (state, action: PayloadAction<Character>) => {
            if (state.player) {
                state.player.character = action.payload;
            }
        },
        progressBattle: (state) => {
            state.currentBattle += 1;
            if (state.currentBattle >= state.totalBattles) {
                state.isGameOver = true;
            }
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
        setSelectedActions: (state, action: PayloadAction<Action[]>) => {
            state.selectedActions = action.payload;
            state.currentActionIndex = 0;
        },
        advanceAction: (state) => {
            state.currentActionIndex =
                (state.currentActionIndex + 1) % state.selectedActions.length;
        },
        setBattleStatus: (state, action: PayloadAction<GameState['battleStatus']>) => {
            state.battleStatus = action.payload;
        },
        incrementTurn: (state) => {
            state.battleTurn += 1;
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

    },

    extraReducers: (builder) => {
        // Listen for the characterSlice's setPlayerCharacter action
        builder.addCase(setPlayerCharacter, (state, action: PayloadAction<Partial<Character>>) => {
            if (state.player) {
                // First create proper Action instances for the actions array
                const actions = action.payload.chosenActions?.map(actionData => new Action(actionData));

                const characterData = {
                    ...state.player.character,
                    ...action.payload,
                    chosenActions: actions // Override with proper Action instances
                } as Character;

                // Create new character with proper actions
                // Convert to plain object while preserving the Action instances
                state.player.character = new Character(characterData);

            }
        });
    }

});

// Create thunks for operations that need to update both game and character state
export const initializeGameAndCharacter = () => (dispatch: AppDispatch) => {
    const initialPlayer = createInitialPlayer();
    dispatch(initializeGame(initialPlayer));
    dispatch(setPlayerCharacter(initialPlayer.character));
};

export const updatePlayerState = (player: Player) => (dispatch: AppDispatch) => {
    dispatch(gameSlice.actions.updatePlayerState(player));
    dispatch(setPlayerCharacter(player.character));
};

export const updatePlayerCharacter = (character: Character) => (dispatch: AppDispatch) => {
    dispatch(setPlayerCharacter(character));
    // Only update the game state's player character
    dispatch(updateGamePlayerCharacter(character));

};

export const startBattle = (aiCharacter: Character) => (dispatch: AppDispatch) => {

    dispatch(gameSlice.actions.startBattle());
    dispatch(setAICharacter(aiCharacter));
};

// Selectors
export const selectPlayerActions = (state: RootState): Action[] | null => {
    return state.game.player.availableActions ? state.game.player.availableActions.map(reconstructAction) : null;
};

export const {
    initializeGame,
    setBattleManager,
    progressBattle,
    resetGame,
    setGameStage,
    incrementTurn,
    endBattle,
    setBattleStatus,
    advanceAction,
    setSelectedActions,
    checkBattleEnd,
    updateGamePlayerCharacter,
    updatePlayerActions
} = gameSlice.actions;

export default gameSlice.reducer;