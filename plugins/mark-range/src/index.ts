import {
	$,
	CardEntry,
	DATA_TRANSIENT_ATTRIBUTES,
	isEngine,
	MarkPlugin,
	NodeInterface,
	Parser,
	Range,
	RangeInterface,
	SchemaGlobal,
	SchemaMark,
	Selection,
} from '@aomao/engine';
import { Path } from 'sharedb';

export type Options = {
	keys: Array<string>;
	hotkey?: string | Array<string>;
	onChange?: (
		addIds: { [key: string]: Array<string> },
		removeIds: { [key: string]: Array<string> },
		ids: { [key: string]: Array<string> },
	) => void;
	onSelect?: (
		range: RangeInterface,
		selectInfo?: { key: string; id: string },
	) => void;
};

const PLUGIN_NAME = 'mark-range';

export default class extends MarkPlugin<Options> {
	private range?: RangeInterface;
	private isCachePreview: boolean = false;
	private executeBySelf: boolean = false;
	private MARK_KEY = `data-mark-key`;
	private ids: { [key: string]: Array<string> } = {};

	readonly followStyle: boolean = false;

	readonly copyOnEnter: boolean = false;

	static get pluginName() {
		return PLUGIN_NAME;
	}

	tagName = 'span';

	combineValueByWrap = true;

	getIdName(key: string) {
		return `data-${key}-id`;
	}

	getPreviewName(key: string) {
		return `data-${key}-preview`;
	}

	init() {
		super.init();
		const globals: Array<SchemaGlobal> = [];
		this.options.keys.forEach(key => {
			globals.push(
				{
					type: 'block',
					attributes: {
						[this.getIdName(key)]: '*',
						[this.MARK_KEY]: key,
					},
				},
				{
					type: 'inline',
					attributes: {
						[this.getIdName(key)]: '*',
						[this.MARK_KEY]: key,
					},
				},
			);
		});
		this.editor.schema.add(globals);
		this.editor.on('beforeCommandExecute', (name: string) => {
			this.executeBySelf = name === PLUGIN_NAME;
		});
		this.editor.on('afterCommandExecute', (name: string) => {
			this.executeBySelf = false;
		});

		if (isEngine(this.editor)) {
			const { change } = this.editor;
			this.editor.on('change', () => {
				this.triggerChange();
			});
			this.editor.on('select', () => this.onSelectionChange());
			this.editor.on('paser:value', (node, atts) => {
				const key = node.attributes(this.MARK_KEY);
				if (!!key) {
					atts[DATA_TRANSIENT_ATTRIBUTES] = this.getPreviewName(key);
				}
			});
			this.editor.on('afterSetValue', () => {
				this.range = change.getRange();
				this.ids = this.getIds();
			});
		} else {
			this.editor.container.document?.addEventListener(
				'selectionchange',
				() => this.onSelectionChange(),
			);
		}
	}

