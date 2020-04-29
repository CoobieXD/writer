const Writer = (function() {

	const CONFIG = {
		LIST_WIDTH: 4960,
		LIST_HEIGHT: 7016,
		LIST_PADDINGS: [104, 500, 800, 240], // top, right, bottom, left
		LINE_HEIGHT: 96 * 2,
		SPACE_WIDTH: 96,
		TAB_WIDTH: 96 * 1.5,
		WRAP_THRESHOLD: 500
	};

	const charToCodeMap = {
		"\t": '0009', "\n": '000a', " ": '0020', '!': '0021', '"': '0022', '#': '0023', '$': '0024', '%': '0025',
		'&': '0026', "'": '0027', '(': '0028', ')': '0029', '*': '002a', '+': '002b', ',': '002c', '-': '002d',
		'.': '002e', '/': '002f', '0': '0030', '1': '0031', '2': '0032', '3': '0033', '4': '0034', '5': '0035',
		'6': '0036', '7': '0037', '8': '0038', '9': '0039', ':': '003a', ';': '003b', '<': '003c', '=': '003d',
		'>': '003e', '?': '003f', '@': '0040', 'A': '0041', 'B': '0042', 'C': '0043', 'D': '0044', 'E': '0045',
		'F': '0046', 'G': '0047', 'H': '0048', 'I': '0049', 'J': '004a', 'K': '004b', 'L': '004c', 'M': '004d',
		'N': '004e', 'O': '004f', 'P': '0050', 'Q': '0051', 'R': '0052', 'S': '0053', 'T': '0054', 'U': '0055',
		'V': '0056', 'W': '0057', 'X': '0058', 'Y': '0059', 'Z': '005a', '[': '005b', '\\': '005c', ']': '005d',
		'^': '005e', '_': '005f', '`': '0060', 'a': '0061', 'b': '0062', 'c': '0063', 'd': '0064', 'e': '0065',
		'f': '0066', 'g': '0067', 'h': '0068', 'i': '0069', 'j': '006a', 'k': '006b', 'l': '006c', 'm': '006d',
		'n': '006e', 'o': '006f', 'p': '0070', 'q': '0071', 'r': '0072', 's': '0073', 't': '0074', 'u': '0075',
		'v': '0076', 'w': '0077', 'x': '0078', 'y': '0079', 'z': '007a', '{': '007b', '|': '007c', '}': '007d',
		'~': '007e', '\u00a5': '00a5', '\u00a7': '00a7', '\u00a9': '00a9', '\u00ab': '00ab', '\u00ae': '00ae',
		'\u00b1': '00b1', '\u00b2': '00b2', '\u00b3': '00b3', '\u00b9': '00b9', '\u00bb': '00bb', '\u00d7': '00d7',
		'\u00df': '00df', '\u00f7': '00f7',
		'\u0391': '0391', '\u0392': '0392', '\u0393': '0393', '\u0394': '0394', '\u0395': '0395', '\u0396': '0396',
		'\u0397': '0397', '\u0398': '0398', '\u0399': '0399', '\u039a': '039a', '\u039b': '039b', '\u039c': '039c',
		'\u039d': '039d', '\u039e': '039e', '\u039f': '039f', '\u03a0': '03a0', '\u03a1': '03a1', '\u03a3': '03a3',
		'\u03a4': '03a4', '\u03a5': '03a5', '\u03a6': '03a6', '\u03a7': '03a7', '\u03a8': '03a8', '\u03a9': '03a9',
		'\u03b1': '03b1', '\u03b2': '03b2', '\u03b3': '03b3', '\u03b4': '03b4', '\u03b5': '03b5', '\u03b6': '03b6',
		'\u03b7': '03b7', '\u03b8': '03b8', '\u03b9': '03b9', '\u03ba': '03ba', '\u03bb': '03bb', '\u03bc': '03bc',
		'\u03bd': '03bd', '\u03be': '03be', '\u03bf': '03bf', '\u03c0': '03c0', '\u03c1': '03c1', '\u03c3': '03c3',
		'\u03c4': '03c4', '\u03c5': '03c5', '\u03c6': '03c6', '\u03c7': '03c7', '\u03c8': '03c8', '\u03c9': '03c9',
		'\u0401': '0401', '\u0404': '0404', '\u0406': '0406', '\u0407': '0407', '\u040e': '040e',
		'\u0410': '0410', '\u0411': '0411', '\u0412': '0412', '\u0413': '0413', '\u0414': '0414',
		'\u0415': '0415', '\u0416': '0416', '\u0417': '0417', '\u0418': '0418', '\u0419': '0419',
		'\u041a': '041a', '\u041b': '041b', '\u041c': '041c', '\u041d': '041d', '\u041e': '041e',
		'\u041f': '041f', '\u0420': '0420', '\u0421': '0421', '\u0422': '0422', '\u0423': '0423',
		'\u0424': '0424', '\u0425': '0425', '\u0426': '0426', '\u0427': '0427', '\u0428': '0428',
		'\u0429': '0429', '\u042a': '042a', '\u042b': '042b', '\u042c': '042c', '\u042d': '042d',
		'\u042e': '042e', '\u042f': '042f',
		'\u0430': '0430', '\u0431': '0431', '\u0432': '0432', '\u0433': '0433', '\u0434': '0434',
		'\u0435': '0435', '\u0436': '0436', '\u0437': '0437', '\u0438': '0438', '\u0439': '0439',
		'\u043a': '043a', '\u043b': '043b', '\u043c': '043c', '\u043d': '043d', '\u043e': '043e',
		'\u043f': '043f', '\u0440': '0440', '\u0441': '0441', '\u0442': '0442', '\u0443': '0443',
		'\u0444': '0444', '\u0445': '0445', '\u0446': '0446', '\u0447': '0447', '\u0448': '0448',
		'\u0449': '0449', '\u044a': '044a', '\u044b': '044b', '\u044c': '044c', '\u044d': '044d',
		'\u044e': '044e', '\u044f': '044f', '\u0451': '0451', '\u0454': '0454', '\u0456': '0456',
		'\u0457': '0457', '\u045e': '045e',
		'\u0490': '0490', '\u0491': '0491', '\u0492': '0492', '\u0493': '0493', '\u0496': '0496',
		'\u0497': '0497', '\u049a': '049a', '\u049b': '049b', '\u04a2': '04a2', '\u04a3': '04a3',
		'\u04ae': '04ae', '\u04af': '04af', '\u04b0': '04b0', '\u04b1': '04b1', '\u04ba': '04ba',
		'\u04bb': '04bb', '\u04d8': '04d8', '\u04d9': '04d9', '\u04e8': '04e8', '\u04e9': '04e9',
		'\u1e9e': '1e9e',
		'\u2013': '2013', '\u2014': '2014', '\u201d': '201d', '\u201e': '201e', '\u2022': '2022',
		'\u2070': '2070', '\u2074': '2074', '\u2075': '2075', '\u2076': '2076', '\u2077': '2077',
		'\u2078': '2078', '\u2079': '2079',
		'\u20a4': '20a4', '\u20ac': '20ac', '\u20b4': '20b4', '\u20bd': '20bd', '\u2116': '2116',
		'\u2190': '2190', '\u2191': '2191', '\u2192': '2192', '\u2193': '2193', '\u2211': '2211',
		'\u221e': '221e', '\u2220': '2220', '\u222b': '222b', '\u2248': '2248', '\u2260': '2260',
		'\u2264': '2264', '\u2265': '2265', '\u25cb': '25cb', '\u25cf': '25cf', '\u2600': '2600',
		'\u2639': '2639', '\u263a': '263a', '\u2729': '2729', '\u2764': '2764',
		'\u00ad': '00ad'
	};

	const codeToPartMap = {};
	(function() {
		const parts = {
			'cyrillic_uppercase': ['0401','0410','0411','0412','0413','0414','0415','0416','0417','0418','0419','041a','041b','041c','041d','041e','041f','0420','0421','0422','0423','0424','0425','0426','0427','0428','0429','042a','042b','042c','042d','042e','042f'],
			'cyrillic_lowercase': ['0430','0431','0432','0433','0434','0435','0436','0437','0438','0439','043a','043b','043c','043d','043e','043f','0440','0441','0442','0443','0444','0445','0446','0447','0448','0449','044a','044b','044c','044d','044e','044f','0451'],
			'latin_uppercase': ['0041','0042','0043','0044','0045','0046','0047','0048','0049','004a','004b','004c','004d','004e','004f','0050','0051','0052','0053','0054','0055','0056','0057','0058','0059','005a'],
			'latin_lowercase': ['0061','0062','0063','0064','0065','0066','0067','0068','0069','006a','006b','006c','006d','006e','006f','0070','0071','0072','0073','0074','0075','0076','0077','0078','0079','007a'],
			'additional': ['0404','0406','0407','040e','0454','0456','0457','045e','0490','0491','0492','0493','0496','0497','049a','049b','04a2','04a3','04ae','04af','04b0','04b1','04ba','04bb','04d8','04d9','04e8','04e9','1e9e'],
			'digits': ['0030','0031','0032','0033','0034','0035','0036','0037','0038','0039'],
			'punctuation': ['002c','002e','002d','2013','2014','003f','0021','0022','003a','003b','0028','0029'],
			'symbols_keyboard': ['0023','0024','0025','0026','0027','002a','002b','002f','003c','003d','003e','0040','005b','005c','005d','005e','005f','0060','007b','007c','007d','007e','2116'],
			'symbols_else': ['00a5','00a7','00a9','00ab','00ae','00b1','00b2','00b3','00b9','00bb','00d7','00df','00f7','201d','201e','2022','2070','2074','2075','2076','2077','2078','2079','20a4','20ac','20b4','20bd','2190','2191','2192','2193','2211','221e','2220','222b','2248','2260','2264','2265','25cb','25cf','2600','2639','263a','2729','2764'],
			'greek': ['0391','0392','0393','0394','0395','0396','0397','0398','0399','039a','039b','039c','039d','039e','039f','03a0','03a1','03a3','03a4','03a5','03a6','03a7','03a8','03a9','03b1','03b2','03b3','03b4','03b5','03b6','03b7','03b8','03b9','03ba','03bb','03bc','03bd','03be','03bf','03c0','03c1','03c3','03c4','03c5','03c6','03c7','03c8','03c9']
		};
		for (const part in parts) {
			for (let i = 0; i < parts[part].length; i++) {
				codeToPartMap[parts[part][i]] = part;
			}
		}
	})();

	function char2code(word) {
		const codes = [];
		for (let i = 0; i < word.length; i++) {
			let ch = word[i];
			if (ch.charCodeAt(0) >= 0xD800 && ch.charCodeAt(0) <= 0xDBFF && i + 1 < word.length) {
				ch = word[i] + word[i + 1];
				i++;
			}
			if (charToCodeMap.hasOwnProperty(ch)) {
				codes.push(charToCodeMap[ch]);
			}
		}
		return codes;
	}

	function getPartByCode(code) {
		return codeToPartMap[code] || null;
	}

	// Precompiled hyphenation regexes
	const HYPHEN_G = '([аеёиоуыэюяaeiouy])';
	const HYPHEN_S = '([бвгджзклмнпрстфхцчшщbcdfghjklmnpqrstvwxyz])';
	const HYPHEN_X = '([йъь])';
	const HYPHEN_RULES = [
		[new RegExp(HYPHEN_G+HYPHEN_S+HYPHEN_S+HYPHEN_S+HYPHEN_S+HYPHEN_G, 'gui'), '$1$2$3\u00ad$4$5$6'],
		[new RegExp(HYPHEN_G+HYPHEN_S+HYPHEN_S+HYPHEN_S+HYPHEN_G, 'gui'), '$1$2$3\u00ad$4$5'],
		[new RegExp(HYPHEN_G+HYPHEN_S+HYPHEN_S+HYPHEN_S+HYPHEN_G, 'gui'), '$1$2\u00ad$3$4$5'],
		[new RegExp(HYPHEN_S+HYPHEN_G+HYPHEN_S+HYPHEN_G, 'gui'), '$1$2\u00ad$3$4'],
		[new RegExp(HYPHEN_G+HYPHEN_S+HYPHEN_S+HYPHEN_G, 'gui'), '$1$2\u00ad$3$4'],
		[new RegExp(HYPHEN_S+HYPHEN_G+HYPHEN_G+HYPHEN_G, 'gui'), '$1$2\u00ad$3$4'],
		[new RegExp(HYPHEN_S+HYPHEN_G+HYPHEN_G+HYPHEN_S, 'gui'), '$1$2\u00ad$3$4'],
		[new RegExp(HYPHEN_G+HYPHEN_S+HYPHEN_S+HYPHEN_G, 'gui'), '$1$2\u00ad$3$4'],
		[new RegExp(HYPHEN_X+HYPHEN_G+HYPHEN_G, 'gui'), '$1\u00ad$2$3'],
		[new RegExp(HYPHEN_X+HYPHEN_G+HYPHEN_S, 'gui'), '$1\u00ad$2$3'],
		[new RegExp(HYPHEN_X+HYPHEN_S+HYPHEN_G, 'gui'), '$1\u00ad$2$3'],
		[new RegExp(HYPHEN_X+HYPHEN_S+HYPHEN_S, 'gui'), '$1\u00ad$2$3'],
		[/([\s])/gui, '$1\u00ad'],
		[/(-)/gui, '$1\u00ad']
	];

	function isHyphen(text) {
		for (const [re, replacement] of HYPHEN_RULES) {
			text = text.replace(re, replacement);
		}
		return text;
	}

	function isBrevis(word) {
		word = word.replace(/\u00ad/g, '');
		return /^[\u0410-\u042f]{2,}$/.test(word);
	}

	// Precompiled normalize replacements
	const NORMALIZE_SINGLE_MAP = new Map([
		['\u00A0', ' '], ['\u2000', ' '], ['\u2002', ' '], ['\u2004', ' '],
		['\u2005', ' '], ['\u2006', ' '], ['\u2007', ' '], ['\u2008', ' '],
		['\u2009', ' '], ['\u200A', ' '], ['\u202F', ' '], ['\u205F', ' '],
		['\u2001', '  '], ['\u2003', '  '],
		['\u1680', '\u2014'], ['\u3000', '\t'],
		['\u180E', ''], ['\u200B', ''], ['\uFEFF', ''],
		['\u0301', ''], ['\u00b4', ''],
		['\u275d', '\u201e'], ['\u275e', '\u201d'],
		['\u201a', ','],
		['\u2039', '<'], ['\u203a', '>'],
		['\u2212', '-'],
		['\u2044', '/'],
		['\u00a6', '|'],
		['\u00b5', '\u03bc'],
		['\u03c2', '\u03c3'],
	]);
	const NORMALIZE_SINGLE_RE = new RegExp('[' + [...NORMALIZE_SINGLE_MAP.keys()].join('').replace(/[-\\^\]]/g, '\\$&') + ']', 'g');

	const NORMALIZE_MULTI_MAP = new Map([
		['\u2026', '...'],
		['\u00bc', '1/4'], ['\u00bd', '1/2'], ['\u00be', '3/4'],
		['\u2122', '(tm)'], ['\u2030', '%'],
		['\uff0c', ', '],
	]);
	const NORMALIZE_MULTI_RE = new RegExp('[' + [...NORMALIZE_MULTI_MAP.keys()].join('') + ']', 'g');

	const NORMALIZE_CLASS_RULES = [
		[/[\u201c\u201d\u2033]/g, '"'],
		[/[\u2018\u2019\u2032\u275b\u275c]/g, "'"],
		[/[\u00b7\u26aa\u26ab\u25cb]/g, '\u2022'],
		[/[\u00b0\u00ba\u00aa]/g, '\u2070'],
		[/[\u2605\u272a\u272b\u272f\u269d]/g, '\u2606'],
	];

	const NORMALIZE_REMOVE_RE = /[\u203e\u00b6\u00ac\u2261\u221a\u220f\u2202\u2200\u2203\u2205\u00d8\u2208\u2209\u220b\u2282\u2283\u2284\u2286\u2287\u2295\u2297\u22a5\u2227\u2228\u2229\u222a\u00a2\u00a3\u00a4\u0192\u2020\u2021\u2660\u2663\u2665\u2666\u25ca\u270f\u270e\u2710\u270d\u2194\u2195\u21b5\u21d0\u21d1\u21d2\u21d3\u21d4\u21d5\u25b2\u25bc\u25ba\u25c4\u2606]/g;

	const ALLOWED_RE = /[^\u0410-\u042f\u0430-\u044f\u0401\u0451\u042d\u044d\u042a\u044a\u042c\u044cA-Za-z0-9 \t\n,.\-\u2013\u2014?!":;()#$%&'*+\/<=>@\[\\\]^_`{|}~\u2116\u00a5\u00a7\u00a9\u00ab\u00ae\u00b1\u00b2\u00b3\u00b9\u00bb\u00d7\u00df\u00f7\u201d\u201e\u2022\u2070\u2074\u2075\u2076\u2077\u2078\u2079\u20a4\u20ac\u20b4\u20bd\u2190\u2191\u2192\u2193\u2211\u221e\u2220\u222b\u2248\u2260\u2264\u2265\u25cb\u25cf\u2600\u2639\u263a\u2729\u2764\u0391-\u03a9\u03b1-\u03c9\u0404\u0406\u0407\u040e\u0454\u0456\u0457\u045e\u0490\u0491\u0492\u0493\u0496\u0497\u049a\u049b\u04a2\u04a3\u04ae\u04af\u04b0\u04b1\u04ba\u04bb\u04d8\u04d9\u04e8\u04e9\u1e9e\u00ad]/g;

	function normalizeText(text) {
		text = text.replace(NORMALIZE_SINGLE_RE, function(ch) { return NORMALIZE_SINGLE_MAP.get(ch); });
		text = text.replace(NORMALIZE_MULTI_RE, function(ch) { return NORMALIZE_MULTI_MAP.get(ch); });
		for (const [re, replacement] of NORMALIZE_CLASS_RULES) {
			text = text.replace(re, replacement);
		}
		text = text.replace(/<</g, '\u00ab');
		text = text.replace(/>>/g, '\u00bb');
		text = text.replace(/\u2039\u2039/g, '\u00ab');
		text = text.replace(/\u203a\u203a/g, '\u00bb');
		text = text.replace(NORMALIZE_REMOVE_RE, '');
		text = text.replace(/\n/g, ' \n');
		text = text.replace(ALLOWED_RE, '');
		return text;
	}

	function mtRand(min, max) {
		return Math.floor(min + Math.random() * (max + 1 - min));
	}

	function pickLetterData(charData, letterCode, brevis) {
		const currentPart = brevis ? 'brevis' : getPartByCode(letterCode);
		if (charData[currentPart] && charData[currentPart][letterCode] && charData[currentPart][letterCode].length > 0) {
			return { part: currentPart, data: charData[currentPart][letterCode][mtRand(0, charData[currentPart][letterCode].length - 1)] };
		}
		if (brevis) {
			const fallbackPart = getPartByCode(letterCode);
			if (charData[fallbackPart] && charData[fallbackPart][letterCode] && charData[fallbackPart][letterCode].length > 0) {
				return { part: fallbackPart, data: charData[fallbackPart][letterCode][mtRand(0, charData[fallbackPart][letterCode].length - 1)] };
			}
		}
		return null;
	}

	function generateList(text, charData, options) {
		options = options || {};
		const useCurv = options.curv || false;
		const pad = CONFIG.LIST_PADDINGS;

		text = normalizeText(text);
		text = isHyphen(text);

		const words = text.split(' ');

		let list = 0;
		const post = [{}];
		let offset_x = 0;
		let offset_y = 0;
		let curvature_y = 0;
		let curvature_x = 0;

		for (let w = 0; w < words.length; w++) {
			const word = words[w];
			const brevis = isBrevis(word);
			const wordCodes = char2code(word);

			// Single pass: pick glyphs and measure word width
			const picks = [];
			let word_width = 0;
			for (let k = 0; k < wordCodes.length; k++) {
				const letter_code = wordCodes[k];
				if (letter_code !== '0009' && letter_code !== '000a' && letter_code !== '0020' && letter_code !== '00ad') {
					const pick = pickLetterData(charData, letter_code, brevis);
					if (!pick) { picks.push(null); continue; }
					picks.push(pick);
					const d = pick.data;
					word_width += Math.round(d[2] - (d[5] || 0) - (d[6] || 0) * 0.9 - d[2] * 0.1);
				} else {
					picks.push(null);
				}
			}

			// Check if we need to wrap
			let cut = 0;
			if (CONFIG.LIST_WIDTH - pad[1] - offset_x > CONFIG.WRAP_THRESHOLD) {
				cut = 1;
			} else {
				if (offset_x + word_width >= CONFIG.LIST_WIDTH - pad[1]) {
					offset_x = 0;
					curvature_y = 0;
					offset_y = offset_y + CONFIG.LINE_HEIGHT;
					if (useCurv) {
						offset_y = offset_y + mtRand(0, 32) - 16;
					}
				}
			}

			// Place each character using pre-picked glyphs
			for (let k = 0; k < wordCodes.length; k++) {
				const letter_code = wordCodes[k];

				if (offset_y >= CONFIG.LIST_HEIGHT - pad[2]) {
					list++;
					post[list] = {};
					offset_x = 0;
					offset_y = 0;
				}

				if (letter_code !== '0009' && letter_code !== '000a' && letter_code !== '0020' && letter_code !== '00ad') {
					const pick = picks[k];
					if (!pick) continue;
					const currentPart = pick.part;
					const letter_data = pick.data;

					const letter_width = letter_data[2];
					const letter_margin_top = letter_data[4] || 0;
					let letter_margin_left = letter_data[5] || 0;
					let letter_margin_right = letter_data[6] || 0;

					if (currentPart === 'brevis') {
						letter_margin_left = 0;
						letter_margin_right = 0;
					}

					offset_x = offset_x - letter_margin_left;

					if (useCurv) {
						const curvature_y_level = -2;
						const curvature_x_level = 2;
						curvature_y = Math.round(curvature_y + offset_x * offset_y / 10000000 * curvature_y_level) + mtRand(-2, 2);
						curvature_x = Math.round(curvature_x + offset_x * offset_y / 100000000 * curvature_x_level) + mtRand(-1, 1);
					}

					const x = pad[3] + offset_x + mtRand(-1, 1) + curvature_x;
					const y = pad[0] + offset_y + letter_margin_top + mtRand(-2, 2) + curvature_y;
					if (!post[list][currentPart]) {
						post[list][currentPart] = [];
					}
					post[list][currentPart].push([x, y, letter_data]);

					offset_x = Math.round(offset_x + letter_width - letter_margin_right * 0.9 - letter_width * 0.1);
				}

				if (letter_code === '0009') {
					offset_x = offset_x + CONFIG.TAB_WIDTH;
				}
				if (letter_code === '000a') {
					offset_x = 0;
					curvature_y = 0;
					offset_y = offset_y + CONFIG.LINE_HEIGHT;
					if (useCurv) {
						offset_y = offset_y + mtRand(0, 80) - 40;
					}
				}
				if (letter_code === '0020') {
					offset_x = offset_x + CONFIG.SPACE_WIDTH;
				}

				// Soft hyphen
				if (cut === 1 && letter_code === '00ad') {
					const nextPick = picks[k + 1];
					if (offset_x + (nextPick ? nextPick.data[2] : 0) >= CONFIG.LIST_WIDTH - pad[1] - 20) {
						const hyphen_code = '002d';
						const hyphen_part = getPartByCode(hyphen_code);
						const hyphen_data = charData[hyphen_part][hyphen_code][mtRand(0, charData[hyphen_part][hyphen_code].length - 1)];
						const h_margin_top = hyphen_data[4] || 0;
						const h_margin_left = hyphen_data[5] || 0;

						offset_x = offset_x - h_margin_left;
						const hx = pad[3] + offset_x + mtRand(-1, 1) + curvature_x;
						const hy = pad[0] + offset_y + h_margin_top + mtRand(-2, 2) + curvature_y;
						if (!post[list][hyphen_part]) {
							post[list][hyphen_part] = [];
						}
						post[list][hyphen_part].push([hx, hy, hyphen_data]);

						offset_x = 0;
						curvature_y = 0;
						offset_y = offset_y + CONFIG.LINE_HEIGHT;
					}
				}
			}

			offset_x = offset_x + CONFIG.SPACE_WIDTH;
		}

		return post;
	}

	return {
		generateList: generateList
	};

})();
