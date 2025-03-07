import React, {useState} from 'react';
import '../../styles/PreparationScreenStyles.css';
import {EquipmentSection} from './EquipmentSection';
import {
    ExpandableState,
    PreparationScreenProps,
    ValidationState
} from '../../types/ui/Preparation/StatInterfaceDefinitions';
import {StatItem} from "./StatItemComponent";
import {EnemyPreview} from "./EnemyPreviewComponent";
import DragAndDropActions from "./DragAndDropActionManager";
import {useBattleManager} from "../../store/hooks/hooks";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {characterUtils} from "../../types/Character/Character";

export const PreparationScreen: React.FC<PreparationScreenProps> = ({onStartBattle}) => {
    const {battleManager} = useBattleManager();

    let playerCharacter = useSelector((state: RootState) => state.character.playerCharacter);
    const aiCharacter = useSelector((state: RootState) => state.character.aiCharacter);


    playerCharacter = characterUtils.applyOutOfBattleStats(playerCharacter);
    const [expandedSections, setExpandedSections] = useState<ExpandableState>({
        stats: false,
        equipment: false
    });

    const [validationState, setValidationState] = useState<ValidationState>({
        errors: null,
        hasAttempted: false
    });
    let requiredCards: number = battleManager.getRound();
    requiredCards += 2;


    const handleStartBattle = () => {
        setValidationState(prev => ({...prev, hasAttempted: true}));
        const errors = battleManager.canStartBattle();

        if (errors.length === 0) {
            setValidationState(prev => ({...prev, errors: null}));
            // console.log({
            //     description: 'Classes before we start the battle',
            //     playerStateClasses: playerState.classes,
            //     battleManagerClasses: battleManager.player.classes
            // });
            // setPlayer(playerState);
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
                    <h1>{playerCharacter.name}'s Battle Preparation</h1>
                    <h1>Battle {battleManager.getRound()}</h1>
                    {/*<div>*/}
                    {/*    /!* First row animation *!/*/}
                    {/*    <SoldierSprite animation={SoldierAnimation.IDLE} showDebugControls={true} scale={2} frameHeight={100} frameWidth={100}/>*/}

                    {/*</div>*/}
                    <div className="stats-section">
                        <h3 className="section-header">Character Statistics</h3>
                        <div className="stats-grid">
                            <StatItem label="HP" value={playerCharacter.stats.maxHitPoints}/>
                            <StatItem label="Attack" value={playerCharacter.stats.attack}/>
                            <StatItem label="Defence" value={playerCharacter.stats.defence}/>
                            <StatItem label="Starting Energy" value={playerCharacter.stats.energy}/>
                            <StatItem label="Energy Regeneration" value={playerCharacter.stats.energyRegen}/>
                            <StatItem label="HP Regeneration" value={playerCharacter.stats.hpRegen}/>
                        </div>

                        <div className="expandable-section">
                            <button
                                className="expand-button"
                                onClick={() => toggleSection('equipment')}
                            >
                                {expandedSections.equipment ? '▼' : '▶'} Equipment
                            </button>
                            {expandedSections.equipment &&
                                <EquipmentSection equipment={playerCharacter.equipment.getEquippedItems()}/>}
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