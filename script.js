// ゲーム画面（Canvas）と、絵を描くための準備
const canvas = document.getElementById('myCanvas'); // HTMLからid="myCanvas"の要素を取得
const ctx = canvas.getContext('2d'); // 2Dの絵を描くための道具をもらう

// ゲームの状態を管理する変数
let isGameOver = false; // ゲームが終わったか (true/false)
let winner = null; // 勝者名
let loser = null; // 敗者名
let currentTurn = 'player'; // 現在のターン ('player' または 'cpu')
let messageText = ''; // 画面中央に表示する共通メッセージ
let messageTimer = null; // 共通メッセージを消すためのタイマー (setTimeout)

// 鳥海スペシャル演出のための変数
let isFlashing = false; // 画面がピカピカしているか
let flashColor = 'red'; // 現在のフラッシュの色
let flashTimerInterval = null; // ピカピカを繰り返すタイマー (setInterval)
let flashDurationTimer = null; // ピカピカを止めるタイマー (setTimeout)
const flashIntervalTime = 80; // フラッシュの色が変わる間隔 (ミリ秒)
const flashDurationTime = 1000; // フラッシュが続く時間 (ミリ秒)

// 鳥海スペシャル演出の前のメッセージ表示用変数
let isShowingSpecialPrelude = false; // 特殊技名を出す演出中か
let specialPreludeTimer = null; // 特殊技名表示時間タイマー (setTimeout)
const specialPreludeDuration = 800; // 特殊技名を表示する時間 (ミリ秒)

// 鳥海スペシャル後のターン移行用タイマー (演出が終わってから次のターンへ)
let afterSpecialTimer = null; // setTimeout

// CPUの攻撃待ち時間タイマー
let cpuAttackTimer = null; // setTimeout


// ゲームで使う画像を準備する
// あなたが添付した画像ファイル名に合わせています！
const enemyImage = new Image(); // 敵側 (person1.PNG)
enemyImage.src = 'person1.PNG';
const playerImage = new Image(); // あなた側 (parson2.jpg)
playerImage.src = 'parson2.jpg';


// キャラクターのデータ
// player1 が 敵キャラクター (person1.PNG)
const player1 = {
  name: '敵 (person1)', // キャラクター名
  image: enemyImage,
  x: 50, // 左端からの横の位置
  y: 80, // 上端からの縦の位置
  width: 200, // 画像を表示する幅 (あなたの画像に合わせて調整してください)
  height: 250, // 画像を表示する高さ (あなたの画像に合わせて調整してください)
  maxHp: 150, // 最大体力
  hp: 150, // 現在の体力
  attackPowerMin: 8, // 敵の最小攻撃力 (ランダム)
  attackPowerMax: 18, // 敵の最大攻撃力 (ランダム)

  isFlippedUpsideDown: false, // 画像が逆さまになっているか (被弾時)
  flipTimer: null, // ひっくり返しを解除するタイマー (setTimeout)
  flipDuration: 500, // ひっくり返っている時間 (ミリ秒)

  shoutMessage: '', // 攻撃時の掛け声メッセージ ("やーーーーー！")
  hitMessage: '', // 被弾時のメッセージ ("うっ！！")
  specialHitMessage: '', // 特殊攻撃時の被弾メッセージ ("シュ～～～～")

  tempMessageDuration: 800, // 短いメッセージを表示する時間 (ミリ秒)
  shoutTimer: null, // 掛け声メッセージを消すタイマー (setTimeout)
  hitTimer: null, // 被弾メッセージを消すタイマー (setTimeout)
  specialHitMessageTimer: null,// 特殊攻撃被弾メッセージを消すタイマー (setTimeout)
};

