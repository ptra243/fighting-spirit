import { Character, createCharacter } from "../../../types/Character/Character";
import { CharacterStats, createStats } from "../../../types/Character/CharacterStats";
import { BuffBehaviour, BuffStat } from "../../../types/Actions/Behaviours/BuffBehaviour";
import { StatBuilder } from "../../../types/Character/CharacterStatBuilder";
import { DamageOverTimeBehaviour } from "../../../types/Actions/Behaviours/DamageOverTimeBehaviour";
import { CharacterEquipment } from "../../../types/Character/CharacterEquipment";
import { IBuffBehaviour } from "../../../types/Actions/Behaviours/BehaviourUnion";

describe('Character Turn Effects', () => {
    describe('StatBuilder', () => {
        it('should apply single buff effects to character stats', () => {
            // Create initial character stats
            const initialStats = createStats({
                attack: 10,
                defence: 5,
                hitPoints: 100,
                maxHitPoints: 100,
                energy: 0,
                maxEnergy: 100,
                energyRegen: 1,
                hpRegen: 0,
                shield: 0
            });

            // Create character with the buff
            const attackBuff = new BuffBehaviour('Attack Up', BuffStat.Attack, 5, 2, true);
            const character = createCharacter({
                name: 'Test Character',
                stats: initialStats,
                chosenActions: [],
                activeBuffs: [attackBuff]
            });

            // Apply buffs using StatBuilder
            const {stats: updatedStats} = new StatBuilder(character)
                .applyActiveBuffs()
                .build();

            expect(updatedStats.attack).toBe(15); // Base 10 + buff 5
        });

        it('should apply multiple buff effects simultaneously', () => {
            const initialStats = createStats({
                attack: 10,
                defence: 5,
                hitPoints: 100,
                maxHitPoints: 100,
                energy: 0,
                maxEnergy: 100,
                energyRegen: 1,
                hpRegen: 0,
                shield: 0
            });

            const buffs = [
                new BuffBehaviour('Attack Up', BuffStat.Attack, 5, 2, true),
                new BuffBehaviour('Defense Up', BuffStat.Defense, 3, 2, true)
            ];

            const character = createCharacter({
                name: 'Test Character',
                stats: initialStats,
                chosenActions: [],
                activeBuffs: buffs
            });

            const {stats: updatedStats} = new StatBuilder(character)
                .applyActiveBuffs()
                .build();

            expect(updatedStats.attack).toBe(15); // 10 + 5
            expect(updatedStats.defence).toBe(8); // 5 + 3
        });

        it('should handle debuffs (negative values)', () => {
            const initialStats = createStats({
                attack: 10,
                defence: 5,
                hitPoints: 100,
                maxHitPoints: 100,
                energy: 0,
                maxEnergy: 100,
                energyRegen: 1,
                hpRegen: 0,
                shield: 0
            });

            const debuffs = [
                new BuffBehaviour('Attack Down', BuffStat.Attack, -3, 2, true),
                new BuffBehaviour('Defense Down', BuffStat.Defense, -2, 2, true)
            ];

            const character = createCharacter({
                name: 'Test Character',
                stats: initialStats,
                chosenActions: [],
                activeBuffs: debuffs
            });

            const {stats: updatedStats} = new StatBuilder(character)
                .applyActiveBuffs()
                .build();

            expect(updatedStats.attack).toBe(7); // 10 - 3
            expect(updatedStats.defence).toBe(3); // 5 - 2
        });

        it('should handle buff duration decrease', () => {
            const initialStats = createStats({
                attack: 10,
                defence: 5,
                hitPoints: 100,
                maxHitPoints: 100,
                energy: 0,
                maxEnergy: 100,
                energyRegen: 1,
                hpRegen: 0,
                shield: 0
            });

            const buff = new BuffBehaviour('Attack Up', BuffStat.Attack, 5, 2, true);
            const character = createCharacter({
                name: 'Test Character',
                stats: initialStats,
                chosenActions: [],
                activeBuffs: [buff]
            });

            const {stats: updatedStats, buffs: remainingBuffs} = new StatBuilder(character)
                .applyActiveBuffs()
                .decreaseEffectDurations()
                .build();

            expect(updatedStats.attack).toBe(15);
            expect(remainingBuffs[0].duration).toBe(1);
        });

        it('should handle complete stat calculation chain', () => {
            const initialStats = new CharacterStats({
                attack: 10,
                defence: 5,
                hitPoints: 90,
                maxHitPoints: 100,
                energy: 50,
                maxEnergy: 100,
                energyRegen: 5,
                hpRegen: 2,
                shield: 10
            });

            const buffs = [
                new BuffBehaviour('Attack Up', BuffStat.Attack, 5, 2, true),
                new BuffBehaviour('Shield Up', BuffStat.Shield, 5, 2, true)
            ];

            const character = new Character({
                name: 'Test Character',
                stats: initialStats,
                chosenActions: [],
                activeBuffs: buffs
            });

            const {stats: updatedStats} = new StatBuilder(character)
                .decayShield()
                .applyEquipmentBuffs()
                .applyActiveBuffs()
                .applyRegen()
                .build();

            expect(updatedStats.attack).toBe(15); // 10 + 5
            expect(updatedStats.shield).toBe(10); // (10 / 2) + 5
            expect(updatedStats.hitPoints).toBe(92); // 90 + 2 regen
            expect(updatedStats.energy).toBe(55); // 50 + 5 regen
        });

        it('should remove expired buffs and dots after duration reaches zero', () => {
            // Create initial character stats
            const initialStats = new CharacterStats({
                attack: 10,
                defence: 5,
                hitPoints: 100,
                maxHitPoints: 100,
                energy: 0,
                maxEnergy: 100,
                energyRegen: 1,
                hpRegen: 0,
                shield: 0
            });

            // Create buffs with different durations
            const buffs = [
                new BuffBehaviour('Attack Up', BuffStat.Attack, 5, 1, true), // Will expire after one turn
                new BuffBehaviour('Defense Up', BuffStat.Defense, 3, 2, true), // Will remain
            ];

            // Create DOTs with different durations
            const dots = [
                new DamageOverTimeBehaviour('Poison', 5, 1), // Will expire after one turn
                new DamageOverTimeBehaviour('Burn', 3, 2), // Will remain
            ];

            const character = new Character({
                name: 'Test Character',
                stats: initialStats,
                chosenActions: [],
                activeBuffs: buffs,
                activeDOTs: dots
            });

            // First turn - all effects active
            const firstTurn = new StatBuilder(character)
                .decayShield()
                .applyActiveBuffs()
                .applyDOTs()
                .decreaseEffectDurations()
                .build();

            // Verify first turn effects
            expect(firstTurn.stats.attack).toBe(15); // Base 10 + buff 5
            expect(firstTurn.stats.defence).toBe(8); // Base 5 + buff 3
            expect(firstTurn.stats.hitPoints).toBe(92); // 100 - (5 + 3) damage from DOTs
            expect(firstTurn.buffs).toHaveLength(1); // One buff should expire
            expect(firstTurn.dots).toHaveLength(1); // One DOT should expire
            expect(firstTurn.buffs[0].duration).toBe(1); // Remaining buff has 1 turn left
            expect(firstTurn.dots[0].duration).toBe(1); // Remaining DOT has 1 turn left

            // Create new character with remaining effects
            const secondCharacter = new Character({
                ...character,
                stats: firstTurn.stats,
                activeBuffs: firstTurn.buffs,
                activeDOTs: firstTurn.dots
            });

            // Second turn - only longer duration effects remain
            const secondTurn = new StatBuilder(secondCharacter)
                .decayShield()
                .applyActiveBuffs()
                .applyDOTs()
                .decreaseEffectDurations()
                .build();

            // Verify second turn effects
            expect(secondTurn.buffs).toHaveLength(0); // All buffs expired
            expect(secondTurn.dots).toHaveLength(0); // All DOTs expired
            expect(secondTurn.stats.attack).toBe(10); // Back to base attack
            expect(secondTurn.stats.defence).toBe(8); // Still has defense buff
            expect(secondTurn.stats.hitPoints).toBe(89); // 92 - 3 damage from remaining DOT

            // Third turn - all effects expired
            const thirdCharacter = new Character({
                ...character,
                stats: secondTurn.stats,
                activeBuffs: secondTurn.buffs,
                activeDOTs: secondTurn.dots
            });

            const thirdTurn = new StatBuilder(thirdCharacter)
                .decayShield()
                .applyActiveBuffs()
                .applyDOTs()
                .decreaseEffectDurations()
                .build();

            // Verify third turn effects - everything should be back to base stats
            expect(thirdTurn.buffs).toHaveLength(0); // No buffs
            expect(thirdTurn.dots).toHaveLength(0); // No DOTs
            expect(thirdTurn.stats.attack).toBe(10); // Base attack
            expect(thirdTurn.stats.defence).toBe(5); // Base defense
            expect(thirdTurn.stats.hitPoints).toBe(89); // No new DOT damage
        });

    });
});

