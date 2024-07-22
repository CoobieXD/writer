import { state, dom, ratio } from './state.js';
import { CONFIG } from './writer.js';

export function createOffCanvas(w, h) {
	if (typeof OffscreenCanvas !== 'undefined') {
		return new OffscreenCanvas(w, h);
	}
	var c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return c;
}

export function renderPageToCanvas(data, target) {
	target = target || dom.canvas;
	const ctx = target.getContext('2d');
	const r = ratio();
	target.width = CONFIG.LIST_WIDTH * r;
	target.height = CONFIG.LIST_HEIGHT * r;
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, target.width, target.height);
	for (const [key, items] of Object.entries(data)) {
		for (const item of items) {
			ctx.drawImage(state.sprites[key], item[2][0]*r, item[2][1]*r, item[2][2]*r, item[2][3]*r, item[0]*r, item[1]*r, item[2][2]*r, item[2][3]*r);
		}
	}
}

export function loadSprites(data) {
	const spritesToLoad = Object.keys(data);
	const newSprites = spritesToLoad.filter(function(name) { return !state.sprites.hasOwnProperty(name); });

	if (newSprites.length === 0) return Promise.resolve();

	return Promise.all(newSprites.map(function(name) {
		return new Promise(function(resolve, reject) {
			const sprite = new Image();
			sprite.onload = function() { resolve(); };
			sprite.onerror = function() { reject(new Error('Failed to load sprite: ' + name)); };
			sprite.src = './assets/sprites/kate/' + state.dpi + 'dpi/' + name + '.png';
			state.sprites[name] = sprite;
		});
	}));
}

export function prefetchAdjacentPages() {
	var indices = [state.pageIndex - 1, state.pageIndex + 1].filter(function(i) {
		return i >= 0 && i < state.pages.length && !state.pageCache.has(i);
	});
	if (indices.length === 0) return;
	var schedule = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
	indices.forEach(function(idx) {
		schedule(function() {
			if (state.pageCache.has(idx)) return;
			var data = state.pages[idx];
			var needed = Object.keys(data).filter(function(name) { return !state.sprites.hasOwnProperty(name); });
			var ready = needed.length === 0
				? Promise.resolve()
				: Promise.all(needed.map(function(name) {
					return new Promise(function(resolve, reject) {
						var img = new Image();
						img.onload = function() { resolve(); };
						img.onerror = function() { reject(); };
						img.src = './assets/sprites/kate/' + state.dpi + 'dpi/' + name + '.png';
						state.sprites[name] = img;
					});
				}));
			ready.then(function() {
				if (state.pageCache.has(idx)) return;
				var r = ratio();
				var offC = createOffCanvas(CONFIG.LIST_WIDTH * r, CONFIG.LIST_HEIGHT * r);
				renderPageToCanvas(data, offC);
				return createImageBitmap(offC);
			}).then(function(bmp) {
				if (bmp && !state.pageCache.has(idx)) state.pageCache.set(idx, bmp);
			}).catch(function() {});
		});
	});
}

export function clearPageCache() {
	state.pageCache.forEach(function(bmp) { if (bmp.close) bmp.close(); });
	state.pageCache.clear();
}
