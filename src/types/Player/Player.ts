// types/Player/Player.ts
import { Character } from "../Character/Character";
import { Action } from "../Actions/Action";
import { Equipment } from "../Equipment/Equipment";

export class Player {
    character: Character;
    gold: number;
    availableActions: Action[];
    preparationPointsLeft: number;

    constructor(character: Character, gold: number = 0) {
        this.character = character;
        this.gold = gold;
        this.availableActions = character.actions; // Move actions from character to player
        this.preparationPointsLeft = 3; // Player gets 3 preparation points per round
    }

    addGold(amount: number) {
        this.gold += amount;
    }

    spendGold(amount: number): boolean {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    addAction(action: Action) {
        this.availableActions.push(action);
    }

    usePreparationPoint(): boolean {
        if (this.preparationPointsLeft > 0) {
            this.preparationPointsLeft--;
            return true;
        }
        return false;
    }
}
