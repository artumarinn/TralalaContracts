// Magic UI Grid Pattern Implementation
class MagicUIGridPattern {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: options.width || 40,
            height: options.height || 40,
            x: options.x || -1,
            y: options.y || -1,
            strokeDasharray: options.strokeDasharray || "0",
            squares: options.squares || [],
            className: options.className || "opacity-30",
            ...options
        };

        this.init();
    }

    init() {
        this.createSVG();
        this.addPattern();
        this.addSquares();
    }

    createSVG() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('aria-hidden', 'true');
        this.svg.classList.add('pointer-events-none', 'absolute', 'inset-0', 'h-full', 'w-full', 'fill-gray-400/30', 'stroke-gray-400/30');

        if (this.options.className) {
            this.svg.classList.add(...this.options.className.split(' '));
        }

        this.container.appendChild(this.svg);
    }

    addPattern() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

        const id = 'grid-pattern-' + Math.random().toString(36).substr(2, 9);

        pattern.setAttribute('id', id);
        pattern.setAttribute('width', this.options.width);
        pattern.setAttribute('height', this.options.height);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('x', this.options.x);
        pattern.setAttribute('y', this.options.y);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M.5 ${this.options.height}V.5H${this.options.width}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('strokeDasharray', this.options.strokeDasharray);

        pattern.appendChild(path);
        defs.appendChild(pattern);
        this.svg.appendChild(defs);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('strokeWidth', '0');
        rect.setAttribute('fill', `url(#${id})`);

        this.svg.appendChild(rect);
        this.patternId = id;
    }

    addSquares() {
        if (this.options.squares && this.options.squares.length > 0) {
            const squaresSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            squaresSvg.setAttribute('x', this.options.x);
            squaresSvg.setAttribute('y', this.options.y);
            squaresSvg.classList.add('overflow-visible');

            this.options.squares.forEach(([x, y]) => {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('strokeWidth', '0');
                rect.setAttribute('width', this.options.width - 1);
                rect.setAttribute('height', this.options.height - 1);
                rect.setAttribute('x', x * this.options.width + 1);
                rect.setAttribute('y', y * this.options.height + 1);
                rect.setAttribute('fill', 'currentColor');

                squaresSvg.appendChild(rect);
            });

            this.svg.appendChild(squaresSvg);
        }
    }

    destroy() {
        if (this.svg && this.svg.parentNode) {
            this.svg.parentNode.removeChild(this.svg);
        }
    }
}

// Función para crear el grid pattern
function createGridPattern(container, options = {}) {
    return new MagicUIGridPattern(container, options);
}

// Función para crear un grid pattern animado
function createAnimatedGridPattern(container, options = {}) {
    const defaultOptions = {
        width: 40,
        height: 40,
        x: -1,
        y: -1,
        strokeDasharray: "0",
        squares: [
            [4, 4], [5, 1], [8, 2], [5, 3], [5, 5], [10, 10],
            [12, 15], [15, 10], [10, 15], [15, 10], [10, 15], [15, 10]
        ],
        className: "opacity-30"
    };

    const finalOptions = { ...defaultOptions, ...options };
    return new MagicUIGridPattern(container, finalOptions);
}

// Exportar para uso global
window.createGridPattern = createGridPattern;
window.createAnimatedGridPattern = createAnimatedGridPattern;
window.MagicUIGridPattern = MagicUIGridPattern;
