import {Character} from "../../../types/Character/Character";
import {CharacterStats} from "../../../types/Character/CharacterStats";
import {Accessory, Armor, EquipmentType, Weapon} from "../../../types/Equipment/EquipmentClassHierarchy";
import {StatBuilder} from "../../../types/Character/CharacterStatBuilder";
import {CharacterEquipment} from "../../../types/Character/CharacterEquipment";

describe('Equipment System Tests', () => {
    let character: Character;
    let baseStats: CharacterStats;

    // Test equipment
    const testWeapon: Weapon = {
        name: 'Test Sword',
        type: EquipmentType.WEAPON,
        boostAttack: 10,
        boostDefence: 0,
        boostHitPoints: 0,
        buffs: []
    } as Weapon;

    const testArmor: Armor = {
        name: 'Test Armor',
        type: EquipmentType.ARMOR,
        boostAttack: 0,
        boostDefence: 15,
        boostHitPoints: 20,
        buffs: []
    } as Armor;

    const testAccessory: Accessory = {
        name: 'Test Ring',
        type: EquipmentType.ACCESSORY,
        boostAttack: 5,
        boostDefence: 5,
        boostHitPoints: 10,
        buffs: []
    } as Accessory;

    beforeEach(() => {
        baseStats = new CharacterStats({
            hitPoints: 100,
            maxHitPoints: 100,
            attack: 20,
            defence: 10,
            energy: 100,
            maxEnergy: 100,
            energyRegen: 10,
            hpRegen: 0
        });

        character = new Character({
            name: 'Test Character',
            stats: baseStats,
            actions: [],
            equipment: new CharacterEquipment()
        });
    });

    describe('Equipment Management', () => {
        test('should successfully equip a weapon', () => {
            const updatedEquipment = character.equipment.addEquipment(testWeapon);
            const newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            expect(newCharacter.equipment.weapon).toEqual(testWeapon);
            expect(newCharacter.equipment.getEquippedItems()).toHaveLength(1);
        });

        test('should successfully equip full set of equipment', () => {
            const updatedEquipment = character.equipment
                .addEquipment(testWeapon)
                .addEquipment(testArmor)
                .addEquipment(testAccessory);

            const newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            expect(newCharacter.equipment.weapon).toEqual(testWeapon);
            expect(newCharacter.equipment.armor).toEqual(testArmor);
            expect(newCharacter.equipment.accessory).toEqual(testAccessory);
            expect(newCharacter.equipment.getEquippedItems()).toHaveLength(3);
        });

        test('should successfully remove equipment', () => {
            let updatedEquipment = character.equipment
                .addEquipment(testWeapon)
                .addEquipment(testArmor);

            let newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            updatedEquipment = newCharacter.equipment.removeEquipment(testWeapon.name);
            newCharacter = new Character({
                ...newCharacter,
                equipment: updatedEquipment
            });

            expect(newCharacter.equipment.weapon).toBeUndefined();
            expect(newCharacter.equipment.armor).toEqual(testArmor);
            expect(newCharacter.equipment.getEquippedItems()).toHaveLength(1);
        });
    });

    describe('Equipment Stats Application', () => {
        test('should correctly calculate total equipment stats', () => {
            const updatedEquipment = character.equipment
                .addEquipment(testWeapon)
                .addEquipment(testArmor)
                .addEquipment(testAccessory);

            const newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            const totalStats = newCharacter.equipment.calculateTotalStats();

            expect(totalStats.attack).toBe(15); // 10 from weapon + 5 from accessory
            expect(totalStats.defence).toBe(20); // 15 from armor + 5 from accessory
            expect(totalStats.hitPoints).toBe(30); // 20 from armor + 10 from accessory
        });

        test('should apply equipment stats in combat calculations', () => {
            const updatedEquipment = character.equipment
                .addEquipment(testWeapon)
                .addEquipment(testArmor)
                .addEquipment(testAccessory);

            const newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            // Build stats with equipment
            const builder = new StatBuilder(newCharacter);
            const result = builder.applyEquipmentBuffs().build();

            // Check if stats are properly increased
            expect(result.stats.attack).toBe(baseStats.attack + 15);
            expect(result.stats.defence).toBe(baseStats.defence + 20);
            expect(result.stats.maxHitPoints).toBe(baseStats.maxHitPoints + 30);
        });
    });

    describe('Equipment Combat Integration', () => {
        test('should apply equipment bonuses when taking damage', () => {
            // Setup characters - one with armor, one without
            const characterWithArmor = character.addEquipment(testArmor);

            const damageAmount = 50;

            // Create builders and apply equipment buffs
            const builderWithoutArmor = new StatBuilder(character)
                .applyEquipmentBuffs();
            const builderWithArmor = new StatBuilder(characterWithArmor)
                .applyEquipmentBuffs();

            // Apply damage to both characters
            const resultWithoutArmor = builderWithoutArmor
                .takeDamage(damageAmount)
                .build();
            const resultWithArmor = builderWithArmor
                .takeDamage(damageAmount)
                .build();

            const damageTakenWithoutArmor = resultWithoutArmor.stats.maxHitPoints - resultWithoutArmor.stats.hitPoints;
            const damageTakenWithArmor = resultWithArmor.stats.maxHitPoints - resultWithArmor.stats.hitPoints;
            // Calculate actual damage taken by each character
            // Verify that armor reduces damage correctly

            expect(resultWithArmor.stats.defence).toBe(characterWithArmor.baseStats.defence + testArmor.boostDefence);
            expect(resultWithoutArmor.stats.defence).toBe(character.baseStats.defence);
            expect(damageTakenWithoutArmor).toBe(damageAmount - character.stats.defence); // Base defense only
            expect(damageTakenWithArmor).toBe(damageAmount - (characterWithArmor.baseStats.defence + testArmor.boostDefence)); // Base + armor defense
            expect(damageTakenWithoutArmor - damageTakenWithArmor).toBe(testArmor.boostDefence); // Difference should equal armor bonus
        });


        test('should apply equipment attack bonus when calculating damage', () => {
            const updatedEquipment = character.equipment.addEquipment(testWeapon);
            const newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            const builder = new StatBuilder(newCharacter);
            const result = builder.applyEquipmentBuffs().build();

            expect(result.stats.attack).toBe(baseStats.attack + testWeapon.boostAttack);
        });
    });
});
