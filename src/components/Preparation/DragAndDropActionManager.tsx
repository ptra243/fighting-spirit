import React, {useState} from "react";
import {closestCenter, DndContext, useDraggable, useDroppable,} from "@dnd-kit/core";
import "../../styles/DragAndDropStyles.css";
import {ActionCard} from "../Cards/ActionCardComponent";
import {AppDispatch, RootState} from '../../store/types';
import { setPlayerCharacter } from '../../store/character/characterSlice';
import {useDispatch, useSelector} from "react-redux";
import {useAppSelector} from "../../store/hooks/hooks";
import {selectPlayerActions} from "../../store/game/gameSelectors";
// Adjust the import path as needed



export default function DragAndDropActions({requiredCards}) {
    const dispatch = useDispatch<AppDispatch>();

    const character = useAppSelector((state) => state.character.playerCharacter);
    const playerActions = useAppSelector(selectPlayerActions)
    const label = `Selected Actions: ${requiredCards} cards required`;
    const [selectedActions, setSelectedActions] = useState(character.chosenActions || []);
    const [availableActions, setAvailableActions] = useState(
        (playerActions || []).filter(action => action &&
            !(character.chosenActions || []).some(chosen => chosen.id === action.id)
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

        const isInSelectedActions = selectedActions.some(action => action.id === active.id);
        const isInAvailableActions = availableActions.some(action => action.id === active.id);

        if (over.id === "selectedActions") {
            if (isInSelectedActions) return;

            const newSelectedActions = [...selectedActions, activeAction];
            const newAvailableActions = availableActions.filter((a) => a.id !== active.id);

            setSelectedActions(newSelectedActions);
            setAvailableActions(newAvailableActions);

            // Update Redux store instead of using setPlayer
            dispatch(setPlayerCharacter({
                ...character,
                chosenActions: newSelectedActions
            }));

        } else if (over.id === "availableActions") {
            if (isInAvailableActions) return;

            const newAvailableActions = [...availableActions, activeAction];
            const newSelectedActions = selectedActions.filter((a) => a.id !== active.id);

            setAvailableActions(newAvailableActions);
            setSelectedActions(newSelectedActions);

            // Update Redux store
            dispatch(setPlayerCharacter({
                ...character,
                chosenActions: newSelectedActions
            }));
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