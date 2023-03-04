const dpi = 300;
const BASE_DPI = 600;
const canvas = document.getElementById('canvas');
const sprites = {};

const textEl = document.getElementById('text');
const writeBtn = document.getElementById('write');
const listEl = document.getElementById('list');
const clipboardEl = document.querySelector('.clipboard');

// Рукописный плейсхолдер на листе при пустом textarea
const PLACEHOLDER_TEXT = 'Привет! Это Писец — генератор рукописных конспектов.\n\nКак пользоваться:\n\t1. Введите или вставьте текст в поле слева\n\t2. Конспект появится здесь автоматически\n\t3. Нажмите "Скачать" чтобы сохранить как картинку, или "PDF" для всех страниц\n\nСоветы:\n\tCtrl+Enter — перегенерировать с новым почерком\n\tTab — вставить отступ в тексте\n\tМожно перетащить .txt файл прямо в поле ввода\n\nУдачи на парах :)';
let placeholderRendered = false;

const renderPlaceholder = function() {
	const result = Writer.generateList(PLACEHOLDER_TEXT, spriteData, { seed: 42 });
	const data = result.pages[0];
	const needed = Object.keys(data).filter(function(name) { return !sprites.hasOwnProperty(name); });
	if (needed.length === 0) {
		renderPageToCanvas(data);
		placeholderRendered = true;
		return;
	}
	Promise.all(needed.map(function(name) {
		return new Promise(function(resolve, reject) {
			var img = new Image();
			img.onload = function() { resolve(); };
			img.onerror = function() { reject(); };
			img.src = './assets/sprites/kate/' + dpi + 'dpi/' + name + '.png';
			sprites[name] = img;
		});
	})).then(function() {
		renderPageToCanvas(data);
		placeholderRendered = true;
	});
};

renderPlaceholder();
document.body.classList.remove('loading');
writeBtn.disabled = false;

let isProcessing = false;
let currentPages = [];
let currentPageIndex = 0;
let currentSeed = (Math.random() * 4294967296) >>> 0;


// Кеш отрендеренных страниц (pageIndex → ImageBitmap)
const pageCache = new Map();

// Создание offscreen/скрытого canvas для экспорта и предзагрузки
const createOffCanvas = function(w, h) {
	if (typeof OffscreenCanvas !== 'undefined') {
		return new OffscreenCanvas(w, h);
	}
	var c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return c;
};

const seedHash = function() {
	return currentSeed.toString(16).padStart(8, '0').slice(0, 4);
};

const sendText = function() {
	if (isProcessing) return;
	if (!textEl.value.trim()) return;
	isProcessing = true;
	const text = textEl.value;
	const options = { seed: currentSeed };
	if (window.location.search.indexOf('curv') !== -1) {
		options.curv = true;
	}
	const result = Writer.generateList(text, spriteData, options);
	currentPages = result.pages;
	currentPageIndex = 0;
	// Предупреждение о неподдерживаемых символах
	if (result.skippedChars.length > 0) {
		showWarning('Символы без глифа пропущены: ' + result.skippedChars.join(' '));
	}

	loadSprites(currentPages[0]);
};

const loadSprites = function(data) {
	const spritesToLoad = Object.keys(data);
	const newSprites = spritesToLoad.filter(function(name) { return !sprites.hasOwnProperty(name); });

	if (newSprites.length === 0) {
		renderList(data);
		return;
	}

	Promise.all(newSprites.map(function(name) {
		return new Promise(function(resolve, reject) {
			const sprite = new Image();
			sprite.onload = function() { resolve(); };
			sprite.onerror = function() { reject(new Error('Failed to load sprite: ' + name)); };
			sprite.src = './assets/sprites/kate/' + dpi + 'dpi/' + name + '.png';
			sprites[name] = sprite;
		});
	})).then(function() {
		renderList(data);
	}).catch(function(err) {
		console.error(err);
		clipboardEl.classList.remove('loading');
		// Рукописный плейсхолдер на листе при пустом textarea
const PLACEHOLDER_TEXT = 'Привет! Это Писец — генератор рукописных конспектов.\n\nКак пользоваться:\n\t1. Введите или вставьте текст в поле слева\n\t2. Конспект появится здесь автоматически\n\t3. Нажмите "Скачать" чтобы сохранить как картинку, или "PDF" для всех страниц\n\nСоветы:\n\tCtrl+Enter — перегенерировать с новым почерком\n\tTab — вставить отступ в тексте\n\tМожно перетащить .txt файл прямо в поле ввода\n\nУдачи на парах :)';
let placeholderRendered = false;

const renderPlaceholder = function() {
	const result = Writer.generateList(PLACEHOLDER_TEXT, spriteData, { seed: 42 });
	const data = result.pages[0];
	const needed = Object.keys(data).filter(function(name) { return !sprites.hasOwnProperty(name); });
	if (needed.length === 0) {
		renderPageToCanvas(data);
		placeholderRendered = true;
		return;
	}
	Promise.all(needed.map(function(name) {
		return new Promise(function(resolve, reject) {
			var img = new Image();
			img.onload = function() { resolve(); };
			img.onerror = function() { reject(); };
			img.src = './assets/sprites/kate/' + dpi + 'dpi/' + name + '.png';
			sprites[name] = img;
		});
	})).then(function() {
		renderPageToCanvas(data);
		placeholderRendered = true;
	});
};

renderPlaceholder();
document.body.classList.remove('loading');
		writeBtn.disabled = false;
	});
};

