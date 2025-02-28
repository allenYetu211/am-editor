import {
	$,
	isEngine,
	NodeInterface,
	getHashId,
	Tooltip,
	BlockPlugin,
	PluginEntry,
} from '@aomao/engine';
import Outline, { OutlineData } from './outline';
import './index.css';

export type Options = {
	hotkey?: {
		h1?: string;
		h2?: string;
		h3?: string;
		h4?: string;
		h5?: string;
		h6?: string;
	};
	showAnchor?: boolean;
	anchorCopy?: (id: string) => string;
	markdown?: boolean;
	disableMark?: Array<string>;
};
export default class extends BlockPlugin<Options> {
	attributes = {
		id: '@var0',
	};
	variable = {
		'@var0': /^[\w\.\-]+$/,
	};
	tagName = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

	allowIn = ['blockquote', '$root'];

	disableMark = this.options.disableMark || ['fontsize', 'bold'];

	static get pluginName() {
		return 'heading';
	}

	init() {
		super.init();
		this.editor.on('paser:html', node => this.parseHtml(node));
		const { language } = this.editor;
		//阅读模式处理
		if (!isEngine(this.editor) && this.options.showAnchor !== false) {
			this.editor.on('render', (root: Node) => {
				const container = $(root);
				container.find(this.tagName.join(',')).each(heading => {
					const node = $(heading);
					const id = node.attributes('id');
					if (id) {
						node.find('.data-anchor-button').remove();
						const button = $(
							`<a class="data-anchor-button"><span class="data-icon data-icon-${node.name}"></span></a>`,
						);
						if (node.height() !== 24) {
							button.css({
								top: (node.height() - 24) / 2 + 'px',
							});
						}
						button.on('mouseenter', () => {
							Tooltip.show(
								button,
								language.get('copyAnchor', 'title').toString(),
							);
						});
						button.on('mouseleave', () => {
							Tooltip.hide();
						});

						button.on('click', e => {
							e.preventDefault();
							e.stopPropagation();
							const url = this.options.anchorCopy
								? this.options.anchorCopy(id)
								: window.location.href + '/' + id;

							if (this.editor.clipboard.copy(url)) {
								this.editor.messageSuccess(
									language.get('copy', 'success').toString(),
								);
							} else {
								this.editor.messageError(
									language.get('copy', 'error').toString(),
								);
							}
						});
						node.prepend(button);
					}
				});
			});
		}
		if (isEngine(this.editor)) {
			this.editor.on('keydown:backspace', event =>
				this.onBackspace(event),
			);
			this.editor.on('paste:markdown', child =>
				this.pasteMarkdown(child),
			);
		}
		//引擎处理
		if (!isEngine(this.editor) || this.options.showAnchor === false) return;

		this.editor.on('setvalue', () => {
			this.updateId();
		});
		this.editor.on('change', () => {
			this.updateId();
			this.showAnchor();
		});
		this.editor.on('select', () => {
			this.showAnchor();
		});
		window.addEventListener(
			'resize',
			() => {
				this.updateAnchorPosition();
			},
			false,
		);
	}

	updateId() {
		this.editor.container.find(this.tagName.join(',')).each(titleNode => {
			const node = $(titleNode);

			if (!node.parent()?.isEditable()) {
				node.removeAttributes('id');
				return;
			}

			let id = node.attributes('id');
			if (!id) {
				id = node.attributes('data-id') || getHashId(node);
				node.attributes('id', id);
			}
		});
	}

	updateAnchorPosition() {
		if (!isEngine(this.editor)) return;
		const { change, root } = this.editor;
		const button = root.find('.data-anchor-button');

		if (button.length === 0) {
			return;
		}
		const range = change.getRange();
		const block = range.startNode.closest('h1,h2,h3,h4,h5,h6');

		if (block.length === 0) {
			button.remove();
			return;
		}
		const rootRect = root.get<Element>()?.getBoundingClientRect() || {
			left: 0,
			top: 0,
		};
		const rect = block.get<Element>()!.getBoundingClientRect();
		const left = Math.round(
			rect.left - rootRect.left - button.get<Element>()!.clientWidth - 1,
		);
		const top = Math.round(
			rect.top -
				rootRect.top +
				rect.height / 2 -
				button.get<Element>()!.clientHeight / 2,
		);
		button.css({
			top: `${top}px`,
			left: `${left}px`,
		});
	}

	showAnchor() {
		if (!isEngine(this.editor)) return;
		const { change, root, clipboard, language, card } = this.editor;
		const range = change.getRange();
		let button = root.find('.data-anchor-button');
		const block = range.startNode.closest(this.tagName.join(','));

		if (
			block.length === 0 ||
			(button.length > 0 &&
				button.find('.data-icon-'.concat(block.name)).length === 0)
		) {
			button.remove();
		}

		if (block.length === 0 || card.closest(block, true)) {
			return;
		}

		if (!block.parent()?.isEditable()) {
			return;
		}

		if (button.find('.data-icon-'.concat(block.name)).length > 0) {
			this.updateAnchorPosition();
			return;
		}

		button = $(
			`<span class="data-anchor-button"><span class="data-icon data-icon-${block.name}"></span></span>`,
		);
		root.append(button);
		const parentRect = root.get<Element>()?.getBoundingClientRect() || {
			left: 0,
			top: 0,
		};
		const rect = block.get<Element>()!.getBoundingClientRect();
		const left = Math.round(
			rect.left -
				parentRect.left -
				button.get<Element>()!.clientWidth -
				1,
		);
		const top = Math.round(
			rect.top -
				parentRect.top +
				rect.height / 2 -
				button.get<Element>()!.clientHeight / 2,
		);
		button.css({
			top: `${top}px`,
			left: `${left}px`,
		});
		button.addClass('data-anchor-button-active');
		button.on('mouseenter', () => {
			Tooltip.show(
				button,
				language.get('copyAnchor', 'title').toString(),
			);
		});
		button.on('mouseleave', () => {
			Tooltip.hide();
		});

		button.on('click', e => {
			e.preventDefault();
			e.stopPropagation();
			const id = block.attributes('id');
			const url = this.options.anchorCopy
				? this.options.anchorCopy(id)
				: window.location.href + '/' + id;

			if (clipboard.copy(url)) {
				this.editor!.messageSuccess(
					language.get('copy', 'success').toString(),
				);
			} else {
				this.editor!.messageError(
					language.get('copy', 'error').toString(),
				);
			}
		});
	}

