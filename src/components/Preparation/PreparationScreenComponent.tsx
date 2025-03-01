import React, {useState} from 'react';
import '../../styles/PreparationScreenStyles.css';
import {useBattleManager} from "../../context/BattleManagerContext";
import {EquipmentSection} from './EquipmentSection';
import {
    ExpandableState,
    PreparationScreenProps,
    ValidationState
} from '../../types/ui/Preparation/StatInterfaceDefinitions';
import {StatItem} from "./StatItemComponent";
import {EnemyPreview} from "./EnemyPreviewComponent";
import DragAndDropActions from "./DragAndDropActionManager";

export const PreparationScreen: React.FC<PreparationScreenProps> = ({onStartBattle}) => {
    const {battleManager} = useBattleManager();
    const {player: character, ai: aiStats} = battleManager;

    const [expandedSections, setExpandedSections] = useState<ExpandableState>({
        stats: false,
        equipment: false
    });

    const [validationState, setValidationState] = useState<ValidationState>({
        errors: null,
        hasAttempted: false
    });
    let requiredCards: number = battleManager.getRound();
    requiredCards +=2;


    const handleStartBattle = () => {
        setValidationState(prev => ({...prev, hasAttempted: true}));
        const errors = battleManager.canStartBattle();

        if (errors.length === 0) {
            setValidationState(prev => ({...prev, errors: null}));
            onStartBattle();
        } else {
            setValidationState(prev => ({...prev, errors}));
        }
    };

    const toggleSection = (section: keyof ExpandableState) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="preparation-layout">
            <div className="main-content">
                <div className="player-section">
                    <h1>{character.name}'s Battle Preparation</h1>
                    <h1>Battle {battleManager.getRound()}</h1>

                    <div className="stats-section">
                        <h3 className="section-header">Character Statistics</h3>
                        <div className="stats-grid">
                            <StatItem label="HP" value={character.stats.maxHitPoints}/>
                            <StatItem label="Attack" value={character.stats.attack}/>
                            <StatItem label="Defence" value={character.stats.defence}/>
                            <StatItem label="Starting Energy" value={character.stats.energy}/>
                            <StatItem label="Energy Regeneration" value={character.stats.energyRegen}/>
                            <StatItem label="HP Regeneration" value={character.stats.hpRegen}/>
                        </div>

                        <div className="expandable-section">
                            <button
                                className="expand-button"
                                onClick={() => toggleSection('equipment')}
                            >
                                {expandedSections.equipment ? '▼' : '▶'} Equipment
                            </button>
                            {expandedSections.equipment && <EquipmentSection equipment={character.getEquipment()}/>}
                        </div>
                    </div>

                    <div className="action-selection">
                        <h2>Select Your Actions</h2>
                        {validationState.errors && (
                            <div className="error-message">
                                <ul>
                                    {validationState.errors.map((error, index) => (
                                        <li key={`error-${index}`}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="action-buttons">
                            <DragAndDropActions requiredCards={requiredCards}></DragAndDropActions>
                        </div>
                    </div>
                </div>
            </div>

            <EnemyPreview aiStats={aiStats} onStartBattle={handleStartBattle}/>
        </div>
    );
};