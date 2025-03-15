import {Character, characterUtils} from "../../Character/Character";
import {IAttackBehaviour} from "./BehaviourUnion";

export enum AttackScalingStat {
    Attack = "attack",
    Defense = "defense",
    Shield = "shield",
    Energy = "energy",
    Health = "hitPoints"
}

export class AttackBehaviour implements IAttackBehaviour {
    readonly type = "attack";
    name: string;
    description: string;
    damage: number;
    scale: AttackScalingStat;
    scaledPercent: number;
    ignoreDefence: boolean;
    
    constructor(config: IAttackBehaviour) {
        this.name = config.name;
        this.damage = config.damage;
        this.scale = config.scale;
        this.scaledPercent = config.scaledPercent;
        this.ignoreDefence = config.ignoreDefence;
        this.description = this.getDescription();
    }

    getDescription(): string {
        return `Deal ${this.damage} damage (${this.scaledPercent}% ${this.scale} scaling)${this.ignoreDefence ? ' (ignores defence)' : ''}`;
    }

    private getScaledStat(character: Character): number {
        switch (this.scale) {
            case AttackScalingStat.Attack:
                return character.stats.attack;
            case AttackScalingStat.Defense:
                return character.stats.defence;
            case AttackScalingStat.Shield:
                return character.stats.shield;
            case AttackScalingStat.Energy:
                return character.stats.energy;
            case AttackScalingStat.Health:
                return character.stats.hitPoints;
            default:
                return 0;
        }
    }

    execute(character: Character, target: Character): [Character, Character] {
        const scaledStat = this.getScaledStat(character);
        const scaledDamage = Math.floor(scaledStat * (this.scaledPercent / 100));
        const totalDamage = this.damage + scaledDamage;

        const updatedTarget = characterUtils
            .wrapCharacter(target)
            .takeDamage(totalDamage, character, this.ignoreDefence)
            .build();

        return [character, updatedTarget];
    }
}