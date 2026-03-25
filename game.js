const emojis = ['🐙','⭐','🚀','🐱','🍕','🎮','🌈','🍦','⚽'];
let selectedPin = "";
let loginPin = "";
let playerName = "";
let selectedEmojis = "";
let selectedMode = "";
let musicStarted = false;
let baseSpeed = 60;
let currentSpeed = 80;
let score = 0;
let lastTenResults = [];
let targetData = null; 
let currentLetterIndex = 0;
let timeLeft = 1;
let timerEvent;
let isGameOver = false;
let wordList = [];

//backend config 
const API_URL = 'http://localhost:3000';
let authToken = null;



document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('emoji-grid');
    
    // Build emoji grid for register page
    emojis.forEach(e => {
        let div = document.createElement('div');
        div.className = 'emoji-item';
        div.innerText = e;
        div.onclick = () => selectEmoji(e);
        grid.appendChild(div);
    });

    // Login button
    document.getElementById('login-btn').onclick = async () => {
        playerName = document.getElementById('login-name-input').value;

        if (playerName.length < 2 || loginPin.length < 4) {
            alert("Please enter your name and 4-digit PIN!");
            return;
        }

        console.log('Sending:', playerName, loginPin);


        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: playerName, pin: String(loginPin) })
        }).catch(() => null);

        if (res && res.ok) {
            const data = await res.json();
            authToken = data.token;
            navigateTo('mode-page');
        } else {
            alert("Name or PIN incorrect. New here? Click Register!");
        }
    };

    // Register button
    document.getElementById('register-btn').onclick = async () => {
        playerName = document.getElementById('nickname-input').value;

        if (playerName.length < 2 || [...selectedEmojis].length < 3 || selectedPin.length < 4) {
            alert("Please enter a name, pick 3 emojis, and choose a 4-digit PIN!");
            return;
        }

        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: playerName, pin: String(selectedPin) })
        }).catch(() => null);

        if (res && res.ok) {
            const data = await res.json();
            authToken = data.token;
            navigateTo('mode-page');
        } else {
            const data = await res.json();
            alert(data.error || "Could not create account.");
        }
    };
});    

//Adds emoji to username, max 3
function selectEmoji(e) {
    if ([...selectedEmojis].length < 3) {
        selectedEmojis += e;
        document.getElementById('emoji-display').innerText = selectedEmojis;
    }
}

// Adds a number to the PIN, max 4 digits
function selectNumber(n) {
    if (selectedPin.length < 4) {
        selectedPin += n;
        document.getElementById('pin-dots').innerText = selectedPin;
    }
}

// Deletes the last number from the PIN
function deleteNumber() {
    selectedPin = selectedPin.slice(0, -1);
    document.getElementById('pin-dots').innerText = selectedPin || '_ _ _ _';
}

// Login page number input
function loginSelectNumber(n) {
    if (loginPin.length < 4) {
        loginPin += n;
        document.getElementById('login-pin-display').innerText = loginPin;
    }
}

// Delete last digit from login PIN
function loginDeleteNumber() {
    loginPin = loginPin.slice(0, -1);
    document.getElementById('login-pin-display').innerText = loginPin || '_ _ _ _';
}

function navigateTo(pageId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    // show desired screen
    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'flex';
    }
}

function goToDifficulty(mode) {
    //difficulty
    console.log("Selected Mode:", mode);
    alert("Moving to " + mode + " difficulty selection...");
}

// function called from mode seletion
function goToDifficulty(mode) {
    selectedMode = mode;
    navigateTo('difficulty-page');
}

