import React, {useState} from 'react';
import styled from 'styled-components';
import {KnightClass} from "../../../types/Classes/KnightClass";
import {CharacterClass} from "../../../types/Classes/CharacterClass";
import {useGameManager} from "../../../context/GameManagerContextProvider";

const TrainingModal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--parchment);
    padding: 20px;
    border: 2px solid var(--dark-wood);
    border-radius: 8px;
    z-index: 1000;
`;

const ClassButton = styled.button`
    background: var(--light-wood);
    border: 2px solid var(--dark-wood);
    padding: 10px 20px;
    margin: 5px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background: var(--dark-wood);
        color: var(--parchment);
    }
`;

// Define available classes and their constructors
const AVAILABLE_CLASSES = [
    {
        name: 'Knight',
        constructor: KnightClass,
        description: 'A heavily armored warrior specializing in defense and sword combat.',
        instanceCreator: () => new KnightClass() // Add this function to create new instances

    }
    // Add new classes here like:
    // {
    //     name: 'Mage',
    //     constructor: MageClass,
    //     description: 'A master of arcane arts specializing in powerful spells.'
    // }
];

const TrainingGroundModal: React.FC<{
    onClose: () => void;
}> = ({onClose}) => {
    const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
    const gm = useGameManager();
    const [getPlayer, setPlayer] = gm.updatePlayer;
    const [getCharacter, setCharacter] = gm.updateCharacter;

    const handleClassSelection = (classInfo: typeof AVAILABLE_CLASSES[0]) => {
        // Check if player already has the class

        const existingClass = getPlayer().character.classes.find(c => c instanceof classInfo.constructor);


        if (!existingClass) {
            // Add the class if player doesn't have it
            const newClass = classInfo.instanceCreator();

            const updatedCharacter = getPlayer().character.addClass(newClass);
            setSelectedClass(newClass);
            setCharacter(updatedCharacter);
        } else {
            // Use existing class instance
            setSelectedClass(existingClass as KnightClass);
        }
    };

    const handleLevelUp = () => {
        if (selectedClass) {
            const updatedCharacter = selectedClass.levelUp(getCharacter());
            setCharacter(updatedCharacter);
        }
    };

    const getClassLevel = (classInfo: typeof AVAILABLE_CLASSES[0]) => {
        const classInstance = getCharacter().classes.find(c => c instanceof classInfo.constructor);
        return classInstance ? classInstance.getLevel() : 0;
    };

    return (
        <TrainingModal>
            <h2>Training Ground</h2>
            <div>
                <h3>Available Classes:</h3>
                {AVAILABLE_CLASSES.map((classInfo) => (
                    <div key={classInfo.name}>
                        <ClassButton
                            onClick={() => handleClassSelection(classInfo)}
                        >
                            {classInfo.name}
                            {getClassLevel(classInfo) > 0
                                ? ` (Level ${getClassLevel(classInfo)})`
                                : ' (New)'}
                        </ClassButton>
                        <p>{classInfo.description}</p>
                    </div>
                ))}
            </div>

            {selectedClass && (
                <div>
                    <h3>Level Up Training</h3>
                    <p>Current Level: {selectedClass.getLevel()}</p>
                    <ClassButton onClick={handleLevelUp}>
                        Level Up
                    </ClassButton>
                </div>
            )}

            <ClassButton onClick={onClose}>Close</ClassButton>
        </TrainingModal>
    );

};

export default TrainingGroundModal;