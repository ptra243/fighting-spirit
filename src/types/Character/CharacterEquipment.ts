// CharacterEquipment.ts
import { Equipment, EquipmentType, Weapon, Armor, Accessory } from "../Equipment/EquipmentClassHierarchy";

export class CharacterEquipment {
    private equipment: Equipment[] = [];

    constructor(initialEquipment: Equipment[] = []) {
        this.equipment = initialEquipment;
    }

    addEquipment(newEquipment: Equipment): CharacterEquipment {
        // Remove any existing equipment of the same type
        this.equipment = this.equipment.filter(eq => eq.type !== newEquipment.type);
        this.equipment.push(newEquipment);
        return this;
    }

    removeEquipment(equipmentName: string): CharacterEquipment {
        this.equipment = this.equipment.filter(eq => eq.name !== equipmentName);
        return this;
    }

    getEquippedItems(): Equipment[] {
        return this.equipment;
    }

    calculateTotalStats(): {
        attack: number;
        defence: number;
        hitPoints: number;
        hpRegen: number;
        energy: number;
        energyRegen: number;
    } {
        return this.equipment.reduce((total, item) => ({
            attack: total.attack + (item.attackBonus || 0),
            defence: total.defence + (item.defenseBonus || 0),
            hitPoints: total.hitPoints + (item.hitPointsBonus || 0),
            hpRegen: total.hpRegen + (item.hpRegenBonus || 0),
            energy: total.energy + (item.energyBonus || 0),
            energyRegen: total.energyRegen + (item.energyRegenBonus || 0)
        }), {
            attack: 0,
            defence: 0,
            hitPoints: 0,
            hpRegen: 0,
            energy: 0,
            energyRegen: 0
        });
    }
}