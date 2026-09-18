// ==================================================
// PIXEL ADVENTURE V6.3
// V5 8-bit 音效系统
// ==================================================

// ==================================================
// V5.0 8-BIT 音效系统（Web Audio API）
// 不需要 MP3 / WAV 文件
// ==================================================

let audioContext = null;

function getAudioContext() {

  if (!audioContext) {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {

      return null;

    }

    audioContext =
      new AudioContextClass();

  }


  if (audioContext.state === "suspended") {

    audioContext.resume();

  }


  return audioContext;

}


function playTone(
  frequency,
  duration = 0.08,
  type = "square",
  volume = 0.05,
  delay = 0
) {

  const audio =
    getAudioContext();


  if (!audio) {

    return;

  }


  const start =
    audio.currentTime + delay;


  const oscillator =
    audio.createOscillator();


  const gain =
    audio.createGain();


  oscillator.type =
    type;


  oscillator.frequency.setValueAtTime(
    frequency,
    start
  );


  gain.gain.setValueAtTime(
    0.0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.01
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );


  oscillator.connect(gain);

  gain.connect(
    audio.destination
  );


  oscillator.start(start);

  oscillator.stop(
    start + duration + 0.02
  );

}


// 🪙 吃金币
function playCoinSound() {

  playTone(
    880,
    0.07,
    "square",
    0.045
  );


  playTone(
    1320,
    0.10,
    "square",
    0.04,
    0.055
  );

}


// 💥 受伤
function playHurtSound() {

  const audio =
    getAudioContext();


  if (!audio) {

    return;

  }


  const start =
    audio.currentTime;


  const oscillator =
    audio.createOscillator();


  const gain =
    audio.createGain();


  oscillator.type =
    "sawtooth";


  oscillator.frequency.setValueAtTime(
    170,
    start
  );


  oscillator.frequency.exponentialRampToValueAtTime(
    70,
    start + 0.18
  );


  gain.gain.setValueAtTime(
    0.06,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + 0.20
  );


  oscillator.connect(gain);

  gain.connect(
    audio.destination
  );


  oscillator.start(start);

  oscillator.stop(
    start + 0.21
  );

}


// 🚪 出口开启
function playDoorOpenSound() {

  playTone(392, 0.10, "square", 0.04, 0.00);
  playTone(523, 0.10, "square", 0.04, 0.09);
  playTone(659, 0.13, "square", 0.04, 0.18);
  playTone(784, 0.18, "square", 0.045, 0.27);

}


// 🎉 通关 / 最终胜利
function playWinSound(finalWin = false) {

  const notes =
    finalWin
      ? [523, 659, 784, 1047, 1319]
      : [523, 659, 784, 1047];


  notes.forEach(
    (note, index) => {

      playTone(
        note,
        index === notes.length - 1
          ? 0.28
          : 0.11,
        "square",
        0.045,
        index * 0.10
      );

    }
  );

}


// ☠️ Game Over
function playGameOverSound() {

  playTone(330, 0.16, "square", 0.045, 0.00);
  playTone(247, 0.16, "square", 0.045, 0.15);
  playTone(196, 0.18, "square", 0.045, 0.30);
  playTone(131, 0.32, "sawtooth", 0.04, 0.47);

}


// ==================================================
// V6.1 钥匙 / 宝箱音效
// ==================================================

function playKeySound() {
  playTone(740, 0.07, "square", 0.04, 0.00);
  playTone(988, 0.10, "square", 0.045, 0.06);
}

function playChestLockedSound() {
  playTone(150, 0.08, "square", 0.035, 0.00);
  playTone(120, 0.10, "square", 0.03, 0.07);
}

function playChestOpenSound() {
  playTone(330, 0.08, "square", 0.04, 0.00);
  playTone(440, 0.08, "square", 0.04, 0.07);
  playTone(660, 0.10, "square", 0.045, 0.14);
  playTone(990, 0.18, "square", 0.045, 0.22);
}


// ==================================================
// V6.2 蝙蝠提示音（为后续怪物音效系统预留）
// ==================================================

function playBatChirp() {
  playTone(1180, 0.045, "square", 0.018, 0.00);
  playTone(920, 0.055, "square", 0.016, 0.045);
}


// ==================================================
// V6.3 古代祭坛音效
// ==================================================

function playAltarLockedSound() {
  playTone(220, 0.09, "triangle", 0.025, 0.00);
  playTone(196, 0.12, "triangle", 0.022, 0.08);
}

function playAltarSound() {
  playTone(392, 0.12, "triangle", 0.035, 0.00);
  playTone(523, 0.12, "triangle", 0.035, 0.10);
  playTone(659, 0.14, "triangle", 0.04, 0.20);
  playTone(784, 0.18, "square", 0.035, 0.32);
  playTone(1047, 0.30, "square", 0.03, 0.46);
}


// ==================================================
// V7.0 THE GUARDIAN Boss 音效
// ==================================================

function playBossHitSound() {
  playTone(880, 0.06, "square", 0.05, 0.00);
  playTone(440, 0.10, "sawtooth", 0.045, 0.05);
  playTone(220, 0.16, "square", 0.04, 0.12);
}

function playTrapMissSound() {
  playTone(180, 0.07, "square", 0.025, 0.00);
  playTone(140, 0.08, "square", 0.022, 0.07);
}

function playBossDefeatSound() {
  playTone(262, 0.10, "square", 0.04, 0.00);
  playTone(330, 0.10, "square", 0.04, 0.10);
  playTone(392, 0.10, "square", 0.04, 0.20);
  playTone(523, 0.12, "square", 0.045, 0.30);
  playTone(659, 0.12, "square", 0.045, 0.42);
  playTone(784, 0.18, "square", 0.05, 0.54);
  playTone(1047, 0.34, "square", 0.04, 0.70);
}