// Рендер одной страницы на произвольный canvas
const renderPageToCanvas = function(data, target) {
	target = target || canvas;
	const ctx = target.getContext('2d');
	const r = dpi / BASE_DPI;
	target.width = Writer.CONFIG.LIST_WIDTH * r;
	target.height = Writer.CONFIG.LIST_HEIGHT * r;
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, target.width, target.height);
	for (const [key, items] of Object.entries(data)) {
		for (const item of items) {
			ctx.drawImage(sprites[key], item[2][0]*r, item[2][1]*r, item[2][2]*r, item[2][3]*r, item[0]*r, item[1]*r, item[2][2]*r, item[2][3]*r);
		}
	}
};

const renderList = function(data) {
	renderPageToCanvas(data);
	// Кешируем отрендеренную страницу
	if (!pageCache.has(currentPageIndex)) {
		createImageBitmap(canvas).then(function(bmp) {
			pageCache.set(currentPageIndex, bmp);
			prefetchAdjacentPages();
		});
	} else {
		prefetchAdjacentPages();
	}
	showList();
};

const showList = function() {
	listEl.style.display = '';
	clipboardEl.classList.remove('loading');
	// Рукописный плейсхолдер на листе при пустом textarea
const PLACEHOLDER_TEXT = 'Привет! Это Писец — генератор рукописных конспектов.\n\nКак пользоваться:\n\t1. Введите или вставьте текст в поле слева\n\t2. Конспект появится здесь автоматически\n\t3. Нажмите "Скачать" чтобы сохранить как картинку, или "PDF" для всех страниц\n\nСоветы:\n\tCtrl+Enter — перегенерировать с новым почерком\n\tTab — вставить отступ в тексте\n\tМожно перетащить .txt файл прямо в поле ввода\n\nУдачи на парах :)';
let placeholderRendered = false;

const renderPlaceholder = function() {
	const result = Writer.generateList(PLACEHOLDER_TEXT, spriteData, { seed: 42 });
	const data = result.pages[0];
	const needed = Object.keys(data).filter(function(name) { return !sprites.hasOwnProperty(name); });
	if (needed.length === 0) {
		renderPageToCanvas(data);
		placeholderRendered = true;
		return;
	}
	Promise.all(needed.map(function(name) {
		return new Promise(function(resolve, reject) {
			var img = new Image();
			img.onload = function() { resolve(); };
			img.onerror = function() { reject(); };
			img.src = './assets/sprites/kate/' + dpi + 'dpi/' + name + '.png';
			sprites[name] = img;
		});
	})).then(function() {
		renderPageToCanvas(data);
		placeholderRendered = true;
	});
};

renderPlaceholder();
document.body.classList.remove('loading');
	writeBtn.disabled = false;
	isProcessing = false;
};


// Предупреждение о неподдерживаемых символах
const showWarning = function(msg) {
	let el = document.getElementById('char-warning');
	if (!el) {
		el = document.createElement('div');
		el.id = 'char-warning';
		clipboardEl.appendChild(el);
	}
	el.textContent = msg;
	el.style.display = '';
};

const hideWarning = function() {
	const el = document.getElementById('char-warning');
	if (el) el.style.display = 'none';
};

// Сообщение об ошибке загрузки спрайтов
const showError = function(msg) {
	let el = document.getElementById('sprite-error');
	if (!el) {
		el = document.createElement('div');
		el.id = 'sprite-error';
		clipboardEl.appendChild(el);
	}
	el.textContent = msg;
	el.style.display = '';
};


// Навигация по страницам
const goToPage = function(index) {
	if (index < 0 || index >= currentPages.length) return;
	currentPageIndex = index;
	var cached = pageCache.get(index);
	if (cached) {
		var r = dpi / BASE_DPI;
		canvas.width = Writer.CONFIG.LIST_WIDTH * r;
		canvas.height = Writer.CONFIG.LIST_HEIGHT * r;
		canvas.getContext('2d').drawImage(cached, 0, 0);
		prefetchAdjacentPages();
		return;
	}
	loadSprites(currentPages[index]);
};