// player2 が あなた自身 (parson2.jpg)
const player2 = {
  name: 'あなた (parson2)', // キャラクター名
  image: playerImage,
  // 画面の右側に配置するため、Canvasの幅から計算
  x: canvas.width - 50 - 200, // 右端からの横の位置 (Canvas幅 - 右からの余白 - 幅)
  y: 80, // 上端からの縦の位置
  width: 200, // 画像を表示する幅 (あなたの画像に合わせて調整してください)
  height: 250, // 画像を表示する高さ (あなたの画像に合わせて調整してください)
  maxHp: 100, // 最大体力
  hp: 100, // 現在の体力
  attackPowerMin: 10, // あなたの通常攻撃の最小攻撃力 (ランダム)
  attackPowerMax: 25, // あなたの通常攻撃の最大攻撃力 (ランダム)
  specialAttackChance: 0.1, // 鳥海スペシャルの出る確率 (0.1 = 10%)
  specialAttackDamage: 100, // 鳥海スペシャルの固定ダメージ

  isFlippedUpsideDown: false, // 画像が逆さまになっているか (被弾時)
  flipTimer: null, // ひっくり返しを解除するタイマー (setTimeout)
  flipDuration: 500, // ひっくり返っている時間 (ミリ秒)

  shoutMessage: '', // 攻撃時の掛け声メッセージ ("やーーーーー！")
  hitMessage: '', // 被弾時のメッセージ ("うっ！！")
  specialHitMessage: '', // 特殊攻撃時の被弾メッセージ（あなたには発生しない想定ですがプロパティとして持つ）

  tempMessageDuration: 800, // 短いメッセージを表示する時間 (ミリ秒)
  shoutTimer: null, // 掛け声メッセージを消すタイマー (setTimeout)
  hitTimer: null, // 被弾メッセージを消すタイマー (setTimeout)
  specialHitMessageTimer: null,// 特殊攻撃被弾メッセージを消すタイマー (setTimeout)

   attackArea: { // 攻撃ボタン判定用の四角いエリアの位置と大きさ (あなたの攻撃ボタン)
    x: canvas.width / 2 - 80, // 中央付近に配置
    y: 320,
    width: 160,
    height: 50
  }
};

// 画像が全て読み込めたらゲーム開始
let imagesLoaded = 0;
const totalImages = 2; // 読み込む画像の数

enemyImage.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    setupGame(); // 全部の画像が読み込めたらゲームの準備を開始
  }
};

playerImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      setupGame(); // 全部の画像が読み込めたらゲームの準備を開始
    }
    // 念のためCanvasの幅/高さが取得できたことを確認
    if (canvas.width === 0 || canvas.height === 0) {
        console.error("Canvasの幅または高さがゼロです。HTMLファイルを確認してください。");
         messageText = 'Canvasエラー！HTMLを確認！'; // 画面にエラー表示
         draw(); // 画面更新
    } else {
        // 画像読み込みが完了したタイミングでキャラクターの初期位置などを再設定すると安全
        // （Canvasの幅/高さが確定した後に位置計算するため）
        player2.x = canvas.width - 50 - player2.width;
        player2.attackArea.x = canvas.width / 2 - player2.attackArea.width / 2;
    }
};

// 画像の読み込みエラー処理 (ファイル名間違いなどで読み込めなかった場合)
enemyImage.onerror = () => {
    console.error('画像の読み込みに失敗しました: ' + enemyImage.src + ' ファイル名やフォルダを確認してください。');
    messageText = '画像読み込みエラー！ファイル名を確認！'; // 画面にエラー表示
     draw(); // 画面更新
};
playerImage.onerror = () => {
    console.error('画像の読み込みに失敗しました: ' + playerImage.src + ' ファイル名やフォルダを確認してください。');
     messageText = '画像読み込みエラー！ファイル名を確認！'; // 画面にエラー表示
     draw(); // 画面更新
};


// ゲームの準備 (画像の読み込みが完了した後に呼び出される)
function setupGame() {
  console.log('setupGame: ゲームの準備開始');
  messageText = 'ゲーム開始！あなたのターン！'; // 開始メッセージ

  // イベントリスナーの設定 (あなたの攻撃ボタンのクリックに反応)
  canvas.addEventListener('click', handleClick);

  // ゲームループ開始 (画面を繰り返し描画する)
  gameLoop();

  // 開始メッセージを数秒後に消すタイマー
   setTimeout(() => { messageText = '', messageTimer = null; }, 2000); // タイマー変数もクリア
}

