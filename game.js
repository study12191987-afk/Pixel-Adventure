// ==================================================
// PIXEL ADVENTURE V7.0
// 游戏核心：LEVEL 4 THE GUARDIAN Boss 战
// ==================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


// ==================================================
// DOM
// ==================================================

const lifeDisplay = document.getElementById("lifeDisplay");
const coinDisplay = document.getElementById("coinDisplay");
const levelTitle = document.getElementById("levelTitle");

const gameModal = document.getElementById("gameModal");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalButton = document.getElementById("modalButton");


// ==================================================
// 基础设置
// ==================================================

const tileSize = 32;
const rows = 10;
const cols = 10;


// ==================================================
// LEVEL 数据已移动到 levels.js
// ==================================================




// ==================================================
// 游戏状态
// ==================================================

let currentLevel = 0;

let map = [];

let player = {
  x: 1,
  y: 1,
  direction: "down"
};

let enemies = [];

let exit = {
  x: 8,
  y: 8
};

let lives = 3;
let maxLives = 3;
let coins = 0;
let totalCoins = 0;

let exitOpen = false;
let gamePaused = false;

let enemyTimer = null;


// ==================================================
// 动画状态
// ==================================================

let animationTime = 0;

let playerWalkingUntil = 0;

let hurtUntil = 0;


// ==================================================
// V5 音效系统已移动到 audio.js
// ==================================================

// ==================================================
// 金币特效
// ==================================================

let coinEffects = [];


// ==================================================
// V4.3 受伤特效
// ==================================================

let damageEffects = [];

let screenFlashUntil = 0;


// ==================================================
// V6.1 钥匙 / 宝箱状态
// ==================================================

let keyItem = null;
let chest = null;
let keys = 0;
let gems = 0;
let adventureEffects = [];

// V6.3 古代祭坛
let altar = null;

// V7.0 THE GUARDIAN
let boss = null;
let bossTraps = [];
let bossMoveTimer = null;
let bossFlashUntil = 0;
let bossDefeated = false;


// ==================================================
// 创建金币特效
// ==================================================

function createCoinEffect(x, y) {

  coinEffects.push({
    x,
    y,
    startTime: performance.now()
  });

}


function createAdventureEffect(x, y, text, color = "#fde047") {

  adventureEffects.push({
    x,
    y,
    text,
    color,
    startTime: performance.now()
  });

}


// ==================================================
// 创建受伤特效
// ==================================================

function createDamageEffect(x, y) {

  const now = performance.now();


  damageEffects.push({
    x,
    y,
    startTime: now
  });


  // 红色屏幕闪光持续约 220ms

  screenFlashUntil =
    now + 220;

}


// ==================================================
// 工具
// ==================================================

function copyMap(originalMap) {

  return originalMap.map(
    row => [...row]
  );

}


function countCoins() {

  let count = 0;


  for (let y = 0; y < rows; y++) {

    for (let x = 0; x < cols; x++) {

      if (map[y][x] === 2) {

        count++;

      }

    }

  }


  return count;

}


// ==================================================
// 加载关卡
// ==================================================

function loadLevel(levelNumber) {

  const level =
    levels[levelNumber];


  map =
    copyMap(level.map);


  player = {
    x: level.playerStart.x,
    y: level.playerStart.y,
    direction: "down"
  };


  enemies =
    level.enemies.map(
      enemy => ({
        ...enemy
      })
    );


  exit = {
    x: level.exit.x,
    y: level.exit.y
  };


  coins = 0;

  exitOpen = false;

  gamePaused = false;

  hurtUntil = 0;

  coinEffects = [];

  damageEffects = [];

  screenFlashUntil = 0;

  adventureEffects = [];

  keys = 0;

  // V6.2：宝石不在换关时清零，作为跨关卡稀有资源保留

  keyItem =
    level.key
      ? { ...level.key, collected: false }
      : null;

  chest =
    level.chest
      ? { ...level.chest, opened: false }
      : null;

  altar =
    level.altar
      ? { ...level.altar, activated: false }
      : null;

  boss =
    level.boss
      ? { ...level.boss }
      : null;

  bossTraps =
    level.traps
      ? level.traps.map(trap => ({ ...trap, used: false, flashUntil: 0 }))
      : [];

  bossDefeated = false;
  bossFlashUntil = 0;


  totalCoins =
    countCoins();


  updateGameInfo();

  startEnemyTimer();

  startBossTimer();

}


// ==================================================
// 顶部信息
// ==================================================

function updateGameInfo() {

  lifeDisplay.textContent =
    `❤️ 生命：${lives}/${maxLives}`;


  coinDisplay.textContent =
    currentLevel >= 1
      ? `🪙 金币：${coins}/${totalCoins}  🗝️ ×${keys}  💎 ×${gems}`
      : `🪙 金币：${coins}/${totalCoins}`;


  levelTitle.textContent =
    boss && !bossDefeated
      ? `LEVEL ${currentLevel + 1}  👹 ${"❤️".repeat(boss.hp)}`
      : `LEVEL ${currentLevel + 1}`;

}


// ==================================================
// 草地
// ==================================================

function drawGrass(x, y) {

  const px =
    x * tileSize;

  const py =
    y * tileSize;


  ctx.fillStyle =
    currentLevel === 0
      ? "#245c3a"
      : currentLevel === 1
        ? "#1f4d40"
        : "#25213b";


  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  if ((x + y) % 2 === 0) {

    ctx.fillStyle =
      currentLevel === 0
        ? "#285f3d"
        : currentLevel === 1
          ? "#235545"
          : "#2d2947";


    ctx.fillRect(
      px,
      py,
      tileSize,
      tileSize
    );

  }


  // 小草

  ctx.fillStyle =
    currentLevel === 0
      ? "#3a8254"
      : currentLevel === 1
        ? "#32705c"
        : "#514b78";


  ctx.fillRect(
    px + 6,
    py + 8,
    2,
    4
  );


  ctx.fillRect(
    px + 9,
    py + 10,
    2,
    3
  );


  ctx.fillRect(
    px + 22,
    py + 21,
    2,
    4
  );


  if ((x * 3 + y * 5) % 7 === 0) {

    ctx.fillRect(
      px + 16,
      py + 5,
      2,
      5
    );


    ctx.fillRect(
      px + 19,
      py + 7,
      2,
      3
    );

  }

}


// ==================================================
// 石墙
// ==================================================

