import {Player} from "../../types/Player/Player";
import {Character, createCharacter} from "../../types/Character/Character";
import {CharacterStats, createStats} from "../../types/Character/CharacterStats";
import {CharacterEquipment} from "../../types/Character/CharacterEquipment";
import {basicAttack, basicBlock} from "../../types/Actions/PredefinedActions/KnightActions";

export const createInitialPlayer = (): Player => {

    return {              // Reference to an existing or new Character object
        gold: 10,                  // Starting gold
        availableActions: [basicAttack(), basicAttack(), basicBlock()],      // Initial list of available actions
        preparationPointsLeft: 0   // Initial preparation points (customize as needed)
    }
};
export const createInitialCharacter = (): Character => {
    return createCharacter({
        name: "Hero",
        stats: createStats({
            maxHitPoints: 50,
            attack: 2,
            defence: 2,
            energyRegen: 2,
            energy: 1,
            speed: 25,
            maxEnergy: 10,
            hpRegen: 1,
            chargesPerTurn: 1,
        }),
        chosenActions: [],
        sprite: 'knight.jpg',
    });
};

export function createAICharacter(name: string, stats: Partial<CharacterStats>): Character {
    const baseStats = createStats({
        hitPoints: 100,
        maxHitPoints: 100,
        shield: 0,
        attack: 10,
        defence: 5,
        energy: 100,
        maxEnergy: 100,
        energyRegen: 10,
        hpRegen: 0,
        ...stats
    });

    return createCharacter({
        name,
        stats: baseStats,
        equipment: []
    });
}