	execute(type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p') {
		if (!isEngine(this.editor)) return;
		if (type === this.queryState()) type = 'p';
		const { list, block } = this.editor;
		list.split();
		block.setBlocks(`<${type} />`);
	}

	queryState() {
		if (!isEngine(this.editor)) return;
		const { change } = this.editor;
		const blocks = change.blocks;
		if (blocks.length === 0) {
			return '';
		}
		const name = this.tagName.find(name =>
			blocks.some(block => block.name === name),
		);
		return name || '';
	}

	hotkey() {
		const h1Hotkey = this.options.hotkey?.h1 || 'mod+opt+1';
		const h2Hotkey = this.options.hotkey?.h2 || 'mod+opt+2';
		const h3Hotkey = this.options.hotkey?.h3 || 'mod+opt+3';
		const h4Hotkey = this.options.hotkey?.h4 || 'mod+opt+4';
		const h5Hotkey = this.options.hotkey?.h5 || 'mod+opt+5';
		const h6Hotkey = this.options.hotkey?.h6 || 'mod+opt+6';
		return [
			{ key: h1Hotkey, args: 'h1' },
			{ key: h2Hotkey, args: 'h2' },
			{ key: h3Hotkey, args: 'h3' },
			{ key: h4Hotkey, args: 'h4' },
			{ key: h5Hotkey, args: 'h5' },
			{ key: h6Hotkey, args: 'h6' },
		];
	}

	//设置markdown
	markdown(event: KeyboardEvent, text: string, block: NodeInterface) {
		if (!isEngine(this.editor) || this.options.markdown === false)
			return false;
		let type: any = '';
		switch (text) {
			case '#':
				type = 'h1';
				break;
			case '##':
				type = 'h2';
				break;
			case '###':
				type = 'h3';
				break;
			case '####':
				type = 'h4';
				break;
			case '#####':
				type = 'h5';
				break;
			case '######':
				type = 'h6';
				break;
		}
		if (!type) return true;
		event.preventDefault();
		this.editor.block.removeLeftText(block);
		if (this.editor.node.isEmpty(block)) {
			block.empty();
			block.append('<br />');
		}
		this.editor.command.execute(
			(this.constructor as PluginEntry).pluginName,
			type,
		);
		return false;
	}

	pasteMarkdown(node: NodeInterface) {
		if (!isEngine(this.editor) || !this.markdown || !node.isText()) return;

		const text = node.text();
		const reg = /(^|\r\n|\n)(#{1,6})(.*)/;
		let match = reg.exec(text);
		if (!match) return;

		let newText = '';
		let textNode = node.clone(true).get<Text>()!;

		while (
			textNode.textContent &&
			(match = reg.exec(textNode.textContent))
		) {
			const codeLength = match[2].length;
			//从匹配到的位置切断
			let regNode = textNode.splitText(match.index);
			newText += textNode.textContent;
			//从匹配结束位置分割
			textNode = regNode.splitText(match[0].length);

			newText += `<h${codeLength}>${match[3].trim()}</h${codeLength}>\n`;
		}
		newText += textNode.textContent;

		node.text(newText);
	}

	onBackspace(event: KeyboardEvent) {
		if (!isEngine(this.editor)) return;
		const { change, node } = this.editor;
		const range = change.getRange();
		const blockApi = this.editor.block;
		if (!blockApi.isFirstOffset(range, 'start')) return;
		const block = blockApi.closest(range.startNode);

		if (
			this.tagName.indexOf(block.name) > -1 &&
			node.isEmptyWithTrim(block) &&
			block.parent()?.isEditable()
		) {
			event.preventDefault();
			blockApi.setBlocks('<p />');
			return false;
		}
		if (this.tagName.indexOf(block.name) > -1) {
			event.preventDefault();
			change.mergeAfterDeletePrevNode(block);
			return false;
		}
		return;
	}

	parseHtml(root: NodeInterface) {
		root.find('h1,h2,h3,h4,h5,h6')
			.css({
				padding: '7px 0',
				margin: '0',
				'font-weight': '700',
			})
			.each(node => {
				const element = node as HTMLElement;
				if ('H1' === element.tagName) {
					element.style['font-size'] = '28px';
					element.style['line-height'] = '36px';
				} else if ('H2' === element.tagName) {
					element.style['font-size'] = '24px';
					element.style['line-height'] = '32px';
				} else if ('H3' === element.tagName) {
					element.style['font-size'] = '20px';
					element.style['line-height'] = '28px';
				} else if ('H4' === element.tagName) {
					element.style['font-size'] = '16px';
					element.style['line-height'] = '24px';
				} else if ('H5' === element.tagName) {
					element.style['font-size'] = '14px';
					element.style['line-height'] = '24px';
				} else if ('H6' === element.tagName) {
					element.style['font-size'] = '14px';
					element.style['line-height'] = '24px';
					element.style['font-weight'] = '400';
				}
			});
	}
}

export { Outline, OutlineData };