function drawWall(x, y) {

  const px =
    x * tileSize;

  const py =
    y * tileSize;


  ctx.fillStyle = "#303846";

  ctx.fillRect(
    px,
    py,
    tileSize,
    tileSize
  );


  ctx.fillStyle = "#596474";

  ctx.fillRect(
    px + 2,
    py + 2,
    28,
    5
  );


  ctx.fillStyle = "#465160";

  ctx.fillRect(
    px + 3,
    py + 9,
    12,
    7
  );


  ctx.fillRect(
    px + 18,
    py + 9,
    11,
    7
  );


  ctx.fillRect(
    px + 7,
    py + 18,
    17,
    6
  );


  ctx.fillStyle = "#202733";

  ctx.fillRect(
    px + 15,
    py + 9,
    3,
    7
  );


  ctx.fillRect(
    px + 3,
    py + 16,
    26,
    2
  );


  ctx.fillStyle = "#171d27";

  ctx.fillRect(
    px + 2,
    py + 27,
    28,
    3
  );

}


// ==================================================
// 金币动画
// ==================================================

function drawCoin(x, y) {

  const px =
    x * tileSize;

  const py =
    y * tileSize;


  const phase =
    Math.sin(
      animationTime * 0.008 +
      x +
      y
    );


  let coinWidth;


  if (phase > 0.55) {

    coinWidth = 5;

  }

  else if (phase < -0.55) {

    coinWidth = 9;

  }

  else {

    coinWidth = 13;

  }


  const coinX =
    px + 16 - coinWidth / 2;


  // 影子

  ctx.fillStyle =
    "rgba(0,0,0,0.25)";


  ctx.fillRect(
    px + 9,
    py + 25,
    14,
    3
  );


  // 金币边缘

  ctx.fillStyle = "#ca8a04";


  ctx.fillRect(
    Math.floor(coinX),
    py + 7,
    coinWidth,
    18
  );


  if (coinWidth >= 9) {

    ctx.fillStyle = "#facc15";


    ctx.fillRect(
      Math.floor(
        coinX + 2
      ),
      py + 9,
      coinWidth - 4,
      14
    );

  }


  if (coinWidth >= 12) {

    ctx.fillStyle = "#fff7a8";


    ctx.fillRect(
      Math.floor(
        coinX + 3
      ),
      py + 10,
      3,
      5
    );

  }

}


// ==================================================
// 玩家
// 四方向像素冒险家
// ==================================================

function drawPlayer(timestamp) {

  const px =
    player.x * tileSize;

  const py =
    player.y * tileSize;


  const walking =
    timestamp <
    playerWalkingUntil;


  const walkFrame =
    walking
      ? Math.floor(timestamp / 100) % 2
      : 0;


  const bob =
    walking &&
    walkFrame === 1
      ? -1
      : 0;


  // 受伤闪烁

  const hurt =
    timestamp < hurtUntil;


  if (
    hurt &&
    Math.floor(timestamp / 80) % 2 === 0
  ) {

    return;

  }


  const y =
    py + bob;


  // 地面影子

  ctx.fillStyle =
    "rgba(0,0,0,0.30)";


  ctx.fillRect(
    px + 8,
    py + 28,
    17,
    3
  );


  // ==================================================
  // 向下
  // ==================================================

  if (
    player.direction === "down"
  ) {

    // 头发

    ctx.fillStyle = "#3b281b";


    ctx.fillRect(
      px + 9,
      y + 2,
      14,
      4
    );


    ctx.fillRect(
      px + 7,
      y + 5,
      18,
      5
    );


    ctx.fillRect(
      px + 7,
      y + 8,
      4,
      5
    );


    ctx.fillRect(
      px + 21,
      y + 8,
      4,
      5
    );


    // 脸

    ctx.fillStyle = "#f5c98b";


    ctx.fillRect(
      px + 10,
      y + 8,
      12,
      8
    );


    // 眼睛

    ctx.fillStyle = "#111827";


    ctx.fillRect(
      px + 12,
      y + 11,
      2,
      2
    );


    ctx.fillRect(
      px + 18,
      y + 11,
      2,
      2
    );


    // 身体

    ctx.fillStyle = "#2563eb";


    ctx.fillRect(
      px + 9,
      y + 16,
      14,
      9
    );


    // 衣服高光

    ctx.fillStyle = "#60a5fa";


    ctx.fillRect(
      px + 11,
      y + 17,
      3,
      6
    );


    // 双手

    ctx.fillStyle = "#f5c98b";


    ctx.fillRect(
      px + 5,
      y + 17,
      4,
      8
    );


    ctx.fillRect(
      px + 23,
      y + 17,
      4,
      8
    );


    // 腰带

    ctx.fillStyle = "#78350f";


    ctx.fillRect(
      px + 9,
      y + 23,
      14,
      3
    );


    // 腰带扣

    ctx.fillStyle = "#facc15";


    ctx.fillRect(
      px + 15,
      y + 23,
      3,
      3
    );

  }


  // ==================================================
  // 向上
  // ==================================================

  else if (
    player.direction === "up"
  ) {

    // 完整头发

    ctx.fillStyle = "#3b281b";


    ctx.fillRect(
      px + 9,
      y + 2,
      14,
      4
    );


    ctx.fillRect(
      px + 7,
      y + 5,
      18,
      6
    );


    ctx.fillRect(
      px + 9,
      y + 10,
      14,
      6
    );


    // 两侧头发

    ctx.fillStyle = "#2b1c13";


    ctx.fillRect(
      px + 7,
      y + 9,
      4,
      6
    );


    ctx.fillRect(
      px + 21,
      y + 9,
      4,
      6
    );


    // 身体

    ctx.fillStyle = "#1d4ed8";


    ctx.fillRect(
      px + 9,
      y + 16,
      14,
      9
    );


    // 背部高光

    ctx.fillStyle = "#3b82f6";


    ctx.fillRect(
      px + 11,
      y + 17,
      10,
      3
    );


    // 双手

    ctx.fillStyle = "#f5c98b";


    ctx.fillRect(
      px + 5,
      y + 17,
      4,
      8
    );


    ctx.fillRect(
      px + 23,
      y + 17,
      4,
      8
    );


    // 腰带

    ctx.fillStyle = "#78350f";


    ctx.fillRect(
      px + 9,
      y + 23,
      14,
      3
    );

  }


  // ==================================================
  // 向右
  // ==================================================

  else if (
    player.direction === "right"
  ) {

    // 头发

    ctx.fillStyle = "#3b281b";


    ctx.fillRect(
      px + 8,
      y + 2,
      14,
      4
    );


    ctx.fillRect(
      px + 7,
      y + 5,
      17,
      5
    );


    ctx.fillRect(
      px + 7,
      y + 8,
      5,
      6
    );


    // 脸

    ctx.fillStyle = "#f5c98b";


    ctx.fillRect(
      px + 11,
      y + 8,
      12,
      8
    );


    // 鼻子

    ctx.fillRect(
      px + 23,
      y + 11,
      2,
      3
    );


    // 眼睛

    ctx.fillStyle = "#111827";


    ctx.fillRect(
      px + 19,
      y + 10,
      2,
      2
    );


    // 身体

    ctx.fillStyle = "#2563eb";


    ctx.fillRect(
      px + 9,
      y + 16,
      14,
      9
    );


    // 手臂

    ctx.fillStyle = "#f5c98b";


    if (walkFrame === 0) {

      ctx.fillRect(
        px + 21,
        y + 17,
        4,
        8
      );


      ctx.fillRect(
        px + 7,
        y + 19,
        3,
        6
      );

    }

    else {

      ctx.fillRect(
        px + 22,
        y + 19,
        4,
        6
      );


      ctx.fillRect(
        px + 6,
        y + 17,
        4,
        8
      );

    }


    // 腰带

    ctx.fillStyle = "#78350f";


    ctx.fillRect(
      px + 9,
      y + 23,
      14,
      3
    );

  }


  // ==================================================
  // 向左
  // ==================================================

  else if (
    player.direction === "left"
  ) {

    // 头发

    ctx.fillStyle = "#3b281b";


    ctx.fillRect(
      px + 10,
      y + 2,
      14,
      4
    );


    ctx.fillRect(
      px + 8,
      y + 5,
      17,
      5
    );


    ctx.fillRect(
      px + 20,
      y + 8,
      5,
      6
    );


    // 脸

    ctx.fillStyle = "#f5c98b";


    ctx.fillRect(
      px + 9,
      y + 8,
      12,
      8
    );


    // 鼻子

    ctx.fillRect(
      px + 7,
      y + 11,
      2,
      3
    );


    // 眼睛

    ctx.fillStyle = "#111827";


    ctx.fillRect(
      px + 11,
      y + 10,
      2,
      2
    );


    // 身体

    ctx.fillStyle = "#2563eb";


    ctx.fillRect(
      px + 9,
      y + 16,
      14,
      9
    );


    // 手臂

    ctx.fillStyle = "#f5c98b";


    if (walkFrame === 0) {

      ctx.fillRect(
        px + 7,
        y + 17,
        4,
        8
      );


      ctx.fillRect(
        px + 22,
        y + 19,
        3,
        6
      );

    }

    else {

      ctx.fillRect(
        px + 6,
        y + 19,
        4,
        6
      );


      ctx.fillRect(
        px + 22,
        y + 17,
        4,
        8
      );

    }


    // 腰带

    ctx.fillStyle = "#78350f";


    ctx.fillRect(
      px + 9,
      y + 23,
      14,
      3
    );

  }


  // ==================================================
  // 腿
  // ==================================================

  ctx.fillStyle = "#172554";


  if (walkFrame === 0) {

    ctx.fillRect(
      px + 10,
      y + 26,
      5,
      3
    );


    ctx.fillRect(
      px + 18,
      y + 26,
      5,
      3
    );

  }

  else {

    ctx.fillRect(
      px + 8,
      y + 26,
      6,
      3
    );


    ctx.fillRect(
      px + 19,
      y + 25,
      6,
      3
    );

  }


  // ==================================================
  // 靴子
  // ==================================================

  ctx.fillStyle = "#451a03";


  if (walkFrame === 0) {

    ctx.fillRect(
      px + 9,
      y + 29,
      6,
      2
    );


    ctx.fillRect(
      px + 18,
      y + 29,
      6,
      2
    );

  }

  else {

    ctx.fillRect(
      px + 7,
      y + 29,
      7,
      2
    );


    ctx.fillRect(
      px + 19,
      y + 28,
      7,
      2
    );

  }

}


