const dpi = 300;
const BASE_DPI = 600;
const canvas = document.getElementById('canvas');
const sprites = {};

const textEl = document.getElementById('text');
const writeBtn = document.getElementById('write');
const listEl = document.getElementById('list');
const listImgEl = document.getElementById('list_img');
const clipboardEl = document.querySelector('.clipboard');

document.body.classList.remove('loading');
writeBtn.disabled = false;

const sendText = function() {
	const text = textEl.value;
	const options = {};
	if (window.location.search.indexOf('curv') !== -1) {
		options.curv = true;
	}
	const lists = Writer.generateList(text, spriteData, options);
	loadSprites(lists.pages[0]);
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
	listImgEl.style.display = 'none';
	canvas.style.display = 'block';
	listEl.style.display = '';
	clipboardEl.classList.remove('loading');
	document.body.classList.remove('loading');
	writeBtn.disabled = false;
};

// "Перевести в рукопись"
writeBtn.addEventListener('click', function() {
	if (window.innerWidth < 1200) {
		document.body.classList.add('loading');
	}
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
		writeBtn.disabled = true;
		clipboardEl.classList.add('loading');
		sendText();
	}
});

// Показать/скрыть кнопку при вводе текста
textEl.addEventListener('input', function() {
	writeBtn.style.display = textEl.value !== '' ? '' : 'none';
});

// Скрыть лист на мобильных по клику
listEl.addEventListener('click', function() {
	if (window.innerWidth < 1200) {
		listEl.style.display = 'none';
	}
});
