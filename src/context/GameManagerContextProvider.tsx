// GameManagerContext.tsx
import React, {createContext, useCallback, useContext, useState} from 'react';
import {Character} from '../types/Character/Character';
import {Player} from '../types/Player/Player';
import {GameManager} from "../GameManagerLogic";

interface GameManagerContextType {
    updatePlayer: [() => Player, (player: Player) => void];
    updateCharacter: [() => Character, (character: Character) => void];
}

const GameManagerContext = createContext<GameManagerContextType | undefined>(undefined);

export const GameManagerProvider: React.FC<{
    children: React.ReactNode;
    gameManager: GameManager;
}> = ({children, gameManager}) => {
    const [gm, setGameManager] = useState(gameManager);

    // Use useCallback to memoize these functions
    const getPlayer = useCallback(() => gm.player, [gm]);
    const updatePlayer = useCallback((player: Player) => {
        gm.updatePlayer(player);
        setGameManager(new GameManager(gm)); // Trigger re-render
    }, [gm]);

    const getCharacter = useCallback(() => gm.player.character, [gm]);
    const updateCharacter = useCallback((character: Character) => {
        gm.updateCharacter(character);
        setGameManager(new GameManager(gm)); // Trigger re-render
    }, [gm]);

    const gmContext: GameManagerContextType = {
        updatePlayer: [getPlayer, updatePlayer],
        updateCharacter: [getCharacter, updateCharacter]
    };

    return (
        <GameManagerContext.Provider value={gmContext}>
            {children}
        </GameManagerContext.Provider>
    );
};

export const useGameManager = () => {
    const context = useContext(GameManagerContext);
    if (context === undefined) {
        throw new Error('useGameManager must be used within a GameManagerProvider');
    }
    return context;
};
