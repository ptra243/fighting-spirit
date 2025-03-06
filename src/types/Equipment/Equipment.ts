import {BuffBehaviour} from "../Actions/Behaviours/BuffBehaviour";

export interface Equipment {
    name: string;
    boostAttack?: number; // Optional property to boost attack stats
    boostDefence?: number; // Optional property to boost attack stats
    boostHitPoints?: number;
    buffs?: BuffBehaviour[];
    type: string; // weapon, armour, accessory
}