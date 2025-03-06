// ShieldBehaviour.test.ts

import {ShieldBehaviour} from "../../../../types/Actions/Behaviours/ShieldAbility";
import {createTestCharacter} from "./testCharacterFactory.test";

describe('ShieldBehaviour', () => {
    it('should add shield correctly', () => {
        const shield = new ShieldBehaviour("Test Shield", 10);
        const character = createTestCharacter({shield: 0});
        const target = createTestCharacter();

        const [updatedCharacter, unchangedTarget] = shield.execute(character, target);

        expect(updatedCharacter.stats.shield).toBe(10);
    });

    it('should stack with existing shield', () => {
        const shield = new ShieldBehaviour("Test Shield", 10);
        const character = createTestCharacter({shield: 5});
        const target = createTestCharacter();

        const [updatedCharacter, unchangedTarget] = shield.execute(character, target);

        expect(updatedCharacter.stats.shield).toBe(15);
    });

    it('should generate correct description', () => {
        const shield = new ShieldBehaviour("Test Shield", 15);
        expect(shield.getDescription()).toBe("Self. Gain 15 Shield.");
    });
});