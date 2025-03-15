import React, {useState} from 'react';
import '../../styles/PreparationScreenStyles.css';
import {EquipmentSection} from './EquipmentSection';
import {
    ExpandableState,
    ValidationState
} from '../../types/ui/Preparation/StatInterfaceDefinitions';
import {StatItem} from "./StatItemComponent";
import {EnemyPreview} from "./EnemyPreviewComponent";
import DragAndDropActions from "./DragAndDropActionManager";
import {useAppDispatch, useAppSelector} from "../../store/hooks/hooks";
import {characterUtils} from "../../types/Character/Character";
import {selectAICharacter, selectPlayerCharacter} from "../../store/character/characterSlice";
import {startBattle} from "../../store/battle/battleSlice";
import {selectCurrentRound} from '../../store/game/gameSlice';

export const PreparationScreenComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const playerCharacter = useAppSelector(selectPlayerCharacter);
    const aiCharacter = useAppSelector(selectAICharacter);
    const currentRound = useAppSelector(selectCurrentRound);

    const updatedPlayerCharacter = playerCharacter ? characterUtils.wrapCharacter(playerCharacter).applyOutOfBattleStats().build() : null;
    const [expandedSections, setExpandedSections] = useState<ExpandableState>({
        stats: false,
        equipment: false
    });

    const [validationState, setValidationState] = useState<ValidationState>({
        errors: null,
        hasAttempted: false
    });
    
    const requiredCards = currentRound + 3;

    const validateBattle = () => {
        if (!playerCharacter || !aiCharacter) {
            return false;
        }
        return playerCharacter.chosenActions.length >= requiredCards;
    };

    const handleStartBattle = () => {
        setValidationState({
            hasAttempted: true,
            errors: []
        });

        if (!playerCharacter || !aiCharacter) {
            setValidationState(prev => ({
                ...prev,
                errors: [...(prev.errors || []), "Characters not loaded properly"]
            }));
            return;
        }

        if (playerCharacter.chosenActions.length < requiredCards) {
            setValidationState(prev => ({
                ...prev,
                errors: [...(prev.errors || []), `You need to select at least ${requiredCards} actions`]
            }));
            return;
        }

        dispatch(startBattle());
    };

    const toggleSection = (section: keyof ExpandableState) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (!playerCharacter || !aiCharacter) {
        return <div>Loading characters...</div>;
    }

    return (
        <div className="preparation-layout">
            <div className="main-content">
                <div className="player-section">
                    <h1>{updatedPlayerCharacter?.name}'s Battle Preparation</h1>
                    <h1>Battle {currentRound}</h1>
                    <div className="stats-section">
                        <h3 className="section-header">Character Statistics</h3>
                        <div className="stats-grid">
                            <StatItem label="HP" value={updatedPlayerCharacter.stats.maxHitPoints}/>
                            <StatItem label="Attack" value={updatedPlayerCharacter.stats.attack}/>
                            <StatItem label="Defence" value={updatedPlayerCharacter.stats.defence}/>
                            <StatItem label="Starting Energy" value={updatedPlayerCharacter.stats.energy}/>
                            <StatItem label="Energy Regeneration" value={updatedPlayerCharacter.stats.energyRegen}/>
                            <StatItem label="HP Regeneration" value={updatedPlayerCharacter.stats.hpRegen}/>
                        </div>

                        <div className="expandable-section">
                            <button
                                className="expand-button"
                                onClick={() => toggleSection('equipment')}
                            >
                                {expandedSections.equipment ? '▼' : '▶'} Equipment
                            </button>
                            {expandedSections.equipment &&
                                <EquipmentSection equipment={updatedPlayerCharacter.equipment}/>}
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

            <EnemyPreview aiStats={aiCharacter} onStartBattle={handleStartBattle}/>
        </div>
    );
};