	schema() {
		const rules: Array<SchemaMark> = this.options.keys.map(key => {
			return {
				name: 'span',
				type: 'mark',
				attributes: {
					[this.MARK_KEY]: {
						required: true,
						value: key,
					},
					[this.getIdName(key)]: '*',
				},
			};
		});
		return rules;
	}
	/**
	 * 获取当前选择的标记id
	 * @param range 光标
	 * @param strict 是否严格模式
	 * @returns
	 */
	getSelectInfo(range: RangeInterface, strict?: boolean) {
		const { card } = this.editor;
		const cloneRange = range
			.cloneRange()
			.shrinkToElementNode()
			.shrinkToTextNode();
		const {
			startNode,
			startOffset,
			endNode,
			endOffset,
			collapsed,
		} = cloneRange;
		let startMark = startNode.closest(`[${this.MARK_KEY}]`);
		const startChild = startNode.children().eq(startOffset);
		//如果选择是块级卡片就选择在卡片根节点
		if (startNode.type === Node.ELEMENT_NODE && startChild?.isBlockCard()) {
			startMark = startChild;
		} else {
			const cardMark = card.find(startMark);
			if (
				cardMark &&
				!cardMark.isEditable &&
				cardMark.root.isBlockCard()
			) {
				startMark = cardMark.root;
			}
		}
		let key = startMark.attributes(this.MARK_KEY);
		//获取节点标记ID
		const startId = startMark.attributes(this.getIdName(key));
		//设置当前选中的标记ID
		let selectId: string | undefined = !!startId ? startId : undefined;

		//不是重合状态，并且开始节点不是块级卡片
		if (!collapsed && !!startId && !startMark.isBlockCard()) {
			let endMark = endNode.closest(`[${this.MARK_KEY}]`);
			const endKey = endMark.attributes(this.MARK_KEY);
			const endChild = endNode.children().eq(endOffset);
			//如果选择是块级卡片就选择在卡片根节点
			if (endNode.type === Node.ELEMENT_NODE && endChild?.isBlockCard()) {
				endMark = endChild;
			}
			const endId = endMark.attributes(this.getIdName(key));
			//需要两端都是同一类型同一个id才需要显示
			if (key === endKey && startId === endId) {
				selectId = startId;
				//严格模式，开始节点和结束节点需要在节点内的两侧
				if (strict) {
					const strictRange = Range.from(this.editor)?.cloneRange();
					strictRange?.setStart(startMark, 0);
					strictRange?.setEnd(
						endMark,
						endMark.isText()
							? endMark.text().length
							: endMark.children().length,
					);
					if (
						!strictRange
							?.shrinkToElementNode()
							.shrinkToTextNode()
							?.equal(cloneRange)
					)
						selectId = undefined;
				}
			} else selectId = undefined;
		}
		return selectId
			? {
					key,
					id: selectId.split(',')[0],
			  }
			: undefined;
	}
	/**
	 * 根据编号获取所有节点
	 * @param key 标记类型
	 * @param id 编号
	 * @returns
	 */
	findElements(key: string, id: string) {
		const { container } = this.editor;
		const elements: Array<NodeInterface> = [];
		container.find(`[${this.getIdName(key)}]`).each(markNode => {
			const mark = $(markNode);
			const ids = mark
				.attributes(this.getIdName(key))
				.trim()
				.split(',');
			if (ids.indexOf(id) > -1) elements.push(mark);
		});
		return elements;
	}
	/**
	 * 预览
	 * @param id 标记id，否则预览当前光标位置
	 */
	preview(key: string, id?: string) {
		if (id) {
			const elements = this.findElements(key, id);
			elements.forEach(markNode => {
				markNode.attributes(
					DATA_TRANSIENT_ATTRIBUTES,
					this.getPreviewName(key),
				);
				markNode.attributes(this.getPreviewName(key), 'true');
			});
		} else if (this.range) {
			const { onSelect } = this.options;
			const { block, node, card } = this.editor;
			let range = this.range;
			//光标重合时，选择整个block块
			if (range.collapsed) {
				const blockNode = block.closest(range.startNode);
				if (!node.isBlock(blockNode)) return;
				range.select(blockNode, true);
				if (isEngine(this.editor)) {
					this.editor.change.select(range);
				}
			}
			const selectInfo = this.getSelectInfo(range, true);
			//当前光标已存在标记
			if (selectInfo && selectInfo.key === key) {
				//触发选择
				if (onSelect) onSelect(range, selectInfo);
				return;
			}
			//包裹标记预览样式
			this.editor.mark.wrap(
				`<${this.tagName} ${
					this.MARK_KEY
				}="${key}" ${this.getPreviewName(key)}="true" />`,
				range,
			);
			//遍历当前光标选择节点，拼接选择的文本
			let text = '';
			const subRanges = range.getSubRanges(true);
			subRanges.forEach(subRange => {
				//如果是卡片，就给卡片加上预览样式
				const cardComponent = card.find(subRange.startNode);
				if (cardComponent) {
					text += `[card:${
						(cardComponent.constructor as CardEntry).cardName
					},${cardComponent.id}]`;
					if (cardComponent.root.attributes(this.getIdName(key)))
						return;
					cardComponent.root.attributes(this.MARK_KEY, key);
					cardComponent.root.attributes(
						this.getPreviewName(key),
						'true',
					);
				} else {
					text += subRange.getText();
				}
			});
			return text;
		}
		return;
	}

