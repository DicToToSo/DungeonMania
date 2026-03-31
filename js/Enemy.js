// Enemy.js - Lógica dos inimigos
window.EnemyModule = (function() {
    'use strict';

    // Diferenças de dificuldade por mundo
    const WORLD_DIFF_MULT = {
        1: { hp: 1, dmg: 1, gold: 1, loot: 1, slow: 1 },
        2: { hp: 1.3, dmg: 1.12, gold: 1.22, loot: 1.18, slow: 1.12 },
        3: { hp: 1.58, dmg: 1.22, gold: 1.42, loot: 1.35, slow: 1.2 }
    };

    // Mundos disponíveis
    const WORLDS = [
        { id: 1, slug: 'floresta', name: 'Floresta', emoji: '🌲', bgClass: 'bg-world-1', enemyPrefix: 'Selva' },
        { id: 2, slug: 'reino_magico', name: 'Reino Mágico', emoji: '✨', bgClass: 'bg-world-2', enemyPrefix: 'Arcano' },
        { id: 3, slug: 'mundo_vazio', name: 'Mundo Vazio', emoji: '⬛', bgClass: 'bg-world-3', enemyPrefix: 'Vazio' }
    ];

    function getWorldDifficultyMult(world) {
        return WORLD_DIFF_MULT[world] || WORLD_DIFF_MULT[1];
    }

    function getWorldMeta(id) {
        return WORLDS.find(w => w.id === id) || WORLDS[0];
    }

    function computeEnemyStats() {
        const s = window.p.stage || 1;
        const w = window.p.world || 1;
        const D = getWorldDifficultyMult(w);
        const slowExtra = 1 + (D.slow - 1) * Math.min(30, s) * 0.035;
        const growth = (28 + s * 11 + (s * s) * 0.12) * slowExtra;
        const wMult = 1 + (w - 1) * 0.22;
        const mHp = Math.floor(growth * wMult * D.hp);
        const baseDmg = 5.5 + s * 1.15 + (w - 1) * 2.4;
        const dmg = Math.max(4, Math.floor(baseDmg * (1 + (w - 1) * 0.08) * D.dmg));
        return { mHp, dmg };
    }

    function spawn() {
        if(!window.p.alive || window.gamePaused) return;
        
        // Verificar se deve oferecer carta
        if (window.shouldOfferCard && window.shouldOfferCard()) { 
            if (window.openCardChoice) window.openCardChoice(); 
            if (window.updateUI) window.updateUI(); 
            return; 
        }
        
        // Verificar se deve abrir loja
        if(window.p.stage > 1 && window.p.stage % 5 === 0) { 
            if (window.openShop) window.openShop(); 
            if (window.updateUI) window.updateUI(); 
            return; 
        }
        
        window.e.alive = true;
        window.p.enemyDotTurns = 0;
        window.p.enemyDotDmg = 0;
        const meta = getWorldMeta(window.p.world);
        const st = computeEnemyStats();
        window.e.mHp = st.mHp; 
        window.e.hp = window.e.mHp;
        window.e.dmg = st.dmg;
        
        const eNameEl = document.getElementById('e-name');
        if (eNameEl) {
            eNameEl.innerText = meta.enemyPrefix + " · SALA " + window.p.stage;
        }
        
        if (window.UIModule) {
            window.UIModule.addLog(`${meta.name} — Sala ${window.p.stage}: combate!`, '#fff');
        }
        
        enemyTurn();
        if (window.updateUI) window.updateUI();
    }

    function enemyTurn() {
        if(!window.e.alive || !window.p.alive || window.shopOpen || window.gamePaused) return;
        
        window.turnTimer = setTimeout(() => {
            if(!window.e.alive || !window.p.alive || window.shopOpen || window.gamePaused) return;
            
            // Aplicar efeitos de pet
            if (window.PlayerModule) {
                window.PlayerModule.applyPetTurnEffects();
            }
            
            if (!window.e.alive || window.e.hp <= 0) { 
                if (window.updateUI) window.updateUI(); 
                return; 
            }
            
            if (window.UIModule) {
                window.UIModule.triggerAnim('p-box', 'anim-shake');
            }

            // Verificar esquiva do arqueiro
            if (window.p.classId === 'arqueiro' && Math.random() < (window.p.dodgeChance || 0)) {
                if (window.UIModule) {
                    window.UIModule.addLog('Esquiva perfeita do Arqueiro!', '#38bdf8');
                }
                if (window.updateUI) window.updateUI();
                enemyTurn();
                return;
            }
            
            // Verificar resistência do tank
            if (window.p.classId === 'tank' && Math.random() < (window.p.standChance || 0)) {
                if (window.UIModule) {
                    window.UIModule.addLog('Tank aguentou o golpe sem dano!', '#fbbf24');
                }
                if (window.updateUI) window.updateUI();
                enemyTurn();
                return;
            }

            let d;
            if (window.isDef) {
                d = Math.max(1, Math.floor(window.e.dmg * 0.12 - (window.p.def * 0.08)));
            } else {
                d = Math.max(2, Math.floor(window.e.dmg - (window.p.def * 0.55)));
            }
            window.p.hp -= d;
            window.p.killStreak = 0;
            
            if (window.UIModule) {
                window.UIModule.addLog(`Dano recebido: ${d}${window.isDef ? ' (bloqueio)' : ''}`, '#f43f5e');
            }
            
            if(window.p.hp <= 0) { 
                window.p.alive = false; 
                if (window.showGameOver) window.showGameOver(); 
                return; 
            }
            
            if (window.updateUI) window.updateUI(); 
            enemyTurn();
        }, 2800);
    }

    function damageEnemy(val, isCrit, fromPet) {
        const variance = 1 + Math.floor(Math.random() * (4 + Math.min(6, window.p.stage / 3)));
        let d = Math.floor(val + Math.random() * variance);
        if (fromPet) d = 0;
        window.e.hp -= d;
        
        if (isCrit && window.UIModule) {
            window.UIModule.addLog(`CRÍTICO! ${d} de dano!`, '#f472b6');
        } else if (!fromPet && window.UIModule) {
            window.UIModule.addLog(`Você causou ${d} de dano!`, '#10b981');
        }
        
        if(window.e.hp <= 0) { 
            window.e.alive = false; 
            clearTimeout(window.turnTimer); 
            window.p.stage++;
            window.p.killStreak = (window.p.killStreak || 0) + 1;
            window.p.totalKillsLifetime = (window.p.totalKillsLifetime || 0) + 1;
            
            const D = getWorldDifficultyMult(window.p.world || 1);
            const baseGold = Math.floor((38 + Math.floor(window.p.stage * 1.4) + (window.p.world - 1) * 10) * D.gold);
            const streakBonus = Math.min(40, (window.p.killStreak - 1) * 5);
            const goldGain = baseGold + streakBonus;
            window.p.gold += goldGain;
            
            // Aplicar bônus de pet
            if (window.PlayerModule) {
                window.PlayerModule.applyPetLootBonus();
            }
            
            // Rolar loot
            if (window.rollLootOnKill) {
                window.rollLootOnKill();
            }
            
            // Atualizar kills globais
            if (typeof window.DMDB !== 'undefined') {
                if (window.p.world === 1) window.DMDB.incrementKill(1);
                if (window.p.world === 2) window.DMDB.incrementKill(2);
            }
            
            // Verificar avanço de mundo
            if (window.checkWorldAdvanceAfterKill) {
                window.checkWorldAdvanceAfterKill();
            }
            
            if (window.bumpMaxStage) window.bumpMaxStage();
            
            if (window.UIModule) {
                const victoryMsg = window.formatVictoryGold ? 
                    window.formatVictoryGold(goldGain, streakBonus) : 
                    `+${goldGain} ouro`;
                window.UIModule.addLog(`Vitória! ${victoryMsg}`, '#f59e0b');
            }
            
            if (window.save) window.save();
            
            if (window.gamePaused) { 
                if (window.updateUI) window.updateUI(); 
                return; 
            }
            
            setTimeout(spawn, 1150);
        }
        
        if (window.updateUI) window.updateUI();
    }

    // Exportar funções públicas
    return {
        WORLD_DIFF_MULT,
        WORLDS,
        getWorldDifficultyMult,
        getWorldMeta,
        computeEnemyStats,
        spawn,
        enemyTurn,
        damageEnemy
    };
})();
