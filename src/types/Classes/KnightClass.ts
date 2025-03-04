// src/types/Classes/KnightClass.ts
import {CharacterClass, ClassStats} from "./CharacterClass";
import {Character} from "../Character/Character";
import {IActionBehaviour} from "../Actions/Action";
import {ActionTrigger, TriggerCondition, TriggerEffect} from "../Actions/Triggers/Trigger";

const KNIGHT_STATS_PER_LEVEL: ClassStats = {
    hitPoints: 10,
    attack: 5,
    defence: 5,
    hpRegen: 1,
    energyRegen: 0,
    energy: 0
};

class BuffAmplifierTrigger implements ActionTrigger {
    condition: TriggerCondition = {
        type: 'onApplyBuff'
    };

    effect: TriggerEffect = {
        execute(character: Character, target: Character, context: any): [Character, Character] {
            if (context.buff) {
                context.buff.amount *= 2;
                context.buff.duration += 1;
            }
            return [character, target];
        },
        behaviour: null
    };
}


export class KnightClass extends CharacterClass {
    constructor() {
        super("Knight", KNIGHT_STATS_PER_LEVEL);
    }

    override levelUp(character: Character): Character {
        let updatedCharacter = super.levelUp(character);

        if (this.level == 1) {
            //add buff trigger
            updatedCharacter.addTrigger(new BuffAmplifierTrigger())
        }
        return updatedCharacter
    }
}