	/**
	 * 应用标记样式到编辑器
	 * @param 标记类型
	 * @param id
	 */
	apply(key: string, id: string) {
		//遍历预览节点
		this.editor.container
			.find(`[${this.getPreviewName(key)}]`)
			.each(markNode => {
				const mark = $(markNode);
				//获取旧id
				const oldIds = mark
					.attributes(this.getIdName(key))
					.trim()
					.split(',');
				//组合新的id串
				let ids: Array<string> = [];
				if (oldIds[0] === '') oldIds.splice(0, 1);
				//范围大的id放在后面
				if (oldIds.length > 0) {
					for (let i = 0; i < oldIds.length; i++) {
						const oldId = oldIds[i];
						//判断之前旧的id对应光标位置是否包含当前节点
						const parent = markNode.parentElement;
						if (
							parent &&
							oldIds.indexOf(id) < 0 &&
							ids.indexOf(id) < 0
						) {
							const elements = this.findElements(key, oldId);
							const oldRange = Range.from(
								this.editor,
							)?.cloneRange();
							if (!oldRange || elements.length === 0) continue;
							const oldBegin = oldRange
								.select(elements[0], true)
								.collapse(true)
								.cloneRange();
							const oldEnd = oldRange
								.select(elements[elements.length - 1], true)
								.collapse(false)
								.cloneRange();
							oldRange.setStart(
								oldBegin.startContainer,
								oldBegin.startOffset,
							);
							oldRange.setEnd(
								oldEnd.endContainer,
								oldEnd.endOffset,
							);
							const reuslt = oldRange.comparePoint(
								parent,
								mark.index(),
							);
							if (reuslt >= 0) {
								ids.push(id);
								ids = ids.concat(oldIds.slice(i));
								break;
							}
						}
						ids.push(oldId);
					}
					//未增加就驾到末尾
					if (
						ids.length === oldIds.length &&
						oldIds.indexOf(id) < 0
					) {
						ids.push(id);
					}
				} else {
					ids.push(id);
				}
				mark.attributes(
					DATA_TRANSIENT_ATTRIBUTES,
					this.getPreviewName(key),
				);
				//设置新的id串
				mark.attributes(this.getIdName(key), ids.join(','));
				mark.removeAttributes(this.getPreviewName(key));
			});
	}
	/**
	 * 遗弃预览项
	 * @param key 标记类型
	 * @param id 编号，不传编号则遗弃所有预览项
	 */
	revoke(key: string, id?: string) {
		const { node } = this.editor;
		let elements: Array<NodeInterface | Node> = [];
		if (id) elements = this.findElements(key, id);
		else
			elements = this.editor.container
				.find(`[${this.getPreviewName(key)}]`)
				.toArray();
		//遍历预览节点
		elements.forEach(markNode => {
			const mark = $(markNode);
			//获取旧id传
			const oldIds = mark
				.attributes(this.getIdName(key))
				.trim()
				.split(',');
			if (oldIds[0] === '') oldIds.splice(0, 1);
			//如果没有id，移除标记样式包裹
			if (oldIds.length === 0) {
				if (mark.isCard()) {
					mark.removeAttributes(this.MARK_KEY);
					mark.removeAttributes(this.getPreviewName(key));
				} else {
					node.unwrap(mark);
				}
			} else {
				//移除预览样式
				mark.removeAttributes(this.getPreviewName(key));
			}
		});
	}
	/**
	 * 移除标识
	 * @param key 标记类型
	 * @param id 编号
	 */
	remove(key: string, id: string) {
		const { node } = this.editor;

		const elements: Array<NodeInterface | Node> = this.findElements(
			key,
			id,
		);

		//遍历节点
		elements.forEach(markNode => {
			const mark = $(markNode);
			//获取旧id传
			const oldIds = mark
				.attributes(this.getIdName(key))
				.trim()
				.split(',');
			if (oldIds[0] === '') oldIds.splice(0, 1);
			//移除标记样式包裹
			if (oldIds.length === 1 && !!oldIds.find(i => i === id)) {
				if (mark.isCard()) {
					mark.removeAttributes(this.MARK_KEY);
					mark.removeAttributes(this.getIdName(key));
					mark.removeAttributes(this.getPreviewName(key));
				} else {
					node.unwrap(mark);
				}
			} else {
				//移除预览样式
				mark.removeAttributes(this.getPreviewName(key));
				//移除id
				const index = oldIds.findIndex(i => i === id);
				oldIds.splice(index, 1);
				mark.attributes(this.getIdName(key), oldIds.join(','));
			}
		});
	}

