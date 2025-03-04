
// First, define trigger types and interfaces
import {IActionBehaviour} from "../Action";
import {CharacterStats} from "../../Character/CharacterStats";
import {Character} from "../../Character/Character";
import { BuffStat } from "../Behaviours/BuffBehaviour";

export type TriggerType = 'beforeAction'| 'onAttack' | 'onDamageDealt' | 'onDamageTaken' | 'onHeal' | 'onApplyBuff'| 'onApplyDebuff' | 'beforeDamageTaken' | 'afterAction';

export interface TriggerContext {
    actionName?: string;
}

export interface BeforeActionContext extends TriggerContext {
    attackBonus?: number;
}

export interface AttackContext extends TriggerContext {
    damage: number;
    isCritical?: boolean;
    damageMultiplier?: number;
}

export interface DamageContext extends TriggerContext {
    damage: number;
    damageType?: string;
}

export interface BuffContext extends TriggerContext {
    buff: {
        amount: number;
        duration: number;
        buffType: BuffStat;
    }
}


export interface TriggerCondition {
    type: TriggerType;
    chance?: number; // For random triggers like crit
    requirement?: (character: Character, target?: Character) => boolean;
}

export interface TriggerEffect {
    execute: (character: Character, target: Character, context: any) => [Character, Character];
    behaviour: IActionBehaviour;
    // modifiers?: Modifier[];
    scaling?: {
        stat: keyof CharacterStats;
        scale: number;
    };
}

export interface ActionTrigger {
    condition: TriggerCondition;
    effect: TriggerEffect;
}
