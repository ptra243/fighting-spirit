
// Mock createInitialPlayer and createInitialCharacter
import {initializeGameAndCharacter, selectPlayerActions} from "../../store/game/gameSelectors";
import {Action} from "../../types/Actions/Action";
import {initializeGame} from "../../store/game/gameSlice";
import {setPlayerCharacter} from "../../store/character/characterSlice";

jest.mock('../utils', () => ({
  createInitialPlayer: jest.fn(() => ({ id: 'mockPlayer' })),
  createInitialCharacter: jest.fn(() => ({ id: 'mockCharacter' }))
}));

describe('gameSelectors', () => {
  describe('selectPlayerActions', () => {
    it('should return null if player has no available actions', () => {
      const mockState = {
        game: {
          player: { availableActions: null }
        }
      };

      const result = selectPlayerActions(mockState as any);
      expect(result).toBeNull();
    });

    it('should reconstruct actions if player has available actions', () => {
      // Create mock action objects
      const mockActions = [
        { id: 'action1', name: 'Attack' },
        { id: 'action2', name: 'Defend' }
      ];

      const mockState = {
        game: {
          player: { 
            availableActions: mockActions 
          }
        }
      };

      const result = selectPlayerActions(mockState as any);
      
      expect(result).toHaveLength(2);
      expect(result![0]).toBeInstanceOf(Action);
      expect(result![1]).toBeInstanceOf(Action);
    });
  });

  describe('initializeGameAndCharacter', () => {
    it('should dispatch initializeGame and setPlayerCharacter', () => {
      const dispatch = jest.fn();
      
      initializeGameAndCharacter()(dispatch);
      
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: initializeGame.type,
          payload: { id: 'mockPlayer' }
        })
      );
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: setPlayerCharacter.type,
          payload: { id: 'mockCharacter' }
        })
      );
    });
  });
});