	hotkey() {
		return this.options.hotkey || '';
	}

	execute(key: string, action: string, ...args: any): any {
		const history = isEngine(this.editor) ? this.editor.history : undefined;
		const id = args[0];
		switch (action) {
			case 'preview':
				if (!id) {
					this.isCachePreview = true;
					//编辑模式，开始缓存当前操作
					history?.startCache();
				}
				const reuslt = this.preview(key, id);
				//没有预览成功关闭缓存
				if (!reuslt) {
					this.isCachePreview = false;
					history?.destroyCache();
				}
				return reuslt;
			case 'apply':
				if (!id) return;
				//锁住30毫秒不产生历史记录
				history?.lock(30);
				this.apply(key, id);
				//提交操作缓存，这里会在20毫秒后执行
				history?.submitCache();
				break;
			case 'revoke':
				this.revoke(key, id);
				history?.destroyCache();
				break;
			case 'find':
				if (!id) return [];
				return this.findElements(key, id);
			case 'remove':
				if (!id) return;
				history?.lock();
				this.remove(key, id);
				break;
			case 'filter':
				return this.filterValue(key, id);
			case 'wrap':
				const value = args[1];
				return this.wrapFromPath(key, id, value);
		}
	}

	getIds() {
		const ids: { [key: string]: Array<string> } = {};
		this.editor.container.find(`[${this.MARK_KEY}]`).each(markNode => {
			const mark = $(markNode);
			const key = mark.attributes(this.MARK_KEY);
			const idArray = mark.attributes(this.getIdName(key)).split(',');
			idArray.forEach(id => {
				if (!!id) {
					if (!ids[key]) ids[key] = [];
					if (ids[key].indexOf(id) < 0) ids[key].push(id);
				}
			});
		});
		return ids;
	}

	/**
	 * 光标选择改变触发
	 * @returns
	 */
	onSelectionChange() {
		if (this.executeBySelf) return;
		const { window } = this.editor.container;
		const selection = window?.getSelection();

		if (!selection) return;
		const range = Range.from(this.editor, selection);
		if (!range) return;
		const { onSelect } = this.options;

		if (isEngine(this.editor) && this.isCachePreview) {
			this.editor.history.destroyCache();
			this.isCachePreview = false;
		}

		//不在编辑器内
		if (
			!$(range.getStartOffsetNode()).inEditor() ||
			!$(range.getEndOffsetNode()).inEditor()
		) {
			if (onSelect) onSelect(range);
			this.range = undefined;
			return;
		}

		this.triggerChange();

		const selectInfo = this.getSelectInfo(range, true);
		if (onSelect) onSelect(range, selectInfo);

		this.range = range;
	}

