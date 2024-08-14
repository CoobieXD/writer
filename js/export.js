import { state, dom, ratio, seedHash } from './state.js';
import { CONFIG } from './writer.js';
import { createOffCanvas, renderPageToCanvas } from './renderer.js';
import { createSticker } from './ui.js';

function loadScript(src) {
	return new Promise(function(resolve, reject) {
		if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
		const s = document.createElement('script');
		s.src = src;
		s.onload = resolve;
		s.onerror = reject;
		document.head.appendChild(s);
	});
}

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.3/jspdf.umd.min.js';
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

export function showDownloadBtn() {
	const btn = createSticker('download-btn', 'Скачать');
	btn.onclick = function(e) {
		e.stopPropagation();
		const link = document.createElement('a');
		link.download = 'page-' + seedHash() + '-' + (state.pageIndex + 1) + '.png';
		link.href = dom.canvas.toDataURL('image/png');
		link.click();
	};
	btn.style.display = '';
}

export function showPdfBtn() {
	const btn = createSticker('pdf-btn', 'PDF');
	btn.onclick = async function(e) {
		e.stopPropagation();
		dom.clipboardEl.classList.add('loading');
		try {
			await loadScript(JSPDF_URL);
		} catch {
			dom.clipboardEl.classList.remove('loading');
			return;
		}
		var jsPDF = window.jspdf.jsPDF;
		var r = ratio();
		var fullW = CONFIG.LIST_WIDTH * r;
		var fullH = CONFIG.LIST_HEIGHT * r;
		var pdfCanvas = document.createElement('canvas');
		pdfCanvas.width = fullW;
		pdfCanvas.height = fullH;
		var pdfCtx = pdfCanvas.getContext('2d');
		var offC = createOffCanvas(fullW, fullH);
		var pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [fullW, fullH] });
		var chain = Promise.resolve();
		for (var i = 0; i < state.pages.length; i++) {
			(function(idx) {
				chain = chain.then(function() {
					return new Promise(function(resolve) {
						setTimeout(function() {
							var cached = state.pageCache.get(idx);
							if (cached) {
								pdfCtx.drawImage(cached, 0, 0, fullW, fullH);
							} else {
								renderPageToCanvas(state.pages[idx], offC);
								pdfCtx.drawImage(offC, 0, 0, fullW, fullH);
							}
							var dataUrl = pdfCanvas.toDataURL('image/jpeg', 0.75);
							if (idx > 0) pdf.addPage([fullW, fullH]);
							pdf.addImage(dataUrl, 'JPEG', 0, 0, fullW, fullH);
							resolve();
						}, 0);
					});
				});
			})(i);
		}
		chain.then(function() {
			pdf.save('pages-' + seedHash() + '.pdf');
			dom.clipboardEl.classList.remove('loading');
		});
	};
	btn.style.display = '';
}

export function showZipBtn() {
	const btn = createSticker('zip-btn', 'ZIP');
	btn.onclick = async function(e) {
		e.stopPropagation();
		dom.clipboardEl.classList.add('loading');
		try {
			await loadScript(JSZIP_URL);
		} catch {
			dom.clipboardEl.classList.remove('loading');
			return;
		}
		var zip = new JSZip();
		var r = ratio();
		var fullW = CONFIG.LIST_WIDTH * r;
		var fullH = CONFIG.LIST_HEIGHT * r;
		var offC = createOffCanvas(fullW, fullH);
		var chain = Promise.resolve();
		for (var i = 0; i < state.pages.length; i++) {
			(function(idx) {
				chain = chain.then(function() {
					var cached = state.pageCache.get(idx);
					if (cached) {
						offC.width = fullW;
						offC.height = fullH;
						offC.getContext('2d').drawImage(cached, 0, 0);
					} else {
						renderPageToCanvas(state.pages[idx], offC);
					}
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
			dom.clipboardEl.classList.remove('loading');
		});
	};
	btn.style.display = '';
}
