import gsap from 'gsap';

export const PIXEL_WAVE_DEFAULTS = {
    sizingMode: 'count',
    landscapeCols: 20,
    portraitRows: 15,
    targetPixelPx: 120,
    direction: 'auto',
    transparentSpreadLines: 4,
    stepPerLine: 0.035,
    cellFadeDuration: 0.07,
    opacitySteps: 0,
    microJitter: 0.014,
    seed: 369529,
};

export function createSeededRandom(seedVal) {
    let s = seedVal % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/**
 * Construye una cuadrícula fluida de píxeles dentro de cualquier contenedor DOM.
 */
export function buildPixelGrid(gridContainer, {
    initialOpacity = 0,
    cellClass = 'pixel-wave-cell',
    cols: forcedCols = null,
    rows: forcedRows = null,
    width: explicitWidth = null,
    height: explicitHeight = null,
    sizingMode = PIXEL_WAVE_DEFAULTS.sizingMode,
    landscapeCols = PIXEL_WAVE_DEFAULTS.landscapeCols,
    portraitRows = PIXEL_WAVE_DEFAULTS.portraitRows,
    targetPixelPx = PIXEL_WAVE_DEFAULTS.targetPixelPx,
} = {}) {
    if (!gridContainer) {
        return { cells: [], cols: 0, rows: 0, isLandscape: true };
    }

    gridContainer.replaceChildren();

    const width = explicitWidth || gridContainer.clientWidth || window.innerWidth || 1440;
    const height = explicitHeight || gridContainer.clientHeight || window.innerHeight || 900;
    const aspectRatio = width / Math.max(1, height);
    const isLandscape = width > height;

    let cols = forcedCols;
    let rows = forcedRows;

    if (cols && !rows) {
        rows = Math.max(4, Math.round(cols / aspectRatio));
    } else if (rows && !cols) {
        cols = Math.max(4, Math.round(rows * aspectRatio));
    } else if (!cols && !rows) {
        if (sizingMode === 'px') {
            const px = Math.max(30, targetPixelPx || 120);
            cols = Math.max(4, Math.round(width / px));
            rows = Math.max(4, Math.round(height / px));
        } else if (isLandscape) {
            cols = landscapeCols;
            rows = Math.max(4, Math.round(cols / aspectRatio));
        } else {
            rows = portraitRows;
            cols = Math.max(4, Math.round(rows * aspectRatio));
        }
    }

    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const cells = [];
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = cellClass;
            cell.style.opacity = String(initialOpacity);
            fragment.appendChild(cell);
            cells.push({ el: cell, col: c, row: r });
        }
    }

    gridContainer.appendChild(fragment);

    return { cells, cols, rows, isLandscape };
}

/**
 * Programa una ola pixelada en un timeline de GSAP y devuelve el tiempo final de la ola.
 */
export function schedulePixelWave(tl, gridState, {
    fromOpacity = 0,
    toOpacity = 1,
    startOffset = 0,
    direction = PIXEL_WAVE_DEFAULTS.direction,
    transparentSpreadLines = PIXEL_WAVE_DEFAULTS.transparentSpreadLines,
    stepPerLine = PIXEL_WAVE_DEFAULTS.stepPerLine,
    cellFadeDuration = PIXEL_WAVE_DEFAULTS.cellFadeDuration,
    opacitySteps = PIXEL_WAVE_DEFAULTS.opacitySteps,
    microJitter = PIXEL_WAVE_DEFAULTS.microJitter,
    seed = PIXEL_WAVE_DEFAULTS.seed,
    seedOffset = 0,
} = {}) {
    const { cells, cols, rows } = gridState || {};
    if (!tl || !cells || !cells.length) return startOffset;

    const vw = window.innerWidth || 1440;
    const vh = window.innerHeight || 900;
    const resolvedDirection = direction === 'auto'
        ? (vw > vh ? 'left-to-right' : 'bottom-to-top')
        : direction;

    const isHorizontal = resolvedDirection === 'left-to-right' || resolvedDirection === 'right-to-left';
    const totalSteps = isHorizontal ? cols : rows;
    const lineJitterSpan = stepPerLine * transparentSpreadLines;
    const easeStr = opacitySteps > 0 ? `steps(${opacitySteps})` : 'none';
    const rng = createSeededRandom(seed + seedOffset);

    const groups = Array.from({ length: totalSteps }, () => []);
    cells.forEach((cellObj) => {
        let lineIndex = 0;
        if (resolvedDirection === 'left-to-right') {
            lineIndex = cellObj.col;
        } else if (resolvedDirection === 'right-to-left') {
            lineIndex = cols - 1 - cellObj.col;
        } else if (resolvedDirection === 'bottom-to-top') {
            lineIndex = rows - 1 - cellObj.row;
        } else {
            lineIndex = cellObj.row;
        }
        if (groups[lineIndex]) {
            groups[lineIndex].push(cellObj);
        }
    });

    let maxEndTime = startOffset;

    groups.forEach((lineCells, lineIdx) => {
        const lineBaseDelay = startOffset + lineIdx * stepPerLine;

        const ranks = lineCells.map((_, idx) => idx);
        for (let i = ranks.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            const tmp = ranks[i];
            ranks[i] = ranks[j];
            ranks[j] = tmp;
        }

        lineCells.forEach((cellObj, idx) => {
            const rankProgress = ranks[idx] / Math.max(1, lineCells.length - 1);
            const jitterOffset = (rng() - 0.5) * microJitter;
            const delay = Math.max(startOffset, lineBaseDelay + rankProgress * lineJitterSpan + jitterOffset);
            const endTime = delay + cellFadeDuration;
            if (endTime > maxEndTime) {
                maxEndTime = endTime;
            }

            tl.fromTo(
                cellObj.el,
                { opacity: fromOpacity },
                {
                    opacity: toOpacity,
                    duration: cellFadeDuration,
                    ease: easeStr,
                    immediateRender: false,
                },
                delay
            );
        });
    });

    return maxEndTime;
}
