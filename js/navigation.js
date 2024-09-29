import { state, dom, ratio, isMobile } from './state.js';
import { CONFIG } from './writer.js';
import { renderPageToCanvas, loadSprites, prefetchAdjacentPages } from './renderer.js';
import { updatePagination } from './ui.js';

let pageAnimating = false;
let swipeUnderlay = null;

export function goToPage(index) {
	if (index < 0 || index >= state.pages.length) return;
	state.pageIndex = index;
	updatePagination();
	var cached = state.pageCache.get(index);
	if (cached) {
		var r = ratio();
		dom.canvas.width = CONFIG.LIST_WIDTH * r;
		dom.canvas.height = CONFIG.LIST_HEIGHT * r;
		dom.canvas.getContext('2d').drawImage(cached, 0, 0);
		prefetchAdjacentPages();
		return;
	}
	loadSprites(state.pages[index]).then(function() {
		renderPageToCanvas(state.pages[index]);
		prefetchAdjacentPages();
	});
}

export function animateToPage(index) {
	if (index < 0 || index >= state.pages.length || pageAnimating) return;
	if (index === state.pageIndex) return;
	pageAnimating = true;
	var dir = index > state.pageIndex ? -1 : 1;
	var w = dom.listEl.offsetWidth || 300;
	if (swipeUnderlay) swipeUnderlay.style.display = '';
	dom.canvas.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
	dom.canvas.style.transform = 'translateX(' + (dir * w) + 'px)';
	dom.canvas.style.opacity = '0';
	setTimeout(function() {
		goToPage(index);
		dom.canvas.style.transition = 'none';
		dom.canvas.style.transform = 'translateX(' + (-dir * w * 0.3) + 'px)';
		dom.canvas.style.opacity = '0.3';
		requestAnimationFrame(function() {
			dom.canvas.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
			dom.canvas.style.transform = '';
			dom.canvas.style.opacity = '';
			setTimeout(function() {
				pageAnimating = false;
				if (swipeUnderlay) swipeUnderlay.style.display = 'none';
			}, 260);
		});
	}, 200);
}

export function initSwipe() {
	swipeUnderlay = document.createElement('div');
	swipeUnderlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#e8e4ec;display:none;z-index:0;';
	dom.listEl.appendChild(swipeUnderlay);
	if (isMobile()) {
		dom.listEl.style.position = 'relative';
		dom.listEl.style.overflow = 'hidden';
		dom.canvas.style.position = 'relative';
		dom.canvas.style.zIndex = '1';
	}

	let touchStartX = 0;
	let touchStartY = 0;
	let wasSwiped = false;
	let swipeLocked = false;
	let swipeAxis = null;

	dom.listEl.addEventListener('touchstart', function(e) {
		if (swipeLocked) return;
		touchStartX = e.changedTouches[0].clientX;
		touchStartY = e.changedTouches[0].clientY;
		swipeAxis = null;
		wasSwiped = false;
		dom.canvas.style.transition = 'none';
		dom.canvas.style.transform = '';
		dom.canvas.style.opacity = '';
	}, { passive: true });

	dom.listEl.addEventListener('touchmove', function(e) {
		if (swipeLocked || state.pages.length <= 1) return;
		var dx = e.changedTouches[0].clientX - touchStartX;
		var dy = e.changedTouches[0].clientY - touchStartY;
		if (!swipeAxis) {
			if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
				swipeAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
			}
			return;
		}
		if (swipeAxis !== 'x') return;
		if (dx > 0 && state.pageIndex === 0) dx *= 0.3;
		if (dx < 0 && state.pageIndex === state.pages.length - 1) dx *= 0.3;
		swipeUnderlay.style.display = '';
		dom.canvas.style.transform = 'translateX(' + dx + 'px)';
		dom.canvas.style.opacity = Math.max(0.4, 1 - Math.abs(dx) / dom.listEl.offsetWidth * 0.8);
	}, { passive: true });

	dom.listEl.addEventListener('touchend', function(e) {
		if (swipeLocked) return;
		var diffX = e.changedTouches[0].clientX - touchStartX;
		if (swipeAxis === 'x' && Math.abs(diffX) > 50 && state.pages.length > 1) {
			var goNext = diffX < 0;
			var goPrev = diffX > 0;
			if ((goNext && state.pageIndex < state.pages.length - 1) ||
				(goPrev && state.pageIndex > 0)) {
				wasSwiped = true;
				swipeLocked = true;
				var targetIdx = goNext ? state.pageIndex + 1 : state.pageIndex - 1;
				var dir = goNext ? -1 : 1;
				dom.canvas.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
				dom.canvas.style.transform = 'translateX(' + (dir * dom.listEl.offsetWidth) + 'px)';
				dom.canvas.style.opacity = '0';
				setTimeout(function() {
					goToPage(targetIdx);
					dom.canvas.style.transition = 'none';
					dom.canvas.style.transform = 'translateX(' + (-dir * dom.listEl.offsetWidth * 0.3) + 'px)';
					dom.canvas.style.opacity = '0.3';
					requestAnimationFrame(function() {
						dom.canvas.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
						dom.canvas.style.transform = '';
						dom.canvas.style.opacity = '';
						setTimeout(function() { swipeLocked = false; swipeUnderlay.style.display = 'none'; }, 260);
					});
				}, 200);
				return;
			}
		}
		dom.canvas.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
		dom.canvas.style.transform = '';
		dom.canvas.style.opacity = '';
		setTimeout(function() { swipeUnderlay.style.display = 'none'; }, 200);
	});

	dom.listEl.addEventListener('click', function() {
		if (wasSwiped) { wasSwiped = false; }
	});
}

