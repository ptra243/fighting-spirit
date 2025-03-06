import React from "react";
import {useBattleManager} from "../../context/BattleManagerContext";

export const ActionsList: React.FC<{
    isPlayer: boolean
}> = ({isPlayer}) => {
    const {playerState, aiState} = useBattleManager();

    // Get current character state
    const character = isPlayer ? playerState : aiState;
    return (
        <div className="actions-list">
            <h3>Actions</h3>
            <div className="actions-container">
                {character.chosenActions.map((action, index) => (
                    <div
                        key={`${action.id}-${index}`}
                        className={`action-item ${index === character.currentAction ? 'current-action' : ''}`}
                    >
                        {action.name} - {action.description}
                    </div>
                ))}

            </div>
        </div>
    );
};