// First, define trigger types and interfaces
import {IActionBehaviour} from "../Action";
import {CharacterStats} from "../../Character/CharacterStats";
import {Character} from "../../Character/Character";

export type TriggerType = 'beforeAction'| 'onAttack' | 'onDamageDealt' | 'onDamageTaken' | 'onHeal' | 'onBuff' | 'beforeDamageTaken' | 'afterAction';

export interface TriggerCondition {
    type: TriggerType;
    chance?: number; // For random triggers like crit
    requirement?: (character: Character, target?: Character) => boolean;
}

export interface TriggerEffect {
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
