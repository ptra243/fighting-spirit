import React, {useEffect, useState} from 'react';
import '../../styles/BattleScreenStyles.css';
import {useBattleManager} from "../../context/BattleManagerContext";
import {CharacterCard} from "./CharacterCard";
import {ActionsList} from "./ActionsList";
import {BuffsList} from "./BuffsList";
import {BattleLogView} from "./BattleLogView";
import {BattleEndScreen} from "../BattleEndScreen/BattleEndScreen";
import {BattleState} from "../../BattleManager";
import {Action} from '../../types/Actions/Action';

export const BattleScreen: React.FC<{
    onBattleEnd: () => void;
}> = ({onBattleEnd}) => {
    const {
        battleManager,
        playerState,
        aiState,
        logs,
        setPlayerActions
    } = useBattleManager();

    const handleContinue = (selectedCard: Action) => {
        // Logic to go back to preparation screen
        let playerActions = battleManager.player.actions;
        playerActions.push(selectedCard);
        setPlayerActions(playerActions)
        if (battleManager.player.stats.hitPoints > battleManager.ai.stats.hitPoints) {
            // Increment round if player won
            // You'll need to implement this method in BattleManager
            onBattleEnd();
        }
        // Navigate to preparation screen
        // Implementation depends on your routing solution
    };

    return (
        <div className="battle-screen">
            <div className="battle-layout">
                <div className="player-side">
                    <BuffsList character={playerState}/>
                    <ActionsList isPlayer={true}
                    />
                </div>

                <div className="battle-board">
                    <div className="characters-container">
                        <CharacterCard isPlayer={true}/>
                        <CharacterCard isPlayer={false}/>
                    </div>
                    {/* Battle log now takes full width */}
                    <BattleLogView entries={logs}/>
                </div>

                <div className="ai-side">
                    <BuffsList character={aiState}/>
                    <ActionsList isPlayer={false}
                    />
                </div>
            </div>
            {battleManager.getBattleState() === BattleState.ENDED && (
                <BattleEndScreen
                    opponent={battleManager.ai}
                    isVictorious={battleManager.isPlayerVictorious()}
                    winner={battleManager.getWinner()}
                    battleLog={battleManager.getBattleLog()}
                    onContinue={handleContinue}/>
            )}
        </div>
    );
};
