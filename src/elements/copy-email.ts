class CopyEmail extends HTMLElement {
  private email: string;
  private button: HTMLButtonElement;
  private status: HTMLDivElement;
  private timeoutId: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.email = this.getAttribute('email') || 'avneeshsingh.job@gmail.com';
    this.render();
    this.setupElements();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }

        .email {
          font-family: var(--font-mono);
          font-size: var(--step-0);
          color: var(--ink);
        }

        button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 1.25rem;
          color: var(--ink-muted);
          transition: transform var(--dur-fast) var(--ease-out);
        }

        button:active {
          transform: scale(var(--press-scale));
        }

        .icon {
          display: inline-block;
          width: 1em;
          height: 1em;
          vertical-align: middle;
          transition: transform var(--dur-enter) var(--ease-out), opacity var(--dur-enter) var(--ease-out), filter var(--dur-enter) var(--ease-out);
        }

        .icon svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }

        .copy {
          transform: scale(1);
          opacity: 1;
          filter: blur(0);
        }

        .check {
          transform: scale(0.25);
          opacity: 0;
          filter: blur(4px);
        }

        .status {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      </style>
      <div class="email">${this.email}</div>
      <button aria-label="Copy email">
        <span class="icon copy">
          <svg viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </span>
        <span class="icon check">
          <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </span>
      </button>
      <div class="status" role="status" aria-live="polite"></div>
    `;
  }

  setupElements() {
    this.button = this.shadowRoot.querySelector('button');
    this.status = this.shadowRoot.querySelector('.status');
  }

  setupEventListeners() {
    this.button.addEventListener('click', () => this.copyEmail());
  }

  async copyEmail() {
    try {
      await navigator.clipboard.writeText(this.email);
      this.showSuccess();
    } catch (err) {
      this.showFallback();
    }
  }

  showSuccess() {
    const copyIcon = this.shadowRoot.querySelector('.copy');
    const checkIcon = this.shadowRoot.querySelector('.check');

    copyIcon.classList.remove('copy');
    copyIcon.classList.add('check');
    checkIcon.classList.remove('check');
    checkIcon.classList.add('copy');

    this.status.textContent = 'Email copied';

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      copyIcon.classList.remove('check');
      copyIcon.classList.add('copy');
      checkIcon.classList.remove('copy');
      checkIcon.classList.add('check');
    }, 2000);
  }

  showFallback() {
    const emailElement = this.shadowRoot.querySelector('.email');
    const range = document.createRange();
    range.selectNode(emailElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    this.status.textContent = "Couldn't copy. Select the address instead.";
  }
}

customElements.define('copy-email', CopyEmail);