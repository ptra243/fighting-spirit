// src/types/Classes/KnightClass.ts
import {CharacterClass} from "./CharacterClass";
import {Character} from "../Character/Character";
import {ActionTrigger, BuffContext, TriggerCondition, TriggerEffect} from "../Actions/Triggers/Trigger";
import {CharacterStats} from "../Character/CharacterStats";
import {createAttack} from "../Actions/BehaviorFactories";

const KNIGHT_STATS_PER_LEVEL = new CharacterStats({
    maxHitPoints: 10,
    attack: 5,
    defence: 5,
    hpRegen: 1,
    energyRegen: 0.5,
    maxEnergy: 0.5
});

class BuffAmplifierTrigger implements ActionTrigger {
    hasBeenTriggered: false;
    condition: TriggerCondition = {
        type: 'onApplyBuff'
    };

    effect: TriggerEffect = {
        execute(character: Character, target: Character, context: BuffContext): [Character, Character] {
            console.log({description: 'buff trigger', context: context,});
            if (context.buff) {
                context.buff.amount *= 2;
                context.buff.duration += 1;
            }
            return [character, target];
        },
        behaviour: null
    };
}

class ExtraAttackTrigger implements ActionTrigger {
    hasBeenTriggered: false;
    condition: TriggerCondition = {type: "onAttack"};
    effect: TriggerEffect;

    constructor() {
        this.effect = {execute: null, behaviour: createAttack("Basic Slash", 1)};
    }
}


export class KnightClass extends CharacterClass {
    constructor(name, statsPerLevel, level: number) {
        super(name || "Knight", statsPerLevel || KNIGHT_STATS_PER_LEVEL, level);
        this.description = 'A class that is balanced in attack and defence. Specialises in setting up buffs on themselves and then delivering devastating damage';
    }

    override levelUp(character: Character): Character {
        let updatedCharacter = super.levelUp(character);

        if (this.level == 1) {
            //add buff trigger
            updatedCharacter.addTrigger(new BuffAmplifierTrigger())

        }

        if (this.level == 2) {
            //add buff trigger
            updatedCharacter.addTrigger(new ExtraAttackTrigger())
        }

        return updatedCharacter
    }
}

