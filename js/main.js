import { state, dom, initDom, isMobile, seedHash } from './state.js';
import { generateList, CONFIG } from './writer.js';
import { renderPageToCanvas, loadSprites, prefetchAdjacentPages, clearPageCache } from './renderer.js';
import { showDownloadBtn, showPdfBtn, showZipBtn } from './export.js';
import { goToPage, animateToPage, initSwipe, initBottomSheet } from './navigation.js';
import { showWarning, hideWarning, showPagination, hidePagination, showError } from './ui.js';

// 1. Инициализация DOM и загрузка данных
initDom();
state.spriteData = await fetch('./data/sprite-data.json').then(r => r.json());

// 2. Web Worker для генерации
let worker = null;
let generateId = 0;
const pendingGenerations = new Map();

function initWorker() {
	try {
		worker = new Worker('./js/render-worker.js', { type: 'module' });
		worker.postMessage({ type: 'init', payload: { spriteData: state.spriteData } });
		worker.onmessage = function(e) {
			if (e.data.type === 'result') {
				const cb = pendingGenerations.get(e.data.id);
				pendingGenerations.delete(e.data.id);
				if (cb) cb(e.data.result);
			}
		};
		worker.onerror = function() {
			worker = null;
		};
	} catch (e) {
		worker = null;
	}
}

function generate(text, options) {
	return new Promise(function(resolve) {
		if (!worker) {
			resolve(generateList(text, state.spriteData, options));
			return;
		}
		const id = ++generateId;
		pendingGenerations.set(id, resolve);
		worker.postMessage({ type: 'generate', payload: { text, options, id } });
	});
}

initWorker();

// 3. Рукописный плейсхолдер
const PLACEHOLDER_TEXT = 'Привет! Это Писец — генератор рукописных конспектов.\n\nКак пользоваться:\n\t1. Введите или вставьте текст в поле слева\n\t2. Конспект появится здесь автоматически\n\t3. Нажмите "Скачать" чтобы сохранить как картинку, или "PDF" для всех страниц\n\nСоветы:\n\tCtrl+Enter — перегенерировать с новым почерком\n\tTab — вставить отступ в тексте\n\tМожно перетащить .txt файл прямо в поле ввода\n\nУдачи на парах :)';

const renderPlaceholder = function() {
	const result = generateList(PLACEHOLDER_TEXT, state.spriteData, { seed: 42 });
	const data = result.pages[0];
	loadSprites(data).then(function() {
		renderPageToCanvas(data);
		state.placeholderRendered = true;
	});
};

renderPlaceholder();
document.body.classList.remove('loading');
dom.writeBtn.disabled = false;

// 4. Основной поток генерации
async function sendText() {
	if (state.processing) return;
	if (!dom.textEl.value.trim()) return;
	state.processing = true;

	hideWarning();
	hidePagination();
	clearPageCache();

	const text = dom.textEl.value;
	const options = { seed: state.seed };
	if (window.location.search.indexOf('curv') !== -1) {
		options.curv = true;
	}

	const result = await generate(text, options);
	state.pages = result.pages;
	state.pageIndex = 0;

	if (result.skippedChars.length > 0) {
		showWarning('Символы без глифа пропущены: ' + result.skippedChars.join(' '));
	}

	try {
		await loadSprites(state.pages[0]);
	} catch (err) {
		console.error(err);
		showError('Ошибка загрузки спрайтов. Попробуйте обновить страницу.');
		dom.clipboardEl.classList.remove('loading');
		document.body.classList.remove('loading');
		dom.writeBtn.disabled = false;
		state.processing = false;
		return;
	}

	renderPageToCanvas(state.pages[0]);

	// Кешируем отрендеренную страницу
	if (!state.pageCache.has(state.pageIndex)) {
		createImageBitmap(dom.canvas).then(function(bmp) {
			state.pageCache.set(state.pageIndex, bmp);
			prefetchAdjacentPages();
		});
	} else {
		prefetchAdjacentPages();
	}

	showList();
}

function showList() {
	dom.listEl.style.display = '';
	dom.clipboardEl.classList.remove('loading');
	document.body.classList.remove('loading');
	dom.writeBtn.disabled = false;
	state.processing = false;

	if (state.pages.length > 1) {
		showPagination(
			function(e) { e.stopPropagation(); if (isMobile()) animateToPage(state.pageIndex - 1); else goToPage(state.pageIndex - 1); },
			function(e) { e.stopPropagation(); if (isMobile()) animateToPage(state.pageIndex + 1); else goToPage(state.pageIndex + 1); }
		);
	}
	showDownloadBtn();
	showPdfBtn();
	showZipBtn();
}

// 5. События

// "Перевести в рукопись"
dom.writeBtn.addEventListener('click', function() {
	state.seed = (Math.random() * 4294967296) >>> 0;
	dom.writeBtn.disabled = true;
	dom.clipboardEl.classList.add('loading');
	sendText();
});

// Tab и Ctrl+Enter
dom.textEl.addEventListener('keydown', function(e) {
	if (e.key === 'Tab') {
		e.preventDefault();
		const val = this.value;
		const start = this.selectionStart;
		const end = this.selectionEnd;
		this.value = val.substring(0, start) + '\t' + val.substring(end);
		this.selectionStart = this.selectionEnd = start + 1;
	}
	if (e.ctrlKey && e.key === 'Enter') {
		state.seed = (Math.random() * 4294967296) >>> 0;
		dom.writeBtn.disabled = true;
		dom.clipboardEl.classList.add('loading');
		sendText();
	}
});

// Живой предпросмотр
let previewTimer = null;

dom.textEl.addEventListener('input', function() {
	const hasText = dom.textEl.value !== '';
	dom.writeBtn.style.display = hasText ? '' : 'none';

	if (!hasText) {
		clearTimeout(previewTimer);
		hidePagination();
		hideWarning();
		renderPlaceholder();
		['download-btn', 'pdf-btn', 'zip-btn'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) el.style.display = 'none';
		});
		return;
	}

	var len = dom.textEl.value.length;
	var delay = len < 2000 ? 0 : Math.min(Math.floor((len - 2000) / 1000) * 100, 500);
	clearTimeout(previewTimer);
	previewTimer = setTimeout(function() {
		sendText();
	}, delay);
});

// Drag&drop .txt файлов
dom.textEl.addEventListener('dragover', function(e) {
	e.preventDefault();
	dom.textEl.classList.add('dragover');
});

dom.textEl.addEventListener('dragleave', function() {
	dom.textEl.classList.remove('dragover');
});

dom.textEl.addEventListener('drop', function(e) {
	e.preventDefault();
	dom.textEl.classList.remove('dragover');
	const file = e.dataTransfer.files[0];
	if (!file || !file.name.endsWith('.txt')) return;
	const reader = new FileReader();
	reader.onload = function() {
		dom.textEl.value = reader.result;
		dom.writeBtn.style.display = '';
	};
	reader.readAsText(file);
});

// 6. Свайп и bottom sheet
initSwipe();
initBottomSheet();
