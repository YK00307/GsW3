// 画面管理
let currentScreen = 1;
let selectedMonster = null;
let monsterHP = 0;
let maxMonsterHP = 0;
let timerInterval = null;
let timerCount = 3;
let playerHand = '';
let cpuHand = '';
let currentRound = 1;
let maxRounds = 10;
let cpuDonTimeout = null;
let playerDonPressed = false;

// HPゲージの更新
function updateHPGauge(hpElement, gaugeElement, currentHP, maxHP) {
  const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  hpElement.textContent = currentHP;
  gaugeElement.style.width = percentage + '%';
  
  // HPの残量に応じて色を変える
  if (percentage > 50) {
    gaugeElement.style.background = 'linear-gradient(to right, #77dd77, #5cb85c)';
  } else if (percentage > 20) {
    gaugeElement.style.background = 'linear-gradient(to right, #ffcc5c, #e8b53a)';
  } else {
    gaugeElement.style.background = 'linear-gradient(to right, #ff6b6b, #f06161)';
  }
}

function showScreen(n) {
  for (let i = 1; i <= 8; i++) {
    document.getElementById('screen' + i).classList.add('hidden');
  }
  document.getElementById('screen' + n).classList.remove('hidden');
  currentScreen = n;
}

// モンスター選択
function selectMonster(level, hp) {
  selectedMonster = level;
  monsterHP = hp;
  maxMonsterHP = hp;
  currentRound = 1;
  
  updateRoundDisplay();
  updateHPDisplay();
  
  showScreen(2);
  // モンスター出現画面を1秒表示
  setTimeout(() => {
    showScreen(3);
    startTimer();
  }, 1000);
}

function updateRoundDisplay() {
  const roundElements = document.querySelectorAll('#round-display, #result-round, #current-round');
  roundElements.forEach(el => {
    if (el) el.textContent = currentRound;
  });
}

function updateHPDisplay() {
  // 手選択画面のHP更新
  updateHPGauge(
    document.getElementById('monster-hp-display'),
    document.getElementById('hp-gauge'),
    monsterHP,
    maxMonsterHP
  );
  
  // 結果画面のHP更新（表示されている場合）
  const resultHPElement = document.getElementById('result-monster-hp');
  const resultHPGauge = document.getElementById('result-hp-gauge');
  if (resultHPElement && resultHPGauge) {
    updateHPGauge(resultHPElement, resultHPGauge, monsterHP, maxMonsterHP);
  }
}

function showRules() {
  alert("グリンピースじゃんけんのルール\n\n1. グリンピースで「グー・チョキ・パー」を出してモンスターと勝負します\n2. 勝つと敵のHPを20減らせます\n3. 負けると敵のHPが10増えてしまいます\n4. あいこの時は「ドン」で勝負！早いほうが有利です\n5. 10回以内にモンスターのHPを0にすれば勝利です");
}

// startTimer関数内の修正
function startTimer() {
  timerCount = 3;
  document.getElementById('timer').textContent = `残り${timerCount}秒`;
  timerInterval = setInterval(() => {
    timerCount--;
    document.getElementById('timer').textContent = `残り${timerCount}秒`;
    if (timerCount <= 0) {
      clearInterval(timerInterval);
      // タイムアウト時の処理を追加
      monsterHP += 50;
      if (monsterHP > maxMonsterHP) monsterHP = maxMonsterHP;
      updateHPDisplay();
      chooseHand('グー', true); // 第2引数でタイムアウトを通知
    }
  }, 1000);
}

