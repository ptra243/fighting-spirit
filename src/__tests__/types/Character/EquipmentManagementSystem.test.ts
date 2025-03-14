import { Character, createCharacter } from "../../../types/Character/Character";
import { CharacterStats, createStats } from "../../../types/Character/CharacterStats";
import { Accessory, Armor, EquipmentType, Weapon } from "../../../types/Equipment/EquipmentClassHierarchy";
import { StatBuilder } from "../../../types/Character/CharacterStatBuilder";
import { CharacterEquipment } from "../../../types/Character/CharacterEquipment";

describe('Equipment Management System', () => {
    let baseStats: CharacterStats;
    let character: Character;
    let weapon: Weapon;
    let armor: Armor;
    let accessory: Accessory;

    beforeEach(() => {
        baseStats = createStats({
            hitPoints: 100,
            maxHitPoints: 100,
            shield: 0,
            attack: 10,
            defence: 5,
            energy: 100,
            maxEnergy: 100,
            energyRegen: 10,
            hpRegen: 0
        });

        character = createCharacter({
            name: 'Test Character',
            stats: baseStats,
            equipment: new CharacterEquipment()
        });

        weapon = {
            type: EquipmentType.WEAPON,
            name: "Test Weapon",
            boostAttack: 5,
            boostDefence: 0,
            boostHitPoints: 0,
            buffs: []
        } as Weapon;

        armor = {
            type: EquipmentType.ARMOR,
            name: "Test Armor",
            boostAttack: 0,
            boostDefence: 5,
            boostHitPoints: 10,
            buffs: []
        } as Armor;

        accessory = {
            type: EquipmentType.ACCESSORY,
            name: "Test Accessory",
            boostAttack: 2,
            boostDefence: 2,
            boostHitPoints: 5,
            buffs: []
        } as Accessory;
    });

    describe('Equipment Management', () => {
        test('should successfully equip a weapon', () => {
            const updatedEquipment = character.equipment.addEquipment(weapon);
            const newCharacter = createCharacter({
                name: character.name,
                stats: character.stats,
                equipment: updatedEquipment
            });

            expect(newCharacter.equipment.weapon).toEqual(weapon);
            expect(newCharacter.equipment.getEquippedItems()).toHaveLength(1);
        });

        test('should successfully equip full set of equipment', () => {
            const updatedEquipment = character.equipment
                .addEquipment(weapon)
                .addEquipment(armor)
                .addEquipment(accessory);

            const newCharacter = createCharacter({
                name: character.name,
                stats: character.stats,
                equipment: updatedEquipment
            });

            expect(newCharacter.equipment.weapon).toEqual(weapon);
            expect(newCharacter.equipment.armor).toEqual(armor);
            expect(newCharacter.equipment.accessory).toEqual(accessory);
            expect(newCharacter.equipment.getEquippedItems()).toHaveLength(3);
        });

        test('should successfully remove equipment', () => {
            let updatedEquipment = character.equipment
                .addEquipment(weapon)
                .addEquipment(armor);

            let newCharacter = createCharacter({
                name: character.name,
                stats: character.stats,
                equipment: updatedEquipment
            });

            updatedEquipment = newCharacter.equipment.removeEquipment(weapon.name);
            newCharacter = createCharacter({
                name: newCharacter.name,
                stats: newCharacter.stats,
                equipment: updatedEquipment
            });

            expect(newCharacter.equipment.weapon).toBeUndefined();
            expect(newCharacter.equipment.armor).toEqual(armor);
            expect(newCharacter.equipment.getEquippedItems()).toHaveLength(1);
        });

        test('should correctly calculate total equipment stats', () => {
            const updatedEquipment = character.equipment
                .addEquipment(weapon)
                .addEquipment(armor)
                .addEquipment(accessory);

            const newCharacter = createCharacter({
                name: character.name,
                stats: character.stats,
                equipment: updatedEquipment
            });

            const totalStats = newCharacter.equipment.calculateTotalStats();
            expect(totalStats.attack).toBe(weapon.boostAttack + armor.boostAttack + accessory.boostAttack);
            expect(totalStats.defence).toBe(weapon.boostDefence + armor.boostDefence + accessory.boostDefence);
            expect(totalStats.hitPoints).toBe(weapon.boostHitPoints + armor.boostHitPoints + accessory.boostHitPoints);
        });

        test('should apply equipment stats in combat calculations', () => {
            const updatedEquipment = character.equipment
                .addEquipment(weapon)
                .addEquipment(armor)
                .addEquipment(accessory);

            const newCharacter = createCharacter({
                name: character.name,
                stats: character.stats,
                equipment: updatedEquipment
            });

            const builder = new StatBuilder(newCharacter);
            const result = builder.applyEquipmentBuffs().build();

            expect(result.stats.attack).toBe(baseStats.attack + weapon.boostAttack);
        });
    });

    describe('Equipment Combat Integration', () => {
        test('should apply equipment bonuses when taking damage', () => {
            // Setup characters - one with armor, one without
            const characterWithArmor = characterUtils.wrapCharacter(character)
                .addEquipment(armor).build();

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

            expect(resultWithArmor.stats.defence).toBe(characterWithArmor.baseStats.defence + armor.boostDefence);
            expect(resultWithoutArmor.stats.defence).toBe(character.baseStats.defence);
            expect(damageTakenWithoutArmor).toBe(damageAmount - character.stats.defence); // Base defense only
            expect(damageTakenWithArmor).toBe(damageAmount - (characterWithArmor.baseStats.defence + armor.boostDefence)); // Base + armor defense
            expect(damageTakenWithoutArmor - damageTakenWithArmor).toBe(armor.boostDefence); // Difference should equal armor bonus
        });


        test('should apply equipment attack bonus when calculating damage', () => {
            const updatedEquipment = character.equipment.addEquipment(weapon);
            const newCharacter = new Character({
                ...character,
                equipment: updatedEquipment
            });

            const builder = new StatBuilder(newCharacter);
            const result = builder.applyEquipmentBuffs().build();

            expect(result.stats.attack).toBe(baseStats.attack + weapon.boostAttack);
        });
    });
});