// async function to fetch word from backend based on dificulty
async function launchGame(speed) {
    baseSpeed = speed;

    let difficultyLevel = speed >= 120 ? 3 : speed >= 80 ? 2 : 1;

    const res = await fetch(`${API_URL}/api/words?difficulty=${difficultyLevel}&limit=20`, {
        headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const data = await res.json();
    wordList = data.words.map(w => ({
        base: w.base_form,
        past: w.past_simple,
        future: 'will ' + w.base_form,
        sentence: `Yesterday, I ___ ${w.base_form}.`
    }));
    
    // hide menu
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('game-container').style.display = 'block';

    new Phaser.Game(phaserConfig);
}

const phaserConfig = {
    type: Phaser.AUTO,
    width: 800, height: 600,
    parent: 'game-container',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    scene: { preload: preload, create: create, update: update }
};

function preload() {
    this.load.image('octopus', 'octopus.png');
    this.load.image('bubble', 'bubble.png');
    this.load.image('ocean', 'ocean.jpg');
    this.load.audio('soundtrack', 'soundtrack.mp3');

    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.fillStyle(0x70d6ff, 0.5);
    graphics.fillCircle(30, 30, 25);
    graphics.strokeCircle(30, 30, 25);
    
    
    // falling objects
    graphics.fillStyle(0xffffff, 1);
    graphics.generateTexture('target-bubble', 60, 60);
    graphics.generateTexture('target-past', 40, 40);
    graphics.clear();

    //bullets
    graphics.fillStyle(0x4ade80, 1);
    graphics.fillRect(0, 0, 8, 16);
    graphics.generateTexture('bullet', 8, 16);
}

function create() {
    let bg = this.add.image(400, 300, 'ocean');
    bg.setDisplaySize(800, 600);
    // Start background music
    this.music = this.sound.add('soundtrack', { loop: true, volume: 0.4 });
    this.music.play();

    
    this.wordList = wordList;
    this.wordQueue = Phaser.Utils.Array.Shuffle([...wordList]);


    this.bullets = this.physics.add.group();
    this.targets = this.physics.add.group();

    // moving ocotopus
    this.player = this.physics.add.sprite(400, 500, 'octopus');
    this.player.setScale(0.2);
    this.player.setCollideWorldBounds(true);

    // HUD 
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '28px', fill: '#4ade80', fontStyle: 'bold', stroke: '#000', strokeThickness: 3});
    this.promptText = this.add.text(400, 100, '', { fontSize: '26px', fill: '#000000', fontStyle: 'bold', stroke: '#0000', strokeThickness: 5}).setOrigin(0.5);

    // collision logic
    this.physics.add.overlap(this.bullets, this.targets, (bullet, target) => {
        const isCorrect = target.getData('correct');
        bullet.destroy();
        handleHit(this, target, isCorrect);
    });

    // shoot on click
   this.input.on('pointerdown', () => {
    let startX = this.player.x + 35;
    let startY = this.player.y - 40;
    let b = this.bullets.create(startX, startY, 'bubble');
    b.setScale(0.2);

    // Calculate angle toward mouse and shoot in that direction
    let angle = Phaser.Math.Angle.Between(startX, startY, this.input.x, this.input.y);
    let speed = 600;
    b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
});

    this.nextRound();
    this.time.addEvent({ delay: 1800, callback: () => spawnObject(this), loop: true });
    
    this.timerText = this.add.text(780, 20, 'Time: 90', {fontSize: '28px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000',strokeThickness: 3 }).setOrigin(1, 0);

    // timer
    timerEvent = this.time.addEvent({delay: 1000, callback: onTimerTick, callbackScope: this, loop: true});
}

// Generates sound effects using Web Audio API — no files needed
function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'correct') {
        // Happy bubble pop sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(520, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
        // Wrong answer thud
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    }

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
}

function onTimerTick() {
    if (isGameOver) return;

    timeLeft--;
    this.timerText.setText('Time: ' + timeLeft);

    // colour changes when time is low
    if (timeLeft <= 10) {
        this.timerText.setFill('#ff7675');
    }

    if (timeLeft <= 0) {
        endRound(this);
    }
}

