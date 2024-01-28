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

	// Показать пагинацию если больше одной страницы
	if (currentPages.length > 1) {
		showPagination();
	}
	// Показать кнопки действий
	showDownloadBtn();
	showPdfBtn();
	showZipBtn();
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
	updatePagination();
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


// Пагинация стикерами
const showPagination = function() {
	const prevBtn = createSticker('page-prev', '\u2190');
	prevBtn.onclick = function(e) { e.stopPropagation(); if (isMobile()) animateToPage(currentPageIndex - 1); else goToPage(currentPageIndex - 1); };
	prevBtn.style.display = '';

	const nextBtn = createSticker('page-next', '\u2192');
	nextBtn.onclick = function(e) { e.stopPropagation(); if (isMobile()) animateToPage(currentPageIndex + 1); else goToPage(currentPageIndex + 1); };
	nextBtn.style.display = '';

	updatePagination();
};

const hidePagination = function() {
	['page-prev', 'page-next'].forEach(function(id) {
		const el = document.getElementById(id);
		if (el) el.style.display = 'none';
	});
};

const updatePagination = function() {
	const prevBtn = document.getElementById('page-prev');
	const nextBtn = document.getElementById('page-next');
	if (!prevBtn) return;
	prevBtn.disabled = currentPageIndex === 0;
	nextBtn.disabled = currentPageIndex === currentPages.length - 1;
};


// Стикер скачивания
const showDownloadBtn = function() {
	const btn = createSticker('download-btn', 'Скачать');
	btn.onclick = function(e) {
		e.stopPropagation();
		const link = document.createElement('a');
		link.download = 'page-' + seedHash() + '-' + (currentPageIndex + 1) + '.png';
		link.href = canvas.toDataURL('image/png');
		link.click();
	};
	btn.style.display = '';
};


// Стикер PDF
const showPdfBtn = function() {
	const btn = createSticker('pdf-btn', 'PDF');
	btn.onclick = function(e) {
		e.stopPropagation();
		if (typeof window.jspdf === 'undefined') return;
		clipboardEl.classList.add('loading');
		var jsPDF = window.jspdf.jsPDF;
		var r = dpi / BASE_DPI;
		var fullW = Writer.CONFIG.LIST_WIDTH * r;
		var fullH = Writer.CONFIG.LIST_HEIGHT * r;
		var pdfW = fullW;
		var pdfH = fullH;
		var pdfCanvas = document.createElement('canvas');
		pdfCanvas.width = pdfW;
		pdfCanvas.height = pdfH;
		var pdfCtx = pdfCanvas.getContext('2d');
		var offC = createOffCanvas(fullW, fullH);
		var pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [pdfW, pdfH] });
		var chain = Promise.resolve();
		for (var i = 0; i < currentPages.length; i++) {
			(function(idx) {
				chain = chain.then(function() {
					return new Promise(function(resolve) {
						setTimeout(function() {
							var cached = pageCache.get(idx);
							if (cached) {
								pdfCtx.drawImage(cached, 0, 0, pdfW, pdfH);
							} else {
								renderPageToCanvas(currentPages[idx], offC);
								pdfCtx.drawImage(offC, 0, 0, pdfW, pdfH);
							}
							var dataUrl = pdfCanvas.toDataURL('image/jpeg', 0.75);
							if (idx > 0) pdf.addPage([pdfW, pdfH]);
							pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH);
							resolve();
						}, 0);
					});
				});
			})(i);
		}
		chain.then(function() {
			pdf.save('pages-' + seedHash() + '.pdf');
			clipboardEl.classList.remove('loading');
		});
	};
	btn.style.display = '';
};


// Стикер ZIP
const showZipBtn = function() {
	const btn = createSticker('zip-btn', 'ZIP');
	btn.onclick = function(e) {
		e.stopPropagation();
		if (typeof JSZip === 'undefined') return;
		clipboardEl.classList.add('loading');
		var zip = new JSZip();
		var r = dpi / BASE_DPI;
		var fullW = Writer.CONFIG.LIST_WIDTH * r;
		var fullH = Writer.CONFIG.LIST_HEIGHT * r;
		var offC = createOffCanvas(fullW, fullH);
		var chain = Promise.resolve();
		for (var i = 0; i < currentPages.length; i++) {
			(function(idx) {
				chain = chain.then(function() {
					var cached = pageCache.get(idx);
					if (cached) {
						offC.width = fullW;
						offC.height = fullH;
						offC.getContext('2d').drawImage(cached, 0, 0);
					} else {
						renderPageToCanvas(currentPages[idx], offC);
					}
					// OffscreenCanvas поддерживает convertToBlob, обычный — toBlob
					if (offC.convertToBlob) {
						return offC.convertToBlob({ type: 'image/png' }).then(function(blob) {
							zip.file('page-' + seedHash() + '-' + (idx + 1) + '.png', blob);
						});
					}
					return new Promise(function(resolve) {
						offC.toBlob(function(blob) {
							zip.file('page-' + seedHash() + '-' + (idx + 1) + '.png', blob);
							resolve();
						}, 'image/png');
					});
				});
			})(i);
		}
		chain.then(function() {
			return zip.generateAsync({ type: 'blob' });
		}).then(function(blob) {
			var url = URL.createObjectURL(blob);
			var link = document.createElement('a');
			link.href = url;
			link.download = 'pages-' + seedHash() + '.zip';
			link.click();
			URL.revokeObjectURL(url);
			clipboardEl.classList.remove('loading');
		});
	};
	btn.style.display = '';
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
		hidePagination();
		hideWarning();
		renderPlaceholder();
		['download-btn', 'pdf-btn', 'zip-btn'].forEach(function(id) {
			var el = document.getElementById(id);
			if (el) el.style.display = 'none';
		});
		return;
	}

	var len = textEl.value.length;
	var delay = len < 2000 ? 0 : Math.min(Math.floor((len - 2000) / 1000) * 100, 500);
	clearTimeout(previewTimer);
	previewTimer = setTimeout(function() {
		sendText();
	}, delay);
});



