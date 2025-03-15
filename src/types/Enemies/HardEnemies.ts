import {
    createAction,
    createAttack,
    createBuff,
    createDamageOverTime,
    createDebuff,
    createHeal
} from "../Actions/BehaviorFactories";
import {BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {createCharacter} from "../Character/Character";
import {createStats} from "../Character/CharacterStats";
import {CharacterEquipment} from "../Character/CharacterEquipment";

export const Lich = createCharacter({
    name: "Lich",
    stats: createStats({
        hitPoints: 55,
        maxHitPoints: 55,
        attack: 5,
        defence: 3,
        hpRegen: 2,
        energyRegen: 4,
        energy: 20,
        maxEnergy: 20,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Dark Heal", createHeal("Dark Heal", 8).behaviours, 3),
        createAction("Shadow Bolt", createAttack("Shadow Bolt", 7).behaviours, 2),
        createAction(
            "Weaken",
            createDebuff("Attack Down", BuffStat.Attack, -2, 2).behaviours,
            3
        )
    ]
});

export const cursedKnight = createCharacter({
    name: "Cursed Knight",
    stats: createStats({
        hitPoints: 80,
        maxHitPoints: 80,
        attack: 12,
        defence: 8,
        hpRegen: 3,
        energyRegen: 2,
        energy: 20,
        maxEnergy: 20,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Dark Cleave", createAttack("Dark Cleave", 10).behaviours, 5),
        createAction("Unholy Barrier", createBuff("Defense Boost", BuffStat.Defense, 5, 3).behaviours, 4),
        createAction("Life Drain", [
            ...createAttack("Life Drain", 8).behaviours,
            ...createHeal("Drain Heal", 6).behaviours,
        ], 6),
        createAction("Cursed Slash", [
            ...createAttack("Cursed Slash", 9).behaviours,
            ...createDebuff("Attack Down", BuffStat.Attack, -2, 2).behaviours,
        ], 4),
        createAction("Unholy Fire", [
            ...createDamageOverTime("Burn", 3, 3).behaviours,
            ...createAttack("Fire Strike", 6).behaviours
        ], 5)
    ]
});

export const dragonWhelp = createCharacter({
    name: "Dragon Whelp",
    stats: createStats({
        hitPoints: 70,
        maxHitPoints: 70,
        attack: 15,
        defence: 6,
        hpRegen: 2,
        energyRegen: 3,
        energy: 20,
        maxEnergy: 20,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Fire Breath", createAttack("Fire Breath", 12).behaviours, 4),
        createAction("Wing Slash", createAttack("Wing Slash", 8).behaviours, 2),
        createAction("Dragon Roar", [
            ...createDebuff("Fear", BuffStat.Attack, -4, 2).behaviours,
        ], 3),
        createAction("Lava Burst", [
            ...createDamageOverTime("Lava Burn", 4, 3).behaviours,
            ...createAttack("Burst", 6).behaviours
        ], 5)
    ]
});

export const demonLord = createCharacter({
    name: "Demon Lord",
    stats: createStats({
        hitPoints: 100,
        maxHitPoints: 100,
        attack: 20,
        defence: 10,
        hpRegen: 4,
        energyRegen: 3,
        energy: 25,
        maxEnergy: 25,
        shield: 0,
        speed: 25,
        chargesPerTurn: 1,
        actionCounter: 0
    }),
    equipment: [],
    chosenActions: [
        createAction("Hellfire", [
            ...createAttack("Hellfire", 15).behaviours,
            ...createDamageOverTime("Hellfire Burn", 3, 3).behaviours
        ], 6),
        createAction("Dark Aura", [
            ...createDebuff("Defense Down", BuffStat.Defense, -3, 3).behaviours,
        ], 3),
        createAction("Chains of Despair", [
            ...createDebuff("Energy Drain", BuffStat.Energy, -2, 3).behaviours,
            ...createAttack("Chain Strike", 8).behaviours
        ], 5),
        createAction("Demonic Fury", [
            ...createBuff("Demonic Power", BuffStat.Attack, 5, 2).behaviours,
            ...createAttack("Fury Strike", 12).behaviours
        ], 7)
    ]
});

export const HardEnemies = [cursedKnight, dragonWhelp, Lich, demonLord];