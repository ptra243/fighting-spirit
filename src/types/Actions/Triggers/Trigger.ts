// First, define trigger types and interfaces
import {IActionBehaviour} from "../Action";
import {CharacterStats} from "../../Character/CharacterStats";
import type {Character} from "../../Character/Character";
import {BuffBehaviour} from "../Behaviours/BuffBehaviour";
import {AttackBehaviour} from "../Behaviours/AttackBehaviour";

export type TriggerType =
    'turnStart'
    | 'beforeAction'
    | 'onAttack'
    | 'onDamageDealt'
    | 'onDamageTaken'
    | 'onHeal'
    | 'onApplyBuff'
    | 'onApplyDebuff'
    | 'beforeDamageTaken'
    | 'afterAction'
    | 'turnEnd';

export interface TriggerContext {
    actionName?: string;
}

export interface BeforeActionContext extends TriggerContext {
    attackBonus?: number;
}

export interface AttackContext extends TriggerContext {
    attack: AttackBehaviour;
    isCritical?: boolean;
    damageMultiplier?: number;
}

export interface DamageContext extends TriggerContext {
    totalDamage: number
}

export interface BuffContext extends TriggerContext {
    buff: BuffBehaviour

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
    hasBeenTriggered: boolean;
    condition: TriggerCondition;
    effect: TriggerEffect;
}
