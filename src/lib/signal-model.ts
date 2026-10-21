const N = 320;
const SIGMA = 0.6;
const SEED = 0xA5A5;
const WINDOW = 9;

// Seeded PRNG
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Gaussian random number generator
function gaussianRandom(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Ease-out function
function easeOut(u: number): number {
  return 1 - (1 - Math.max(0, Math.min(1, u))) ** 3;
}

// Signal model
function signalModel(lambda: number, burst: { x0: number; amp: number; age: number } | null) {
  const rng = mulberry32(SEED);
  const burstRng = mulberry32(SEED ^ 0x9E3779B9);

  // Generate clean signal
  const clean: number[] = [];
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);
    clean[i] = Math.sin(2 * Math.PI * 3 * x) + 0.4 * Math.sin(2 * Math.PI * 7 * x + 0.8);
  }

  // Generate noise
  const noise: number[] = [];
  for (let i = 0; i < N; i++) {
    noise[i] = SIGMA * gaussianRandom(rng);
  }

  // Generate burst noise
  const burstNoise: number[] = [];
  for (let i = 0; i < N; i++) {
    burstNoise[i] = SIGMA * gaussianRandom(burstRng);
  }

  // Apply burst
  const raw: number[] = [...clean];
  if (burst) {
    const { x0, amp, age } = burst;
    const decay = Math.exp(-age / 0.6);
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const dist = Math.abs(x - x0);
      const weight = Math.exp(-0.5 * (dist / 0.08) ** 2);
      raw[i] += amp * decay * weight * burstNoise[i];
    }
  }

  // Add noise
  for (let i = 0; i < N; i++) {
    raw[i] += noise[i];
  }

  // Smoothing
  const smooth: number[] = [];
  for (let i = 0; i < N; i++) {
    let sum = 0;
    let count = 0;
    const start = Math.max(0, i - Math.floor(WINDOW / 2));
    const end = Math.min(N - 1, i + Math.floor(WINDOW / 2));
    for (let j = start; j <= end; j++) {
      sum += raw[j];
      count++;
    }
    smooth[i] = sum / count;
  }

  // Filtered signal
  const filtered: number[] = [];
  for (let i = 0; i < N; i++) {
    filtered[i] = (1 - lambda) * raw[i] + lambda * smooth[i];
  }

  return { clean, raw, filtered };
}

export { signalModel };