// RechargeBehaviour.test.ts

import {RechargeBehaviour} from "../../../../types/Actions/Behaviours/RechargeBehaviour";
import {createTestCharacter} from "./testCharacterFactory.test";

describe('RechargeBehaviour', () => {
    it('should recharge energy correctly', () => {
        const recharge = new RechargeBehaviour("Test Recharge", 5);
        const character = createTestCharacter({ energy: 3, maxEnergy: 10 });
        const target = createTestCharacter();

        const [updatedCharacter, unchangedTarget] = recharge.execute(character, target);

        expect(updatedCharacter.stats.energy).toBe(8); // 3 + 5
    });

    it('should not recharge beyond max energy', () => {
        const recharge = new RechargeBehaviour("Big Recharge", 8);
        const character = createTestCharacter({ energy: 5, maxEnergy: 10 });
        const target = createTestCharacter();

        const [updatedCharacter, unchangedTarget] = recharge.execute(character, target);

        expect(updatedCharacter.stats.energy).toBe(10);
    });

    it('should generate correct description', () => {
        const recharge = new RechargeBehaviour("Test Recharge", 5);
        expect(recharge.getDescription()).toBe("Self. Restore 5 Energy.");
    });
});