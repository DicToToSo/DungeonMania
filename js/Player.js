// Player.js - Lógica do jogador
window.PlayerModule = (function() {
    'use strict';

    // Classes disponíveis
    const classesDb = [
        { id: 'heroi', name: 'Herói', sprite: 'heroi-azul-parado.png', baseAtk: 22, baseDef: 11, baseMHp: 110, stamMax: 100, stamRegen: 9, blockStamRegen: 10, atkCost: 12, furyBlockPerSec: 2.5, dodgeChance: 0, standChance: 0, critChance: 0 },
        { id: 'arqueiro', name: 'Arqueiro', sprite: 'arqueiro.png', baseAtk: 30, baseDef: 5, baseMHp: 82, stamMax: 100, stamRegen: 12, blockStamRegen: 9, atkCost: 10, furyBlockPerSec: 2, dodgeChance: 0.22, standChance: 0, critChance: 0 },
        { id: 'cavaleiro', name: 'Cavaleiro', sprite: 'cavaleiro.png', baseAtk: 24, baseDef: 14, baseMHp: 128, stamMax: 100, stamRegen: 8, blockStamRegen: 11, atkCost: 12, furyBlockPerSec: 3, dodgeChance: 0, standChance: 0, critChance: 0.22 },
        { id: 'tank', name: 'Tank', sprite: 'tank.png', baseAtk: 18, baseDef: 19, baseMHp: 158, stamMax: 100, stamRegen: 6, blockStamRegen: 14, atkCost: 14, furyBlockPerSec: 4, dodgeChance: 0, standChance: 0.24, critChance: 0 }
    ];

    // Pets disponíveis
    const petsDb = [
        { id: 'fox', emoji: '🦊', name: 'Raposa Garimpeira', type: 'loot' },
        { id: 'slime', emoji: '🟢', name: 'Slime Venenoso', type: 'dot' },
        { id: 'wolf', emoji: '🐺', name: 'Lobo de Caça', type: 'damage' }
    ];

    // Itens disponíveis
    const itemsDb = [
        { id: 'espada_inicial', name: 'Espada Inicial', icon: '⚔️', price: 0, rarity: 1, slot: 'weapon', bonusAtk: 0, bonusDef: 0, bonusMHp: 0 },
        { id: 'pocao', name: 'Poção Vida', icon: '🧪', price: 28, rarity: 0.6, slot: 'consumable', heal: 42 },
        { id: 'amuleto', name: 'Amuleto', icon: '📿', price: 48, rarity: 0.6, slot: 'accessory', bonusAtk: 0, bonusDef: 4, bonusMHp: 0 },
        { id: 'espada_aco', name: 'Espada Aço', icon: '🗡️', price: 115, rarity: 0.3, slot: 'weapon', bonusAtk: 8, bonusDef: 0, bonusMHp: 0 },
        { id: 'escudo_rei', name: 'Escudo Rei', icon: '🛡️', price: 145, rarity: 0.3, slot: 'armor', bonusAtk: 0, bonusDef: 5, bonusMHp: 0 },
        { id: 'excalibur', name: 'Excalibur', icon: '✨', price: 380, rarity: 0.1, slot: 'weapon', bonusAtk: 13, bonusDef: 0, bonusMHp: 0 },
        { id: 'buy_class_arqueiro', name: 'Treino: Arqueiro', icon: '🏹', price: 300, rarity: 0.4, slot: 'class', classId: 'arqueiro' },
        { id: 'buy_class_cavaleiro', name: 'Treino: Cavaleiro', icon: '⚜️', price: 275, rarity: 0.42, slot: 'class', classId: 'cavaleiro' },
        { id: 'buy_class_tank', name: 'Treino: Tank', icon: '🧱', price: 320, rarity: 0.38, slot: 'class', classId: 'tank' }
    ];

    const iconToId = { '🧪': 'pocao', '📿': 'amuleto', '🗡️': 'espada_aco', '🛡️': 'escudo_rei', '✨': 'excalibur', '⚔️': 'espada_inicial' };

    // Funções utilitárias
    function getClassById(id) { 
        return classesDb.find(c => c.id === id) || classesDb[0]; 
    }

    function getPetById(id) { 
        return petsDb.find(pet => pet.id === id); 
    }

    function getItemById(id) { 
        return itemsDb.find(x => x.id === id); 
    }

    function defaultPlayer(worldId) {
        return {
            hp: 110, mHp: 110, baseAtk: 22, baseDef: 11, baseMHp: 110,
            atk: 22, def: 11, gold: 55, stage: 1, stam: 100, fury: 0,
            stamMax: 100, stamRegen: 9, blockStamRegen: 10, atkStamCost: 12, furyBlockPerSec: 2.5,
            killStreak: 0, totalKillsLifetime: 0,
            buffAtk: 0, buffDef: 0, buffMHp: 0, buffStamMax: 0, buffStamRegen: 0, buffLootLuck: 0,
            cardHistory: [], lastCardStageOffered: 0,
            petOwned: ['fox'], activePetId: 'fox',
            enemyDotTurns: 0, enemyDotDmg: 0,
            classId: 'heroi', ownedClasses: ['heroi'],
            inv: [{ id: 'espada_inicial' }],
            equipped: { weapon: 0, armor: null, accessory: null },
            alive: true, world: worldId || 1, maxStageReached: 1
        };
    }

    function applyClassBase(target) {
        const pl = target || window.p;
        const c = getClassById(pl.classId);
        pl.baseAtk = c.baseAtk;
        pl.baseDef = c.baseDef;
        pl.baseMHp = c.baseMHp;
        pl.stamMax = c.stamMax + (pl.buffStamMax || 0);
        pl.stamRegen = c.stamRegen + (pl.buffStamRegen || 0);
        pl.blockStamRegen = c.blockStamRegen != null ? c.blockStamRegen : 10;
        pl.atkStamCost = c.atkCost;
        pl.furyBlockPerSec = c.furyBlockPerSec != null ? c.furyBlockPerSec : 2.5;
        pl.dodgeChance = c.dodgeChance || 0;
        pl.standChance = c.standChance || 0;
        pl.critChance = c.critChance || 0;
        pl.stam = Math.min(pl.stamMax, pl.stam != null ? pl.stam : pl.stamMax);
    }

    function unlockPet(pl, petId) {
        if (!pl.petOwned) pl.petOwned = ['fox'];
        if (!pl.petOwned.includes(petId)) pl.petOwned.push(petId);
        pl.activePetId = petId;
    }

    function getActivePet() {
        return getPetById(window.p.activePetId);
    }

    function getLootLuckPercent() {
        const k = window.p.totalKillsLifetime || 0;
        const w = (window.p.world || 1) - 1;
        const b = window.p.buffLootLuck || 0;
        return Math.min(20, Math.round((k * 0.015 + w * 1.1 + b) * 10) / 10);
    }

    function applyPlayerSprite() {
        const c = getClassById(window.p.classId);
        const el = document.getElementById('player-sprite');
        if (el) el.style.backgroundImage = `url('${c.sprite}')`;
    }

    function equipSlotKeyForItem(it) {
        if (!it) return null;
        if (it.slot === 'class') return null;
        if (it.slot === 'weapon') return 'weapon';
        if (it.slot === 'armor') return 'armor';
        if (it.slot === 'accessory') return 'accessory';
        return null;
    }

    function fixEquippedIndicesAfterRemove(removedIndex) {
        if (!window.p.equipped) return;
        ['weapon', 'armor', 'accessory'].forEach(s => {
            const v = window.p.equipped[s];
            if (v == null) return;
            if (v === removedIndex) window.p.equipped[s] = null;
            else if (v > removedIndex) window.p.equipped[s] = v - 1;
        });
    }

    function isInvIndexEquipped(idx) {
        if (!window.p.equipped) return false;
        return window.p.equipped.weapon === idx || window.p.equipped.armor === idx || window.p.equipped.accessory === idx;
    }

    function recalcStats(player) {
        const pl = player || window.p;
        if (pl.baseAtk == null) pl.baseAtk = 25;
        if (pl.baseDef == null) pl.baseDef = 10;
        if (pl.baseMHp == null) pl.baseMHp = 120;
        if (!pl.equipped) pl.equipped = { weapon: null, armor: null, accessory: null };

        let atk = pl.baseAtk + (pl.buffAtk || 0), def = pl.baseDef + (pl.buffDef || 0), mhp = pl.baseMHp + (pl.buffMHp || 0);

        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const idx = pl.equipped[slot];
            if (idx == null) return;
            const cell = pl.inv[idx];
            if (!cell || !cell.id) return;
            const it = getItemById(cell.id);
            const sk = equipSlotKeyForItem(it);
            if (!it || sk !== slot) return;
            atk += it.bonusAtk || 0;
            def += it.bonusDef || 0;
            mhp += it.bonusMHp || 0;
        });

        const prevM = pl.mHp || 1;
        pl.atk = atk;
        pl.def = def;
        pl.mHp = Math.max(1, mhp);
        pl.hp = Math.min(pl.hp, pl.mHp);
        if (prevM !== pl.mHp && prevM > 0) {
            const ratio = pl.mHp / prevM;
            pl.hp = Math.min(pl.mHp, Math.max(1, Math.floor(pl.hp * ratio)));
        }
    }

    function migratePlayer(raw) {
        const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (o.world == null) o.world = 1;
        if (o.maxStageReached == null) o.maxStageReached = Math.max(1, o.stage || 1);
        if (!o.classId) o.classId = 'heroi';
        if (!o.ownedClasses || !o.ownedClasses.length) o.ownedClasses = ['heroi'];
        if (o.killStreak == null) o.killStreak = 0;
        if (o.totalKillsLifetime == null) o.totalKillsLifetime = 0;
        if (o.buffAtk == null) o.buffAtk = 0;
        if (o.buffDef == null) o.buffDef = 0;
        if (o.buffMHp == null) o.buffMHp = 0;
        if (o.buffStamMax == null) o.buffStamMax = 0;
        if (o.buffStamRegen == null) o.buffStamRegen = 0;
        if (o.buffLootLuck == null) o.buffLootLuck = 0;
        if (!o.cardHistory) o.cardHistory = [];
        if (o.lastCardStageOffered == null) o.lastCardStageOffered = 0;
        if (!o.petOwned || !o.petOwned.length) o.petOwned = ['fox'];
        if (!o.activePetId) o.activePetId = o.petOwned[0];
        if (o.enemyDotTurns == null) o.enemyDotTurns = 0;
        if (o.enemyDotDmg == null) o.enemyDotDmg = 0;

        if (!o.inv || !o.inv.length) o.inv = [{ id: 'espada_inicial' }];
        else {
            o.inv = o.inv.map(c => {
                if (typeof c === 'string') return { id: iconToId[c] || 'espada_inicial' };
                if (c && c.id && getItemById(c.id)) return { id: c.id };
                return { id: 'espada_inicial' };
            });
        }

        if (!o.equipped) o.equipped = { weapon: null, armor: null, accessory: null };

        applyClassBase(o);

        const wi = o.inv.findIndex(c => getItemById(c.id) && getItemById(c.id).slot === 'weapon');
        if (o.equipped.weapon == null && wi >= 0) o.equipped.weapon = wi;

        recalcStats(o);
        return o;
    }

    function applyPetTurnEffects() {
        const pet = getActivePet();
        if (!pet || !window.e.alive) return;

        if (pet.type === 'dot') {
            if (window.p.enemyDotTurns > 0) {
                window.e.hp -= window.p.enemyDotDmg;
                window.p.enemyDotTurns--;
                if (window.UIModule) {
                    window.UIModule.addLog(`${pet.emoji} veneno: ${window.p.enemyDotDmg} de dano`, '#22c55e');
                }
            } else if (Math.random() < 0.33) {
                window.p.enemyDotDmg = Math.max(2, Math.floor(2 + window.p.stage * 0.12));
                window.p.enemyDotTurns = 3;
                if (window.UIModule) {
                    window.UIModule.addLog(`${pet.emoji} aplicou veneno!`, '#84cc16');
                }
            }
        } else if (pet.type === 'damage' && Math.random() < 0.55) {
            const hit = Math.max(2, Math.floor(3 + window.p.stage * 0.22));
            window.e.hp -= hit;
            if (window.UIModule) {
                window.UIModule.addLog(`${pet.emoji} atacou: ${hit} dano passivo`, '#fca5a5');
            }
        }

        if (window.e.hp <= 0 && window.e.alive) {
            if (window.EnemyModule) {
                window.EnemyModule.damageEnemy(0, false, true);
            }
        }
    }

    function applyPetLootBonus() {
        const pet = getActivePet();
        if (!pet || pet.type !== 'loot') return;
        if (Math.random() < 0.4) {
            const gold = 8 + Math.floor(Math.random() * 12);
            window.p.gold += gold;
            if (window.UIModule) {
                window.UIModule.addLog(`${pet.emoji} trouxe +${gold} ouro`, '#fbbf24');
            }
        } else if (Math.random() < 0.25 && window.p.inv.length < 12) {
            const candidate = itemsDb.filter(it => it.slot !== 'class' && it.price > 0 && it.id !== 'espada_inicial');
            const item = candidate[Math.floor(Math.random() * candidate.length)];
            if (item) {
                window.p.inv.push({ id: item.id });
                if (window.UIModule) {
                    window.UIModule.addLog(`${pet.emoji} encontrou ${item.icon} ${item.name}!`, '#c4b5fd');
                }
            }
        }
    }

    function equipBonusesFromState() {
        let atk = 0, def = 0, mhp = 0;
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const idx = window.p.equipped[slot];
            if (idx == null) return;
            const cell = window.p.inv[idx];
            if (!cell || !cell.id) return;
            const it = getItemById(cell.id);
            const sk = equipSlotKeyForItem(it);
            if (!it || sk !== slot) return;
            atk += it.bonusAtk || 0;
            def += it.bonusDef || 0;
            mhp += it.bonusMHp || 0;
        });
        return { atk, def, mhp };
    }

    // Exportar funções públicas
    return {
        classesDb,
        petsDb,
        itemsDb,
        iconToId,
        getClassById,
        getPetById,
        getItemById,
        defaultPlayer,
        applyClassBase,
        unlockPet,
        getActivePet,
        getLootLuckPercent,
        applyPlayerSprite,
        equipSlotKeyForItem,
        fixEquippedIndicesAfterRemove,
        isInvIndexEquipped,
        recalcStats,
        migratePlayer,
        applyPetTurnEffects,
        applyPetLootBonus,
        equipBonusesFromState
    };
})();
