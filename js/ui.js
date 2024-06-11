import { state, dom, isMobile } from './state.js';

const getSheetToolbar = function() {
	let toolbar = document.querySelector('.sheet-toolbar');
	if (!toolbar) {
		toolbar = document.createElement('div');
		toolbar.className = 'sheet-toolbar';
		const rightSection = document.querySelector('.section.right');
		const clipboard = rightSection.querySelector('.clipboard');
		rightSection.insertBefore(toolbar, clipboard);
	}
	return toolbar;
};

export const createSticker = function(id, text) {
	let el = document.getElementById(id);
	if (!el) {
		el = document.createElement('button');
		el.id = id;
		el.className = 'sticker-btn';
		el.textContent = text;
		if (isMobile()) {
			getSheetToolbar().appendChild(el);
		} else {
			dom.listEl.appendChild(el);
		}
	}
	return el;
};

export const showPagination = function(onPrev, onNext) {
	const prevBtn = createSticker('page-prev', '\u2190');
	prevBtn.onclick = onPrev;
	prevBtn.style.display = '';

	const nextBtn = createSticker('page-next', '\u2192');
	nextBtn.onclick = onNext;
	nextBtn.style.display = '';

	updatePagination();
};

export const hidePagination = function() {
	['page-prev', 'page-next'].forEach(function(id) {
		const el = document.getElementById(id);
		if (el) el.style.display = 'none';
	});
};

export const updatePagination = function() {
	const prevBtn = document.getElementById('page-prev');
	const nextBtn = document.getElementById('page-next');
	if (!prevBtn) return;
	prevBtn.disabled = state.pageIndex === 0;
	nextBtn.disabled = state.pageIndex === state.pages.length - 1;
};

export const showWarning = function(msg) {
	let el = document.getElementById('char-warning');
	if (!el) {
		el = document.createElement('div');
		el.id = 'char-warning';
		dom.clipboardEl.appendChild(el);
	}
	el.textContent = msg;
	el.style.display = '';
};

export const hideWarning = function() {
	const el = document.getElementById('char-warning');
	if (el) el.style.display = 'none';
};

export const showError = function(msg) {
	let el = document.getElementById('sprite-error');
	if (!el) {
		el = document.createElement('div');
		el.id = 'sprite-error';
		dom.clipboardEl.appendChild(el);
	}
	el.textContent = msg;
	el.style.display = '';
};