// Анимированное перелистывание
let pageAnimating = false;
const animateToPage = function(index) {
	if (index < 0 || index >= currentPages.length || pageAnimating) return;
	if (index === currentPageIndex) return;
	pageAnimating = true;
	var dir = index > currentPageIndex ? -1 : 1;
	var w = listEl.offsetWidth || 300;
	// Показать подложку
	if (typeof swipeUnderlay !== 'undefined') swipeUnderlay.style.display = '';
	// Вылет текущей страницы
	canvas.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
	canvas.style.transform = 'translateX(' + (dir * w) + 'px)';
	canvas.style.opacity = '0';
	setTimeout(function() {
		goToPage(index);
		// Влёт новой страницы
		canvas.style.transition = 'none';
		canvas.style.transform = 'translateX(' + (-dir * w * 0.3) + 'px)';
		canvas.style.opacity = '0.3';
		requestAnimationFrame(function() {
			canvas.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
			canvas.style.transform = '';
			canvas.style.opacity = '';
			setTimeout(function() {
				pageAnimating = false;
				if (typeof swipeUnderlay !== 'undefined') swipeUnderlay.style.display = 'none';
			}, 260);
		});
	}, 200);
};

// Предзагрузка соседних страниц в фоне
const prefetchAdjacentPages = function() {
	var indices = [currentPageIndex - 1, currentPageIndex + 1].filter(function(i) {
		return i >= 0 && i < currentPages.length && !pageCache.has(i);
	});
	if (indices.length === 0) return;
	var schedule = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
	indices.forEach(function(idx) {
		schedule(function() {
			if (pageCache.has(idx)) return;
			// Загрузить спрайты для страницы если нужно
			var data = currentPages[idx];
			var needed = Object.keys(data).filter(function(name) { return !sprites.hasOwnProperty(name); });
			var ready = needed.length === 0
				? Promise.resolve()
				: Promise.all(needed.map(function(name) {
					return new Promise(function(resolve, reject) {
						var img = new Image();
						img.onload = function() { resolve(); };
						img.onerror = function() { reject(); };
						img.src = './assets/sprites/kate/' + dpi + 'dpi/' + name + '.png';
						sprites[name] = img;
					});
				}));
			ready.then(function() {
				if (pageCache.has(idx)) return;
				var r = dpi / BASE_DPI;
				var offC = createOffCanvas(Writer.CONFIG.LIST_WIDTH * r, Writer.CONFIG.LIST_HEIGHT * r);
				renderPageToCanvas(data, offC);
				return createImageBitmap(offC);
			}).then(function(bmp) {
				if (bmp && !pageCache.has(idx)) pageCache.set(idx, bmp);
			}).catch(function() {});
		});
	});
};

// Мобильный тулбар для стикеров (внутри bottom sheet)
const isMobile = function() { return window.innerWidth <= 1200; };

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

// Создание стикера
const createSticker = function(id, text) {
	let el = document.getElementById(id);
	if (!el) {
		el = document.createElement('button');
		el.id = id;
		el.className = 'sticker-btn';
		el.textContent = text;
		if (isMobile()) {
			getSheetToolbar().appendChild(el);
		} else {
			listEl.appendChild(el);
		}
	}
	return el;
};

// "Перевести в рукопись" — сбрасывает seed
writeBtn.addEventListener('click', function() {
	currentSeed = (Math.random() * 4294967296) >>> 0;
	writeBtn.disabled = true;
	clipboardEl.classList.add('loading');
	sendText();
});

// Tab и Ctrl+Enter
textEl.addEventListener('keydown', function(e) {
	if (e.key === 'Tab') {
		e.preventDefault();
		const val = this.value;
		const start = this.selectionStart;
		const end = this.selectionEnd;
		this.value = val.substring(0, start) + '\t' + val.substring(end);
		this.selectionStart = this.selectionEnd = start + 1;
	}
	if (e.ctrlKey && e.key === 'Enter') {
		currentSeed = (Math.random() * 4294967296) >>> 0;
		writeBtn.disabled = true;
		clipboardEl.classList.add('loading');
		sendText();
	}
});

// Живой предпросмотр
let previewTimer = null;

textEl.addEventListener('input', function() {
	const hasText = textEl.value !== '';
	writeBtn.style.display = hasText ? '' : 'none';

	if (!hasText) {
		// Сбросить к плейсхолдеру
		clearTimeout(previewTimer);
		hideWarning();
		renderPlaceholder();
		return;
	}

	var len = textEl.value.length;
	var delay = len < 2000 ? 0 : Math.min(Math.floor((len - 2000) / 1000) * 100, 500);
	clearTimeout(previewTimer);
	previewTimer = setTimeout(function() {
		sendText();
	}, delay);
});


