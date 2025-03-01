import { BuffBehaviour } from "../ActionEquipmentExports";

// BaseEquipment.ts
export abstract class BaseEquipment {
    readonly name: string;
    readonly boostAttack: number;
    readonly boostDefence: number;
    readonly boostHitPoints: number;
    readonly buffs: BuffBehaviour[];
    readonly type: EquipmentType;

    protected constructor(params: {
        name: string;
        boostAttack?: number;
        boostDefence?: number;
        boostHitPoints?: number;
        buffs?: BuffBehaviour[];
        type: EquipmentType;
    }) {
        this.name = params.name;
        this.boostAttack = params.boostAttack || 0;
        this.boostDefence = params.boostDefence || 0;
        this.boostHitPoints = params.boostHitPoints || 0;
        this.buffs = params.buffs || [];
        this.type = params.type;
    }
}

// EquipmentType.ts
export enum EquipmentType {
    WEAPON = 'weapon',
    ARMOR = 'armor',
    ACCESSORY = 'accessory'
}

// Weapon.ts
export class Weapon extends BaseEquipment {

    constructor(params: {
        name: string;
        boostAttack?: number;
        boostDefence?: number;
        boostHitPoints?: number;
        buffs?: BuffBehaviour[];
    }) {
        super({
            ...params,
            type: EquipmentType.WEAPON
        });
    }
}

// Armor.ts
export class Armor extends BaseEquipment {

    constructor(params: {
        name: string;
        boostDefence?: number;
        boostAttack?: number;
        boostHitPoints?: number;
        buffs?: BuffBehaviour[];
    }) {
        super({
            ...params,
            type: EquipmentType.ARMOR
        });
    }
}

// Accessory.ts
export class Accessory extends BaseEquipment {

    constructor(params: {
        name: string;
        boostAttack?: number;
        boostDefence?: number;
        boostHitPoints?: number;
        buffs?: BuffBehaviour[];
    }) {
        super({
            ...params,
            type: EquipmentType.ACCESSORY
        });
    }
}

export interface AccessoryEffect {
    name: string;
    description: string;
    onEquip?: () => void;
    onUnequip?: () => void;
}