import {
	EngineInterface,
	EventListener,
	TypingHandleInterface,
} from '../../types';
import { $ } from '../../node';

class ShitEnter implements TypingHandleInterface {
	private engine: EngineInterface;
	type: 'keydown' | 'keyup' = 'keydown';
	hotkey: string | string[] | ((event: KeyboardEvent) => boolean) =
		'shift+enter';
	private listeners: Array<EventListener> = [];

	constructor(engine: EngineInterface) {
		this.engine = engine;
	}

	on(listener: EventListener) {
		this.listeners.push(listener);
	}

	off(listener: EventListener) {
		for (let i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i] === listener) {
				this.listeners.splice(i, 1);
				break;
			}
		}
	}

	trigger(event: KeyboardEvent): void {
		const { change, inline, block } = this.engine;
		event.preventDefault();
		const range = change.getRange();
		const br = $('<br />');
		inline.insert(br);
		// Chrome 问题：<h1>foo<br /><cursor /></h1> 时候需要再插入一个 br，否则没有换行效果
		if (block.isLastOffset(range, 'end')) {
			if (!br.next() || br.next()?.name !== 'br') {
				br.after('<br />');
			}
		}
		for (let i = 0; i < this.listeners.length; i++) {
			const listener = this.listeners[i];
			const result = listener(event);
			if (result === false) break;
		}
		if (this.engine.scrollNode)
			this.engine.change
				.getRange()
				.scrollIntoViewIfNeeded(
					this.engine.container,
					this.engine.scrollNode,
				);
	}
	destroy(): void {
		this.listeners = [];
	}
}

export default ShitEnter;
