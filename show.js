var show = {
	activeIndex: 0,
	activeParagraph: null,
	pages: null,
	started: false,

	startup(pages) {
		if (this.started) {
			console.warn('show already started');
			return;
		}

		pages = pages || [];
		this.chorusIndex = -1;
		this.pages = pages;
		this.started = true;

		pages.some(function (node, i) {
			if (node.dataset.chorus) {
				this.chorusIndex = i;
				return true;
			}
		}, this);

		//window.addEventListener('hashchange', this.onHashChange.bind(this));
		window.addEventListener('resize', this.onResize.bind(this));
		window.addEventListener('wheel', this.onWheel.bind(this));
		document.body.addEventListener('keydown', this.onKeydown.bind(this));

		this.createBlankNode();
		this.createIkongkarNode();

		this.onResize();

		if (!pages || !pages.length) {
			document.title = 'Ik Ongkar';
			this.toggleIkongkar();
			return;
		}

		/*if (window.location.hash) {
			this.onHashChange();
		}
		else {*/
			this.setPage(0);
		//}
	},

	blank() {
		if (this.blankNode.classList.contains('hidden')) {
			this.blankNode.classList.remove('hidden');
		}
		else {
			this.blankNode.classList.add('hidden');
		}
	},

	createBlankNode() {
		this.blankNode = document.createElement('div');
		this.blankNode.className = 'blank hidden';
		document.body.appendChild(this.blankNode);
	},

	createIkongkarNode() {
		this.ikongkarNode = document.createElement('div');
		this.ikongkarNode.className = 'section';
		this.ikongkarNode.appendChild(document.createElement('div'));
		this.ikongkarNode.firstChild.className = 'line gurmukhi ikongkar';
		this.ikongkarNode.firstChild.textContent = 'Ç ÅÆ Ç';
		document.body.appendChild(this.ikongkarNode);
	},

	hidePage(index) {
		this.pages[index].classList.remove('visible');
	},

	showPage(index) {
		this.activePage = this.pages[index];
		this.activePage.classList.add('visible');
	},

	setPage(index) {
		//window.location.hash = '#' + index;
		this.onHashChange(index);
	},

	next() {
		if (this.activeIndex < (this.pages.length - 1)) {
			this.setPage(this.activeIndex + 1);
		}
	},

	previous() {
		if (this.activeIndex > 0) {
			this.setPage(this.activeIndex - 1);
		}
	},

	toggleIkongkar() {
		if (this.ikongkarNode.classList.contains('visible')) {
			this.ikongkarNode.classList.remove('visible');
			this.activePage && this.activePage.classList.add('visible');
		}
		else {
			this.activePage && this.activePage.classList.remove('visible');
			this.ikongkarNode.classList.add('visible');
		}
	},

	onHashChange(pageIndex) {
		//var pageIndex = parseInt(window.location.hash.substr(1), 10);

		if (pageIndex >= this.pages.length) {
			return;
		}

		this.hidePage(this.activeIndex);
		this.showPage(pageIndex);
		this.activeIndex = pageIndex;
	},

	onKeydown(event) {
		if (event.key === 'i') {
			this.toggleIkongkar();
			return;
		}

		if (event.key === 'c' && this.chorusIndex !== -1) {
			this.onHashChange(this.chorusIndex);
			return;
		}

		if (event.key === 'b') {
			this.blank();
		}

		if (event.key.match(/[0-9]/)) {
			this.onHashChange(parseInt(event.key, 10));
			return;
		}

		switch (event.keyCode) {
			case 32: // space
			case 34: // page down
			case 39: // right
			case 40: { // down
				this.next();
				break;
			}

			case 33: // page up
			case 37: // left
			case 38: { // up
				this.previous();
				break;
			}
		}
	},

	onResize() {
		this.pages.forEach(this.setNodeScale);
		this.setNodeScale(this.ikongkarNode);
	},

	setNodeScale(node) {
		if (!node) {
			return;
		}

		node.style.transform = 'scale(1)';

		const windowHeight = window.innerHeight;
		const windowWidth = window.innerWidth;
		const dimensions = node.getBoundingClientRect();
		const heightRatio = windowHeight / dimensions.height;
		const widthRatio = windowWidth / dimensions.width;
		const zoom = Math.min(heightRatio, widthRatio) * 0.94;

		node.style.left = ((windowWidth - dimensions.width) / 2) + 'px';
		node.style.top = ((windowHeight - dimensions.height) / 2) + 'px';
		node.style.transform = 'scale(' + zoom + ')';
	},

	onWheel(event) {
		if (event.deltaY > 0) {
			this.next();
		} else if (event.deltaY < 0) {
			this.previous();
		}
	}
};

function parseShabad() {
	const shabadNode = document.querySelector('script[type="text/show"]');

	if (!shabadNode || !shabadNode.textContent.trim()) {
		return;
	}

	const contentNode = document.createElement('div');
	contentNode.className = 'content';
	const sectionNodes = [];
	const sections = shabadNode.textContent.split(/\r?\n\r?\n/);
	document.title = sections.shift().trim();

	sections.forEach(function (section) {
		section = section.trim();
		const sectionNode = document.createElement('div');
		sectionNode.className = 'section';
		sectionNodes.push(sectionNode);
		const lines = section.split(/\r?\n/);

		lines.forEach(function (line) {
			if (line.toLocaleLowerCase() === 'chorus') {
				sectionNode.dataset.chorus = true;
				return;
			}

			const lineNode = document.createElement('div');
			lineNode.className = 'line';

			if (line.startsWith('/G')) {
				lineNode.classList.add('gurmukhi');
				line = line.substr(2);
			}
			else if( line.startsWith('!')) {
				lineNode.classList.add('romanized');
				line = line.substr(1);
			}

			lineNode.innerHTML = line;
			sectionNode.appendChild(lineNode);
		});

		contentNode.appendChild(sectionNode);
	});

	document.body.appendChild(contentNode);

	return sectionNodes;
}

show.startup(parseShabad());
