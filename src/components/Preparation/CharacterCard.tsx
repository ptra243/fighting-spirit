import React, {useEffect, useState} from 'react';
import "../../styles/CharacterCardStyles.css";
import {Character} from "../../types/Character/Character";
import {SoldierSprite} from "../Battle/SoldierSprite";

interface CharacterCardProps {
    character?: Character
}

export const CharacterCard: React.FC<CharacterCardProps> = ({character}) => {
    // const {character} = useCharacter(); // Access character stats and actions from context
    const spritePath = '../../images/' + character.sprite;

    const [stats, setStats] = useState(character?.stats);
    // Update local state when character props change
    useEffect(() => {
        if (character?.stats) {
            setStats(character.stats);
        }
    }, [character?.stats]);


    if (!character || !stats) return null;

    return (
        <div className="character-card">
            <h2>{character.name}</h2>

            <div className="character-bar shield-bar">
                <p>Shield: {stats.shield}</p>
                <div className="bar-container">
                    <div
                        className="bar-inner"
                        style={{
                            width: `${stats.shield}%`,
                            backgroundColor: character.stats.shield > 50 ? 'blue' : 'gray',
                        }}
                    ></div>
                </div>
            </div>
            <div className="character-bar health-bar">
                <p>HP: {stats.hitPoints}/{character.stats.maxHitPoints}</p>
                <div className="bar-container">
                    <div
                        className="bar-inner"
                        style={{
                            width: `${Math.round(
                                (stats.hitPoints / character.stats.maxHitPoints) * 100
                            )}%`,
                            backgroundColor:
                                stats.hitPoints > character.stats.maxHitPoints / 2
                                    ? 'green'
                                    : 'red',
                        }}
                    ></div>
                </div>
            </div>
            <div className="character-bar energy-bar">
                <p>Energy: {stats.energy}/{character.stats.maxEnergy}</p>
                <div className="bar-container">
                    <div
                        className="bar-inner"
                        style={{
                            width: `${stats.energy}%`,
                            backgroundColor: stats.energy > 50 ? 'yellow' : 'orange',
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