function endRound(scene) {
    isGameOver = true;
    timerEvent.remove(); // stop the clock
    scene.physics.pause(); // stop all movement

    // scoring system
    let starsEarned = 0;
    if (score >= 150) starsEarned = 5;
    else if (score >= 100) starsEarned = 4;
    else if (score >= 60) starsEarned = 3;
    else if (score >= 30) starsEarned = 2;
    else if (score > 0) starsEarned = 1;

    let overlay = scene.add.rectangle(400, 300, 800, 600, 0x002b5b, 0.85);
    let card = scene.add.rectangle(400, 300, 450, 400, 0x2d3436, 1).setStrokeStyle(4, 0x4ade80);


    scene.add.text(400, 180, 'MISSION COMPLETE!', { 
        fontSize: '40px', fill: '#4ade80', fontStyle: 'bold', fontFamily: 'Arial'
    }).setOrigin(0.5);

    // stars or empty circle
    for (let i = 0; i < 5; i++) {
        let starX = 280 + (i * 60);
        let starChar = (i < starsEarned) ? '⭐' : '🔘'; 
        let star = scene.add.text(starX, 280, starChar, { 
            fontSize: '45px',
            padding: { top: 15, bottom: 10 }
        }).setOrigin(0.5).setAlpha(0);
        
        scene.tweens.add({
            targets: star,
            alpha: 1,
            scale: { from: 0, to: 1 },
            delay: i * 150,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    scene.add.text(400, 360, `Final Score: ${score}`, { 
        fontSize: '24px', fill: '#fff', fontFamily: 'Courier' 
    }).setOrigin(0.5);

    let btn = scene.add.rectangle(400, 440, 200, 60, 0x4ade80, 1).setInteractive({ useHandCursor: true });
    scene.add.text(400, 440, 'CONTINUE', { fontSize: '20px', fill: '#1a1a1a', fontStyle: 'bold' }).setOrigin(0.5);

    btn.on('pointerdown', () => {
        document.getElementById('game-container').style.display = 'none';
        navigateTo('next-action-page');
        } 
    );
}

function restartLevel() {
    // Reset game variables
    score = 0;
    timeLeft = 60;
    isGameOver = false;
    navigateTo('none');
    document.getElementById('game-container').style.display = 'block';
    // Logic to restart the Phaser scene...
    window.location.reload(); // Simplest reset for demo purposes
}



// Saves completed game session to backend
async function saveSession(difficulty, correct, incorrect) {
    if (!authToken) return;
    try {
        await fetch(`${API_URL}/api/scores/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({ mode: selectedMode, difficulty, correct, incorrect })
        });
    } catch (err) {
        console.error('Could not save session:', err);
    }
}

function update() {
    this.player.x = Phaser.Math.Linear(this.player.x, this.input.x, 0.2);

    if (!musicStarted && this.music) { this.music.play(); musicStarted = true; }

    // Draw aim line from player to mouse
    if (this.aimLine) this.aimLine.clear();
    else this.aimLine = this.add.graphics();

    this.aimLine.lineStyle(2, 0x4ade80, 0.5);
    this.aimLine.beginPath();
    this.aimLine.moveTo(this.player.x + 35, this.player.y - 40);
    this.aimLine.lineTo(this.input.x, this.input.y);
    this.aimLine.strokePath();

    // Draw crosshair at mouse position
    if (this.crosshair) this.crosshair.clear();
    else this.crosshair = this.add.graphics();

    this.crosshair.lineStyle(2, 0x4ade80, 1);
    this.crosshair.strokeCircle(this.input.x, this.input.y, 15);
    this.crosshair.beginPath();
    this.crosshair.moveTo(this.input.x - 20, this.input.y);
    this.crosshair.lineTo(this.input.x + 20, this.input.y);
    this.crosshair.moveTo(this.input.x, this.input.y - 20);
    this.crosshair.lineTo(this.input.x, this.input.y + 20);
    this.crosshair.strokePath();

    
}

// game funtions
function handleHit(scene, target, isCorrect) {
    if (isCorrect) {
        playSound('correct');
        
        score += 10;
        scene.sessionCorrect++;
        scene.scoreText.setText(`Score: ${score}`);

        scene.player.setTint(0x4ade80);
        scene.time.delayedCall(200, () => scene.player.clearTint());

        if (selectedMode === 'spelling') {
            currentLetterIndex++;
           
            if (currentLetterIndex >= targetData.base.length) {
                clearRemainingBubbles(scene); 
                scene.nextRound(); 
            }
        } else {
 
            clearRemainingBubbles(scene);
            scene.nextRound();
        }
        

        updateDifficulty(true);
        
    } else {

        playSound('wrong');
        scene.sessionIncorrect++;
        updateDifficulty(false);
        target.setAlpha(0.2);
    }
    
    // always destroy the bullet and the specific bubble hit
    target.destroy();
}

function clearRemainingBubbles(scene) {
    scene.targets.clear(true, true); // removes all existing bubbles instantly
}

function spawnObject(scene) {
    if (isGameOver) return;
    if (!targetData) return;

    // In spelling mode, don't spawn if we've already completed the word
    if (selectedMode === 'spelling' && currentLetterIndex >= targetData.base.length) return;

    let x = Phaser.Math.Between(80, 720);

    // Make sure new bubble isn't too close to existing ones
    let attempts = 0;
    let tooClose = true;
    while (tooClose && attempts < 10) {
        tooClose = false;
        scene.targets.getChildren().forEach(existing => {
            if (Math.abs(existing.x - x) < 100) {
                x = Phaser.Math.Between(80, 720);
                tooClose = true;
         }
        });
        attempts++;
    }

let target = scene.targets.create(x, -50, 'target-bubble');
target.setVelocityY(currentSpeed);

    let val, isCorrect;

    if (selectedMode === 'spelling') {
        const correctLetter = targetData.base[currentLetterIndex].toUpperCase();
        isCorrect = Math.random() > 0.4;
        if (isCorrect) {
            val = correctLetter;
        } else {
            // Generate a wrong letter that is never the correct one
            let wrong;
            do {
                wrong = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Phaser.Math.Between(0, 25)];
            } while (wrong === correctLetter);
            val = wrong;
        }
    } else {
        let options = [targetData.past, targetData.base, targetData.future];
        val = Phaser.Utils.Array.GetRandom(options);
        isCorrect = (val === targetData.past);
    }

    target.setData('correct', isCorrect);
    target.setData('wordId', targetData.id);

    let label = scene.add.text(x, -50, val, { 
        fontSize: '22px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 
    }).setOrigin(0.5);
    
    scene.events.on('update', () => {
        if (target.active) { label.x = target.x; label.y = target.y; } 
        else { label.destroy(); }
    });
}

Phaser.Scene.prototype.nextRound = function() {
    currentLetterIndex = 0;

    // If all words have been used, reshuffle and start again
    if (this.wordQueue.length === 0) {
        this.wordQueue = Phaser.Utils.Array.Shuffle([...this.wordList]);
    }

    // Take the next word from the queue instead of random
    targetData = this.wordQueue.pop();

    let task = (selectedMode === 'spelling') ? 
        `SPELL: ${targetData.base.toUpperCase()}` : 
        targetData.sentence;
    
    this.promptText.setText(task);
    // console.log("State Updated: Moving to next question.");
};

// Fetches and displays the leaderboard
async function showLeaderboard() {
    navigateTo('leaderboard-page');

    const list = document.getElementById('leaderboard-list');
    list.innerHTML = 'Loading...';

    try {
        const res = await fetch(`${API_URL}/api/scores/leaderboard`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        const data = await res.json();

        if (!data.leaderboard || data.leaderboard.length === 0) {
            list.innerHTML = '<p style="color:white;">No scores yet — be the first!</p>';
            return;
        }

        list.innerHTML = data.leaderboard.map((entry, i) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #4ade8044; color:white;">
                <span>${i + 1}. ${entry.username}</span>
                <span style="color:var(--green); font-weight:bold;">${entry.topScore} ✓</span>
            </div>
        `).join('');

    } catch (err) {
        list.innerHTML = '<p style="color:#f87171;">Could not load leaderboard.</p>';
    }
}

function updateDifficulty(isCorrect) {
    lastTenResults.push(isCorrect);
    if (lastTenResults.length > 10) lastTenResults.shift();
    if (lastTenResults.length === 10) {
        let acc = (lastTenResults.filter(r => r).length / 10) * 100;
        if (acc >= 90) currentSpeed += 20; // increase speed as they progress
        else if (acc <= 40) currentSpeed = Math.max(40, currentSpeed - 15); // reduce speed if they struggle
        lastTenResults = [];
    }
}