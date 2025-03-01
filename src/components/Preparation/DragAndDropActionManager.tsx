import {useState} from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
    closestCenter,
    DragOverlay,
} from "@dnd-kit/core";
import "../../styles/DragAndDropStyles.css";
import React from "react";
import {ActionCard} from "../Cards/ActionCardComponent";
import {useBattleManager} from "../../context/BattleManagerContext";


export default function DragAndDropActions({requiredCards}) {
    const label = `Selected Actions: ${requiredCards} cards required`;
    const {battleManager} = useBattleManager();
    const character = battleManager.player;
    const [selectedActions, setSelectedActions] = useState(character.chosenActions);
    const [availableActions, setAvailableActions] = useState(
        character.actions.filter(action => action &&
            !character.chosenActions.some(chosen => chosen.id === action.id)
        )
    );

    const [activeId, setActiveId] = useState(null);

    const findActionById = (id: number) => {
        return availableActions.find((action) => action.id === id)
            || selectedActions.find((action) => action.id === id);
    };

    const handleDragEnd = (event: { active: any; over: any; }) => {
        const {active, over} = event;
        if (!over) return;

        const activeAction = findActionById(active.id);
        if (!activeAction) return;

        // Check if we're dropping in the same container where the item originated
        const isInSelectedActions = selectedActions.some(action => action.id === active.id);
        const isInAvailableActions = availableActions.some(action => action.id === active.id);

        if (over.id === "selectedActions") {
            // If the action is already in selected actions, don't do anything
            if (isInSelectedActions) return;

            // Move to selected actions
            const newSelectedActions = [...selectedActions, activeAction];
            const newAvailableActions = availableActions.filter((a) => a.id !== active.id);

            setSelectedActions(newSelectedActions);
            setAvailableActions(newAvailableActions);

            // Update character chosen actions
            character.chosenActions = newSelectedActions;


        } else if (over.id === "availableActions") {
            // If the action is already in available actions, don't do anything
            if (isInAvailableActions) return;

            // Move to available actions
            const newAvailableActions = [...availableActions, activeAction];
            const newSelectedActions = selectedActions.filter((a) => a.id !== active.id);

            setAvailableActions(newAvailableActions);
            setSelectedActions(newSelectedActions);

            character.chosenActions = newSelectedActions;
        }
        setActiveId(null);
    };


    const DraggableItem = ({item}) => {
        const {attributes, listeners, setNodeRef, transform} = useDraggable({
            id: item.id,
        });

        const style = transform
            ? {
                transform: `translate(${transform.x}px, ${transform.y}px)`,
            }
            : {};

        return (
            <div
                ref={setNodeRef}
                style={style}
                className="action-card"
                {...listeners}
                {...attributes}
            >
                <ActionCard
                    action={item}
                    dragHandleProps={listeners}
                />

            </div>
        );
    };

    const DroppableArea = ({id, children, label}) => {
        const {setNodeRef} = useDroppable({id});
        return (
            <div ref={setNodeRef} className={`actions-column ${id}-area`}>
                <h2 className="drop-zone-label">{label}</h2>
                <div className="drop-zone-container">
                    <div className="action-list">{children}</div>
                </div>
            </div>
        );
    };


    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveId(event.active.id)}
            onDragEnd={handleDragEnd}
        >
            <div className="drag-and-drop-container">
                <div className="drag-and-drop-content">
                    {/* Selected Actions Area */}
                    <DroppableArea id="selectedActions" label={label}>
                        {selectedActions.map((action) => (
                            <DraggableItem key={action.id} item={action}/>
                        ))}
                    </DroppableArea>

                    {/* Available Actions Area */}
                    <DroppableArea id="availableActions" label="Available Actions">
                        {availableActions.map((action) => (
                            <DraggableItem key={action.id} item={action}/>
                        ))}
                    </DroppableArea>
                </div>
            </div>
        </DndContext>

    );
}