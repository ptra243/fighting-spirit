import { Middleware } from '@reduxjs/toolkit';
import { logBattleAction } from '../battle/battleSlice';
import { incrementActionCounter, resetActionCounter } from '../character/characterSlice';

export const battleLogger: Middleware = storeAPI => next => action => {
  const prevState = storeAPI.getState();

  // Perform the action
  const result = next(action);
  const nextState = storeAPI.getState();

  // Example conditions for logging
  switch(action.type) {
    case incrementActionCounter.type:
      const { target, amount } = action.payload;
      const char = prevState.character[target + 'Character'];

      storeAPI.dispatch(logBattleAction({
        message: `${charName(targetToName(target))} incremented action counter (${action.payload.amount ?? charSpeed(targetToName(target))}).`,
        type: 'ACTION_COUNTER_INCREMENT',
        source: targetToName(target),
        target: targetToName(target),
        value: action.payload.amount ?? charSpeed(targetToName(target)),
      }));
      break;

  case resetActionCounter.type:
    storeAPI.dispatch(logBattleAction({
      message: `${targetToName(target)} action counter reset to 0.`,
      type: 'ACTION_COUNTER_RESET',
      source: targetToName(target),
      target: targetToName(target),
      value: 0,
    }));
    break;

  default:
    break;
  }

  return next(action);

  function charSpeed(target: 'player' | 'ai') {
    const char = prevState.character[target + 'Character'];
    return char ? char.stats.speed : 0;
  }

  function charName(target: 'player' | 'ai') {
    const char = prevState.character[target + 'Character'];
    return char ? char.name : 'Unknown';
  }

  function targetToName(target: 'player' | 'ai'): string {
    return prevState.character[target + 'Character'].name;
  }
};