// 画面全体を描く関数
function draw() {
  // 画面をクリア (前の絵を全て消す)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // キャラクターを描く (逆さまにひっくり返す処理を含む関数を使用)
  drawCharacter(player1); // 敵
  drawCharacter(player2); // あなた自身

  // 体力バーを描く
  drawHpBar(player1);
  drawHpBar(player2);

  // キャラクター名と体力を表示
  drawPlayerInfo(player1);
  drawPlayerInfo(player2);

   // キャラクター付近のメッセージを描く (攻撃時の掛け声や被弾時の声)
   drawCharacterMessages(player1);
   drawCharacterMessages(player2);


  // 攻撃ボタン（に見立てた文字や四角）を描く (あなたのターンだけ表示)
  // あなたのターンで、ゲームオーバーでなく、特殊演出中でもない場合だけ表示
  if (!isGameOver && currentTurn === 'player' && !isShowingSpecialPrelude) {
    drawAttackButton(player2); // あなたの攻撃ボタン
  }

  // ターンの表示 (画面上部に表示)
  // drawTurnInfo(); // 今回はmessageTextで表示するのでこの関数は使わない


  // ゲームオーバー時のメッセージ表示
  if (isGameOver) {
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    // 勝者メッセージ (でかい文字で「ｱｯﾊｯﾊ」)
    ctx.font = '60px Impact, sans-serif'; // 迫力のあるフォントに
    ctx.fillText('ｱｯﾊｯﾊ', canvas.width / 2, canvas.height / 2 - 60);

    // 勝者名表示
    ctx.font = '30px Arial';
    ctx.fillText(`${winner} のかち！`, canvas.width / 2, canvas.height / 2 - 10);

    // 敗者メッセージ (「非常識ですね」)
    ctx.font = '24px Arial';
     // 敗者の位置に近づけて表示
     const loserPlayer = (winner === player1.name) ? player2 : player1; // 勝者から敗者を判断
     ctx.fillText(`「非常識ですね」`, loserPlayer.x + loserPlayer.width / 2, loserPlayer.y + loserPlayer.height + 60); // キャラクターの下あたりに表示


    ctx.font = '20px Arial';
     ctx.fillText('クリックでさいかい', canvas.width / 2, canvas.height / 2 + 80);
  }

  // 画面中央などの共通メッセージ表示 (例: "あなたのターン", "CPUのターン", "画像読み込みエラー！")
  // 特殊演出中は特別なメッセージ表示を行う
  if (isShowingSpecialPrelude) {
       ctx.fillStyle = 'orange'; // 特殊技名表示の色
       ctx.font = '48px Impact, sans-serif'; // 特殊技名表示のフォント
       ctx.textAlign = 'center';
       ctx.fillText(messageText, canvas.width / 2, canvas.height / 2); // 画面中央に大きく表示

  } else if (messageText) { // 特殊演出中でなく、かつmessageTextが空文字でなければ表示
       ctx.fillStyle = (messageText.includes('エラー')) ? 'red' : 'blue'; // エラーは赤、それ以外は青
       ctx.font = '24px Arial';
       ctx.textAlign = 'center';
       ctx.fillText(messageText, canvas.width / 2, 50); // 画面上部に表示
  }

    // 鳥海スペシャルのフラッシュ演出を描画 (画面の一番手前に描く)
   if (isFlashing) {
       ctx.fillStyle = flashColor;
       ctx.fillRect(0, 0, canvas.width, canvas.height); // 画面全体に色付きの四角を描く
   }
}

// キャラクターを描くヘルパー関数 (逆さまにひっくり返す処理を含む)
function drawCharacter(player) {
    // 画像が読み込めていない、または無効な場合は描画しない
    if (!player.image || !player.image.complete || player.image.naturalWidth === 0) {
        // console.warn(`描画スキップ: 画像が読み込めていないか無効です - ${player.name}`);
        return;
    }

    if (player.isFlippedUpsideDown) {
        // 画像を逆さま（上下反転）にして描画する場合
        ctx.save(); // 現在のCanvasの状態を保存
        // 画像の上下方向の中心（下端）を原点に移動 (反転の中心を指定)
        // xは中心、yは下端
        ctx.translate(player.x + player.width / 2, player.y + player.height);
        ctx.scale(1, -1); // Y軸方向に-1倍することで上下反転
        // 新しい原点(0,0)に対して、画像の左上隅の位置を調整して描画
        // 描画開始点は左上なので、(-width/2, -height) となる
        ctx.drawImage(player.image, -player.width / 2, -player.height, player.width, player.height);
        ctx.restore(); // Canvasの状態を元に戻す (重要！)
    } else {
        // 通常通り描画する場合
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    }
}


