import React, {createContext, useContext, useEffect, useState} from 'react';
import {BattleManager} from '../BattleManager';
import {Character} from '../types/Character/Character';
import {BattleLog} from "../types/Battle/BattleLog";
import {Action} from "../types/Actions/Action";

// Modified interface to handle nullable BattleManager
interface BattleManagerContextValue {
    battleManager: BattleManager | null;
    playerState: Character | null;
    aiState: Character | null;
    currentPlayerActionIndex: number;
    currentAIActionIndex: number;
    logs: BattleLog | null;
    forceUpdate: () => void;
    setBattleManager: (manager: BattleManager | null) => void;
    setPlayerActions: (actions: Action[]) => void;
    setPlayer: (player: Character) => void;
    setAI: (ai: Character) => void;
    battleConfig: {
        TURN_INTERVAL_MS: number;
    };
}

const BattleManagerContext = createContext<BattleManagerContextValue | null>(null);

export const useBattleManager = () => {
    const context = useContext(BattleManagerContext);
    if (!context) {
        throw new Error('useBattleManager must be used within a BattleManagerProvider');
    }
    return context;
};

export const BattleManagerProvider: React.FC<{
    manager: BattleManager | null;
    children: React.ReactNode;
}> = ({manager, children}) => {
    const [updateVersion, setUpdateVersion] = useState(0);
    const [battleManager, setBattleManager] = useState<BattleManager | null>(manager);

    const updateBattleManager = (newManager: BattleManager | null) => {
        setBattleManager(newManager);
    };

    const setPlayer = (newPlayer: Character) => {
        if (battleManager) {
            console.log({description: 'battleManagerContext: setPlayer', player: newPlayer})
            battleManager.player = newPlayer;
            forceUpdate();
        }
    };

    const setAI = (newAI: Character) => {
        if (battleManager) {
            battleManager.ai = newAI;
            forceUpdate();
        }
    };

    const setPlayerActions = (newActions: Action[]) => {
        if (battleManager && battleManager.player) {
            setPlayer(new Character({...battleManager.player, actions: newActions}));
            forceUpdate();
        }
    };

    // Initialize state with null-safe values
    const [state, setState] = useState(() => ({
        battleManager: manager,
        playerState: manager?.player || null,
        aiState: manager?.ai || null,
        currentPlayerActionIndex: manager?.player?.currentAction || 0,
        currentAIActionIndex: manager?.ai?.currentAction || 0,
        logs: manager?.getBattleLog() || new BattleLog(), // or null depending on your needs
        setBattleManager: updateBattleManager,
        setPlayer,
        setAI,
        setPlayerActions,
        battleConfig: BattleManager.CONFIG
    }));

    const forceUpdate = () => {
        setUpdateVersion(prev => prev + 1);
    };
    useEffect(() => {
        const handleUpdate = () => {
            console.log({
                description: 'BattleManager Context Update',
                playerState: battleManager?.player?.classes,
                timestamp: new Date().toISOString()
            });

            setState({
                battleManager: battleManager,
                playerState: battleManager?.player || null,
                aiState: battleManager?.ai || null,
                currentPlayerActionIndex: battleManager?.player?.currentAction || 0,
                currentAIActionIndex: battleManager?.ai?.currentAction || 0,
                logs: battleManager?.getBattleLog() || new BattleLog(),
                setBattleManager: updateBattleManager,
                setPlayer,
                setAI,
                setPlayerActions,
                battleConfig: BattleManager.CONFIG
            });
            // Remove forceUpdate() as setState will trigger a rerender anyway
        };

        handleUpdate(); // Initial update

        // Only subscribe if battleManager exists
        if (battleManager) {
            battleManager.subscribe(handleUpdate);
            return () => {
                battleManager.unsubscribe(handleUpdate);
            };
        }
    }, [battleManager]); // Simplified dependency array


    const contextValue: BattleManagerContextValue = {
        ...state,
        forceUpdate,
        setPlayer,
        setAI,
        battleConfig: BattleManager.CONFIG
    };

    return (
        <BattleManagerContext.Provider value={contextValue}>
            {children}
        </BattleManagerContext.Provider>
    );
};