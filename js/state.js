export const state = {
	dpi: 300,
	baseDpi: 600,
	pages: [],
	pageIndex: 0,
	seed: (Math.random() * 4294967296) >>> 0,
	processing: false,
	placeholderRendered: false,
	sprites: {},
	spriteData: null,
	pageCache: new Map(),
};

export const dom = {};

export function initDom() {
	dom.canvas = document.getElementById('canvas');
	dom.textEl = document.getElementById('text');
	dom.writeBtn = document.getElementById('write');
	dom.listEl = document.getElementById('list');
	dom.clipboardEl = document.querySelector('.clipboard');
}

export const ratio = () => state.dpi / state.baseDpi;
export const isMobile = () => window.innerWidth <= 1200;
export const seedHash = () => state.seed.toString(16).padStart(8, '0').slice(0, 4);