export function initBottomSheet() {
	const sheetEl = document.querySelector('.section.right');
	const handleEl = document.querySelector('.sheet-handle');
	if (!sheetEl || !handleEl) return;

	const SHEET_HEIGHT_VH = 65;
	const HANDLE_VISIBLE_PX = 90;
	let sheetExpanded = true;
	let dragStartY = 0;
	let dragStartTranslate = 0;
	let isDragging = false;
	let dragStartTime = 0;

	const getSheetHeight = function() {
		return window.innerHeight * SHEET_HEIGHT_VH / 100;
	};

	const getCollapsedTranslate = function() {
		return getSheetHeight() - HANDLE_VISIBLE_PX;
	};

	const setTransform = function(y, animate) {
		if (animate) {
			sheetEl.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
		} else {
			sheetEl.style.transition = 'none';
		}
		sheetEl.style.transform = 'translateY(' + y + 'px)';
	};

	const expandSheet = function() {
		sheetExpanded = true;
		setTransform(0, true);
	};

	const collapseSheet = function() {
		sheetExpanded = false;
		setTransform(getCollapsedTranslate(), true);
	};

	handleEl.addEventListener('touchstart', function(e) {
		if (!isMobile()) return;
		isDragging = true;
		dragStartY = e.touches[0].clientY;
		dragStartTime = Date.now();
		var matrix = new DOMMatrix(getComputedStyle(sheetEl).transform);
		dragStartTranslate = matrix.m42 || 0;
		sheetEl.style.transition = 'none';
	}, { passive: true });

	handleEl.addEventListener('touchmove', function(e) {
		if (!isDragging || !isMobile()) return;
		var currentY = e.touches[0].clientY;
		var delta = currentY - dragStartY;
		var newTranslate = dragStartTranslate + delta;
		var maxTranslate = getCollapsedTranslate();
		newTranslate = Math.max(0, Math.min(newTranslate, maxTranslate));
		sheetEl.style.transform = 'translateY(' + newTranslate + 'px)';
	}, { passive: true });

	handleEl.addEventListener('touchend', function(e) {
		if (!isDragging || !isMobile()) return;
		isDragging = false;
		var endY = e.changedTouches[0].clientY;
		var delta = endY - dragStartY;
		var elapsed = Date.now() - dragStartTime;
		var velocity = Math.abs(delta) / elapsed;
		var threshold = getSheetHeight() * 0.3;

		if (velocity > 0.5 || Math.abs(delta) > threshold) {
			if (delta > 0) collapseSheet();
			else expandSheet();
		} else {
			if (sheetExpanded) expandSheet();
			else collapseSheet();
		}
	});

	handleEl.addEventListener('click', function() {
		if (!isMobile()) return;
		if (sheetExpanded) collapseSheet();
		else expandSheet();
	});
}
