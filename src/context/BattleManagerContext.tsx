import React, {createContext, useContext, useState, useEffect} from 'react';
import {BattleManager} from '../BattleManager';
import {Character} from '../types/Character/Character';
import {BattleLog} from "../types/Battle/BattleLog";
import {Actions} from "@dnd-kit/core/dist/store/actions";
import {Action} from "../types/Actions/Action";

interface BattleManagerContextValue {
    battleManager: BattleManager;
    playerState: Character;
    aiState: Character;
    currentPlayerActionIndex: number;
    currentAIActionIndex: number;
    logs: BattleLog;
    forceUpdate: () => void;
    setBattleManager: (manager: BattleManager) => void;
    setPlayerActions: (actions: Action[]) => void;
    setPlayer: (player: Character) => void;  // Add these methods
    setAI: (ai: Character) => void;         // instead of setBattleManager
    battleConfig: {
        TURN_INTERVAL_MS: number;
        // ... other config properties
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
    manager: BattleManager;
    children: React.ReactNode;
}> = ({manager, children}) => {
    const [updateVersion, setUpdateVersion] = useState(0);
    const [battleManager, setBattleManager] = useState(manager);

    // Update internal battleManager when prop changes
    useEffect(() => {
        setBattleManager(manager);
    }, [manager]);

    const updateBattleManager = (newManager: BattleManager) => {
        setBattleManager(newManager);
    };

    const setPlayer = (newPlayer: Character) => {
        battleManager.player = newPlayer;
        forceUpdate();
    };

    const setAI = (newAI: Character) => {
        battleManager.ai = newAI;
        forceUpdate();
    };
    const setPlayerActions = (newActions: Action[]) => {
        // battleManager.ai = newAI;
        setPlayer(new Character({...battleManager.player, actions: newActions}));
        forceUpdate();
    };


    const [state, setState] = useState({
        battleManager: battleManager,
        playerState: battleManager.player,
        aiState: battleManager.ai,
        currentPlayerActionIndex: battleManager.player.currentAction || 0,
        currentAIActionIndex: battleManager.ai.currentAction || 0,
        logs: battleManager.getBattleLog(),
        setBattleManager: updateBattleManager,
        setPlayer: setPlayer,
        setAi: setAI,
        setPlayerActions: setPlayerActions,
        battleConfig: BattleManager.CONFIG
    });

    const forceUpdate = () => {
        setUpdateVersion(prev => prev + 1);
    };  // Add methods to update specific characters


    // Update state when battleManager changes
    useEffect(() => {
        const handleUpdate = () => {
            setState({
                battleManager: battleManager,
                playerState: battleManager.player,
                aiState: battleManager.ai,
                currentPlayerActionIndex: battleManager.player.currentAction || 0,
                currentAIActionIndex: battleManager.ai.currentAction || 0,
                logs: battleManager.getBattleLog(),
                setBattleManager: updateBattleManager,
                setPlayer: setPlayer,
                setAi: setAI,
                setPlayerActions: setPlayerActions,
                battleConfig: BattleManager.CONFIG
            });
            forceUpdate();
        };

        handleUpdate(); // Initial update
        battleManager.subscribe(handleUpdate);

        return () => {
            battleManager.unsubscribe(handleUpdate);
        };
    }, [battleManager]); // Dependency on battleManager instead of manager

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
