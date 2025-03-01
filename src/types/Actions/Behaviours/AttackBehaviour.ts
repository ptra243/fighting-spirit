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
    chargeTurns: number; // Number of turns required to charge
    isPrecharge: boolean;
    damage: number; // Damage dealt when charged is complete
    scale: AttackScalingStat;
    scaledPercent: number;

    constructor(name: string, chargeTurns: number, damage: number, isPreCharge: boolean = true, scale: AttackScalingStat = AttackScalingStat.Attack, scaledPercent: number = 100) {
        this.name = name;
        this.chargeTurns = chargeTurns;
        this.damage = damage;
        this.isPrecharge = isPreCharge;
        this.scale = scale;
        this.scaledPercent = scaledPercent;
    }

    execute(character: Character, target: Character): [Character, Character] {
        // If the character is not charging, start the charging process
        if (!character.isCharging && this.chargeTurns > 0) {
            const updatedCharacter = character.cloneWith({
                isCharging: true,
                chargeTurns: this.chargeTurns,
            });
            return [updatedCharacter, target];
        }

        // If charging is complete, perform the attack
        if ((character.isCharging && character.chargeTurns <= 1) || this.chargeTurns === 0) {

            // Determine which stat to scale with
            const scaledStat = this.getScaledStat(character);

            const scaledDamage = Math.floor(scaledStat * (this.scaledPercent / 100));

            // Calculate damage
            //get rid of (scaledStat * (1 + this.scaledPercent * 0.1))
            const totalDamage = this.damage + scaledDamage;

            // Apply damage to the target
            const updatedTarget = target.takeDamage(totalDamage,target);

            // Reset character charging state
            const updatedCharacter = character.cloneWith({
                isCharging: false,
                chargeTurns: 0  // Add this line to reset charge turns
            });


            // Return updated states of both character and target
            return [updatedCharacter, updatedTarget];
        }

        // Continue charging
        const updatedCharacter = character.cloneWith({
            chargeTurns: character.chargeTurns - character.stats.chargesPerTurn,
        });

        // Return updated character with one less charge turn
        return [updatedCharacter, target];

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

        // Add charge information if there are charge turns
        if (this.chargeTurns > 0) {
            description += `Charge ${this.chargeTurns}, `;
        }

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