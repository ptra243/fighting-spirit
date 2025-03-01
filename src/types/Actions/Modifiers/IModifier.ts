import {Character} from "../../Character/Character";

export class Modifier {
    name: string;
    type: string; // e.g. "damage", "scaling", "cost", "dotDuration", "beforeTrigger", "afterTrigger"
    value: number; // Flat or percentage value (e.g., +5 damage, 20% decrease in cost)
    scaleStat?: string; // Optional stat for scaling, like "attackPower" or "defensePower"
    condition?: (character: Character, target: Character) => boolean; // Optional condition for applying the modifier
    onBefore?: (character: Character, target: Character) => void; // Optional "before execution" trigger
    onAfter?: (character: Character, target: Character) => void; // Optional "after execution" trigger
}
