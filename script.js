let pontos = 0;
let fase = 1;

let maxHP = 100;
let playerHP = maxHP;

let dano = 10; // Aumentei um pouco pro começo não ser tediante
let defesa = 0;
let arma = "Nenhuma";

let enemyHP, enemyMaxHP, enemyDmg;

// Variáveis do Sistema de Combate
let enemyTimer;
let isTelegraphing = false; // Define se é a hora certa do parry!
let parryCooldown = false;

// ELEMENTOS DOM
const elEnemy = document.getElementById("enemyIcon");
const elLog = document.getElementById("log");

// LOG
function log(msg, color = "white") {
    elLog.innerHTML = `<span style="color:${color}">${msg}</span><br>` + elLog.innerHTML;
}

// INICIO
function novoJogo() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("jogo").style.display = "block";
    log("A descida começou...", "gold");
    spawnEnemy();
    atualizarUI();
}

// SPAWN
function spawnEnemy() {
    clearTimeout(enemyTimer); // Limpa o ciclo do inimigo anterior
    isTelegraphing = false;
    elEnemy.className = ""; // Limpa animações

    let boss = fase % 5 === 0;

    enemyMaxHP = boss ? 150 + (fase * 30) : 40 + (fase * 15);
    enemyHP = enemyMaxHP;
    enemyDmg = boss ? 15 + (fase * 2) : 5 + fase;

    document.getElementById("enemyName").innerText = boss ? "💀 BOSS: O Guardião" : "Goblin Saqueador";
    elEnemy.innerText = boss ? "💀" : "👺";
    
    iniciarCicloDeAtaque();
}

// O NOVO CICLO DO INIMIGO (Inteligente)
function iniciarCicloDeAtaque() {
    // 1. O Inimigo espera um pouco (tempo aleatório pra não ser robótico)
    let tempoEspera = 1500 + Math.random() * 1000; 

    enemyTimer = setTimeout(() => {
        
        // 2. FASE DE TELEGRAPH (Aviso visual para o jogador!)
        isTelegraphing = true;
        elEnemy.classList.add("anim-telegraph");
        
        // O jogador tem exatos 800ms para apertar o Parry
        enemyTimer = setTimeout(() => {
            isTelegraphing = false;
            elEnemy.classList.remove("anim-telegraph");
            
            // 3. O ATAQUE ACONTECE
            executarAtaqueInimigo();

        }, 800); 

    }, tempoEspera);
}

function executarAtaqueInimigo() {
    elEnemy.classList.add("anim-strike");
    
    // Tira a animação logo depois
    setTimeout(() => elEnemy.classList.remove("anim-strike"), 200);

    let dmg = enemyDmg - defesa;
    if (dmg < 1) dmg = 1;

    playerHP -= dmg;
    log(`💥 Você sofreu ${dmg} de dano!`, "#ef4444");
    
    // Balança a tela
    document.body.classList.add("anim-screen-shake");
    setTimeout(() => document.body.classList.remove("anim-screen-shake"), 400);

    atualizarUI();

    if (playerHP <= 0) {
        alert(`Fim de jogo! Você chegou na Fase ${fase} com ${pontos} moedas.`);
        location.reload();
    } else {
        // Reinicia o ciclo para o próximo ataque
        iniciarCicloDeAtaque();
    }
}

// ATACAR
function atacar() {
    enemyHP -= dano;
    
    // Animação de tomar dano
    elEnemy.classList.remove("anim-shake"); // reseta pra poder repetir rápido
    void elEnemy.offsetWidth; // truque de JS pra forçar reflow
    elEnemy.classList.add("anim-shake");

    if (enemyHP <= 0) {
        matarEnemy();
    }
    atualizarUI();
}

// O NOVO PARRY (Agora funciona!)
function parry() {
    if (parryCooldown) return; // Evita spam do botão

    let btn = document.getElementById("btnParry");
    
    if (isTelegraphing) {
        // PARRY PERFEITO!
        clearTimeout(enemyTimer); // Cancela o ataque do inimigo
        isTelegraphing = false;
        elEnemy.classList.remove("anim-telegraph");

        log("✨ PARRY PERFEITO! Inimigo atordoado!", "#3b82f6");
        
        // Contra-ataque dá o dobro de dano
        enemyHP -= dano * 2;
        elEnemy.classList.add("anim-shake");
        
        if (enemyHP <= 0) {
            matarEnemy();
        } else {
            // Inimigo fica atordoado por 2 segundos antes de recomeçar o ciclo
            enemyTimer = setTimeout(iniciarCicloDeAtaque, 2000);
        }
    } else {
        // ERROU O TIME
        log("❌ Parry falhou!", "gray");
        parryCooldown = true;
        btn.style.opacity = "0.5";
        btn.innerText = "Recarregando...";
        
        // Punição: fica sem parry por 1.5s
        setTimeout(() => {
            parryCooldown = false;
            btn.style.opacity = "1";
            btn.innerText = "🛡️ Parry";
        }, 1500);
    }
    atualizarUI();
}

// MORTE DO INIMIGO
function matarEnemy() {
    clearTimeout(enemyTimer); // Para os ataques na hora!
    let boss = fase % 5 === 0;

    let reward = boss ? enemyMaxHP * 2 : enemyMaxHP;
    pontos += reward;
    log(`💀 Inimigo derrotado! +${reward} 💰`, "#22c55e");

    if (boss) {
        arma = "Espada do Guardião";
        dano += 15;
        log("🔥 DROP LENDÁRIO: Dano +15!", "#fbbf24");
    }

    fase++;
    // Pequeno delay antes de aparecer o próximo para o jogador respirar
    setTimeout(spawnEnemy, 1000); 
}

// LOJA BALANCEADA (Com custos dinâmicos)
let custoDanoBase = 50;
let custoVidaBase = 50;
let multiplicadorLoja = 1.5;

function comprarDano() {
    let custo = Math.floor(custoDanoBase);
    if (pontos >= custo) {
        pontos -= custo;
        dano += 3;
        custoDanoBase *= multiplicadorLoja; // Aumenta o custo exponencialmente
        log("🛒 Machado afiado! Dano +3", "lightblue");
        atualizarUI();
    } else 
    
        log }