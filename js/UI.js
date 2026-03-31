// UI.js - Lógica da interface do usuário
window.UIModule = (function() {
    'use strict';

    // Cartas de buff disponíveis
    const buffCardsDb = [
        { id: 'atk_minor', title: 'Fúria de Aço', desc: '+2 ATK permanente.', apply: (pl) => { pl.buffAtk = (pl.buffAtk || 0) + 2; } },
        { id: 'def_minor', title: 'Pele de Pedra', desc: '+2 DEF permanente.', apply: (pl) => { pl.buffDef = (pl.buffDef || 0) + 2; } },
        { id: 'hp_minor', title: 'Sangue Ancestral', desc: '+14 HP máximo permanente.', apply: (pl) => { pl.buffMHp = (pl.buffMHp || 0) + 14; } },
        { id: 'stam_boost', title: 'Pulmão de Ferro', desc: '+10 Stamina máxima e +1 regen.', apply: (pl) => { pl.buffStamMax = (pl.buffStamMax || 0) + 10; pl.buffStamRegen = (pl.buffStamRegen || 0) + 1; } },
        { id: 'luck_up', title: 'Amuleto da Fortuna', desc: '+1.5% sorte de loot.', apply: (pl) => { pl.buffLootLuck = (pl.buffLootLuck || 0) + 1.5; } },
        { id: 'unlock_pet_slime', title: 'Pacto do Slime', desc: 'Desbloqueia o pet 🟢 (veneno DoT).', apply: (pl) => {
            if (window.PlayerModule) window.PlayerModule.unlockPet(pl, 'slime');
        }},
        { id: 'unlock_pet_wolf', title: 'Pacto do Lobo', desc: 'Desbloqueia o pet 🐺 (dano passivo).', apply: (pl) => {
            if (window.PlayerModule) window.PlayerModule.unlockPet(pl, 'wolf');
        }}
    ];

    let currentCardOptions = [];

    function drawCardOptions() {
        const pool = buffCardsDb.slice();
        const result = [];
        while (pool.length && result.length < 3) {
            const i = Math.floor(Math.random() * pool.length);
            result.push(pool.splice(i, 1)[0]);
        }
        return result;
    }

    function openCardChoice() {
        currentCardOptions = drawCardOptions();
        const list = document.getElementById('card-choice-list');
        if (!list) return;
        
        list.innerHTML = '';
        currentCardOptions.forEach(card => {
            const el = document.createElement('div');
            el.className = 'card-pick';
            el.innerHTML = `<div class="card-pick-title">${card.title}</div><div class="card-pick-desc">${card.desc}</div>`;
            el.onclick = () => chooseCard(card.id);
            list.appendChild(el);
        });
        window.gamePaused = true;
        const overlay = document.getElementById('card-choice-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    function chooseCard(cardId) {
        const card = buffCardsDb.find(c => c.id === cardId);
        if (!card) return;
        card.apply(window.p);
        window.p.cardHistory = window.p.cardHistory || [];
        window.p.cardHistory.push(cardId);
        window.p.lastCardStageOffered = window.p.stage;
        
        const overlay = document.getElementById('card-choice-overlay');
        if (overlay) overlay.style.display = 'none';
        
        window.gamePaused = false;
        
        if (window.PlayerModule) {
            window.PlayerModule.applyClassBase();
            window.PlayerModule.recalcStats();
        }
        
        const pet = window.PlayerModule ? window.PlayerModule.getActivePet() : null;
        addLog(`Carta escolhida: ${card.title}${pet ? ` · Pet ativo: ${pet.emoji}` : ''}`, '#a78bfa');
        
        if (window.save) window.save();
        if (window.EnemyModule) window.EnemyModule.spawn();
    }

    function openShop() {
        window.shopOpen = true;
        window.e.alive = false;
        clearTimeout(window.turnTimer);
        
        const shopUI = document.getElementById('shop-ui');
        if (shopUI) shopUI.style.display = 'flex';
        
        const goldVal = document.getElementById('shop-gold-val');
        if (goldVal) goldVal.innerText = window.p.gold;
        
        const grid = document.getElementById('shop-items');
        if (!grid) return;
        grid.innerHTML = '';

        const offers = [];
        const itemsDb = window.PlayerModule ? window.PlayerModule.itemsDb : [];
        
        // Oferecer classes não possuídas
        const classPool = itemsDb.filter(it => it.slot === 'class' && it.price > 0 && (!window.p.ownedClasses || !window.p.ownedClasses.includes(it.classId)));
        if (classPool.length) {
            offers.push(classPool[Math.floor(Math.random() * classPool.length)]);
        }
        
        let guard = 0;
        while (offers.length < 3 && guard++ < 50) {
            const rnd = Math.random();
            let pool = itemsDb.filter(it => it.price > 0 && it.slot !== 'class' && it.rarity >= (rnd - 0.5));
            if (!pool.length) pool = itemsDb.filter(it => it.price > 0 && it.slot !== 'class');
            const item = pool[Math.floor(Math.random() * pool.length)];
            if (item && !offers.some(o => o.id === item.id)) offers.push(item);
        }
        
        const nonClass = itemsDb.filter(it => it.price > 0 && it.slot !== 'class');
        while (offers.length < 3 && nonClass.length) {
            const fb = nonClass[offers.length % nonClass.length];
            if (!offers.some(o => o.id === fb.id)) offers.push(fb);
            else break;
        }
        offers.sort(() => Math.random() - 0.5);

        offers.forEach(item => {
            const div = document.createElement('div');
            div.className = `shop-item ${item.rarity < 0.2 ? 'rarity-legendary' : ''}`;
            const tag = item.slot === 'class' ? '<br><small style="color:#a78bfa">Classe</small>' : '';
            div.innerHTML = `<div style="font-size:2rem">${item.icon}</div><b>${item.name}</b>${tag}<br><span style="color:var(--gold)">💰 ${item.price}</span>`;
            div.onclick = () => buyItem(item, div);
            grid.appendChild(div);
        });
    }

    function buyItem(it, element) {
        if (element.classList.contains('sold-out')) return;

        if (it.slot === 'class') {
            if (window.p.ownedClasses && window.p.ownedClasses.includes(it.classId)) {
                addLog('Você já domina esta classe!', '#f59e0b');
                return;
            }
            if (window.p.gold < it.price) {
                addLog('Ouro insuficiente!', '#f43f5e');
                return;
            }
            window.p.gold -= it.price;
            window.p.ownedClasses = window.p.ownedClasses || ['heroi'];
            if (!window.p.ownedClasses.includes(it.classId)) window.p.ownedClasses.push(it.classId);
            window.p.classId = it.classId;
            
            if (window.PlayerModule) {
                window.PlayerModule.applyClassBase();
                window.PlayerModule.recalcStats();
                window.PlayerModule.applyPlayerSprite();
            }
            
            element.classList.add('sold-out');
            element.innerHTML = `<div style="font-size:2rem">🚫</div><b>ESGOTADO</b><br><span style="color:#666">COMPRADO</span>`;
            
            const goldVal = document.getElementById('shop-gold-val');
            if (goldVal) goldVal.innerText = window.p.gold;
            
            const className = window.PlayerModule ? window.PlayerModule.getClassById(it.classId).name : it.classId;
            addLog(`Classe adquirida: ${className}!`, '#a78bfa');
            
            if (window.save) window.save();
            if (window.updateUI) window.updateUI();
            return;
        }

        if (window.p.gold >= it.price && window.p.inv.length < 12) {
            window.p.gold -= it.price;
            window.p.inv.push({ id: it.id });
            element.classList.add('sold-out');
            element.innerHTML = `<div style="font-size:2rem">🚫</div><b>ESGOTADO</b><br><span style="color:#666">COMPRADO</span>`;
            
            const goldVal = document.getElementById('shop-gold-val');
            if (goldVal) goldVal.innerText = window.p.gold;
            
            addLog(`Você comprou ${it.name}! (equipe ou use no inventário)`, '#10b981');
            
            if (window.PlayerModule) window.PlayerModule.recalcStats();
            if (window.save) window.save();
            if (window.updateUI) window.updateUI();
        } else {
            addLog('Ouro insuficiente ou mochila cheia!', '#f43f5e');
        }
    }

    function closeShop() {
        window.shopOpen = false;
        const shopUI = document.getElementById('shop-ui');
        if (shopUI) shopUI.style.display = 'none';
        window.p.stage++;
        if (window.bumpMaxStage) window.bumpMaxStage();
        if (window.save) window.save();
        if (window.EnemyModule) window.EnemyModule.spawn();
    }

    function updateUI() {
        if (window.PlayerModule) window.PlayerModule.recalcStats();
        
        const eb = window.PlayerModule ? window.PlayerModule.equipBonusesFromState() : { atk: 0, def: 0, mhp: 0 };
        
        // Atualizar barras do jogador
        const hpBar = document.getElementById('hp-bar');
        const hpText = document.getElementById('hp-text');
        if (hpBar) hpBar.style.width = (window.p.hp/window.p.mHp*100) + "%";
        if (hpText) hpText.innerText = `${window.p.hp}/${window.p.mHp}`;
        
        // Atualizar barras do inimigo
        const eHpBar = document.getElementById('e-hp-bar');
        const eHpText = document.getElementById('e-hp-text');
        const em = window.e.mHp > 0 ? window.e.mHp : 1;
        if (eHpBar) eHpBar.style.width = (Math.max(0, window.e.hp) / em * 100) + "%";
        if (eHpText) eHpText.innerText = `${Math.max(0, window.e.hp)}/${window.e.mHp || 0}`;
        
        // Atualizar stamina
        const smx = window.p.stamMax != null ? window.p.stamMax : 100;
        const stamBar = document.getElementById('stam-bar');
        const stamText = document.getElementById('stam-text');
        if (stamBar) stamBar.style.width = (window.p.stam / smx * 100) + "%";
        if (stamText) stamText.innerText = `${Math.floor(window.p.stam)}/${smx}`;
        
        // Atualizar fúria
        const furyBar = document.getElementById('fury-bar');
        const furyText = document.getElementById('fury-text');
        if (furyBar) furyBar.style.width = window.p.fury + "%";
        if (furyText) furyText.innerText = `${window.p.fury}%`;
        
        // Atualizar nome da classe
        const cn = document.getElementById('ui-class-name');
        if (cn && window.PlayerModule) {
            cn.textContent = 'Classe: ' + window.PlayerModule.getClassById(window.p.classId).name;
        }
        
        // Atualizar botão especial
        const s = document.getElementById('btn-spec');
        if(s) {
            if(window.p.fury >= 100) { 
                s.classList.add('ready'); 
                s.style.opacity = '1'; 
                s.style.cursor = 'pointer'; 
            } else { 
                s.classList.remove('ready'); 
                s.style.opacity = '0.4'; 
                s.style.cursor = 'not-allowed'; 
            }
        }

        // Atualizar ouro e estágio
        const goldEl = document.getElementById('ui-gold');
        const stageEl = document.getElementById('ui-stage');
        if (goldEl) goldEl.innerText = window.p.gold;
        if (stageEl) stageEl.innerText = window.p.stage;
        
        // Atualizar streak e sorte
        const ust = document.getElementById('ui-streak');
        if (ust) ust.textContent = window.p.killStreak != null ? window.p.killStreak : 0;
        
        const ulk = document.getElementById('ui-luck');
        if (ulk && window.PlayerModule) {
            ulk.textContent = window.PlayerModule.getLootLuckPercent() + '%';
        }
        
        // Atualizar botão de bloqueio
        const blk = document.getElementById('btn-block');
        if (blk) blk.classList.toggle('is-blocking', !!window.isDef);
        
        // Atualizar pet
        const pet = window.PlayerModule ? window.PlayerModule.getActivePet() : null;
        const pui = document.getElementById('pet-ui');
        if (pui) {
            const petLabel = pet ? `${pet.emoji} ${pet.name}` : 'Nenhum';
            const owned = (window.p.petOwned || []).map(id => {
                const p = window.PlayerModule ? window.PlayerModule.getPetById(id) : null;
                return p ? p.emoji : '';
            }).filter(Boolean).join(' ');
            pui.innerHTML = `Pet: <b>${petLabel}</b>${owned ? ` · Coleção: ${owned}` : ''}`;
        }
        
        // Atualizar buffs
        const bui = document.getElementById('buff-ui');
        if (bui) bui.innerHTML = `Buffs acumulados: <b>${(window.p.cardHistory || []).length}</b>`;
        
        // Atualizar stats
        const atkEl = document.getElementById('ui-atk');
        const defEl = document.getElementById('ui-def');
        if (atkEl) atkEl.innerText = window.p.atk + (eb.atk ? ` (${window.p.baseAtk}+${eb.atk})` : '');
        if (defEl) defEl.innerText = window.p.def + (eb.def ? ` (${window.p.baseDef}+${eb.def})` : '');

        // Atualizar inventário
        renderInventory();
        
        // Atualizar painel de equipamento
        renderEquipPanel();
        
        // Atualizar linha de progresso do mundo
        if (window.updateWorldProgressLine) window.updateWorldProgressLine();
        
        // Sincronizar botão de avanço
        if (window.syncAdvanceButton) window.syncAdvanceButton();
    }

    function renderInventory() {
        const inv = document.getElementById('inv-grid');
        if (!inv) return;
        
        inv.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const cell = window.p.inv[i];
            const slot = document.createElement('div');
            slot.className = 'inv-slot' + (!cell ? ' inv-empty' : '') + 
                            (cell && window.PlayerModule && window.PlayerModule.isInvIndexEquipped(i) ? ' inv-equipped' : '');
            if (cell) {
                const it = window.PlayerModule ? window.PlayerModule.getItemById(cell.id) : null;
                slot.textContent = it ? it.icon : '?';
                slot.title = it ? `${it.name} — clique para equipar/usar` : '';
                slot.onclick = () => invClick(i);
            }
            inv.appendChild(slot);
        }
    }

    function renderEquipPanel() {
        const slotsEl = document.getElementById('equip-slots');
        const totEl = document.getElementById('equip-totals');
        if (!slotsEl || !totEl) return;
        
        const labels = { weapon: 'Arma', armor: 'Armadura / escudo', accessory: 'Acessório' };
        let html = '';
        
        ['weapon', 'armor', 'accessory'].forEach(key => {
            const idx = window.p.equipped[key];
            let line = '—';
            if (idx != null && window.p.inv[idx]) {
                const it = window.PlayerModule ? window.PlayerModule.getItemById(window.p.inv[idx].id) : null;
                if (it) {
                    const bits = [];
                    if (it.bonusAtk) bits.push(`+${it.bonusAtk} ATK`);
                    if (it.bonusDef) bits.push(`+${it.bonusDef} DEF`);
                    if (it.bonusMHp) bits.push(`+${it.bonusMHp} HP máx.`);
                    line = `${it.icon} ${it.name}${bits.length ? ' (' + bits.join(', ') + ')' : ''}`;
                }
            }
            html += `<div class="equip-line"><span>${labels[key]}</span><b>${line}</b></div>`;
        });
        
        slotsEl.innerHTML = html;
        
        const eb = window.PlayerModule ? window.PlayerModule.equipBonusesFromState() : { atk: 0, def: 0, mhp: 0 };
        const parts = [];
        if (eb.atk) parts.push(`+${eb.atk} ATK`);
        if (eb.def) parts.push(`+${eb.def} DEF`);
        if (eb.mhp) parts.push(`+${eb.mhp} HP máx.`);
        totEl.innerHTML = parts.length
            ? `Bônus do equipamento: ${parts.join(' · ')}`
            : 'Bônus do equipamento: nenhum (equipe armas / escudos / amuletos no inventário).';
    }

    function invClick(index) {
        if (!window.p.inv[index]) return;
        const cell = window.p.inv[index];
        const it = window.PlayerModule ? window.PlayerModule.getItemById(cell.id) : null;
        if (!it) return;

        if (it.slot === 'consumable') {
            const heal = it.heal || 0;
            if (heal) window.p.hp = Math.min(window.p.mHp, window.p.hp + heal);
            window.p.inv.splice(index, 1);
            if (window.PlayerModule) window.PlayerModule.fixEquippedIndicesAfterRemove(index);
            addLog(`Usou ${it.name}! (+${heal} HP)`, '#10b981');
            if (window.PlayerModule) window.PlayerModule.recalcStats();
            if (window.save) window.save();
            updateUI();
            return;
        }

        const slot = window.PlayerModule ? window.PlayerModule.equipSlotKeyForItem(it) : null;
        if (!slot) return;

        if (window.p.equipped[slot] === index) {
            window.p.equipped[slot] = null;
            addLog(`Desequipou ${it.name}.`, '#94a3b8');
        } else {
            window.p.equipped[slot] = index;
            addLog(`Equipou ${it.name}.`, '#10b981');
        }
        if (window.PlayerModule) window.PlayerModule.recalcStats();
        if (window.save) window.save();
        updateUI();
    }

    function setHudVisible(visible) {
        const h = document.getElementById('hud-top');
        if (h) h.style.display = visible ? 'flex' : 'none';
    }

    function addLog(m, c) {
        const l = document.getElementById('log');
        if (!l) return;
        
        const d = document.createElement('div');
        d.style.color = c || '#cbd5e1'; 
        d.style.marginBottom = '5px';
        d.innerText = `> ${m}`;
        l.appendChild(d); 
        l.scrollTop = l.scrollHeight;
    }

    function triggerAnim(id, cls) {
        let el = document.getElementById(id);
        if (el) {
            el.classList.remove(cls); 
            void el.offsetWidth; 
            el.classList.add(cls);
        }
    }

    function renderEquipPanel() {
        const slotsEl = document.getElementById('equip-slots');
        const totEl = document.getElementById('equip-totals');
        if (!slotsEl || !totEl) return;
        
        const labels = { weapon: 'Arma', armor: 'Armadura / escudo', accessory: 'Acessório' };
        let html = '';
        
        ['weapon', 'armor', 'accessory'].forEach(key => {
            const idx = window.p.equipped[key];
            let line = '—';
            if (idx != null && window.p.inv[idx]) {
                const it = window.PlayerModule ? window.PlayerModule.getItemById(window.p.inv[idx].id) : null;
                if (it) {
                    const bits = [];
                    if (it.bonusAtk) bits.push(`+${it.bonusAtk} ATK`);
                    if (it.bonusDef) bits.push(`+${it.bonusDef} DEF`);
                    if (it.bonusMHp) bits.push(`+${it.bonusMHp} HP máx.`);
                    line = `${it.icon} ${it.name}${bits.length ? ' (' + bits.join(', ') + ')' : ''}`;
                }
            }
            html += `<div class="equip-line"><span>${labels[key]}</span><b>${line}</b></div>`;
        });
        
        slotsEl.innerHTML = html;
        
        const eb = window.PlayerModule ? window.PlayerModule.equipBonusesFromState() : { atk: 0, def: 0, mhp: 0 };
        const parts = [];
        if (eb.atk) parts.push(`+${eb.atk} ATK`);
        if (eb.def) parts.push(`+${eb.def} DEF`);
        if (eb.mhp) parts.push(`+${eb.mhp} HP máx.`);
        totEl.innerHTML = parts.length
            ? `Bônus do equipamento: ${parts.join(' · ')}`
            : 'Bônus do equipamento: nenhum (equipe armas / escudos / amuletos no inventário).';
    }

    function invClick(index) {
        if (!window.p.inv[index]) return;
        const cell = window.p.inv[index];
        const it = window.PlayerModule ? window.PlayerModule.getItemById(cell.id) : null;
        if (!it) return;

        if (it.slot === 'consumable') {
            const heal = it.heal || 0;
            if (heal) window.p.hp = Math.min(window.p.mHp, window.p.hp + heal);
            window.p.inv.splice(index, 1);
            if (window.PlayerModule) window.PlayerModule.fixEquippedIndicesAfterRemove(index);
            addLog(`Usou ${it.name}! (+${heal} HP)`, '#10b981');
            if (window.PlayerModule) window.PlayerModule.recalcStats();
            if (window.save) window.save();
            updateUI();
            return;
        }

        const slot = window.PlayerModule ? window.PlayerModule.equipSlotKeyForItem(it) : null;
        if (!slot) return;

        if (window.p.equipped[slot] === index) {
            window.p.equipped[slot] = null;
            addLog(`Desequipou ${it.name}.`, '#94a3b8');
        } else {
            window.p.equipped[slot] = index;
            addLog(`Equipou ${it.name}.`, '#10b981');
        }
        if (window.PlayerModule) window.PlayerModule.recalcStats();
        if (window.save) window.save();
        updateUI();
    }

    // Exportar funções públicas
    return {
        buffCardsDb,
        drawCardOptions,
        openCardChoice,
        chooseCard,
        openShop,
        buyItem,
        closeShop,
        updateUI,
        renderInventory,
        renderEquipPanel,
        invClick,
        setHudVisible,
        addLog,
        triggerAnim
    };
})();
