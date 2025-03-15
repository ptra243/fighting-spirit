import {CharacterStats, statsUtils, createStats} from "./CharacterStats";
import {Character} from "./Character";
import {IBuffBehaviour, IDamageOverTimeBehaviour} from "../Actions/Behaviours/BehaviourUnion";
import {BuffStat} from "../Actions/Behaviours/BuffBehaviour";

interface BuildResult {
    stats: CharacterStats;
    buffs: IBuffBehaviour[];
    dots: IDamageOverTimeBehaviour[];
}

export class StatBuilder {
    private currentStats: CharacterStats;
    private readonly character: Character;
    private currentBuffs: IBuffBehaviour[];
    private currentDots: IDamageOverTimeBehaviour[];

    constructor(character: Character) {
        this.character = character;
        // Start with base stats
        this.currentStats = createStats({
            ...character.baseStats,
            // But override with current values for these specific stats
            hitPoints: character.stats.hitPoints,
            shield: character.stats.shield,
            energy: character.stats.energy
        });
        this.currentBuffs = [...character.activeBuffs];
        this.currentDots = [...character.activeDOTs];

    }


    applyEquipmentBuffs(): StatBuilder {
        // Calculate total stats from equipment array
        const equipmentBonuses = this.character.equipment.reduce((total, item) => ({
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

        this.currentStats = createStats({
            ...this.currentStats,
            attack: this.currentStats.attack + equipmentBonuses.attack,
            defence: this.currentStats.defence + equipmentBonuses.defence,
            maxHitPoints: this.currentStats.maxHitPoints + equipmentBonuses.hitPoints,
            hpRegen: this.currentStats.hpRegen + equipmentBonuses.hpRegen,
            maxEnergy: this.currentStats.maxEnergy + equipmentBonuses.energy,
            energyRegen: this.currentStats.energyRegen + equipmentBonuses.energyRegen
        });

        this.currentBuffs = [
            ...this.currentBuffs,
            ...this.character.equipment.flatMap(equip => 
                'buffs' in equip ? (equip as { buffs: IBuffBehaviour[] }).buffs.map(buff => ({...buff, duration: 1})) : []
            )
        ];

        return this;
    }

    decreaseEffectDurations(): StatBuilder {
        this.currentBuffs = this.currentBuffs
            .map(buff => ({
                ...buff,
                duration: buff.duration - 1, // Decrease duration by 1
            }))
            .filter(buff => buff.duration > 0); // Keep only buffs with duration > 0

        this.currentDots = this.currentDots
            .map(dot => ({...dot, duration: dot.duration - 1 })) // Clone dots with reduced duration
            .filter(dot => dot.duration > 0); // Keep only dots with duration > 0

        return this;

    }

    applyActiveBuffs(): StatBuilder {
        const applyBuffs = (stat: number, buffType: BuffStat): number =>
            stat +
            this.currentBuffs
                .filter(buff => buff.buffType === buffType)
                .reduce((sum, buff) => sum + buff.amount, 0);

        this.currentStats = createStats({
            ...this.currentStats,
            attack: applyBuffs(this.currentStats.attack, BuffStat.Attack),
            defence: applyBuffs(this.currentStats.defence, BuffStat.Defense),
            shield: applyBuffs(this.currentStats.shield, BuffStat.Shield),  // Removed the /2
            energyRegen: applyBuffs(this.currentStats.energyRegen, BuffStat.EnergyRegen),
            hpRegen: applyBuffs(this.currentStats.hpRegen, BuffStat.HPRegen),
        });
        return this;
    }


    applyDOTs(): StatBuilder {
        if (this.currentDots.length === 0) {
            return this;
        }

        this.currentStats = this.currentDots.reduce((stats, dot) => {
            return statsUtils.takeDamage(stats, dot.damagePerTurn, true);
        }, this.currentStats);


        return this;
    }

    applyRegen(): StatBuilder {
        this.currentStats = createStats({
            ...this.currentStats,
            hitPoints: Math.min(
                this.currentStats.maxHitPoints,
                this.character.stats.hitPoints + this.currentStats.hpRegen
            ),
            energy: Math.min(
                this.currentStats.maxEnergy,
                this.character.stats.energy + this.currentStats.energyRegen
            )
        });
        return this;
    }

    takeDamage(damage: number, ignoreDefense: boolean = false): StatBuilder {

        this.currentStats = statsUtils.takeDamage(this.currentStats, damage, ignoreDefense);
        return this;
    }

    restoreHealth(amount: number): StatBuilder {
        this.currentStats = createStats({
            ...this.currentStats,
            hitPoints: Math.min(
                this.currentStats.maxHitPoints,
                this.currentStats.hitPoints + amount
            )
        });
        return this;
    }

    modifyEnergy(amount: number): StatBuilder {
        this.currentStats = createStats({
            ...this.currentStats,
            energy: Math.min(
                this.currentStats.maxEnergy,
                Math.max(0, this.currentStats.energy + amount)
            )
        });
        return this;
    }


    // Add new method to apply class stats
    applyClassStats(): StatBuilder {
        if (!this.character.classes) return this; // For backward compatibility

        const classes = this.character.classes;
        if (classes.length === 0) return this;  // Add this check

        console.log('Classes array:', classes);  // Add this log
        console.log('Classes length:', classes.length);  // And this one

        const classStats = classes.reduce((totalStats, characterClass) => {
            const stats = characterClass.getCurrentStats();

            return statsUtils.add(totalStats, stats);
        }, createStats({}));

        this.currentStats = statsUtils.add(this.currentStats, classStats);
        return this;
    }

    //default build
    build(): BuildResult {
        // Add applyClassStats to the build chain
        return {
            stats: this.currentStats,
            buffs: this.currentBuffs,
            dots: this.currentDots
        };
    }

    getStatsForTurn() {
        return this
            .applyClassStats()
            .applyEquipmentBuffs()
            .applyActiveBuffs()
            .applyDOTs()
            .applyRegen()
            .build();
    }

    setToFullHP() {

        this.currentStats = createStats({
            ...this.currentStats,
            hitPoints: this.currentStats.maxHitPoints
        });

        return this;
    }

    decayShield(): StatBuilder {
        this.currentStats = createStats({
            ...this.currentStats,
            shield: Math.floor(this.currentStats.shield / 2)
        });
        return this;
    }

}