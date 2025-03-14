
// Create thunks for operations that need to update both game and character state
import {AppDispatch, RootState} from "../types";
import {setAICharacter, setPlayerCharacter} from "../character/characterSlice";
import {Player} from "../../types/Player/Player";
import {Character} from "../../types/Character/Character";
import {Action} from "../../types/Actions/Action";
import {reconstructAction} from "../character/characterThunks";
import gameSlice, {initializeGame} from "./gameSlice";
import {createInitialCharacter, createInitialPlayer} from "./utils";


export const initializeGameAndCharacter = () => (dispatch: AppDispatch) => {
    const initialPlayer = createInitialPlayer();
    const initialCharacter = createInitialCharacter();
    dispatch(initializeGame(initialPlayer));
    dispatch(setPlayerCharacter(initialCharacter));
};


// Selectors
export const selectPlayerActions = (state: RootState): Action[] | null => {
    return state.game.player.availableActions ? state.game.player.availableActions.map(reconstructAction) : null;
};