// 体力バーを描くヘルパー関数 (変更なし)
function drawHpBar(player) {
  // キャラクターの画像幅と同じ幅にする
  const barWidth = player.width;
  const barHeight = 10; // バーの高さ
  // キャラクターの画像真上中央に配置
  const barX = player.x;
  const barY = player.y - barHeight - 5; // キャラクター画像の上に表示（画像との隙間5px）

  // HPの割合を計算 (0%以下にならないようにMath.maxを使用)
  const hpRate = Math.max(0, player.hp / player.maxHp);
  const currentBarWidth = hpRate * barWidth;


  // HPバーの背景（灰色）
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // HPバーの現在の体力部分の色分け（緑→黄→赤）
  ctx.fillStyle = '#00ff00'; // 緑色 (デフォルト)
   if (hpRate < 0.5) { // 体力半分以下で黄色
       ctx.fillStyle = '#ffff00';
   }
   if (hpRate < 0.2) { // 体力20%以下で赤色
       ctx.fillStyle = '#ff0000';
   }

  // 体力バーの現在の体力部分を描画
  ctx.fillRect(barX, barY, currentBarWidth, barHeight);

  // HPバーの枠線
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(barX, barY, barWidth, barHeight);
}

// プレイヤー情報（名前、体力）を描くヘルパー関数
function drawPlayerInfo(player) {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';

    // 名前
    ctx.fillText(player.name, player.x + player.width / 2, player.y - 20);

    // 体力テキスト (0未満にならないようにMath.maxを使用)
    ctx.fillText(`HP: ${Math.max(0, player.hp)}`, player.x + player.width / 2, player.y + player.height + 20);
}

// キャラクター付近のメッセージ (掛け声や被弾声) を描くヘルパー関数
function drawCharacterMessages(player) {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';

    // 攻撃時の掛け声メッセージ ("やーーーーー！")
    if (player.shoutMessage) {
        // キャラクター画像の上の体力バーの上に表示
        ctx.fillText(player.shoutMessage, player.x + player.width / 2, player.y - 40);
    }

    // 被弾時のメッセージ ("うっ！！" または "シュ～～～～" または "やられた～")
    // specialHitMessage が最も優先される
    const hitMsg = player.specialHitMessage || player.hitMessage;
    if (hitMsg) {
        // キャラクター画像の少し下に表示
        ctx.fillText(hitMsg, player.x + player.width / 2, player.y + player.height + 40);
    }
}


// あなたの攻撃ボタン（テキスト）を描くヘルパー関数
function drawAttackButton(player) { // あなた自身(player2)の情報を使用
    const area = player.attackArea;

    // 攻撃ボタンの見た目（四角と文字）
    // あなたのターン以外、ゲームオーバー時、特殊演出中はボタンの色を変える
    ctx.fillStyle = (isGameOver || currentTurn !== 'player' || isShowingSpecialPrelude) ? '#cccccc' : '#0077cc'; // 灰色か青

    ctx.fillRect(area.x, area.y, area.width, area.height);

    ctx.strokeStyle = '#000000';
    ctx.strokeRect(area.x, area.y, area.width, area.height);

    // 文字の色
    ctx.fillStyle = (isGameOver || currentTurn !== 'player' || isShowingSpecialPrelude) ? '#000000' : 'white'; // 黒か白
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`こうげき！`, area.x + area.width / 2, area.y + area.height / 2 + 7);
}


// ゲームループ (アニメーションや状態更新が必要な場合に draw() 以外の処理を入れる場所)
// 今回は主にdraw()で全ての状態を描画しているので、このままでOK
function gameLoop() {
  draw(); // 毎フレーム画面を描き直す

  // requestAnimationFrame を使ってブラウザの描画タイミングに合わせて gameLoop を繰り返し呼び出す
  requestAnimationFrame(gameLoop);
}