	triggerChange() {
		const { onChange } = this.options;
		const addIds: { [key: string]: Array<string> } = {};
		const removeIds: { [key: string]: Array<string> } = {};
		const ids = this.getIds();
		this.options.keys.forEach(key => {
			const prevIds = this.ids[key] || [];
			const curIds = ids[key] || [];
			curIds.forEach(id => {
				if (prevIds.indexOf(id) < 0) {
					if (!addIds[key]) addIds[key] = [];
					addIds[key].push(id);
				}
			});
			prevIds.forEach(id => {
				if (curIds.indexOf(id) < 0) {
					if (!removeIds[key]) removeIds[key] = [];
					removeIds[key].push(id);
				}
			});
		});
		this.ids = ids;
		if (onChange) onChange(addIds, removeIds, ids);
	}

	/**
	 * 过滤标记样式，并返回每个样式的路径
	 * @param value 编辑器值
	 * @returns 过滤后的值和路径
	 */
	filterValue(
		key: string,
		value?: string,
	): {
		value: string;
		paths: Array<{ id: Array<string>; path: Array<Path> }>;
	} {
		const { node, card } = this.editor;
		const container = this.editor.container.clone(value ? false : true);
		container.css({
			position: 'fixed',
			top: 0,
			clip: 'rect(0, 0, 0, 0)',
		});
		$(document.body).append(container);
		if (value) container.html(value);

		card.render(container);

		const selection = container.window?.getSelection();
		const range = selection
			? Range.from(this.editor, selection) || Range.create(this.editor)
			: Range.create(this.editor);

		const parser = new Parser(container, this.editor);
		const { schema, conversion } = this.editor;
		if (!range) {
			container.remove();
			return {
				value: value ? value : parser.toValue(schema, conversion),
				paths: [],
			};
		}
		range.select(container, true).collapse(true);

		const paths: Array<{ id: Array<string>; path: Array<Path> }> = [];
		container.traverse(childNode => {
			const id = childNode.attributes(this.getIdName(key));
			if (!!id) {
				const rangeClone = range.cloneRange();

				if (childNode.isCard()) {
					rangeClone.select(childNode);
					childNode.removeAttributes(this.getIdName(key));
				} else {
					rangeClone.select(childNode, true);
					const selection = rangeClone.createSelection();
					node.unwrap(childNode);
					selection.move();
				}
				paths.push({
					id: id.split(','),
					path: rangeClone
						.shrinkToElementNode()
						.shrinkToTextNode()
						.toPath(),
				});
			}
		}, false);

		value = parser.toValue(schema, conversion);
		container.remove();
		return {
			value,
			paths,
		};
	}
	/**
	 * 从标记样式路径还原包裹编辑器值
	 * @param paths 标记样式路径
	 * @param value 编辑器值
	 * @returns
	 */
	wrapFromPath(
		key: string,
		paths: Array<{ id: Array<string>; path: Array<Path> }>,
		value?: string,
	): string {
		const { card } = this.editor;
		const container = this.editor.container.clone(value ? false : true);
		if (value) value = Selection.removeTags(value);
		container.css({
			position: 'fixed',
			top: 0,
			clip: 'rect(0, 0, 0, 0)',
		});
		$(document.body).append(container);
		if (value) container.html(value);

		card.render(container);
		const selection = container.window?.getSelection();
		const range = selection
			? Range.from(this.editor, selection) || Range.create(this.editor)
			: Range.create(this.editor);

		const parser = new Parser(container, this.editor);
		const { schema, conversion } = this.editor;
		if (!range) {
			container.remove();
			return value ? value : parser.toValue(schema, conversion);
		}

		range.select(container, true).collapse(true);

		(paths || []).forEach(({ id, path }) => {
			const pathRange = Range.fromPath(this.editor, path, container);
			const elements = pathRange.findElementsInSimpleRange();
			elements.forEach(element => {
				const node = $(element);
				if (node.isCard()) {
					node.attributes(this.getIdName(key), id.join(','));
				}
			});
			this.editor.mark.wrap(
				`<${this.tagName} ${this.MARK_KEY}="${key}" ${this.getIdName(
					key,
				)}="${id.join(',')}" />`,
				pathRange,
			);
		});
		value = parser.toValue(schema, conversion);
		container.remove();
		return value;
	}
}
