// HealBehaviour.test.ts

import {HealBehaviour} from "../../../../types/Actions/Behaviours/HealBehaviour";
import {createTestCharacter} from "./testCharacterFactory.test";

describe('HealBehaviour', () => {
    it('should heal character correctly', () => {
        const heal = new HealBehaviour("Test Heal", 20);
        const character = createTestCharacter({ hitPoints: 50 });
        const target = createTestCharacter();

        const [updatedCharacter, unchangedTarget] = heal.execute(character, target);

        expect(updatedCharacter.stats.hitPoints).toBe(70); // 50 + 20
    });

    it('should not heal beyond max health', () => {
        const heal = new HealBehaviour("Big Heal", 50);
        const character = createTestCharacter({ hitPoints: 90, maxHitPoints: 100 });
        const target = createTestCharacter();

        const [updatedCharacter, unchangedTarget] = heal.execute(character, target);

        expect(updatedCharacter.stats.hitPoints).toBe(100);
    });

    it('should generate correct description', () => {
        const heal = new HealBehaviour("Test Heal", 25);
        expect(heal.getDescription()).toBe("Self. Restore 25 HP.");
    });
});