// クリックされたときの処理
function handleClick(event) {
  // ゲームオーバー時はクリックでリセット
  if (isGameOver) {
      resetGame();
      return; // リセット処理をして終了
  }

  // あなたのターンでなければクリックは無効
  // 特殊演出中もクリックは無効
  if (currentTurn !== 'player' || isShowingSpecialPrelude) {
      console.log("handleClick: 現在はあなたのターンではありません または 特殊演出中です");
      return;
  }

  // クリックされた場所の座標を取得 (Canvas内での正確な位置)
  const rect = canvas.getBoundingClientRect(); // Canvasが画面のどこにあるか
  const clickX = event.clientX - rect.left; // クリックのX座標 - Canvasの左端の位置
  const clickY = event.clientY - rect.top; // クリックのY座標 - Canvasの上端の位置

  // あなたの攻撃エリアがクリックされたか判定 (player2はあなたのデータ)
  const attackBtn = player2.attackArea;
  if (clickX > attackBtn.x && clickX < attackBtn.x + attackBtn.width &&
      clickY > attackBtn.y && clickY < attackBtn.y + attackBtn.height) {

    console.log('handleClick: あなたが攻撃ボタンをクリック！ -> プレイヤー攻撃開始');

    // あなたの攻撃処理を開始
    startPlayerAttack(player2, player1); // あなた(player2)が敵(player1)を攻撃
  }
}

// 攻撃処理本体 (ダメージ計算、メッセージ、反転設定のみを行う)
// この関数はstartPlayerAttackまたはCPUターン処理から呼ばれる
// この関数自体はターン移行の処理は行いません
function performAttack(attacker, target, isSpecial = false) {
    if (isGameOver) return; // ゲームオーバーなら何もしない

    let damage;
    let attackConsoleMessage = '';

    // キャラクターのメッセージと反転をリセット（前のターンや攻撃の表示が残らないように）
     // ただし、攻撃者のshoutMessageは直後に設定し直すか、呼び出し元で設定済み
     clearCharacterMessagesAndFlip(target); // ターゲットのメッセージ・反転のみクリア


    // ダメージ計算
    if (isSpecial) {
        damage = attacker.specialAttackDamage; // 固定ダメージ 100
        attackConsoleMessage = `${attacker.name} の${isSpecial ? '鳥海スペシャル' : '通常攻撃'}！ ${target.name} に ${damage} のダメージ！`; // コンソールメッセージに特殊/通常を含める
    } else {
        damage = Math.floor(Math.random() * (attacker.attackPowerMax - attacker.attackPowerMin + 1)) + attacker.attackPowerMin;
        attackConsoleMessage = `${attacker.name} の${isSpecial ? '鳥海スペシャル' : '通常攻撃'}！ ${target.name} に ${damage} のダメージ！`; // コンソールメッセージに特殊/通常を含める
    }

    // ターゲットのHPを減らす
    target.hp -= damage;
    console.log(`performAttack: ${attackConsoleMessage}. ${target.name} 残りHP: ${Math.max(0, target.hp)}`);


    // ターゲットの被弾時メッセージと逆さま反転を設定
    // specialHitMessage は startPlayerAttack の special 分岐の中で設定する (鳥海スペシャルで敵が受けた場合)
    if (!isSpecial || target !== player1) { // 通常攻撃、または特殊攻撃だがターゲットが敵(player1)でない場合
        target.hitMessage = 'うっ！！'; // 通常の被弾メッセージ
         if (target.hitTimer) clearTimeout(target.hitTimer);
         target.hitTimer = setTimeout(() => {
             target.hitMessage = '';
         }, target.tempMessageDuration); // 短いメッセージ時間で消える
    }
    // else (特殊攻撃でターゲットが敵(player1)の場合は specialHitMessage ('シュ～～～～') が startPlayerAttack 側で設定済み)


    // ターゲットを逆さまにひっくり返す設定と、タイマーで戻す処理 (通常攻撃時も特殊攻撃時も)
     target.isFlippedUpsideDown = true;
     if (target.flipTimer) clearTimeout(target.flipTimer);
     target.flipTimer = setTimeout(() => {
         target.isFlippedUpsideDown = false;
     }, target.flipDuration); // ひっくり返っている時間


    // HPが0以下になったかチェック
     // ゲームオーバー処理は performAttack を呼び出した側 (startPlayerAttack / CPU攻撃ルーチン) で行う
}