// ==================================================
// V6.2 追踪蝙蝠
// ==================================================

function drawBat(enemy, index) {

  const px = enemy.x * tileSize;
  const py = enemy.y * tileSize;

  const flap =
    Math.floor(animationTime / 120 + index) % 2;

  const bob =
    Math.sin(animationTime * 0.009 + index) > 0
      ? -2
      : 0;

  const y = py + bob;

  // 地面影子
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(px + 9, py + 27, 15, 3);

  // 翅膀
  ctx.fillStyle = "#4338ca";

  if (flap === 0) {
    ctx.fillRect(px + 3, y + 10, 8, 5);
    ctx.fillRect(px + 22, y + 10, 8, 5);
    ctx.fillRect(px + 5, y + 7, 5, 4);
    ctx.fillRect(px + 23, y + 7, 5, 4);
  } else {
    ctx.fillRect(px + 4, y + 15, 8, 5);
    ctx.fillRect(px + 21, y + 15, 8, 5);
    ctx.fillRect(px + 2, y + 18, 5, 4);
    ctx.fillRect(px + 26, y + 18, 5, 4);
  }

  // 身体
  ctx.fillStyle = "#6d28d9";
  ctx.fillRect(px + 11, y + 10, 11, 13);

  // 耳朵
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(px + 11, y + 7, 4, 5);
  ctx.fillRect(px + 18, y + 7, 4, 5);

  // 脸
  ctx.fillStyle = "#8b5cf6";
  ctx.fillRect(px + 13, y + 12, 7, 7);

  // 红眼
  ctx.fillStyle = "#f87171";
  ctx.fillRect(px + 13, y + 14, 2, 2);
  ctx.fillRect(px + 18, y + 14, 2, 2);

  // 小尖牙
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px + 15, y + 18, 2, 2);
  ctx.fillRect(px + 18, y + 18, 2, 2);

}


// ==================================================
// 史莱姆 / 怪物绘制入口
// ==================================================