describe('Damage and Buff Behaviours', () => {
    describe('Damage Calculation', () => {
        test('should correctly calculate damage with defense', () => {
            const initialStats = createStats({
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

            const character = createCharacter({
                name: "Test Character",
                stats: initialStats,
                equipment: new CharacterEquipment()
            });

            const builder = new StatBuilder(character);
            const result = builder.takeDamage(20).build();

            expect(result.stats.hitPoints).toBe(85); // 100 - (20 - 5 defense)
        });

        test('should correctly calculate damage ignoring defense', () => {
            const initialStats = createStats({
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

            const character = createCharacter({
                name: "Test Character",
                stats: initialStats,
                equipment: new CharacterEquipment()
            });

            const builder = new StatBuilder(character);
            const result = builder.takeDamage(20, true).build();

            expect(result.stats.hitPoints).toBe(80); // 100 - 20 (ignoring 5 defense)
        });

        test('should correctly handle shield in damage calculation', () => {
            const initialStats = createStats({
                hitPoints: 100,
                maxHitPoints: 100,
                shield: 10,
                attack: 10,
                defence: 5,
                energy: 100,
                maxEnergy: 100,
                energyRegen: 10,
                hpRegen: 0
            });

            const character = createCharacter({
                name: "Test Character",
                stats: initialStats,
                equipment: new CharacterEquipment()
            });

            const builder = new StatBuilder(character);
            const result = builder.takeDamage(20).build();

            expect(result.stats.shield).toBe(0);
            expect(result.stats.hitPoints).toBe(95); // Shield absorbs 10, defense reduces by 5, remaining 5 damage to HP
        });
    });

    describe('Buff Application', () => {
        test('should correctly apply attack buff', () => {
            const initialStats = createStats({
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

            const character = createCharacter({
                name: "Test Character",
                stats: initialStats,
                equipment: new CharacterEquipment()
            });

            const builder = new StatBuilder(character);
            character.activeBuffs = [{
                type: "buff",
                name: "Attack Up",
                description: "Increases attack power",
                buffType: BuffStat.Attack,
                amount: 5,
                duration: 2,
                isSelfBuff: true
            }];

            const result = builder.applyActiveBuffs().build();

            expect(result.stats.attack).toBe(15); // Base 10 + 5 from buff
        });

        test('should correctly apply multiple buffs', () => {
            const initialStats = createStats({
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

            const character = createCharacter({
                name: "Test Character",
                stats: initialStats,
                equipment: new CharacterEquipment()
            });

            const builder = new StatBuilder(character);
            character.activeBuffs = [
                {
                    type: "buff",
                    name: "Attack Up",
                    description: "Increases attack power",
                    buffType: BuffStat.Attack,
                    amount: 5,
                    duration: 2,
                    isSelfBuff: true
                },
                {
                    type: "buff",
                    name: "Defense Up",
                    description: "Increases defense",
                    buffType: BuffStat.Defense,
                    amount: 3,
                    duration: 2,
                    isSelfBuff: true
                }
            ];

            const result = builder.applyActiveBuffs().build();

            expect(result.stats.attack).toBe(15); // Base 10 + 5 from buff
            expect(result.stats.defence).toBe(8); // Base 5 + 3 from buff
        });

        test('should correctly handle buff duration', () => {
            const initialStats = createStats({
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

            const character = createCharacter({
                name: "Test Character",
                stats: initialStats,
                equipment: new CharacterEquipment()
            });

            const builder = new StatBuilder(character);
            character.activeBuffs = [{
                type: "buff",
                name: "Attack Up",
                description: "Increases attack power",
                buffType: BuffStat.Attack,
                amount: 5,
                duration: 1,
                isSelfBuff: true
            }];

            let result = builder.decreaseEffectDurations().applyActiveBuffs().build();
            expect(result.buffs).toHaveLength(0); // Buff should be removed after duration decrease
            expect(result.stats.attack).toBe(10); // Back to base attack
        });
    });
});