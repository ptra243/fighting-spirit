import {createCharacter} from "../Character/Character";
import {
    createAction,
    createAttack,
    createBuff,
    createDamageOverTime,
    createDebuff,
    createRecharge,
} from "../Actions/BehaviorFactories";
import {BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {createStats} from "../Character/CharacterStats";
import {CharacterEquipment} from "../Character/CharacterEquipment";

// Goblin Grunt
export const goblinGrunt = createCharacter({
    name: "Goblin Grunt",
    stats: createStats({
        hitPoints: 30,
        maxHitPoints: 30,
        attack: 1,
        defence: 0,
        hpRegen: 0,
        energyRegen: 1,
        energy: 10,
        maxEnergy: 10,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    baseStats: createStats({
        hitPoints: 30,
        maxHitPoints: 30,
        attack: 1,
        defence: 0,
        hpRegen: 0,
        energyRegen: 1,
        energy: 10,
        maxEnergy: 10,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Rusty Stab", createAttack("Rusty Stab", 3).behaviours, 1), // Low energy cost stab
        createAction("Scavenge", createRecharge("Scavenge", 2).behaviours, 2),     // Recharge energy
        createAction(
            "Weak Kick",
            [
                ...createAttack("Weak Kick", 2).behaviours,                             // Light attack
                ...createDebuff("Defense Down", BuffStat.Defense, -1, 1).behaviours,    // Reduce defense for 1 turn
            ],
            3
        )
    ],
    currentAction: 0,
    classes: [],
    triggers: [],
    activeBuffs: [],
    activeDOTs: [],
    sprite: '',
    isCharging: false,
    chargeTurns: 0
});

// Goblin Rogue
export const goblinRogue = createCharacter({
    name: "Goblin Rogue",
    stats: createStats({
        hitPoints: 35,
        maxHitPoints: 35,
        attack: 2,
        defence: 1,
        hpRegen: 1,
        energyRegen: 2,
        energy: 10,
        maxEnergy: 10,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction(
            "Poison Blade",
            [
                ...createAttack("Blade Attack", 1).behaviours,                          // Light attack
                ...createDamageOverTime("Poison", 1, 2).behaviours,                     // Poison effect for 2 turns
            ],
            2
        ),
        createAction(
            "Quick Strike",
            createAttack("Quick Strike", 3).behaviours,                           // Medium attack
            2
        ),
        createAction(
            "Shadow Step",
            [
                ...createBuff("Evasion Up", BuffStat.Defense, 2, 2).behaviours,        // Increase defense for 2 turns
                ...createRecharge("Focus", 1).behaviours,                               // Small energy recharge
            ],
            3
        )
    ]
});

// Export Easy Enemies as an array
export const EasyEnemies = [goblinGrunt, goblinRogue];
