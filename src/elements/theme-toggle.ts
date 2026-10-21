class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 1.25rem;
          color: var(--ink);
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
        }

        .icon svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
      </style>
      <button aria-label="Switch theme">
        <span class="icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          </svg>
        </span>
      </button>
    `;
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => this.toggleTheme());
  }

  toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Suppress transitions during theme switch
    root.setAttribute('data-theme-switching', '');
    root.dataset.theme = newTheme;

    // Force style flush
    void root.offsetHeight;

    // Restore transitions
    requestAnimationFrame(() => {
      root.removeAttribute('data-theme-switching');
    });

    // Persist preference
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Could not save theme preference');
    }
  }
}

customElements.define('theme-toggle', ThemeToggle);