// あなたの攻撃処理開始関数 (特殊攻撃判定と演出、ターン移行を含む)
function startPlayerAttack(attacker, target) {
     if (isGameOver || currentTurn !== 'player' || isShowingSpecialPrelude) {
         console.log("startPlayerAttack: 条件不一致で実行スキップ");
         return; // 安全のため再チェック
     }

     let isSpecial = false;
      // 鳥海スペシャルが出るか判定 (設定した確率)
     if (Math.random() < attacker.specialAttackChance) {
         isSpecial = true;
     }

     // キャラクターのメッセージと反転をリセット（前のターンや攻撃の表示が残らないように）
     clearCharacterMessagesAndFlip(attacker); // 攻撃者のメッセージもクリア
     clearCharacterMessagesAndFlip(target); // ターゲットのメッセージ・反転もクリア


     // 攻撃時の掛け声を設定し、タイマーで消す
     attacker.shoutMessage = 'やーーーーー！';
      if (attacker.shoutTimer) clearTimeout(attacker.shoutTimer);
      attacker.shoutTimer = setTimeout(() => {
          attacker.shoutMessage = '';
      }, attacker.tempMessageDuration);


     if (isSpecial) {
         // ★ 鳥海スペシャル演出開始（ダメージ処理などは後で） ★
         console.log('startPlayerAttack: 鳥海スペシャル演出開始！');
         isShowingSpecialPrelude = true; // 演出中フラグON
         messageText = '鳥海スペシャル～'; // 特殊技名表示

         // 特殊技名表示後にダメージ処理とメイン演出を実行するタイマー
          if (specialPreludeTimer) clearTimeout(specialPreludeTimer);
          specialPreludeTimer = setTimeout(() => {
              // *** 特殊技名表示後のメイン演出開始（この中が実行される） ***
              console.log('specialPreludeTimer callback: メイン演出開始');
              isShowingSpecialPrelude = false; // 演出中フラグOFF
               messageText = ''; // 中央メッセージクリア (フラッシュ表示に切り替わる)
              specialPreludeTimer = null; // タイマー変数クリア

              // ★ ダメージ処理とターゲットの反応 ★
              // Special フラグを true で performAttack を呼び出し
              performAttack(attacker, target, true); // ダメージ計算、被弾メッセージ、反転設定

              // HPが0以下になったかチェック (演出中にゲームオーバーになるか判断)
              // 先にチェックしておき、フラッシュ演出などはゲームオーバーでも最後まで行う
              const isTargetDefeated = (target.hp <= 0);
               if(isTargetDefeated) target.hp = 0; // 体力表示がマイナスにならないように

              // ★ 鳥海スペシャル演出のフラッシュ開始 ★
              startFlashing(); // ゲームオーバーでもフラッシュはする


              // ★ 演出終了後のターン移行 or ゲームオーバー処理 ★
              // フラッシュが終わるのを待ってから次のターンに移行するか、ゲームオーバー処理を呼び出す
              if (afterSpecialTimer) clearTimeout(afterSpecialTimer); // 前のタイマーをクリア
              afterSpecialTimer = setTimeout(() => {
                   afterSpecialTimer = null; // タイマー変数クリア

                   if (isTargetDefeated) {
                       // フラッシュ終了後にゲームオーバー処理を実行
                        console.log('afterSpecialTimer callback: ターゲットHP0以下 -> ゲームオーバー処理呼び出し');
                       gameOver(attacker);
                   } else {
                       // フラッシュ終了後に次のターンへ移行
                        console.log('afterSpecialTimer callback: ターゲットHPあり -> CPUターン開始');
                       startCPUTurn(); // CPUのターンを開始
                   }
               }, flashDurationTime + 300); // フラッシュ時間 (1000ms) + 少しの待機時間 (300ms)


          }, specialPreludeDuration); // 特殊技名を表示する時間 (800ms)
     } else {
         // ★ 通常攻撃の場合の処理 ★
         console.log('startPlayerAttack: 通常攻撃');
         // 通常攻撃ダメージ計算、被弾メッセージ、反転設定
         performAttack(attacker, target, false); // Special フラグを false で呼び出し


         // ゲームオーバーチェック (performAttack の後に行う)
         if (target.hp <= 0) {
           gameOver(attacker);
         }

         // 通常攻撃後のターン移行 (ゲームオーバーでなければ)
         if (!isGameOver) { // チェックはperformAttackの後に行う
              console.log('startPlayerAttack: 通常攻撃後 -> CPUターン開始');
              startCPUTurn(); // CPUのターンを開始
          } else {
              console.log('startPlayerAttack: 通常攻撃後 -> ゲームオーバーのため次のターン移行なし');
          }
     }
     // 画面更新はgameLoopが担当
}