function drawEnemy(enemy, index) {

  if (enemy.type === "bat") {
    drawBat(enemy, index);
    return;
  }

  const px =
    enemy.x * tileSize;

  const py =
    enemy.y * tileSize;


  const bounce =
    Math.sin(
      animationTime * 0.007 +
      index * 1.7
    );


  const jump =
    bounce > 0.35
      ? -2
      : 0;


  const squash =
    bounce < -0.65;


  const y =
    py + jump;


  // 影子

  ctx.fillStyle =
    "rgba(0,0,0,0.28)";


  ctx.fillRect(
    px + 8,
    py + 26,
    17,
    3
  );


  const mainColor =
    currentLevel === 0
      ? "#ef4444"
      : "#a855f7";


  const lightColor =
    currentLevel === 0
      ? "#fca5a5"
      : "#d8b4fe";


  const darkColor =
    currentLevel === 0
      ? "#991b1b"
      : "#6b21a8";


  // 身体

  ctx.fillStyle = mainColor;


  if (!squash) {

    ctx.fillRect(
      px + 7,
      y + 11,
      18,
      14
    );


    ctx.fillRect(
      px + 10,
      y + 7,
      12,
      5
    );

  }

  else {

    ctx.fillRect(
      px + 5,
      y + 14,
      22,
      11
    );


    ctx.fillRect(
      px + 9,
      y + 10,
      14,
      5
    );

  }


  // 高光

  ctx.fillStyle =
    lightColor;


  ctx.fillRect(
    px + 10,
    y + 11,
    5,
    4
  );


  // 眼睛

  ctx.fillStyle = "#111827";


  ctx.fillRect(
    px + 11,
    y + 17,
    3,
    3
  );


  ctx.fillRect(
    px + 19,
    y + 17,
    3,
    3
  );


  // 脚

  ctx.fillStyle =
    darkColor;


  ctx.fillRect(
    px + 7,
    y + 24,
    7,
    3
  );


  ctx.fillRect(
    px + 19,
    y + 24,
    7,
    3
  );

}


// ==================================================
// 出口
// ==================================================

function drawExit() {

  if (!exitOpen) {

    return;

  }


  const px =
    exit.x * tileSize;

  const py =
    exit.y * tileSize;


  const pulse =
    (
      Math.sin(
        animationTime * 0.006
      ) + 1
    ) / 2;


  // 外部光芒

  ctx.fillStyle =
    `rgba(250,204,21,${
      0.08 + pulse * 0.18
    })`;


  ctx.fillRect(
    px,
    py,
    32,
    32
  );


  ctx.fillStyle =
    `rgba(253,224,71,${
      0.10 + pulse * 0.18
    })`;


  ctx.fillRect(
    px + 3,
    py + 2,
    26,
    30
  );


  // 门框

  ctx.fillStyle = "#78350f";


  ctx.fillRect(
    px + 5,
    py + 3,
    22,
    27
  );


  // 门

  ctx.fillStyle = "#f59e0b";


  ctx.fillRect(
    px + 8,
    py + 6,
    16,
    24
  );


  // 门光

  ctx.fillStyle =
    pulse > 0.5
      ? "#fff7a8"
      : "#fde047";


  ctx.fillRect(
    px + 11,
    py + 9,
    10,
    18
  );


  if (pulse > 0.8) {

    ctx.fillStyle = "#ffffff";


    ctx.fillRect(
      px + 14,
      py + 11,
      2,
      5
    );

  }


  ctx.fillStyle = "#ffffff";


  ctx.fillRect(
    px + 19,
    py + 18,
    2,
    2
  );

}


// ==================================================
// 金币拾取特效
// ==================================================

function drawCoinEffects(timestamp) {

  const duration = 650;


  coinEffects =
    coinEffects.filter(
      effect => {

        const age =
          timestamp -
          effect.startTime;


        if (age >= duration) {

          return false;

        }


        const progress =
          age / duration;


        const px =
          effect.x * tileSize;

        const py =
          effect.y * tileSize;


        // 金色爆闪

        if (progress < 0.35) {

          const flashProgress =
            progress / 0.35;


          const size =
            3 +
            flashProgress * 10;


          const alpha =
            1 -
            flashProgress;


          ctx.fillStyle =
            `rgba(253,224,71,${alpha})`;


          // 中心

          ctx.fillRect(
            px + 14,
            py + 14,
            4,
            4
          );


          // 上

          ctx.fillRect(
            px + 15,
            py + 13 - size,
            2,
            size
          );


          // 下

          ctx.fillRect(
            px + 15,
            py + 19,
            2,
            size
          );


          // 左

          ctx.fillRect(
            px + 13 - size,
            py + 15,
            size,
            2
          );


          // 右

          ctx.fillRect(
            px + 19,
            py + 15,
            size,
            2
          );


          // 小星星

          ctx.fillStyle =
            `rgba(255,255,255,${alpha})`;


          ctx.fillRect(
            px + 7,
            py + 7,
            3,
            3
          );


          ctx.fillRect(
            px + 23,
            py + 8,
            2,
            2
          );


          ctx.fillRect(
            px + 8,
            py + 23,
            2,
            2
          );


          ctx.fillRect(
            px + 24,
            py + 22,
            3,
            3
          );

        }


        // +1 飘字

        const floatY =
          py +
          13 -
          progress * 25;


        ctx.save();


        ctx.globalAlpha =
          1 - progress;


        ctx.font =
          "bold 11px Courier New";


        ctx.textAlign =
          "center";


        // 黑色阴影

        ctx.fillStyle =
          "#111827";


        ctx.fillText(
          "+1",
          px + 17,
          floatY + 2
        );


        // 金色文字

        ctx.fillStyle =
          "#fde047";


        ctx.fillText(
          "+1",
          px + 16,
          floatY
        );


        ctx.restore();


        return true;

      }
    );

}


// ==================================================
// V4.3 受伤 -1 ❤️ 飘字
// ==================================================

function drawDamageEffects(timestamp) {

  const duration = 850;


  damageEffects =
    damageEffects.filter(
      effect => {

        const age =
          timestamp -
          effect.startTime;


        if (age >= duration) {

          return false;

        }


        const progress =
          age / duration;


        const px =
          effect.x * tileSize;

        const py =
          effect.y * tileSize;


        // 向上飘

        const floatY =
          py +
          10 -
          progress * 28;


        ctx.save();


        ctx.globalAlpha =
          1 - progress;


        ctx.font =
          "bold 12px Courier New";


        ctx.textAlign =
          "center";


        // 黑色阴影

        ctx.fillStyle =
          "#111827";


        ctx.fillText(
          "♥ -1",
          px + 17,
          floatY + 2
        );


        // 红色文字

        ctx.fillStyle =
          "#ff4d4d";


        ctx.fillText(
          "♥ -1",
          px + 16,
          floatY
        );


        ctx.restore();


        return true;

      }
    );

}


// ==================================================
// V4.3 屏幕红色受伤闪光
// ==================================================

