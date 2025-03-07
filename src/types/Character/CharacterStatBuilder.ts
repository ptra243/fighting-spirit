import {CharacterStats, statsUtils} from "./CharacterStats";
import {Character} from "./Character";
import {BuffBehaviour, BuffStat} from "../Actions/Behaviours/BuffBehaviour";
import {DamageOverTimeBehaviour} from "../Actions/Behaviours/DamageOverTimeBehaviour";

interface BuildResult {
    stats: CharacterStats;
    buffs: BuffBehaviour[];
    dots: DamageOverTimeBehaviour[];
}

export class StatBuilder {
    private currentStats: CharacterStats;
    private readonly character: Character;
    private currentBuffs: BuffBehaviour[];
    private currentDots: DamageOverTimeBehaviour[];

    constructor(character: Character) {
        this.character = character;
        // Start with base stats
        this.currentStats = new CharacterStats({
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
        const equipmentBonuses = this.character.equipment.calculateTotalStats();
        this.currentStats = new CharacterStats({
            ...this.currentStats,
            attack: this.currentStats.attack + equipmentBonuses.attack,
            defence: this.currentStats.defence + equipmentBonuses.defence,
            maxHitPoints: this.currentStats.maxHitPoints + equipmentBonuses.hitPoints
        });

        this.currentBuffs = [
            ...this.currentBuffs,
            ...this.character.equipment.getEquippedItems().flatMap(equip =>
                equip.buffs.map(buff => new BuffBehaviour(buff.name, buff.buffType, buff.amount, 1, buff.isSelfBuff))
            )
        ];

        return this;
    }

    decreaseEffectDurations(): StatBuilder {
        this.currentBuffs = this.currentBuffs
            .map(buff => buff.clone({duration: buff.duration - 1}))
            .filter(buff => buff.duration > 0);

        this.currentDots = this.currentDots
            .map(dot => dot.clone({duration: dot.duration - 1}))
            .filter(dot => dot.duration > 0);

        return this;
    }

    applyActiveBuffs(): StatBuilder {
        const applyBuffs = (stat: number, buffType: BuffStat): number =>
            stat +
            this.currentBuffs
                .filter(buff => buff.buffType === buffType)
                .reduce((sum, buff) => sum + buff.amount, 0);

        this.currentStats = new CharacterStats({
            ...this.currentStats,
            attack: applyBuffs(this.currentStats.attack, BuffStat.Attack),
            defence: applyBuffs(this.currentStats.defence, BuffStat.Defense),
            shield: applyBuffs(this.currentStats.shield, BuffStat.Shield),  // Removed the /2
            energyRegen: applyBuffs(this.currentStats.energyRegen, BuffStat.EnergyRegen),
            hpRegen: applyBuffs(this.currentStats.hpRegen, BuffStat.hpRegen),
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
        this.currentStats = new CharacterStats({
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
        this.currentStats = new CharacterStats({
            ...this.currentStats,
            hitPoints: Math.min(
                this.currentStats.maxHitPoints,
                this.currentStats.hitPoints + amount
            )
        });
        return this;
    }

    modifyEnergy(amount: number): StatBuilder {
        this.currentStats = new CharacterStats({
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
        }, new CharacterStats({}));

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

        this.currentStats = new CharacterStats({
            ...this.currentStats,
            hitPoints: this.currentStats.maxHitPoints
        });

        return this;
    }

    decayShield(): StatBuilder {
        this.currentStats = new CharacterStats({
            ...this.currentStats,
            shield: Math.floor(this.currentStats.shield / 2)
        });
        return this;
    }

}