// キャラクターのメッセージと反転状態を全てクリアするヘルパー関数
function clearCharacterMessagesAndFlip(player) {
    player.shoutMessage = '';
     if (player.shoutTimer) { clearTimeout(player.shoutTimer); player.shoutTimer = null; }

    player.hitMessage = '';
     if (player.hitTimer) { clearTimeout(player.hitTimer); player.hitTimer = null; }

    player.specialHitMessage = ''; // 特殊攻撃被弾メッセージもクリア
     if (player.specialHitMessageTimer) { clearTimeout(player.specialHitMessageTimer); player.specialHitMessageTimer = null; }


    player.isFlippedUpsideDown = false; // 逆さま反転もクリア
     if (player.flipTimer) { clearTimeout(player.flipTimer); player.flipTimer = null; }
}


// CPUのターン開始処理
function startCPUTurn() {
    if (isGameOver) {
        console.log("startCPUTurn: ゲームオーバーのため開始スキップ");
        return; // ゲームオーバーなら実行しない
    }

    currentTurn = 'cpu'; // ターンをCPUに設定
    console.log('startCPUTurn: CPUのターン開始');
    messageText = 'CPUのターン'; // 中央メッセージ表示

    // CPUの攻撃は少し待ってから実行 (思考時間のような間を作る)
    // 以前のCPU攻撃待ちタイマーが残っていたらクリア
    if(cpuAttackTimer) clearTimeout(cpuAttackTimer);
    cpuAttackTimer = setTimeout(() => {
        if (isGameOver) { // 待っている間にゲームオーバーになったら何もしない
             console.log("cpuAttackTimer callback: ゲームオーバーのため攻撃スキップ");
             messageText = ''; // ゲームオーバーならメッセージクリア
             cpuAttackTimer = null; // タイマー変数クリア
             return;
         }
        console.log("cpuAttackTimer callback: CPU攻撃実行");

        // CPU(player1)があなた(player2)を攻撃 (通常攻撃のみ)
        // performAttack関数の中でゲームオーバーチェックは行われる
        performAttack(player1, player2, false); // Special フラグは false

        // ゲームオーバーチェック (performAttack の後で行う)
        if (player2.hp <= 0) {
            gameOver(player1); // CPUが勝者
        }

        // CPU攻撃後のターン移行 (ゲームオーバーでなければあなたのターンに戻る)
        if (!isGameOver) { // チェックはperformAttackの後に行う
             console.log('cpuAttackTimer callback: CPU攻撃後 -> あなたのターン開始');
             endCPUTurn(); // あなたのターンを開始
         } else {
              console.log('cpuAttackTimer callback: CPU攻撃後 -> ゲームオーバーのため次のターン移行なし');
         }
         cpuAttackTimer = null; // タイマー変数クリア
        // 状態が変わったので画面更新はgameLoopが担当

    }, 1500); // 1.5秒後にCPUが攻撃 (調整可)
}

// CPUのターン終了処理（あなたのターン開始）
function endCPUTurn() {
     if (isGameOver) {
         console.log("endCPUTurn: ゲームオーバーのため実行スキップ");
         return; // ゲームオーバーなら実行しない
     }
    currentTurn = 'player'; // ターンをあなたに設定
    console.log('endCPUTurn: あなたのターン開始');
    messageText = 'あなたのターン！'; // 中央メッセージ表示

     // ターン開始メッセージを数秒後に消すタイマー
     if(messageTimer) clearTimeout(messageTimer); // 前のメッセージタイマーがあればクリア
     messageTimer = setTimeout(() => { messageText = '', messageTimer = null; }, 2000); // タイマー変数もクリア

    // 状態が変わったので画面更新はgameLoopが担当
}


// 鳥海スペシャルのフラッシュを開始する関数
function startFlashing() {
    isFlashing = true;
    flashColor = 'red'; // 最初は赤から

    // 一定間隔で色を切り替える
    if (flashTimerInterval) clearInterval(flashTimerInterval); // 前のが動いてたらクリア
    flashTimerInterval = setInterval(() => {
        flashColor = (flashColor === 'red') ? 'white' : 'red'; // 赤白切り替え
    }, flashIntervalTime); // 80ms間隔で切り替え

    // 指定時間後にフラッシュを止める
    if (flashDurationTimer) clearTimeout(flashDurationTimer); // 前のが動いてたらクリア
    flashDurationTimer = setTimeout(() => {
        stopFlashing();
    }, flashDurationTime); // 1000ms (1秒)後に停止
}