function drawDamageFlash(timestamp) {

  if (
    timestamp >=
    screenFlashUntil
  ) {

    return;

  }


  const remaining =
    screenFlashUntil -
    timestamp;


  const alpha =
    Math.min(
      0.32,
      remaining / 700
    );


  ctx.fillStyle =
    `rgba(255,40,40,${alpha})`;


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // 四周再加一层红边

  ctx.fillStyle =
    `rgba(255,0,0,${alpha * 0.8})`;


  // 上

  ctx.fillRect(
    0,
    0,
    canvas.width,
    6
  );


  // 下

  ctx.fillRect(
    0,
    canvas.height - 6,
    canvas.width,
    6
  );


  // 左

  ctx.fillRect(
    0,
    0,
    6,
    canvas.height
  );


  // 右

  ctx.fillRect(
    canvas.width - 6,
    0,
    6,
    canvas.height
  );

}


// ==================================================
// V6.1 金色像素钥匙
// ==================================================

function drawKeyItem(timestamp) {

  if (!keyItem || keyItem.collected) {
    return;
  }

  const px = keyItem.x * tileSize;
  const py = keyItem.y * tileSize;

  const bob =
    Math.sin(timestamp * 0.008) > 0
      ? -2
      : 0;

  const y = py + bob;

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(px + 8, py + 26, 17, 3);

  // 钥匙圆环
  ctx.fillStyle = "#ca8a04";
  ctx.fillRect(px + 7, y + 8, 12, 12);

  ctx.fillStyle = "#fde047";
  ctx.fillRect(px + 9, y + 10, 8, 8);

  ctx.fillStyle = "#245c3a";
  ctx.fillRect(px + 11, y + 12, 4, 4);

  // 钥匙柄
  ctx.fillStyle = "#facc15";
  ctx.fillRect(px + 17, y + 13, 9, 4);
  ctx.fillRect(px + 23, y + 16, 4, 5);
  ctx.fillRect(px + 20, y + 16, 3, 3);

  // 高光
  ctx.fillStyle = "#fff7a8";
  ctx.fillRect(px + 10, y + 9, 4, 2);

}


// ==================================================
// V6.1 像素宝箱
// ==================================================

function drawChest() {

  if (!chest) {
    return;
  }

  const px = chest.x * tileSize;
  const py = chest.y * tileSize;

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px + 5, py + 27, 23, 3);

  if (!chest.opened) {

    // 箱盖
    ctx.fillStyle = "#5b3218";
    ctx.fillRect(px + 5, py + 8, 22, 8);

    ctx.fillStyle = "#a16207";
    ctx.fillRect(px + 7, py + 10, 18, 4);

    // 箱体
    ctx.fillStyle = "#78350f";
    ctx.fillRect(px + 5, py + 16, 22, 11);

    ctx.fillStyle = "#b45309";
    ctx.fillRect(px + 7, py + 18, 18, 7);

    // 金属边
    ctx.fillStyle = "#facc15";
    ctx.fillRect(px + 5, py + 14, 22, 3);
    ctx.fillRect(px + 14, py + 15, 5, 8);

    // 锁孔
    ctx.fillStyle = "#422006";
    ctx.fillRect(px + 16, py + 18, 2, 3);

  } else {

    // 打开的箱盖向上翻
    ctx.fillStyle = "#5b3218";
    ctx.fillRect(px + 6, py + 4, 20, 5);

    ctx.fillStyle = "#facc15";
    ctx.fillRect(px + 7, py + 9, 18, 2);

    // 箱内金光
    ctx.fillStyle = "rgba(253,224,71,0.28)";
    ctx.fillRect(px + 7, py + 11, 18, 10);

    // 箱体
    ctx.fillStyle = "#78350f";
    ctx.fillRect(px + 5, py + 17, 22, 10);

    ctx.fillStyle = "#b45309";
    ctx.fillRect(px + 7, py + 19, 18, 6);

    ctx.fillStyle = "#facc15";
    ctx.fillRect(px + 14, py + 17, 5, 7);

    // 宝石
    ctx.fillStyle = "#67e8f9";
    ctx.fillRect(px + 13, py + 12, 7, 6);

    ctx.fillStyle = "#ecfeff";
    ctx.fillRect(px + 15, py + 12, 3, 2);

  }

}


// ==================================================
// V6.1 钥匙 / 宝箱飘字
// ==================================================

function drawAdventureEffects(timestamp) {

  const duration = 900;

  adventureEffects =
    adventureEffects.filter(effect => {

      const age = timestamp - effect.startTime;

      if (age >= duration) {
        return false;
      }

      const progress = age / duration;
      const px = effect.x * tileSize + 16;
      const py = effect.y * tileSize + 8 - progress * 25;

      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.textAlign = "center";
      ctx.font = "bold 10px Courier New";

      ctx.fillStyle = "#111827";
      ctx.fillText(effect.text, px + 1, py + 2);

      ctx.fillStyle = effect.color;
      ctx.fillText(effect.text, px, py);

      ctx.restore();

      return true;
    });

}


// ==================================================
// V6.3 古代宝石祭坛
// ==================================================

function drawAltar(timestamp) {

  if (!altar) {
    return;
  }

  const px = altar.x * tileSize;
  const py = altar.y * tileSize;

  const pulse =
    (Math.sin(timestamp * 0.006) + 1) / 2;

  // 石台
  ctx.fillStyle = "#312e4f";
  ctx.fillRect(px + 5, py + 20, 22, 8);

  ctx.fillStyle = "#5b5684";
  ctx.fillRect(px + 7, py + 17, 18, 5);

  ctx.fillStyle = "#1e1b35";
  ctx.fillRect(px + 8, py + 27, 16, 3);

  if (!altar.activated) {

    // 悬浮晶体槽
    ctx.fillStyle =
      `rgba(103,232,249,${0.16 + pulse * 0.20})`;
    ctx.fillRect(px + 8, py + 5, 16, 14);

    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(px + 13, py + 7, 7, 9);

    ctx.fillStyle = "#ecfeff";
    ctx.fillRect(px + 15, py + 7, 3, 3);

  } else {

    // 激活后的金色核心
    ctx.fillStyle =
      `rgba(253,224,71,${0.20 + pulse * 0.25})`;
    ctx.fillRect(px + 5, py + 3, 22, 17);

    ctx.fillStyle = "#fde047";
    ctx.fillRect(px + 12, py + 6, 9, 10);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 15, py + 7, 3, 4);

    // 上升光柱
    ctx.fillStyle =
      `rgba(255,247,168,${0.08 + pulse * 0.15})`;
    ctx.fillRect(px + 14, py, 5, 18);

  }

}


