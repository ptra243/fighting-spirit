// DamageOverTimeBehaviour.test.ts

import {DamageOverTimeBehaviour} from "../../../../types/Actions/Behaviours/DamageOverTimeBehaviour";
import {createTestCharacter} from "./testCharacterFactory.test";

describe('DamageOverTimeBehaviour', () => {
    it('should apply DOT effect correctly', () => {
        const dot = new DamageOverTimeBehaviour("Poison", 5, 3);
        const character = createTestCharacter();
        const target = createTestCharacter();

        const [updatedCharacter, updatedTarget] = dot.execute(character, target);

        expect(updatedTarget.activeDOTs).toHaveLength(1);
        expect(updatedTarget.activeDOTs[0]).toEqual(expect.objectContaining({
            damagePerTurn: 5,
            duration: 3
        }));
    });

    it('should stack multiple DOT effects', () => {
        const dot1 = new DamageOverTimeBehaviour("Poison", 5, 3);
        const dot2 = new DamageOverTimeBehaviour("Burn", 3, 2);
        const character = createTestCharacter();
        let target = createTestCharacter();

        [, target] = dot1.execute(character, target);
        [, target] = dot2.execute(character, target);

        expect(target.activeDOTs).toHaveLength(2);
    });

    it('should generate correct description', () => {
        const dot = new DamageOverTimeBehaviour("Poison", 5, 3);
        expect(dot.getDescription()).toBe("Deal 5 damage per turn for 3 turns.");
    });
});