// src/store/middleware/battleLoopMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
  addBattleLog,
  updateCharacter,
  setPhase
} from '../slices/battleSlice';


let battleInterval: NodeJS.Timeout | null = null;

export const battleLoopMiddleware: Middleware =
    store => next => action => {
      const getState = () => store.getState() as RootState;
      const dispatch = store.dispatch;
      const processTick = () => {
        const state = getState();

        if (state.battle.isPaused ||
            state.battle.battleState !== 'IN_PROGRESS' ||
            state.battle.waitingForPlayerInput) {
          return;
        }

        // Increment action counters for both characters
        state.battle.characters.forEach((character, index) => {
          dispatch(updateCharacter({
            characterIndex: index,
            updates: {
              stats: {
                ...character.stats,
                actionCounter: character.stats.actionCounter + character.stats.speed
              }
            }
          }));
        });

        // Check if any character can act
        const updatedState = getState();
        const [player, ai] = updatedState.battle.characters;

        if (player.stats.actionCounter >= 100 || ai.stats.actionCounter >= 100) {
          processActions(updatedState);
        }
      };

      const processActions = (state: RootState) => {
        const [player, ai] = state.battle.characters;

        // Determine which character(s) can act
        if (player.stats.actionCounter >= 100) {
          // Handle player action
          dispatch(updateCharacter({
            characterIndex: 0,
            updates: {
              stats: {
                ...player.stats,
                actionCounter: player.stats.actionCounter - 100
              }
            }
          }));
        }

        if (ai.stats.actionCounter >= 100) {
          // Handle AI action
          dispatch(updateCharacter({
            characterIndex: 1,
            updates: {
              stats: {
                ...ai.stats,
                actionCounter: ai.stats.actionCounter - 100
              }
            }
          }));
        }
      };

      const startBattleLoop = () => {
        if (battleInterval) {
          clearInterval(battleInterval);
        }

        battleInterval = setInterval(processTick, 100); // Match TURN_INTERVAL_MS from BattleManager
      };

      const stopBattleLoop = () => {
        if (battleInterval) {
          clearInterval(battleInterval);
          battleInterval = null;
        }
      };

      // Handle incoming actions
      switch (action.type) {
        case 'battle/startBattle':
          const state = getState();
          const errors = validateBattleStart(state);

          if (errors.length > 0) {
            errors.forEach(error => {
              dispatch(addBattleLog({
                message: error,
                type: 'action',
                source: 'System',
                target: 'System'
              }));
            });
            return next(action);
          }

          startBattleLoop();
          break;

        case 'battle/endBattle':
          stopBattleLoop();
          break;

        case 'battle/pauseBattle':
          stopBattleLoop();
          break;

        case 'battle/resumeBattle':
          startBattleLoop();
          break;
      }

      return next(action);
    };

const validateBattleStart = (state: RootState) => {
  const errors: string[] = [];
  const player = state.battle.characters[0];

  if (state.battle.characters.some(char => char.stats.health <= 0)) {
    errors.push("Battle cannot start as one or both characters are dead.");
  }

  if (player.chosenActions.length !== state.battle.requiredActionsCount) {
    errors.push(`The player needs to choose exactly ${state.battle.requiredActionsCount} actions.`);
  }

  return errors;
};