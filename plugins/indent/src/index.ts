import {
	addUnit,
	isEngine,
	NodeInterface,
	Plugin,
	PluginEntry,
	removeUnit,
	SchemaGlobal,
} from '@aomao/engine';

export type Options = {
	hotkey?: {
		in?: string;
		out?: string;
	};
	maxPadding?: number;
};

export default class extends Plugin<Options> {
	static get pluginName() {
		return 'indent';
	}

	init() {
		this.editor.schema.add(this.schema());
		this.editor.on('keydown:backspace', event => this.onBackspace(event));
		this.editor.on('keydown:tab', event => this.onTab(event));
		this.editor.on('keydown:shift-tab', event => this.onShiftTab(event));
	}

	execute(type: 'in' | 'out' = 'in', isTab: boolean = false) {
		if (!isEngine(this.editor)) return;
		const { change, list, block } = this.editor;
		list.split();
		const range = change.getRange();
		const blocks = block.findBlocks(range);
		// 没找到目标 block
		if (!blocks) {
			return;
		}
		const maxPadding = this.options.maxPadding || 50;
		// 其它情况
		blocks.forEach(block => {
			this.addPadding(block, type === 'in' ? 2 : -2, isTab, maxPadding);
		});
		list.merge();
	}

	queryState() {
		if (!isEngine(this.editor)) return;
		const { change, list, node } = this.editor;
		const range = change.getRange();
		const block = this.editor.block.closest(range.startNode);
		if (block.name === 'li') {
			return list.getIndent(block.closest('ul,ol'));
		}

		if (node.isRootBlock(block) || node.isSimpleBlock(block)) {
			const padding = removeUnit(block.css('padding-left'));
			const textIndent = removeUnit(
				block.get<HTMLElement>()?.style.textIndent || '',
			);
			return padding || textIndent;
		}
		return 0;
	}

	addPadding(
		block: NodeInterface,
		padding: number,
		isTab: boolean,
		maxPadding: number,
	) {
		const { list, node } = this.editor;
		if (block.name === 'li') return;
		if (node.isList(block)) {
			list.addIndent(block, padding, maxPadding);
		} else if (node.isRootBlock(block) || node.isSimpleBlock(block)) {
			if (padding > 0) {
				if (removeUnit(block.css('text-indent')) || isTab !== true) {
					const currentValue = block.css('padding-left');
					let newValue = removeUnit(currentValue) + padding;
					newValue = Math.min(newValue, maxPadding);
					node.setAttributes(block, {
						style: {
							'padding-left': addUnit(
								newValue > 0 ? newValue : 0,
								'em',
							),
						},
					});
				} else {
					node.setAttributes(block, {
						style: {
							'text-indent': '2em',
						},
					});
				}
			} else if (removeUnit(block.css('text-indent'))) {
				node.setAttributes(block, {
					style: {
						'text-indent': '',
					},
				});
			} else {
				const currentValue = block.css('padding-left');
				const newValue = removeUnit(currentValue) + padding;
				node.setAttributes(block, {
					style: {
						'padding-left': addUnit(
							newValue > 0 ? newValue : 0,
							'em',
						),
					},
				});
			}
		}
	}

	hotkey() {
		const inHotkey = this.options.hotkey?.in || 'mod+]';
		const outHotkey = this.options.hotkey?.out || 'mod+[';
		return [
			{ key: inHotkey, args: 'in' },
			{ key: outHotkey, args: 'out' },
		];
	}

	schema(): SchemaGlobal {
		return {
			type: 'block',
			attributes: {
				style: {
					'text-indent': '@length',
					'padding-left': '@length',
				},
			},
		};
	}

	onBackspace(event: KeyboardEvent) {
		if (!isEngine(this.editor)) return;
		const { change, list } = this.editor;
		let range = change.getRange();
		const block = this.editor.block.closest(range.startNode);
		if (range.collapsed && 'li' === block.name && !list.isFirst(range)) {
			return;
		}
		if (this.queryState()) {
			event.preventDefault();
			this.editor.command.execute(
				(this.constructor as PluginEntry).pluginName,
				'out',
			);
			return false;
		}
		return;
	}

	onTab(event: KeyboardEvent) {
		if (!isEngine(this.editor)) return;
		const { change, list, block } = this.editor;
		const range = change.getRange();
		//列表
		if (range.collapsed && list.isFirst(range)) {
			event.preventDefault();
			this.editor.command.execute(
				(this.constructor as PluginEntry).pluginName,
				'in',
			);
			return false;
		}
		// <p><cursor />foo</p>
		if (!range.collapsed || block.isFirstOffset(range, 'start')) {
			event.preventDefault();
			this.editor.command.execute(
				(this.constructor as PluginEntry).pluginName,
				'in',
				true,
			);
			return false;
		}
		return;
	}

	onShiftTab(event: KeyboardEvent) {
		if (!isEngine(this.editor)) return;
		event.preventDefault();
		this.editor.command.execute(
			(this.constructor as PluginEntry).pluginName,
			'out',
		);
		return false;
	}
}
