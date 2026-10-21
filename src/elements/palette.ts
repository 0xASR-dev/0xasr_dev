class Palette extends HTMLElement {
  private dialog: HTMLDialogElement;
  private input: HTMLInputElement;
  private listbox: HTMLUListElement;
  private status: HTMLDivElement;
  private projects: any[] = [
    { title: 'SUNWAI', summary: 'Budget priorities from citizen demand', stack: 'Python, TypeScript, PostgreSQL', href: '/work/sunwai' },
    { title: 'ParkySpot', summary: 'ESP32 sensors to a live parking map', stack: 'ESP32, Python, JavaScript', href: '/work/parkyspot' },
    { title: 'Monastery360', summary: 'Virtual tours, audio guides and a map', stack: 'JavaScript, HTML, CSS', href: '/work/monastery360' }
  ];
  private pages: any[] = [
    { title: 'Home', href: '/' },
    { title: 'Work', href: '/work' },
    { title: 'Resume', href: '/resume' },
    { title: 'Colophon', href: '/colophon' }
  ];
  private items: any[] = [];
  private visibleItems: any[] = [];
  private activeIndex = -1;
  private isOpen = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.setupElements();
    this.setupEventListeners();
    this.updateItems();
    this.filterItems();
  }

  updateItems() {
    this.items = [...this.pages, ...this.projects];
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: contents;
        }

        dialog {
          position: fixed;
          top: 12vh;
          left: 50%;
          transform: translateX(-50%);
          width: min(34rem, calc(100vw - 2rem));
          max-width: 100%;
          max-height: 80vh;
          padding: var(--space-2);
          border: none;
          border-radius: var(--radius-lg);
          background: var(--paper);
          color: var(--ink);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: opacity var(--dur-base) ease-out, transform var(--dur-base) ease-out;
          opacity: 0;
          transform: translateX(-50%) scale(0.97);
          transition-behavior: allow-discrete;
        }

        dialog[open] {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }

        .input-container {
          position: relative;
          margin-bottom: var(--space-2);
        }

        input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--rule);
          border-radius: var(--radius-item);
          background: var(--paper);
          color: var(--ink);
          font-size: var(--step-0);
          outline: none;
        }

        input:focus {
          border-color: var(--accent);
        }

        .listbox {
          max-height: 60vh;
          overflow-y: auto;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .item {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-item);
          cursor: pointer;
          transition: background-color var(--dur-fast) ease-out;
        }

        .item:hover, .item[aria-selected="true"] {
          background-color: var(--rule);
        }

        .item-title {
          font-weight: 500;
          margin-bottom: var(--space-1);
        }

        .item-summary {
          color: var(--ink-muted);
          font-size: var(--step--1);
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

        .kbd-hint {
          position: absolute;
          top: 0;
          right: 0;
          font-family: var(--font-mono);
          font-size: var(--step--1);
          color: var(--ink-muted);
          padding: var(--space-2);
        }

        @media (hover: hover) and (pointer: fine) {
          .kbd-hint {
            display: block;
          }
        }
      </style>
      <dialog>
        <div class="input-container">
          <input type="text" placeholder="Search..." role="combobox" aria-expanded="false" aria-controls="listbox" aria-activedescendant="">
          <div class="kbd-hint">⌘K</div>
        </div>
        <ul class="listbox" id="listbox" role="listbox"></ul>
        <div class="status" role="status" aria-live="polite"></div>
      </dialog>
    `;
  }

  setupElements() {
    this.dialog = this.shadowRoot.querySelector('dialog');
    this.input = this.shadowRoot.querySelector('input');
    this.listbox = this.shadowRoot.querySelector('.listbox');
    this.status = this.shadowRoot.querySelector('.status');
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !this.isOpen && !this.isInputFocused()) {
        e.preventDefault();
        this.open();
      }
    });

    const headerButton = document.querySelector('.kbd-hint');
    if (headerButton) {
      headerButton.addEventListener('click', () => this.open());
    }

    this.input.addEventListener('input', () => this.filterItems());
    this.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
    this.listbox.addEventListener('click', (e) => this.handleListboxClick(e));
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) {
        this.close();
      }
    });
  }

  isInputFocused() {
    return document.activeElement === this.input;
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.dialog.showModal();
    this.input.focus();
    this.input.value = '';
    this.filterItems();
    this.activeIndex = -1;
    this.updateAria();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.dialog.open) {
      this.dialog.close();
    }
    this.input.blur();
    this.activeIndex = -1;
    this.updateAria();
  }

  filterItems() {
    const query = this.input.value.toLowerCase();
    if (!query) {
      this.visibleItems = this.items;
      this.renderItems(this.visibleItems);
      this.status.textContent = `${this.visibleItems.length} results`;
      return;
    }

    const filtered = this.items
      .map(item => ({
        ...item,
        score: this.calculateScore(item, query)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    this.visibleItems = filtered;
    this.renderItems(this.visibleItems);
    this.status.textContent = `${this.visibleItems.length} results`;
  }

  calculateScore(item: any, query: string): number {
    let score = 0;
    const titleMatch = item.title.toLowerCase().includes(query);
    const summaryMatch = item.summary?.toLowerCase().includes(query);
    const stackMatch = item.stack?.toLowerCase().includes(query);

    if (titleMatch) score += 3;
    if (summaryMatch) score += 2;
    if (stackMatch) score += 1;

    return score;
  }

  renderItems(items: any[]) {
    this.listbox.innerHTML = '';
    if (items.length === 0) {
      const li = document.createElement('li');
      li.textContent = `No match for “${this.input.value}”. Try a project name.`;
      li.className = 'item';
      this.listbox.appendChild(li);
      return;
    }

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.id = `item-${index}`;
      li.className = 'item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', index === this.activeIndex ? 'true' : 'false');

      const title = document.createElement('div');
      title.className = 'item-title';
      title.textContent = item.title;

      const summary = document.createElement('div');
      summary.className = 'item-summary';
      summary.textContent = item.summary || item.stack || '';

      li.appendChild(title);
      li.appendChild(summary);
      this.listbox.appendChild(li);
    });
  }

  handleInputKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.moveActiveIndex(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveActiveIndex(-1);
        break;
      case 'Enter':
        e.preventDefault();
        this.selectActiveItem();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }

  moveActiveIndex(direction: number) {
    const items = this.listbox.querySelectorAll('.item');
    if (items.length === 0) return;

    this.activeIndex += direction;
    if (this.activeIndex < 0) this.activeIndex = items.length - 1;
    if (this.activeIndex >= items.length) this.activeIndex = 0;

    this.updateAria();
    this.scrollToActiveItem();
  }

  selectActiveItem() {
    const items = this.listbox.querySelectorAll('.item');
    if (this.activeIndex >= 0 && this.activeIndex < items.length) {
      const item = this.visibleItems[this.activeIndex];
      if (item?.href) {
        window.location.href = item.href;
      }
    }
  }

  handleListboxClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const item = target.closest('.item') as HTMLElement;
    if (item) {
      const index = Array.from(this.listbox.children).indexOf(item);
      if (index !== -1) {
        this.activeIndex = index;
        this.selectActiveItem();
      }
    }
  }

  updateAria() {
    const items = this.listbox.querySelectorAll('.item');
    items.forEach((item, index) => {
      item.setAttribute('aria-selected', index === this.activeIndex ? 'true' : 'false');
    });

    this.input.setAttribute('aria-activedescendant',
      this.activeIndex >= 0 ? `item-${this.activeIndex}` : '');
  }

  scrollToActiveItem() {
    const activeItem = this.listbox.querySelector('.item[aria-selected="true"]') as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }
}

customElements.define('command-palette', Palette);