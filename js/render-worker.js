import { generateList } from './writer.js';

let spriteData = null;

self.onmessage = function(e) {
	const { type, payload } = e.data;

	if (type === 'init') {
		spriteData = payload.spriteData;
		self.postMessage({ type: 'ready' });
		return;
	}

	if (type === 'generate') {
		const result = generateList(payload.text, spriteData, payload.options);
		self.postMessage({ type: 'result', id: payload.id, result });
	}
};
