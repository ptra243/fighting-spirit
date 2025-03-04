// src/components/ClassSelection/ClassSelectionScreen.tsx
import React from 'react';
import {Character} from '../../types/Character/Character';
import {CharacterClass} from '../../types/Classes/CharacterClass';
import {uniqueId} from "lodash";
import {CharacterStats} from "../../types/Character/CharacterStats";

interface ClassSelectionScreenProps {
    onClassSelected: (character: Character) => void;
}

export const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({onClassSelected}) => {
    const availableClasses: CharacterClass[] = [
        {
            // id: 'knight',
            name: 'Knight',
            description: 'A stalwart defender with high defense and reliable damage.',
            startingStats: new CharacterStats({
                maxHitPoints: 50,
                attack: 2,
                defence: 2,
                energyRegen: 2,
                energy: 1
            }),
            startingActions: ['basicAttack', 'basicBlock', 'knightsValor'],
            sprite: 'knight.jpg'
        }
        // More classes can be added here
    ];

    const handleClassSelect = (classData: CharacterClass) => {
        const character = Character.createFromClass(classData);
        onClassSelected(character);
    };

    return (
        <div className="class-selection">
            <h1>Choose Your Class</h1>
            <div className="class-list">
                {availableClasses.map(classData => (
                    <div key={uniqueId(classData.getName())} className="class-card">
                        {/*<img src={''classData.sprite''} alt={classData.getName()} />*/}
                        <h2>{classData.getName()}</h2>
                        <p>{classData.description}</p>
                        <button onClick={() => handleClassSelect(classData)}>
                            Select {classData.getName()}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};