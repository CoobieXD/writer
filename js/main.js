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

// Показать/скрыть кнопку при вводе текста
textEl.addEventListener('input', function() {
	writeBtn.style.display = textEl.value !== '' ? '' : 'none';
});


