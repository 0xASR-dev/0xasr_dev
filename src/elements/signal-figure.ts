import { signalModel } from '../lib/signal-model';

class SignalFigure extends HTMLElement {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private isAnimating = false;
  private isReducedMotion = false;
  private lastTime = 0;
  private lambda = 0;
  private probeX = 0.5;
  private burst: { x0: number; amp: number; age: number } | null = null;
  private settled = false;
  private width = 0;
  private height = 0;
  private dpr = Math.min(window.devicePixelRatio, 1.5);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.setupCanvas();
    this.setupEventListeners();
    this.checkReducedMotion();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          aspect-ratio: 640/96;
          max-width: var(--col);
          margin: 0 auto;
          position: relative;
        }

        canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .readout {
          position: absolute;
          bottom: 0;
          right: 0;
          font-family: var(--font-mono);
          font-size: var(--step--1);
          color: var(--ink-muted);
          padding: var(--space-2);
        }

        .probe {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: opacity 0.2s ease-out;
        }

        @media (min-width: var(--bp-wide)) {
          :host {
            aspect-ratio: 640/96;
          }
        }
      </style>
      <canvas></canvas>
      <div class="readout" aria-live="polite">Signal-to-noise 12.0 dB</div>
      <div class="probe" style="display: none;"></div>
    `;
  }

  setupCanvas() {
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const rect = this.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.drawStatic();
  }

  setupEventListeners() {
    this.addEventListener('pointermove', this.handlePointerMove.bind(this));
    this.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    this.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.addEventListener('focus', () => this.setAttribute('tabindex', '0'));
    this.addEventListener('blur', () => this.removeAttribute('tabindex'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      });
    });
    observer.observe(this);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.stopAnimation();
      } else if (this.isAnimating) {
        this.startAnimation();
      }
    });
  }

  checkReducedMotion() {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = media.matches;

    const handleChange = () => {
      this.isReducedMotion = media.matches;
      if (this.isReducedMotion) {
        this.stopAnimation();
        this.settled = true;
        this.drawStatic();
      } else if (!this.isAnimating) {
        this.startAnimation();
      }
    };

    media.addEventListener?.('change', handleChange);

    if (this.isReducedMotion) {
      this.settled = true;
      this.drawStatic();
    }
  }

  startAnimation() {
    if (this.isReducedMotion || this.isAnimating) return;
    this.isAnimating = true;
    this.lastTime = performance.now();
    this.lambda = 0;
    this.settled = false;
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
  }

  animate(currentTime: number) {
    if (!this.isAnimating) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update lambda for settle animation
    if (!this.settled) {
      const t = currentTime / 1000;
      this.lambda = Math.min(1, Math.max(0, (t - 0.3) / 1.2));
      if (this.lambda >= 1) {
        this.settled = true;
      }
    }

    // Update burst age
    if (this.burst) {
      this.burst.age += deltaTime;
      if (this.burst.age > 1.8) {
        this.burst = null;
      }
    }

    this.draw();
    this.updateReadout();

    if (this.isAnimating) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw baseline
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height / 2);
    this.ctx.lineTo(this.width, this.height / 2);
    this.ctx.strokeStyle = 'var(--rule)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Get model data
    const { clean, raw, filtered } = signalModel(this.lambda, this.burst);

    // Draw raw trace
    this.ctx.beginPath();
    for (let i = 0; i < clean.length; i++) {
      const x = (i / (clean.length - 1)) * this.width;
      const y = this.height / 2 - this.clamp(raw[i], -1.8, 1.8) * (this.height / 2 - 4) / 1.8;
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = 'var(--ink-faint)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Draw filtered line
    this.ctx.beginPath();
    for (let i = 0; i < clean.length; i++) {
      const x = (i / (clean.length - 1)) * this.width;
      const y = this.height / 2 - this.clamp(filtered[i], -1.8, 1.8) * (this.height / 2 - 4) / 1.8;
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = 'var(--accent)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Draw probe if active
    if (this.burst) {
      const probeX = this.probeX * this.width;
      const probeY = this.height / 2 - this.clamp(filtered[Math.floor(this.probeX * (clean.length - 1))], -1.8, 1.8) * (this.height / 2 - 4) / 1.8;
      const probe = this.shadowRoot.querySelector('.probe');
      probe.style.display = 'block';
      probe.style.left = `${probeX}px`;
      probe.style.top = `${probeY}px`;
    } else {
      this.shadowRoot.querySelector('.probe').style.display = 'none';
    }
  }

  drawStatic() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw baseline
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height / 2);
    this.ctx.lineTo(this.width, this.height / 2);
    this.ctx.strokeStyle = 'var(--rule)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Get settled model data
    const { clean, filtered } = signalModel(1, null);

    // Draw filtered line
    this.ctx.beginPath();
    for (let i = 0; i < clean.length; i++) {
      const x = (i / (clean.length - 1)) * this.width;
      const y = this.height / 2 - this.clamp(filtered[i], -1.8, 1.8) * (this.height / 2 - 4) / 1.8;
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = 'var(--accent)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  updateReadout() {
    const { clean, filtered } = signalModel(this.lambda, this.burst);
    const snr = this.calculateSNR(clean, filtered);
    const readout = this.shadowRoot.querySelector('.readout');
    readout.textContent = `Signal-to-noise ${snr.toFixed(1)} dB`;
  }

  calculateSNR(clean: number[], filtered: number[]): number {
    let cleanPower = 0;
    let noisePower = 0;

    for (let i = 0; i < clean.length; i++) {
      cleanPower += clean[i] * clean[i];
      noisePower += (filtered[i] - clean[i]) * (filtered[i] - clean[i]);
    }

    cleanPower /= clean.length;
    noisePower /= clean.length;

    return 10 * Math.log10(cleanPower / noisePower);
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  handlePointerMove(e: PointerEvent) {
    if (!this.settled || this.isReducedMotion) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    this.probeX = Math.max(0, Math.min(1, x));

    if (this.burst) {
      this.burst.x0 = this.probeX;
      this.burst.age = 0;
    }
  }

  handlePointerDown(e: PointerEvent) {
    if (!this.settled || this.isReducedMotion) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    this.probeX = Math.max(0, Math.min(1, x));

    this.burst = {
      x0: this.probeX,
      amp: 1.5,
      age: 0
    };
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.settled || this.isReducedMotion) return;

    switch (e.key) {
      case 'ArrowLeft':
        this.probeX = Math.max(0, this.probeX - 0.05);
        break;
      case 'ArrowRight':
        this.probeX = Math.min(1, this.probeX + 0.05);
        break;
      case 'Enter':
      case ' ':
        this.burst = {
          x0: this.probeX,
          amp: 1.5,
          age: 0
        };
        break;
      case 'Escape':
        this.burst = null;
        break;
    }
  }
}

customElements.define('signal-figure', SignalFigure);