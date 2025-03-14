import type {Character} from "../../Character/Character";
import {ActionTrigger, TriggerContext, TriggerType} from "./Trigger";

// First, let's define a common trigger management system
export interface TriggerManager {
    triggers: ActionTrigger[];

    addTrigger(trigger: ActionTrigger): void;

    removeTrigger(trigger: ActionTrigger): void;

    executeTriggers<T extends TriggerContext>(
        triggerType: TriggerType,
        character: Character,
        target: Character,
        context?: T
    ): [Character, Character];
}

// Base trigger manager implementation
export class BaseTriggerManager implements TriggerManager {
    triggers: ActionTrigger[] = [];

    constructor(triggers: ActionTrigger[] = []) {
        this.triggers = triggers;
    }

    addTrigger(trigger: ActionTrigger): void {
        this.triggers.push(trigger);
    }

    removeTrigger(trigger: ActionTrigger): void {
        this.triggers = this.triggers.filter(t => t !== trigger);
    }

    executeTriggers<T extends TriggerContext>(
        triggerType: TriggerType,
        character: Character,
        target: Character,
        context?: T
    ): [Character, Character] {
        let updatedCharacter = character;
        let updatedTarget = target;

        for (const trigger of this.triggers) {
            if (trigger.condition.type !== triggerType || trigger.hasBeenTriggered) continue;

            if (trigger.condition.chance && Math.random() > trigger.condition.chance) continue;

            if (trigger.condition.requirement &&
                !trigger.condition.requirement(updatedCharacter, updatedTarget)) continue;

            if (trigger.effect.execute)
                [updatedCharacter, updatedTarget] = trigger.effect.execute(
                    updatedCharacter,
                    updatedTarget,
                    context
                );
            if (trigger.effect.behaviour)
                [updatedCharacter, updatedTarget] = trigger.effect.behaviour.execute(
                    updatedCharacter,
                    updatedTarget
                );
            trigger.hasBeenTriggered = true;
        }

        return [updatedCharacter, updatedTarget];
    }

    resetTriggers() {
        this.triggers.forEach((t) => {
            t.hasBeenTriggered = false
        })

    }
}