// ==================================================
// V7.0 THE GUARDIAN
// ==================================================

function drawBossTraps(timestamp) {
  bossTraps.forEach(trap => {
    const tx = trap.x * tileSize;
    const ty = trap.y * tileSize;
    const sx = trap.switchX * tileSize;
    const sy = trap.switchY * tileSize;

    ctx.fillStyle = trap.used ? "#3f3f46" : "#713f12";
    ctx.fillRect(tx + 5, ty + 5, 22, 22);
    ctx.fillStyle = trap.used ? "#71717a" : "#facc15";
    ctx.fillRect(tx + 9, ty + 9, 14, 14);
    ctx.fillStyle = "#111827";
    ctx.fillRect(tx + 14, ty + 8, 4, 16);
    ctx.fillRect(tx + 10, ty + 14, 12, 4);

    ctx.fillStyle = trap.used ? "#52525b" : "#991b1b";
    ctx.fillRect(sx + 7, sy + 9, 18, 15);
    ctx.fillStyle = trap.used ? "#71717a" : "#ef4444";
    ctx.fillRect(sx + 10, sy + 11, 12, 8);
    ctx.fillStyle = "#fecaca";
    ctx.fillRect(sx + 12, sy + 12, 5, 2);

    if (timestamp < trap.flashUntil) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillRect(tx + 2, ty + 2, 28, 28);
      ctx.fillStyle = "#fde047";
      ctx.fillRect(tx + 14, ty, 4, 32);
      ctx.fillRect(tx, ty + 14, 32, 4);
    }
  });
}

function drawBoss(timestamp) {
  if (!boss || bossDefeated) return;
  if (timestamp < bossFlashUntil && Math.floor(timestamp / 70) % 2 === 0) return;

  const px = boss.x * tileSize;
  const py = boss.y * tileSize;
  const y = py + (Math.sin(timestamp * 0.006) > 0 ? -1 : 0);

  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.fillRect(px + 3, py + 27, 27, 4);

  ctx.fillStyle = "#d1d5db";
  ctx.fillRect(px + 4, y + 3, 6, 8);
  ctx.fillRect(px + 23, y + 3, 6, 8);
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(px + 2, y + 2, 4, 5);
  ctx.fillRect(px + 27, y + 2, 4, 5);

  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(px + 5, y + 9, 23, 17);
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(px + 8, y + 7, 17, 16);
  ctx.fillStyle = "#292524";
  ctx.fillRect(px + 8, y + 6, 17, 7);

  ctx.fillStyle = "#fde047";
  ctx.fillRect(px + 10, y + 14, 4, 3);
  ctx.fillRect(px + 20, y + 14, 4, 3);
  ctx.fillStyle = "#111827";
  ctx.fillRect(px + 13, y + 20, 9, 3);

  ctx.fillStyle = "#44403c";
  ctx.fillRect(px + 3, y + 15, 6, 8);
  ctx.fillRect(px + 25, y + 15, 6, 8);
  ctx.fillStyle = "#450a0a";
  ctx.fillRect(px + 7, y + 25, 8, 4);
  ctx.fillRect(px + 20, y + 25, 8, 4);
}

function drawBossBar() {
  if (!boss || bossDefeated) return;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(54, 5, 212, 15);
  ctx.fillStyle = "#450a0a";
  ctx.fillRect(57, 8, 206, 9);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(57, 8, Math.floor(206 * boss.hp / 3), 9);
  ctx.font = "bold 8px Courier New";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("THE GUARDIAN", 160, 15);
}

// ==================================================
// 绘制整个游戏
// ==================================================

function drawGame(timestamp) {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // 地图

  for (let y = 0; y < rows; y++) {

    for (let x = 0; x < cols; x++) {

      drawGrass(x, y);


      if (map[y][x] === 1) {

        drawWall(x, y);

      }


      if (map[y][x] === 2) {

        drawCoin(x, y);

      }

    }

  }


  // 出口

  drawExit();


  // V6.1 探索物件

  drawKeyItem(timestamp);

  drawChest();

  drawAltar(timestamp);

  drawBossTraps(timestamp);


  // 史莱姆

  enemies.forEach(
    (enemy, index) => {

      drawEnemy(
        enemy,
        index
      );

    }
  );


  drawBoss(timestamp);

  drawBossBar();


  // 玩家

  drawPlayer(timestamp);


  // 金币特效

  drawCoinEffects(timestamp);


  // 受伤飘字

  drawDamageEffects(timestamp);


  // V6.1 钥匙 / 宝箱飘字

  drawAdventureEffects(timestamp);


  // 最上层屏幕红闪

  drawDamageFlash(timestamp);

}


// ==================================================
// 动画循环
// ==================================================

function gameLoop(timestamp) {

  animationTime =
    timestamp;


  drawGame(timestamp);


  requestAnimationFrame(
    gameLoop
  );

}


// ==================================================
// 敌人碰撞
// ==================================================

function checkEnemyCollision() {

  const hitEnemy =
    enemies.find(
      enemy =>

        enemy.x === player.x &&
        enemy.y === player.y
    );


  if (!hitEnemy) {

    return false;

  }


  if (hitEnemy.type === "bat") {

    playBatChirp();

  }


  // ==================================================
  // 先记住受伤发生的位置
  // ==================================================

  const damageX =
    player.x;

  const damageY =
    player.y;


  // 创建受伤视觉效果

  createDamageEffect(
    damageX,
    damageY
  );


  // V5.0 受伤音效

  playHurtSound();


  // 扣生命

  lives--;


  updateGameInfo();


  // 人物闪烁

  hurtUntil =
    performance.now() +
    700;


  // 回出生点

  const start =
    levels[currentLevel]
      .playerStart;


  player.x =
    start.x;

  player.y =
    start.y;


  // GAME OVER

  if (lives <= 0) {

    gamePaused = true;


    stopEnemyTimer();


    // V5.0 Game Over 音效

    playGameOverSound();


    // 稍微等一下，让玩家看到受伤效果

    setTimeout(
      () => {

        showModal(
          "☠️",
          "GAME OVER",
          `你到达了 LEVEL ${
            currentLevel + 1
          }`,
          "PLAY AGAIN",
          restartGame
        );

      },
      350
    );

  }


  return true;

}


// ==================================================
// 玩家移动
// ==================================================