// script.js の chooseHand 関数を以下のように修正
function chooseHand(hand, isTimeout = false) {
  clearInterval(timerInterval);
  playerHand = hand;
  cpuHand = getRandomHand();
  
  // タイムアウト時のメッセージ追加
  if(isTimeout) {
    document.getElementById('battle-result').textContent = '時間切れ！ モンスターのHPが50回復した！';
    document.getElementById('battle-result').style.color = '#843030';
  }
  
  showScreen(4);
  setTimeout(() => {
    // 勝敗判定
    if (playerHand === cpuHand) {
      // あいこ
      document.getElementById('player-hand5').textContent = playerHand;
      document.getElementById('cpu-hand5').textContent = cpuHand;
      showScreen(5);
      // CPUがドンを押すタイミングをランダムに設定
      playerDonPressed = false;
      cpuDonTimeout = setTimeout(() => {
        if (!playerDonPressed) {
          cpuDonWin();
        }
      }, 500 + Math.random() * 1500);
    } else {
      // 勝敗がつく
      const result = getJankenResult(playerHand, cpuHand);
      document.getElementById('player-hand6').textContent = playerHand;
      document.getElementById('cpu-hand6').textContent = cpuHand;
      
      // HPの更新
      if (result === 'win') {
        monsterHP -= 20;
        document.getElementById('battle-result').textContent = 'プレイヤーの勝ち！ モンスターに20ダメージ！';
        document.getElementById('battle-result').style.color = '#30843a';
      } else {
        monsterHP += 10;
        document.getElementById('battle-result').textContent = 'プレイヤーの負け... モンスターのHPが10回復...';
        document.getElementById('battle-result').style.color = '#843030';
      }
      
      // HP上限チェック
      if (monsterHP > maxMonsterHP) {
        monsterHP = maxMonsterHP;
      }
      
      updateHPDisplay();
      showScreen(6);
      
      // HP0以下になったらゲーム終了（勝利）
      if (monsterHP <= 0) {
        document.getElementById('remaining-battles').textContent = maxRounds - currentRound;
        document.getElementById('final-hp').textContent = '0';
        setTimeout(() => {
          showScreen(7); // 勝利画面
        }, 1500);
      } else if (currentRound >= maxRounds) {
        // 10回終了で敗北
        document.getElementById('final-hp-lose').textContent = monsterHP;
        setTimeout(() => {
          showScreen(8); // 敗北画面
        }, 1500);
      } else {
        // 次の試合へ進むためのボタンを表示
        document.getElementById('next-battle-btn').style.display = 'block';
      }
    }
  }, 1000); // この遅延時間を1000ms（1秒）に設定
}



function getRandomHand() {
  const hands = ['グー', 'チョキ', 'パー'];
  return hands[Math.floor(Math.random() * 3)];
}

function getJankenResult(playerHand, cpuHand) {
  if (
    (playerHand === 'グー' && cpuHand === 'チョキ') ||
    (playerHand === 'チョキ' && cpuHand === 'パー') ||
    (playerHand === 'パー' && cpuHand === 'グー')
  ) {
    return 'win';
  } else {
    return 'lose';
  }
}

// プレイヤーのドンボタン
function playerDon() {
  playerDonPressed = true;
  clearTimeout(cpuDonTimeout);
  
  // プレイヤーが先に押せた場合
  document.getElementById('battle-result').textContent = 'プレイヤーの「ドン」勝ち！ モンスターに60ダメージ！';
  document.getElementById('battle-result').style.color = '#30843a';
  monsterHP -= 60;
  
  // HP更新と次の画面表示
  updateHPDisplay();
  showScreen(6);
  
  // HP0以下になったらゲーム終了（勝利）
  if (monsterHP <= 0) {
    document.getElementById('remaining-battles').textContent = maxRounds - currentRound;
    document.getElementById('final-hp').textContent = '0';
    setTimeout(() => {
      showScreen(7); // 勝利画面
    }, 1500);
  } else if (currentRound >= maxRounds) {
    // 10回終了で敗北
    document.getElementById('final-hp-lose').textContent = monsterHP;
    setTimeout(() => {
      showScreen(8); // 敗北画面
    }, 1500);
  }
}

// CPUがドンボタンを先に押した場合
function cpuDonWin() {
  document.getElementById('battle-result').textContent = 'CPUの「ドン」勝ち... モンスターのHPが10回復...';
  document.getElementById('battle-result').style.color = '#843030';
  monsterHP += 10;
  
  // HPが上限を超えないようにする
  if (monsterHP > maxMonsterHP) {
    monsterHP = maxMonsterHP;
  }
  
  // HP更新と次の画面表示
  updateHPDisplay();
  showScreen(6);
  
  // 10回終了で敗北
  if (currentRound >= maxRounds) {
    document.getElementById('final-hp-lose').textContent = monsterHP;
    setTimeout(() => {
      showScreen(8); // 敗北画面
    }, 1500);
  }
}

// 次の勝負へ
function nextBattle() {
  currentRound++;
  if (currentRound > maxRounds) {
    document.getElementById('final-hp-lose').textContent = monsterHP;
    showScreen(8); // 敗北画面
  } else {
    updateRoundDisplay();
    showScreen(2); // モンスター出現画面に戻る
    setTimeout(() => {
      showScreen(3);
      startTimer();
    }, 1000);
  }
}

// タイトルに戻る
function backToTitle() {
  document.getElementById('quit-popup').classList.add('hidden');
  showScreen(1);
}

// ゲーム中断確認
function confirmQuit() {
  document.getElementById('quit-popup').classList.remove('hidden');
}

// 修正後の初期化部分（script.jsの最後に追加）
// 初期画面表示
showScreen(1);
// 初期状態でポップアップを非表示に確実にする
document.getElementById('quit-popup').classList.add('hidden');

