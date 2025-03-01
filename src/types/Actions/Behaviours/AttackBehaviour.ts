import {IAttackBehaviour} from "./BehaviourUnion";
import {Character} from "../../Character/Character";
import {CharacterStats} from "../../Character/CharacterStats";

export enum AttackScalingStat {
    Attack = "attack",
    Defense = "defense",
    Shield = "shield",
    Energy = "energy",
    Health = "health"
}

export class AttackBehaviour implements IAttackBehaviour {
    name: string;
    damage: number; // Damage dealt when charged is complete
    scale: AttackScalingStat;
    scaledPercent: number;
    ignoreDefence: boolean

    constructor(name: string, damage: number, scale: AttackScalingStat = AttackScalingStat.Attack, scaledPercent: number = 100, ignoreDefence: boolean = false) {
        this.name = name;
        this.damage = damage;
        this.scale = scale;
        this.scaledPercent = scaledPercent;
        this.ignoreDefence = ignoreDefence;
    }

    execute(character: Character, target: Character): [Character, Character] {
        // Determine which stat to scale with
        const scaledStat = this.getScaledStat(character);

        const scaledDamage = Math.floor(scaledStat * (this.scaledPercent / 100));

        // Calculate damage
        //get rid of (scaledStat * (1 + this.scaledPercent * 0.1))
        const totalDamage = this.damage + scaledDamage;

        // Apply damage to the target
        let updatedTarget = target.takeDamage(totalDamage, character, this.ignoreDefence);

        let updatedCharacter = character;

        // Execute onDamageDealt triggers for the attacker
        [updatedCharacter, updatedTarget] = character.triggerManager.executeTriggers(
            'onDamageDealt',
            updatedCharacter,
            updatedTarget,
            { totalDamage }
        );

        // Execute onDamageTaken triggers for the target
        [updatedTarget, updatedCharacter] = updatedTarget.triggerManager.executeTriggers(
            'onDamageTaken',
            updatedTarget,
            updatedCharacter,
            { totalDamage }
        );


        // Return updated states of both character and target
        return [updatedCharacter, updatedTarget];

    }

    getScaledStat(character: Character): number {
        switch (this.scale) {
            case AttackScalingStat.Attack:
                return character.stats.attack;
            case AttackScalingStat.Defense:
                return character.stats.defence;
            case AttackScalingStat.Energy:
                return character.stats.energy;
            case AttackScalingStat.Shield:
                return character.stats.shield;
            case AttackScalingStat.Health:
                return character.stats.hitPoints;
            default:
                return 1; // Fallback in case of an invalid scale
        }
    }

    getDescription(): string {
        let description = '';

        // Add damage and scaling information
        description += `Deal ${this.damage} `;

        // Add scaling stat with proper capitalization
        if (this.scale) {
            const scaledStatName = this.scale.charAt(0).toUpperCase() + this.scale.slice(1);
            description += `${scaledStatName} `;
        }

        description += 'Damage';

        // Add scaling percentage if it's different from 100%
        if (this.scaledPercent !== 100) {
            description += ` (${this.scaledPercent}% scaling)`;
        }

        return description;
    }

    type: "attack";

}