function movePlayer(dx, dy) {

  if (gamePaused) {

    return;

  }


  // 朝向

  if (dx > 0) {

    player.direction =
      "right";

  }

  else if (dx < 0) {

    player.direction =
      "left";

  }

  else if (dy < 0) {

    player.direction =
      "up";

  }

  else if (dy > 0) {

    player.direction =
      "down";

  }


  const newX =
    player.x + dx;

  const newY =
    player.y + dy;


  // 地图边界

  if (
    newX < 0 ||
    newX >= cols ||
    newY < 0 ||
    newY >= rows
  ) {

    return;

  }


  // 撞墙

  if (
    map[newY][newX] === 1
  ) {

    return;

  }


  // V7.0：不能直接穿过 Boss
  if (
    boss &&
    !bossDefeated &&
    newX === boss.x &&
    newY === boss.y
  ) {
    damagePlayerFromBoss();
    return;
  }


  // V6.3：未激活祭坛需要宝石才能进入

  if (
    altar &&
    !altar.activated &&
    newX === altar.x &&
    newY === altar.y &&
    gems <= 0
  ) {

    playAltarLockedSound();

    createAdventureEffect(
      altar.x,
      altar.y,
      "NEED GEM",
      "#67e8f9"
    );

    return;

  }


  // V6.1：锁着的宝箱会挡住玩家

  if (
    chest &&
    !chest.opened &&
    newX === chest.x &&
    newY === chest.y &&
    keys <= 0
  ) {

    playChestLockedSound();

    createAdventureEffect(
      chest.x,
      chest.y,
      "NEED KEY",
      "#fca5a5"
    );

    return;

  }


  // 移动

  player.x =
    newX;

  player.y =
    newY;


  playerWalkingUntil =
    performance.now() +
    180;


  // ==================================================
  // V7.0 Boss 机关开关
  // ==================================================

  checkBossSwitches();


  // ==================================================
  // 吃金币
  // ==================================================

  if (
    map[newY][newX] === 2
  ) {

    createCoinEffect(
      newX,
      newY
    );


    map[newY][newX] = 0;


    coins++;


    // V5.0 金币音效

    playCoinSound();


    if (
      coins >= totalCoins
    ) {

      exitOpen = true;


      // V5.0 出口开启音效

      playDoorOpenSound();

    }


    updateGameInfo();

  }


  // ==================================================
  // V6.1 拾取钥匙
  // ==================================================

  if (
    keyItem &&
    !keyItem.collected &&
    player.x === keyItem.x &&
    player.y === keyItem.y
  ) {

    keyItem.collected = true;

    keys = 1;

    playKeySound();

    createAdventureEffect(
      keyItem.x,
      keyItem.y,
      "+1 KEY",
      "#fde047"
    );

    updateGameInfo();

  }


  // ==================================================
  // V6.1 打开宝箱
  // ==================================================

  if (
    chest &&
    !chest.opened &&
    player.x === chest.x &&
    player.y === chest.y &&
    keys > 0
  ) {

    chest.opened = true;

    keys = 0;

    gems++;

    playChestOpenSound();

    createAdventureEffect(
      chest.x,
      chest.y,
      "+1 GEM",
      "#67e8f9"
    );

    updateGameInfo();

  }


  // ==================================================
  // V6.3 激活古代祭坛
  // ==================================================

  if (
    altar &&
    !altar.activated &&
    player.x === altar.x &&
    player.y === altar.y &&
    gems > 0
  ) {

    altar.activated = true;

    gems--;

    maxLives++;

    lives = maxLives;

    playAltarSound();

    createAdventureEffect(
      altar.x,
      altar.y,
      "MAX HP +1",
      "#fde047"
    );

    updateGameInfo();

  }


  // ==================================================
  // 撞史莱姆
  // ==================================================

  if (
    checkEnemyCollision()
  ) {

    return;

  }


  // ==================================================
  // 进入出口
  // ==================================================

  if (
    exitOpen &&
    player.x === exit.x &&
    player.y === exit.y
  ) {

    completeLevel();

  }

}


// ==================================================
// V7.0 Boss 战逻辑
// ==================================================

function damagePlayerFromBoss() {
  if (gamePaused) return;

  createDamageEffect(player.x, player.y);
  playHurtSound();
  lives--;
  updateGameInfo();
  hurtUntil = performance.now() + 700;

  const start = levels[currentLevel].playerStart;
  player.x = start.x;
  player.y = start.y;

  if (lives <= 0) {
    gamePaused = true;
    stopEnemyTimer();
    stopBossTimer();
    playGameOverSound();

    setTimeout(() => {
      showModal("☠️", "GAME OVER", "THE GUARDIAN 击败了你", "PLAY AGAIN", restartGame);
    }, 350);
  }
}

function checkBossSwitches() {
  if (!boss || bossDefeated) return;

  bossTraps.forEach(trap => {
    if (trap.used || player.x !== trap.switchX || player.y !== trap.switchY) return;

    trap.used = true;

    if (boss.x === trap.x && boss.y === trap.y) {
      trap.flashUntil = performance.now() + 350;
      boss.hp--;
      bossFlashUntil = performance.now() + 650;
      playBossHitSound();
      createAdventureEffect(boss.x, boss.y, "ZAP! -1", "#fde047");
      updateGameInfo();

      if (boss.hp <= 0) {
        bossDefeated = true;
        stopBossTimer();
        playBossDefeatSound();
        createAdventureEffect(boss.x, boss.y, "DEFEATED!", "#ffffff");
        exitOpen = true;

        setTimeout(() => {
          if (!gamePaused) {
            showModal("🏆", "BOSS DEFEATED!", "THE GUARDIAN 已被击败，出口开启！", "CONTINUE", hideModal);
          }
        }, 550);
      }
    } else {
      playTrapMissSound();
      createAdventureEffect(trap.switchX, trap.switchY, "MISS!", "#fca5a5");
    }
  });
}

function moveBoss() {
  if (gamePaused || !boss || bossDefeated) return;

  const directions = [
    { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: 0 }, { x: 1, y: 0 }
  ];

  directions.sort((a, b) => {
    const da = Math.abs(boss.x + a.x - player.x) + Math.abs(boss.y + a.y - player.y);
    const db = Math.abs(boss.x + b.x - player.x) + Math.abs(boss.y + b.y - player.y);
    return da - db;
  });

  for (const direction of directions) {
    const newX = boss.x + direction.x;
    const newY = boss.y + direction.y;

    if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) continue;
    if (map[newY][newX] === 1) continue;

    const onSwitch = bossTraps.some(
      trap => newX === trap.switchX && newY === trap.switchY
    );
    if (onSwitch) continue;

    boss.x = newX;
    boss.y = newY;
    break;
  }

  if (boss.x === player.x && boss.y === player.y) {
    damagePlayerFromBoss();
  }
}

