import { AppDispatch, RootState } from "../types";
import {
  incrementActionCounter,
  resetActionCounter,
} from "../character/characterSlice";
import {
  startBattle,
  endBattle,
  logBattleAction,
  incrementTurnCount,
  toggleTurn,
} from "./battleSlice";
import { selectPlayerCharacter, selectAICharacter } from "../character/characterSelectors";

export const startBattleLoop = (round: number) => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  dispatch(startBattle(round));


  dispatch(endBattle());
};