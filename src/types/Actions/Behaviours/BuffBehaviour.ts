import {Character, characterUtils} from "../../Character/Character";
import {IBuffBehaviour} from "./BehaviourUnion";
import {TriggerManager} from "../Triggers/TriggerManager";
import {BuffContext} from "../Triggers/Trigger";

export enum BuffStat {
    Attack = "attack",
    Defense = "defence",
    Shield = "shield",
    Energy = "energy",
    HitPoints = "hitPoints",
    Speed = "speed",
    EnergyRegen = "energyRegen",
    HPRegen = "hpRegen",
    ChargesPerTurn = "chargesPerTurn",
}

export class BuffBehaviour implements IBuffBehaviour {
    readonly type = "buff";
    name: string;
    description: string;
    buffType: BuffStat;
    amount: number;
    duration: number;
    isSelfBuff: boolean;
    
    constructor(config: IBuffBehaviour) {
        this.name = config.name;
        this.buffType = config.buffType;
        this.amount = config.amount;
        this.duration = config.duration;
        this.isSelfBuff = config.isSelfBuff;
        this.description = this.getDescription();
    }

    getDescription(): string {
        const target = this.isSelfBuff ? "self" : "target";
        return `Buff ${target}'s ${this.buffType} by ${this.amount} for ${this.duration} turns`;
    }

    execute(character: Character, target: Character): [Character, Character] {
        const buffTarget = this.isSelfBuff ? character : target;
        const otherCharacter = this.isSelfBuff ? target : character;

        const updatedTarget = characterUtils
            .wrapCharacter(buffTarget)
            .addBuff(this)
            .build();

        return this.isSelfBuff ? [updatedTarget, otherCharacter] : [otherCharacter, updatedTarget];
    }
}