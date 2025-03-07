import React from "react";
import {useAppSelector} from "../../store/hooks/hooks";
import {useSelector} from "react-redux";
import {selectAICharacter, selectPlayerCharacter} from "../../store/characterSlice";

export const ActionsList: React.FC<{
    isPlayer: boolean
}> = ({isPlayer}) => {


    // Get current character state
    const character = isPlayer ?  useSelector(selectPlayerCharacter):  useSelector(selectAICharacter);

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