// 鳥海スペシャルのフラッシュを停止する関数
function stopFlashing() {
    isFlashing = false;
    if (flashTimerInterval) { clearInterval(flashTimerInterval); flashTimerInterval = null; }
    if (flashDurationTimer) { clearTimeout(flashDurationTimer); flashDurationTimer = null; }
}


// ゲームオーバー処理
function gameOver(winnerPlayer) {
  if (isGameOver) { // 多重呼び出し防止
      console.log("gameOver: すでにゲームオーバーです");
      return;
  }
  isGameOver = true; // ゲームオーバー状態にする
  winner = winnerPlayer.name; // 勝者を記録

  // 敗者を判定して記録
  loser = (winner === player1.name) ? player2.name : player1.name;

  console.log(`gameOver: ゲームオーバー！ ${winner} のかち！ ${loser} は「非常識ですね」と思った`);

  // ゲームオーバーになったらターンの概念をなくす
  currentTurn = 'gameover';

  // メッセージなどを全てクリア (特殊演出中のタイマーも含む)
   messageText = ''; // 中央メッセージクリア

   // キャラクターのメッセージや反転状態を全てクリア
   clearCharacterMessagesAndFlip(player1);
   clearCharacterMessagesAndFlip(player2);

   // 特殊演出やターン移行関連のタイマーも全てクリア
   if (messageTimer) clearTimeout(messageTimer);
   if (specialPreludeTimer) clearTimeout(specialPreludeTimer);
   if (afterSpecialTimer) clearTimeout(afterSpecialTimer);
   if (cpuAttackTimer) clearTimeout(cpuAttackTimer); // CPU攻撃待ちタイマーもクリア
   stopFlashing(); // フラッシュ演出も停止


  // ゲームオーバー画面を描くためにdraw()を呼び出す必要はない (gameLoopが描く)
}

// ゲームをリセットする関数 (ゲームオーバー時にクリックで呼び出される)
function resetGame() {
    console.log("resetGame: ゲームをリセット");
    // 全てのゲーム状態を初期値に戻す
    isGameOver = false;
    winner = null;
    loser = null;
    player1.hp = player1.maxHp; // 敵の体力を最大に戻す
    player2.hp = player2.maxHp; // あなたの体力を最大に戻す
    currentTurn = 'player'; // ターンをあなたの最初に戻す

    // メッセージや状態、タイマーも全てリセット
    messageText = 'ゲーム開始！あなたのターン！'; // リセット開始メッセージ
    clearCharacterMessagesAndFlip(player1); // キャラクターのメッセージや反転をクリア
    clearCharacterMessagesAndFlip(player2); // キャラクターのメッセージや反転をクリア
    stopFlashing(); // フラッシュ演出も停止

    // 特殊演出やターン移行関連のタイマーも全てクリア
     if (messageTimer) clearTimeout(messageTimer); // 中央メッセージタイマーもクリア
     if (specialPreludeTimer) clearTimeout(specialPreludeTimer);
     if (afterSpecialTimer) clearTimeout(afterSpecialTimer);
      if (cpuAttackTimer) clearTimeout(cpuAttackTimer); // CPU攻撃待ちタイマーもクリア


     // リセット開始メッセージを数秒後に消すタイマーを再設定
     messageTimer = setTimeout(() => { messageText = '', messageTimer = null; }, 2000); // タイマー変数もクリア


    console.log("resetGame: リセット完了");

    // 初期状態を描画 (gameLoopが描くが、即時反映したい場合は draw() )
}


// --------------- ゲーム開始 ---------------
// ここからゲームが始まります。
// 画像の読み込みを開始します。onloadイベントで imagesLoaded が増え、
// 全ての画像が読み込めたら setupGame() が自動で呼び出されてゲーム本編が始まります。
// ファイルの先頭で playerImage.src = ... のように読み込みは開始されています。
console.log("初期化: ゲームスクリプト開始、画像読み込み中");
// setupGame() は画像の読み込み完了イベントから呼び出されるため、
// ここでは特に何かを呼び出す必要はありません。画像の読み込み完了を待ちます。