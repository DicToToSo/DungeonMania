// PetSystem.js - Sistema de Pets Modular
window.PetSystem = (function() {
    'use strict';

    // Database de pets com 4 categorias
    const petsDb = [
        // Recursos (ganho passivo)
        { 
            id: 'coletor_ouro', 
            name: 'Coletor de Ouro', 
            emoji: '💰', 
            category: 'recursos',
            baseEffect: 2, 
            effectType: 'gold_per_wave',
            description: 'Ganha +2 ouro por onda'
        },
        { 
            id: 'gerador_stamina', 
            name: 'Gerador de Stamina', 
            emoji: '⚡', 
            category: 'recursos',
            baseEffect: 5, 
            effectType: 'stamina_regen',
            description: '+5% regeneração de stamina'
        },
        
        // Itens (chance de drop)
        { 
            id: 'sortudo', 
            name: 'Sortudo', 
            emoji: '🍀', 
            category: 'itens',
            baseEffect: 3, 
            effectType: 'drop_chance',
            description: '+3% chance de drop extra'
        },
        { 
            id: 'caçador', 
            name: 'Caçador', 
            emoji: '🎯', 
            category: 'itens',
            baseEffect: 5, 
            effectType: 'rare_drop',
            description: '+5% chance de itens raros'
        },
        
        // Dano Passivo (ataque automático)
        { 
            id: 'fada_atacante', 
            name: 'Fada Atacante', 
            emoji: '🧚', 
            category: 'dano',
            baseEffect: 8, 
            effectType: 'passive_damage',
            description: 'Causa 8 de dano passivo por turno'
        },
        { 
            id: 'golem', 
            name: 'Golem Guardião', 
            emoji: '🗿', 
            category: 'dano',
            baseEffect: 12, 
            effectType: 'passive_damage',
            description: 'Causa 12 de dano passivo por turno'
        },
        
        // Status Base (buffs em atributos)
        { 
            id: 'esprito_ataque', 
            name: 'Espírito de Ataque', 
            emoji: '🔥', 
            category: 'status',
            baseEffect: 5, 
            effectType: 'atk_buff',
            description: '+5 ATK base'
        },
        { 
            id: 'tartaruga_defesa', 
            name: 'Tartaruga Defensiva', 
            emoji: '🛡️', 
            category: 'status',
            baseEffect: 3, 
            effectType: 'def_buff',
            description: '+3 DEF base'
        },
        { 
            id: 'fênix_vida', 
            name: 'Fênix da Vida', 
            emoji: '🦅', 
            category: 'status',
            baseEffect: 15, 
            effectType: 'hp_buff',
            description: '+15 HP máximo'
        }
    ];

    // Função para gerar 2 opções aleatórias de pets
    function gerarOpcoesPets() {
        const opcoes = [];
        const petsDisponiveis = [...petsDb];
        
        // Garantir que não se repita a mesma opção
        while (opcoes.length < 2 && petsDisponiveis.length > 0) {
            const index = Math.floor(Math.random() * petsDisponiveis.length);
            const pet = petsDisponiveis.splice(index, 1)[0];
            opcoes.push(pet);
        }
        
        return opcoes;
    }

    // Função para aplicar efeito do pet no jogador
    function aplicarEfeitoPet(player, pet) {
        const level = pet.level || 1;
        const effectMultiplier = 1 + (level - 1) * 0.5; // Level 1: 100%, Level 2: 150%, Level 3: 200%
        const finalEffect = Math.floor(pet.baseEffect * effectMultiplier);

        switch (pet.effectType) {
            case 'gold_per_wave':
                // Será aplicado ao final de cada onda
                break;
            case 'stamina_regen':
                player.staminaRegenBonus = (player.staminaRegenBonus || 0) + finalEffect;
                break;
            case 'drop_chance':
                player.dropChanceBonus = (player.dropChanceBonus || 0) + finalEffect;
                break;
            case 'rare_drop':
                player.rareDropBonus = (player.rareDropBonus || 0) + finalEffect;
                break;
            case 'passive_damage':
                player.passiveDamage = (player.passiveDamage || 0) + finalEffect;
                break;
            case 'atk_buff':
                player.baseAtk = (player.baseAtk || 0) + finalEffect;
                break;
            case 'def_buff':
                player.baseDef = (player.baseDef || 0) + finalEffect;
                break;
            case 'hp_buff':
                player.baseMHp = (player.baseMHp || 0) + finalEffect;
                player.hp = Math.min(player.hp + finalEffect, player.baseMHp);
                break;
        }
    }

    // Função para remover efeito do pet
    function removerEfeitoPet(player, pet) {
        const level = pet.level || 1;
        const effectMultiplier = 1 + (level - 1) * 0.5;
        const finalEffect = Math.floor(pet.baseEffect * effectMultiplier);

        switch (pet.effectType) {
            case 'stamina_regen':
                player.staminaRegenBonus = Math.max(0, (player.staminaRegenBonus || 0) - finalEffect);
                break;
            case 'drop_chance':
                player.dropChanceBonus = Math.max(0, (player.dropChanceBonus || 0) - finalEffect);
                break;
            case 'rare_drop':
                player.rareDropBonus = Math.max(0, (player.rareDropBonus || 0) - finalEffect);
                break;
            case 'passive_damage':
                player.passiveDamage = Math.max(0, (player.passiveDamage || 0) - finalEffect);
                break;
            case 'atk_buff':
                player.baseAtk = Math.max(0, (player.baseAtk || 0) - finalEffect);
                break;
            case 'def_buff':
                player.baseDef = Math.max(0, (player.baseDef || 0) - finalEffect);
                break;
            case 'hp_buff':
                player.baseMHp = Math.max(0, (player.baseMHp || 0) - finalEffect);
                player.hp = Math.min(player.hp, player.baseMHp);
                break;
        }
    }

    // Função para escolher pet
    function escolherPet(player, petEscolhido) {
        // Remover pet atual se existir
        if (player.petAtual) {
            removerEfeitoPet(player, player.petAtual);
        }

        // Verificar se já possui este pet
        const petExistente = player.petsColecao.find(p => p.id === petEscolhido.id);
        
        if (petExistente) {
            // Aumentar nível do pet existente
            petExistente.level = (petExistente.level || 1) + 1;
            player.petAtual = petExistente;
        } else {
            // Adicionar novo pet à coleção
            const novoPet = { ...petEscolhido, level: 1 };
            player.petsColecao.push(novoPet);
            player.petAtual = novoPet;
        }

        // Aplicar efeito do novo pet
        aplicarEfeitoPet(player, player.petAtual);
    }

    // Função para aplicar dano passivo no inimigo
    function aplicarDanoPassivo(player, enemy) {
        if (player.petAtual && player.petAtual.effectType === 'passive_damage') {
            const dano = player.passiveDamage || 0;
            if (dano > 0 && enemy.hp > 0) {
                enemy.hp = Math.max(0, enemy.hp - dano);
                return dano;
            }
        }
        return 0;
    }

    // Função para aplicar bônus de ouro ao final da onda
    function aplicarBonusOuro(player) {
        if (player.petAtual && player.petAtual.effectType === 'gold_per_wave') {
            const bonus = player.passiveDamage || 0; // Reutilizando a variável
            if (bonus > 0) {
                player.gold += bonus;
                return bonus;
            }
        }
        return 0;
    }

    // Função para inicializar sistema de pets no jogador
    function inicializarPets(player) {
        if (!player.petsColecao) {
            player.petsColecao = [];
        }
        if (!player.petAtual) {
            player.petAtual = null;
        }
        
        // Inicializar bônus
        player.staminaRegenBonus = player.staminaRegenBonus || 0;
        player.dropChanceBonus = player.dropChanceBonus || 0;
        player.rareDropBonus = player.rareDropBonus || 0;
        player.passiveDamage = player.passiveDamage || 0;
    }

    // Função para mostrar seleção de pets
    function mostrarSelecaoPet(callback) {
        const opcoes = gerarOpcoesPets();
        
        // Criar overlay de seleção
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.zIndex = '6000';
        overlay.innerHTML = `
            <div style="background: var(--panel); padding: 30px; border-radius: 12px; max-width: 600px; text-align: center;">
                <h2 style="font-family: 'Cinzel'; color: var(--gold); margin: 0 0 20px;">ESCOLHA SEU PET</h2>
                <p style="color: #94a3b8; margin: 0 0 30px;">A cada 10 ondas você pode escolher um novo pet!</p>
                <div style="display: flex; gap: 20px; justify-content: center;">
                    ${opcoes.map((pet, index) => `
                        <div class="pet-option" data-index="${index}" style="
                            background: rgba(255,255,255,0.05);
                            border: 2px solid var(--border);
                            border-radius: 12px;
                            padding: 20px;
                            cursor: pointer;
                            transition: 0.3s;
                            min-width: 200px;
                        " onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'">
                            <div style="font-size: 3rem; margin-bottom: 10px;">${pet.emoji}</div>
                            <h3 style="font-family: 'Cinzel'; color: #f8fafc; margin: 0 0 8px;">${pet.name}</h3>
                            <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0;">${pet.description}</p>
                            <p style="color: #a78bfa; font-size: 0.75rem; margin: 8px 0 0;">Categoria: ${pet.category}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Adicionar evento de clique
        overlay.addEventListener('click', function(e) {
            const petOption = e.target.closest('.pet-option');
            if (petOption) {
                const index = parseInt(petOption.dataset.index);
                const petEscolhido = opcoes[index];
                document.body.removeChild(overlay);
                callback(petEscolhido);
            }
        });
    }

    // Exportar funções
    return {
        gerarOpcoesPets,
        escolherPet,
        aplicarDanoPassivo,
        aplicarBonusOuro,
        inicializarPets,
        mostrarSelecaoPet,
        aplicarEfeitoPet,
        petsDb
    };
})();
