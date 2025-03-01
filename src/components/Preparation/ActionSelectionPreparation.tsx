import {Action} from '../../types/Actions/Action';
import React, {useState} from "react";
import DragAndDropActionManager from './DragAndDropActionManager';
import DragAndDropActions from "./DragAndDropActionManager";
import {useBattleManager} from "../../context/BattleManagerContext";

interface ActionButtonsProps {
    actions: Action[];
    onActionClick: () => void;
}

export const ActionSelectionPreparation: React.FC = ({}) => {
    let {battleManager} = useBattleManager();

    const character = battleManager.player;

    const [currentActions, setCurrentActions] = useState(character.actions);
    const toggleAction = (action: Action) => {
        // Check if the action is already selected
        const actionIndex = character.chosenActions.map(a => a.name).indexOf(action.name);
        if (actionIndex > -1) {
            // Remove the action if it's already selected
            const updatedActions = [...character.chosenActions];
            updatedActions.splice(actionIndex, 1); // Remove the action from the array
            character.chosenActions = updatedActions;
        } else {
            // Add the action if not selected (limit to 3 actions)
            if (character.chosenActions.length < 3) {
                // character.chosenActions= ([...character.chosenActions, action]);
                character.chosenActions.push(action); // Call character.selectAction
            }
        }
    };

    const isSelected = (action: Action) => {
        return character.chosenActions.some(a => a.name === action.name);
    };
    return (
        <div className="action-buttons">
            <DragAndDropActions></DragAndDropActions>
            {/*{actions.map((action, index) => (*/}
            {/*    <button key={action.name}*/}
            {/*            className={isSelected(action) ? 'action-button selected-action' : 'action-button'}*/}
            {/*            onClick={() => toggleAction(action)}*/}
            {/*    >*/}
            {/*        {action.name}*/}
            {/*    </button>*/}
            {/*))}*/}
            {/*<button onClick={() => gameManager.startBattle()} className="action-button">Start Battle</button>*/}
        </div>
    );
};