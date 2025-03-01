// CharacterEquipment.ts
import {Accessory, Armor, BaseEquipment, EquipmentType, Weapon} from "../Equipment/EquipmentClassHierarchy";
import {LogCallbacks} from "../../BattleManager";

export class CharacterEquipment {
    readonly weapon?: Weapon;
    readonly armor?: Armor;
    readonly accessory?: Accessory;
    private readonly logCallback?: LogCallbacks

    constructor(params?: {
        weapon?: Weapon;
        armor?: Armor;
        accessory?: Accessory;
        logCallback?: LogCallbacks;
    }) {
        this.weapon = params?.weapon;
        this.armor = params?.armor;
        this.accessory = params?.accessory;
        this.logCallback = params?.logCallback;
    }

    addEquipment(newEquipment: BaseEquipment): CharacterEquipment {
        let updates: Partial<{
            weapon?: Weapon;
            armor?: Armor;
            accessory?: Accessory;
        }> = {};

        switch (newEquipment.type) {
            case EquipmentType.WEAPON:
                updates.weapon = newEquipment as Weapon;
                break;
            case EquipmentType.ARMOR:
                updates.armor = newEquipment as Armor;
                break;
            case EquipmentType.ACCESSORY:
                updates.accessory = newEquipment as Accessory;
                break;
        }

        return new CharacterEquipment({
            weapon: this.weapon,
            armor: this.armor,
            accessory: this.accessory,
            ...updates
        });
    }

    removeEquipment(equipmentName: string): CharacterEquipment {
        const equipment = this.getEquippedItems().find(eq => eq.name === equipmentName);

        if (!equipment) {
            return this;
        }
        let updates: Partial<{
            weapon?: Weapon;
            armor?: Armor;
            accessory?: Accessory
        }> = {};
        switch (equipment.type) {
            case EquipmentType.WEAPON:
                updates.weapon = undefined;
                break;
            case EquipmentType.ARMOR:
                updates.armor = undefined;
                break;
            case EquipmentType.ACCESSORY:
                updates.accessory = undefined;
                break;
        }

        return new CharacterEquipment({
            weapon: this.weapon,
            armor: this.armor,
            accessory: this.accessory,
            ...updates
        });
    }


    getEquippedItems(): BaseEquipment[] {
        return [
            this.weapon,
            this.armor,
            this.accessory
        ].filter((item)=> item !== undefined);
    }

    calculateTotalStats(): {
        attack: number;
        defence: number;
        hitPoints: number;
    } {
        return this.getEquippedItems().reduce((total, item) => ({
            attack: total.attack + (item.boostAttack || 0),
            defence: total.defence + (item.boostDefence || 0),
            hitPoints: total.hitPoints + (item.boostHitPoints || 0)
        }), {attack: 0, defence: 0, hitPoints: 0});
    }
}