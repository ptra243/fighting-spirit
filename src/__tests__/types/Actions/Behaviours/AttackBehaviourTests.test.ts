import {AttackBehaviour, AttackScalingStat} from "../../../../types/Actions/Behaviours/AttackBehaviour";
import {createTestCharacter} from "./testCharacterFactory.test";

describe('AttackBehaviour', () => {
    it('should deal basic damage reduced by defense', () => {
        const attack = new AttackBehaviour("Test Attack", 10);
        const attacker = createTestCharacter();
        const target = createTestCharacter({defence: 3});

        const [updatedAttacker, updatedTarget] = attack.execute(attacker, target);

        expect(updatedTarget.stats.hitPoints).toBe(88); // 100 - (10 + 5 - 3)
    });

    it('should scale with attack stat and be reduced by defense', () => {
        const attack = new AttackBehaviour(
            "Scaled Attack",
            10,
            AttackScalingStat.Attack,
            100
        );
        const attacker = createTestCharacter({attack: 5});
        const target = createTestCharacter({defence: 4, shield: 0});

        const [updatedAttacker, updatedTarget] = attack.execute(attacker, target);

        expect(updatedTarget.stats.hitPoints).toBe(89); // 100 - ((10 + 5) - 4)
    });

    it('should deal minimum 1 damage when defense equals or exceeds damage', () => {
        const attack = new AttackBehaviour("Weak Attack", 5);
        const attacker = createTestCharacter();
        const target = createTestCharacter({defence: 10});

        const [updatedAttacker, updatedTarget] = attack.execute(attacker, target);

        expect(updatedTarget.stats.hitPoints).toBe(99); // Minimum 1 damage

        // Test with defense greatly exceeding damage
        const toughTarget = createTestCharacter({defence: 20});
        const [_, veryToughTarget] = attack.execute(attacker, toughTarget);
        expect(veryToughTarget.stats.hitPoints).toBe(99); // Still minimum 1 damage
    });

    it('should deal minimum 1 damage with very high defense', () => {
        const attack = new AttackBehaviour("Normal Attack", 10);
        const attacker = createTestCharacter();
        const target = createTestCharacter({defence: 100});

        const [_, updatedTarget] = attack.execute(attacker, target);

        expect(updatedTarget.stats.hitPoints).toBe(99); // Minimum 1 damage despite high defense
    });

    describe('AttackBehaviour Scaling Tests', () => {
        it('should scale with Attack stat correctly', () => {
            const attack = new AttackBehaviour(
                "Attack Scaled",
                10,
                AttackScalingStat.Attack,
                120
            );
            const attacker = createTestCharacter({attack: 10});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 10 attack * 120% = 12
            // Total: 22
            expect(updatedTarget.stats.hitPoints).toBe(78);
        });

        it('should scale with Defense stat correctly', () => {
            const attack = new AttackBehaviour(
                "Defense Scaled",
                10,
                AttackScalingStat.Defense,
                150
            );
            const attacker = createTestCharacter({defence: 10});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 10 defense * 150% = 15
            // Total: 25
            expect(updatedTarget.stats.hitPoints).toBe(75);
        });

        it('should scale with Shield stat correctly', () => {
            const attack = new AttackBehaviour(
                "Shield Scaled",
                10,
                AttackScalingStat.Shield,
                80
            );
            const attacker = createTestCharacter({shield: 10});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 10 shield * 80% = 8
            // Total: 18
            expect(updatedTarget.stats.hitPoints).toBe(82);
        });

        it('should scale with Energy stat correctly', () => {
            const attack = new AttackBehaviour(
                "Energy Scaled",
                10,
                AttackScalingStat.Energy,
                200
            );
            const attacker = createTestCharacter({energy: 10});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 10 energy * 200% = 20
            // Total: 30
            expect(updatedTarget.stats.hitPoints).toBe(70);
        });

        it('should scale with Health stat correctly', () => {
            const attack = new AttackBehaviour(
                "Health Scaled",
                10,
                AttackScalingStat.Health,
                50
            );
            const attacker = createTestCharacter({hitPoints: 100});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 100 health * 50% = 50
            // Total: 60
            expect(updatedTarget.stats.hitPoints).toBe(40);
        });

        it('should handle fractional scaling correctly', () => {
            const attack = new AttackBehaviour(
                "Fraction Test",
                10,
                AttackScalingStat.Attack,
                33
            );
            const attacker = createTestCharacter({attack: 10});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 10 attack * 33% = 3.3 (should floor to 3)
            // Total: 13
            expect(updatedTarget.stats.hitPoints).toBe(87);
        });

        it('should handle zero stat scaling correctly', () => {
            const attack = new AttackBehaviour(
                "Zero Stat Test",
                10,
                AttackScalingStat.Shield,
                100
            );
            const attacker = createTestCharacter({shield: 0});
            const target = createTestCharacter({defence: 0});

            const [_, updatedTarget] = attack.execute(attacker, target);
            // Base damage: 10
            // Scaled damage: 0 shield * 100% = 0
            // Total: 10
            expect(updatedTarget.stats.hitPoints).toBe(90);
        });
    });

});