function startBossTimer() {
  stopBossTimer();
  if (!boss) return;
  bossMoveTimer = setInterval(moveBoss, levels[currentLevel].enemySpeed);
}

function stopBossTimer() {
  if (bossMoveTimer) {
    clearInterval(bossMoveTimer);
    bossMoveTimer = null;
  }
}


// ==================================================
// 敌人移动
// ==================================================

function moveEnemies() {

  if (gamePaused) {

    return;

  }


  enemies.forEach(
    enemy => {

      const directions = [

        { x: 0, y: -1 },

        { x: 0, y: 1 },

        { x: -1, y: 0 },

        { x: 1, y: 0 }

      ];


      // V6.2：
      // 普通史莱姆随机移动；
      // 蝙蝠会优先选择让自己更接近玩家的方向。

      if (enemy.type === "bat") {

        directions.sort(
          (a, b) => {

            const distanceA =
              Math.abs(enemy.x + a.x - player.x) +
              Math.abs(enemy.y + a.y - player.y);

            const distanceB =
              Math.abs(enemy.x + b.x - player.x) +
              Math.abs(enemy.y + b.y - player.y);

            return distanceA - distanceB;

          }
        );

      } else {

        directions.sort(
          () =>
            Math.random() -
            0.5
        );

      }


      for (
        const direction
        of directions
      ) {

        const newX =
          enemy.x +
          direction.x;


        const newY =
          enemy.y +
          direction.y;


        // 边界

        if (
          newX < 0 ||
          newX >= cols ||
          newY < 0 ||
          newY >= rows
        ) {

          continue;

        }


        // 墙

        if (
          map[newY][newX] === 1
        ) {

          continue;

        }


        // 出口

        if (
          exitOpen &&
          newX === exit.x &&
          newY === exit.y
        ) {

          continue;

        }


        // V6.1 钥匙 / 宝箱位置留给玩家探索

        if (
          keyItem &&
          !keyItem.collected &&
          newX === keyItem.x &&
          newY === keyItem.y
        ) {

          continue;

        }


        if (
          chest &&
          newX === chest.x &&
          newY === chest.y
        ) {

          continue;

        }


        if (
          altar &&
          newX === altar.x &&
          newY === altar.y
        ) {

          continue;

        }


        // 其他史莱姆

        const occupied =
          enemies.some(
            other =>

              other !== enemy &&

              other.x === newX &&

              other.y === newY
          );


        if (occupied) {

          continue;

        }


        enemy.x =
          newX;

        enemy.y =
          newY;


        break;

      }

    }
  );


  checkEnemyCollision();

}


// ==================================================
// 敌人计时器
// ==================================================

function startEnemyTimer() {

  stopEnemyTimer();


  const speed =
    levels[currentLevel]
      .enemySpeed;


  enemyTimer =
    setInterval(
      moveEnemies,
      speed
    );

}


function stopEnemyTimer() {

  if (enemyTimer) {

    clearInterval(
      enemyTimer
    );


    enemyTimer = null;

  }

}


// ==================================================
// 完成关卡
// ==================================================

function completeLevel() {

  gamePaused = true;


  stopEnemyTimer();

  stopBossTimer();


  // V5.0 通关音效

  playWinSound(
    currentLevel ===
    levels.length - 1
  );


  if (
    currentLevel <
    levels.length - 1
  ) {

    showModal(
      "🎉",
      "LEVEL COMPLETE!",
      `准备进入 LEVEL ${currentLevel + 2}`,
      "CONTINUE",
      nextLevel
    );

  }

  else {

    showModal(
      "🏆",
      "YOU WIN!",
      "你完成了所有关卡！",
      "PLAY AGAIN",
      restartGame
    );

  }

}


// ==================================================
// 下一关
// ==================================================

function nextLevel() {

  hideModal();


  currentLevel++;


  loadLevel(
    currentLevel
  );

}


// ==================================================
// 重新开始
// ==================================================

function restartGame() {

  hideModal();


  stopEnemyTimer();

  stopBossTimer();


  currentLevel = 0;

  lives = 3;

  maxLives = 3;

  // V6.2：只有重新开始整局游戏时才清空宝石

  gems = 0;


  loadLevel(0);

}


// ==================================================
// 弹窗
// ==================================================

function showModal(
  icon,
  title,
  text,
  buttonText,
  action
) {

  modalIcon.textContent =
    icon;


  modalTitle.textContent =
    title;


  modalText.textContent =
    text;


  modalButton.textContent =
    buttonText;


  modalButton.onclick =
    action;


  gameModal.classList.remove(
    "hidden"
  );

}


function hideModal() {

  gameModal.classList.add(
    "hidden"
  );

}


// ==================================================
// 手机方向按钮
// ==================================================

document
  .getElementById("up")
  .addEventListener(
    "click",
    () =>
      movePlayer(0, -1)
  );


document
  .getElementById("down")
  .addEventListener(
    "click",
    () =>
      movePlayer(0, 1)
  );


document
  .getElementById("left")
  .addEventListener(
    "click",
    () =>
      movePlayer(-1, 0)
  );


document
  .getElementById("right")
  .addEventListener(
    "click",
    () =>
      movePlayer(1, 0)
  );


// ==================================================
// 键盘
// ==================================================

document.addEventListener(
  "keydown",
  event => {

    if (gamePaused) {

      return;

    }


    const key =
      event.key.toLowerCase();


    if (
      key.startsWith("arrow")
    ) {

      event.preventDefault();

    }


    if (
      key === "arrowup" ||
      key === "w"
    ) {

      movePlayer(
        0,
        -1
      );

    }


    else if (
      key === "arrowdown" ||
      key === "s"
    ) {

      movePlayer(
        0,
        1
      );

    }


    else if (
      key === "arrowleft" ||
      key === "a"
    ) {

      movePlayer(
        -1,
        0
      );

    }


    else if (
      key === "arrowright" ||
      key === "d"
    ) {

      movePlayer(
        1,
        0
      );

    }

  }
);


// ==================================================
// 游戏启动
// ==================================================

loadLevel(0);


requestAnimationFrame(
  gameLoop
);