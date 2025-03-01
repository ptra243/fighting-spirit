// BuffBehaviour.test.ts

import {BuffBehaviour, BuffStat} from "../../../../types/Actions/Behaviours/BuffBehaviour";
import {createTestCharacter} from "./testCharacterFactory.test";

describe('BuffBehaviour', () => {
    it('should apply self buff correctly', () => {
        const buff = new BuffBehaviour(
            "Attack Buff", 
            BuffStat.Attack, 
            5, 
            3, 
            true
        );
        const character = createTestCharacter();
        const target = createTestCharacter();

        const [updatedCharacter, updatedTarget] = buff.execute(character, target);

        expect(updatedCharacter.activeBuffs).toHaveLength(1);
        expect(updatedCharacter.activeBuffs[0]).toEqual(expect.objectContaining({
            name: "Attack Buff",
            buffType: BuffStat.Attack,
            amount: 5,
            duration: 3
        }));
    });

    it('should apply enemy buff correctly', () => {
        const buff = new BuffBehaviour(
            "Defense Buff", 
            BuffStat.Defense, 
            3, 
            2, 
            false
        );
        const character = createTestCharacter();
        const target = createTestCharacter();

        const [updatedCharacter, updatedTarget] = buff.execute(character, target);

        expect(updatedTarget.activeBuffs).toHaveLength(1);
        expect(updatedTarget.activeBuffs[0]).toEqual(expect.objectContaining({
            name: "Defense Buff",
            buffType: BuffStat.Defense,
            amount: 3,
            duration: 2
        }));
    });

    it('should generate correct description for self buff', () => {
        const buff = new BuffBehaviour(
            "Energy Regen Buff", 
            BuffStat.EnergyRegen, 
            2, 
            3, 
            true
        );
        
        expect(buff.getDescription()).toBe("Self. Apply 2 Energy Regeneration for 3 turns.");
    });

    it('should generate correct description for enemy buff', () => {
        const buff = new BuffBehaviour(
            "Defense Buff", 
            BuffStat.Defense, 
            3, 
            1, 
            false
        );
        
        expect(buff.getDescription()).toBe("Enemy. Apply 3 Defense for 1 turn.");
    });
});