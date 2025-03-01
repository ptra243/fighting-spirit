import React from "react";
import {Character} from "../../types/Character/Character";

export const BuffsList: React.FC<{ character: Character }> = ({character}) => {
    return (
        <div className="buffs-list">
            <h3>Active Effects</h3>
            <div className="buffs-container">
                {character.activeBuffs.map((buff, index) => (
                    <div key={index} className="buff-item">
                        {buff.name} ({buff.duration} turns)
                    </div>
                ))}
                {character.activeDOTs.map((dot, index) => (
                    <div key={index} className="dot-item">
                        {dot.getDescription()} ({dot.duration} turns)
                    </div>
                ))}
            </div>
        </div>
    );
};