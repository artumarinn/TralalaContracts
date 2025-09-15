// Grid Pattern Component - Magic UI
class GridPattern {
    constructor(options = {}) {
        this.width = options.width || 40;
        this.height = options.height || 40;
        this.x = options.x || -1;
        this.y = options.y || -1;
        this.strokeDasharray = options.strokeDasharray || "0";
        this.squares = options.squares || [];
        this.className = options.className || "";
    }

    generateId() {
        return 'grid-pattern-' + Math.random().toString(36).substr(2, 9);
    }

    render() {
        const id = this.generateId();

        return `
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30 ${this.className}"
      >
        <defs>
          <pattern
            id="${id}"
            width="${this.width}"
            height="${this.height}"
            patternUnits="userSpaceOnUse"
            x="${this.x}"
            y="${this.y}"
          >
            <path
              d="M.5 ${this.height}V.5H${this.width}"
              fill="none"
              stroke-dasharray="${this.strokeDasharray}"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#${id})" />
        ${this.squares.length > 0 ? `
          <svg x="${this.x}" y="${this.y}" class="overflow-visible">
            ${this.squares.map(([x, y]) => `
              <rect
                stroke-width="0"
                key="${x}-${y}"
                width="${this.width - 1}"
                height="${this.height - 1}"
                x="${x * this.width + 1}"
                y="${y * this.height + 1}"
              />
            `).join('')}
          </svg>
        ` : ''}
      </svg>
    `;
    }
}

// Función para crear el Grid Pattern
function createGridPattern(container, options = {}) {
    const gridPattern = new GridPattern(options);
    container.innerHTML = gridPattern.render();
}

// Exportar para uso global
window.GridPattern = GridPattern;
window.createGridPattern = createGridPattern;