// Bottom sheet — перетаскивание на мобайле
(function() {
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

	// Обработка касаний на хэндле
	handleEl.addEventListener('touchstart', function(e) {
		if (!isMobile()) return;
		isDragging = true;
		dragStartY = e.touches[0].clientY;
		dragStartTime = Date.now();
		// Текущий translateY
		var matrix = new DOMMatrix(getComputedStyle(sheetEl).transform);
		dragStartTranslate = matrix.m42 || 0;
		sheetEl.style.transition = 'none';
	}, { passive: true });

	handleEl.addEventListener('touchmove', function(e) {
		if (!isDragging || !isMobile()) return;
		var currentY = e.touches[0].clientY;
		var delta = currentY - dragStartY;
		var newTranslate = dragStartTranslate + delta;
		// Clamp: не выше 0 (полностью раскрыт), не ниже collapsedTranslate
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
		var velocity = Math.abs(delta) / elapsed; // px/ms
		var threshold = getSheetHeight() * 0.3;

		// Быстрый свайп (>0.5 px/ms) или прошли порог 30%
		if (velocity > 0.5 || Math.abs(delta) > threshold) {
			if (delta > 0) collapseSheet();
			else expandSheet();
		} else {
			// Вернуть в предыдущее состояние
			if (sheetExpanded) expandSheet();
			else collapseSheet();
		}
	});

	// Тап по хэндлу — переключить состояние
	handleEl.addEventListener('click', function() {
		if (!isMobile()) return;
		if (sheetExpanded) collapseSheet();
		else expandSheet();
	});
})();

// Подложка-затемнение для свайпа (страница «снизу»)
const swipeUnderlay = document.createElement('div');
swipeUnderlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#e8e4ec;display:none;z-index:0;';
listEl.appendChild(swipeUnderlay);
if (isMobile()) {
	listEl.style.position = 'relative';
	listEl.style.overflow = 'hidden';
	canvas.style.position = 'relative';
	canvas.style.zIndex = '1';
}

// Свайп между страницами на мобайле (с анимацией)
let touchStartX = 0;
let touchStartY = 0;
let wasSwiped = false;
let swipeLocked = false;
let swipeAxis = null;

listEl.addEventListener('touchstart', function(e) {
	if (swipeLocked) return;
	touchStartX = e.changedTouches[0].clientX;
	touchStartY = e.changedTouches[0].clientY;
	swipeAxis = null;
	wasSwiped = false;
	canvas.style.transition = 'none';
	canvas.style.transform = '';
	canvas.style.opacity = '';
}, { passive: true });

listEl.addEventListener('touchmove', function(e) {
	if (swipeLocked || currentPages.length <= 1) return;
	var dx = e.changedTouches[0].clientX - touchStartX;
	var dy = e.changedTouches[0].clientY - touchStartY;
	if (!swipeAxis) {
		if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
			swipeAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
		}
		return;
	}
	if (swipeAxis !== 'x') return;
	// Не тянуть за границы (первая/последняя страница)
	if (dx > 0 && currentPageIndex === 0) dx *= 0.3;
	if (dx < 0 && currentPageIndex === currentPages.length - 1) dx *= 0.3;
	swipeUnderlay.style.display = '';
	canvas.style.transform = 'translateX(' + dx + 'px)';
	canvas.style.opacity = Math.max(0.4, 1 - Math.abs(dx) / listEl.offsetWidth * 0.8);
}, { passive: true });

listEl.addEventListener('touchend', function(e) {
	if (swipeLocked) return;
	var diffX = e.changedTouches[0].clientX - touchStartX;
	var diffY = e.changedTouches[0].clientY - touchStartY;
	if (swipeAxis === 'x' && Math.abs(diffX) > 50 && currentPages.length > 1) {
		var goNext = diffX < 0;
		var goPrev = diffX > 0;
		if ((goNext && currentPageIndex < currentPages.length - 1) ||
			(goPrev && currentPageIndex > 0)) {
			wasSwiped = true;
			swipeLocked = true;
			var targetIdx = goNext ? currentPageIndex + 1 : currentPageIndex - 1;
			// Анимация вылета
			var dir = goNext ? -1 : 1;
			canvas.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
			canvas.style.transform = 'translateX(' + (dir * listEl.offsetWidth) + 'px)';
			canvas.style.opacity = '0';
			setTimeout(function() {
				goToPage(targetIdx);
				canvas.style.transition = 'none';
				canvas.style.transform = 'translateX(' + (-dir * listEl.offsetWidth * 0.3) + 'px)';
				canvas.style.opacity = '0.3';
				requestAnimationFrame(function() {
					canvas.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
					canvas.style.transform = '';
					canvas.style.opacity = '';
					setTimeout(function() { swipeLocked = false; swipeUnderlay.style.display = 'none'; }, 260);
				});
			}, 200);
			return;
		}
	}
	// Вернуть на место если не свайп
	canvas.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
	canvas.style.transform = '';
	canvas.style.opacity = '';
	setTimeout(function() { swipeUnderlay.style.display = 'none'; }, 200);
});

// Свайп — не считать кликом
listEl.addEventListener('click', function() {
	if (wasSwiped) { wasSwiped = false; }
});
