// ShieldBehavior.ts
import type { Character } from "../../Character/Character";
import { CharacterStats, createStats } from "../../Character/CharacterStats";
import { TriggerManager } from "../Triggers/TriggerManager";
import { IActionBehaviour } from "../Action";

export class ShieldBehaviour implements IActionBehaviour {
    type: "shield";
    name: string;
    description: string;
    shieldAmount: number;

    constructor(name: string, shieldAmount: number) {
        this.type = "shield";
        this.name = name;
        this.description = `Gain ${shieldAmount} shield`;
        this.shieldAmount = shieldAmount;
    }

    execute(source: Character, target: Character, triggerManager: TriggerManager): [Character, Character] {
        const newStats = createStats({
            ...source.stats,
            shield: source.stats.shield + this.shieldAmount,
        });

        const newSource = {
            ...source,
            stats: newStats
        };

        return [newSource, target];
    }

    getDescription(): string {
        let description = 'Self. '; // Since shield is always self-targeted

        // Add "Gain" and shield amount
        description += `Gain ${this.shieldAmount} Shield`;
        description += '.';

        return description;
    }
}