import confetti from 'canvas-confetti';

export function celebrateCompletion() {
  // Burst from center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF8C69', '#FFB347', '#88D498', '#B8E0D2', '#FFD93D']
  });
}

export function celebrateBigWin() {
  // Multiple bursts
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FF8C69', '#FFB347', '#88D498']
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#B8E0D2', '#FFD93D', '#FF8C69']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
