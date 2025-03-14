
// Mock redux-related modules
import {selectPlayerCharacter} from "../../store/character/characterSelectors";
import {BattleManager} from "../../BattleManager";
import {loadNextBattle} from "../../store/game/gameThunks";
import {setBattleManager} from "../../store/game/gameSlice";

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock dependencies
jest.mock('../../../BattleManager');
jest.mock('../gameSlice');
jest.mock('../../character/characterSelectors');

describe('gameThunks', () => {
  // Set up mocks for the thunk arguments
  let dispatch;
  let getState;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    dispatch = jest.fn();
    getState = jest.fn(() => ({
      game: {
        player: { id: 'mockPlayer' },
        currentBattle: 2,
        totalBattles: 10
      },
      character: {
        playerCharacter: { id: 'mockCharacter' }
      }
    }));
    
    // Mock selectPlayerCharacter function result (not using useSelector)
    (selectPlayerCharacter as jest.Mock).mockImplementation(state => state.character.playerCharacter);
  });

  describe('loadNextBattle', () => {
    it('should create a battle manager and dispatch setBattleManager', async () => {
      // Mock the BattleManager constructor
      const mockBattleManager = { id: 'mockBattleManager' };
      (BattleManager as jest.Mock).mockImplementation(() => mockBattleManager);

      // Execute the thunk
      await loadNextBattle()(dispatch, getState, undefined);

      // Assertions
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: setBattleManager.type
        })
      );
      
      // Verify BattleManager was constructed with correct parameters
      expect(BattleManager).toHaveBeenCalledWith(
        expect.any(Object), // playerCharacter
        expect.any(Object), // aiOpponent
        2, // currentBattle
        expect.any(Function) // dispatch
      );
    });

    it('should throw an error if player is not initialized', async () => {
      // Mock state without player
      getState.mockReturnValue({
        game: {
          player: null,
          currentBattle: 2,
          totalBattles: 10
        }
      });

      // Execute the thunk and catch the error
      await expect(loadNextBattle()(dispatch, getState, undefined))
        .rejects.toThrow('Player not initialized');

      // Verify setBattleManager was not called
      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: setBattleManager.type
        })
      );
    });

    it('should throw an error if all battles are completed', async () => {
      // Mock state with completed battles
      getState.mockReturnValue({
        game: {
          player: { id: 'mockPlayer' },
          currentBattle: 10,
          totalBattles: 10
        }
      });

      // Execute the thunk and catch the error
      await expect(loadNextBattle()(dispatch, getState, undefined))
        .rejects.toThrow('All battles completed');

      // Verify setBattleManager was not called
      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: setBattleManager.type
        })
      );
    });
  });
});