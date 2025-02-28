import React from 'react';
import classnames from 'classnames-es-ts';
import Tooltip from 'antd/es/tooltip';
import { EngineInterface, formatHotkey, isMobile } from '@aomao/engine';
import { autoGetHotkey } from '../utils';
import 'antd/es/tooltip/style';

export type DropdownListItem = {
	key: string;
	icon?: React.ReactNode;
	content?: React.ReactNode | (() => React.ReactNode);
	hotkey?: boolean | string;
	isDefault?: boolean;
	title?: string;
	placement?:
		| 'right'
		| 'top'
		| 'left'
		| 'bottom'
		| 'topLeft'
		| 'topRight'
		| 'bottomLeft'
		| 'bottomRight'
		| 'leftTop'
		| 'leftBottom'
		| 'rightTop'
		| 'rightBottom';
	className?: string;
	command?: { name: string; args: Array<any> } | Array<any>;
	autoExecute?: boolean;
};

export type DropdownListProps = {
	engine?: EngineInterface;
	direction?: 'vertical' | 'horizontal';
	name: string;
	items: Array<DropdownListItem>;
	values: string | Array<string>;
	className?: string;
	onSelect?: (event: React.MouseEvent, key: string) => void | boolean;
	hasDot?: boolean;
};

const DropdownList: React.FC<DropdownListProps> = ({
	engine,
	name,
	direction,
	items,
	className,
	onSelect,
	values,
	hasDot,
}) => {
	if (!direction) direction = 'vertical';

	const triggerSelect = (event: React.MouseEvent, key: string) => {
		event.preventDefault();
		event.stopPropagation();
		const item = items.find(item => item.key === key);
		if (!item) return;
		const { autoExecute, command } = item;
		if (onSelect && onSelect(event, key) === false) return;
		if (autoExecute !== false) {
			let commandName = name;
			let commandArgs = [key];
			if (command) {
				if (!Array.isArray(command)) {
					commandName = command.name;
					commandArgs = commandArgs.concat(command.args);
				} else {
					commandArgs = commandArgs.concat(command);
				}
			}
			engine?.command.execute(commandName, ...commandArgs);
		}
	};

	const renderItem = ({
		key,
		title,
		icon,
		content,
		command,
		placement,
		className,
		hotkey,
	}: DropdownListItem) => {
		const renderContent = () => (
			<a
				key={key}
				className={classnames('toolbar-dropdown-list-item', className)}
				onClick={event => {
					return triggerSelect(event, key);
				}}
			>
				{((typeof values === 'string' && values === key) ||
					(Array.isArray(values) && values.indexOf(key) > -1)) &&
					direction !== 'horizontal' &&
					hasDot !== false && (
						<span className="data-icon data-icon-dot"></span>
					)}
				{typeof icon === 'string' ? (
					<span className={`data-icon data-icon-${icon}`} />
				) : (
					icon
				)}
				{typeof content === 'function' ? content() : content}
			</a>
		);
		let titleElement = title ? (
			<div className="toolbar-tooltip-title">{title}</div>
		) : null;
		//默认获取插件的热键
		if (engine && hotkey !== false) {
			hotkey = autoGetHotkey(
				engine,
				command && !Array.isArray(command) ? command.name : name,
				key,
			);
		}
		if (typeof hotkey === 'string' && hotkey !== '') {
			titleElement = (
				<>
					{title}
					<div className="toolbar-tooltip-hotkey">
						{formatHotkey(hotkey)}
					</div>
				</>
			);
		}

		return titleElement && !isMobile ? (
			<Tooltip
				key={`${key}-tooltip`}
				title={titleElement}
				placement={placement || 'right'}
			>
				{renderContent()}
			</Tooltip>
		) : (
			renderContent()
		);
	};

	return (
		<div
			className={classnames(
				'toolbar-dropdown-list',
				`toolbar-dropdown-${direction}`,
				{ 'toolbar-dropdown-dot': hasDot !== false },
				className,
			)}
		>
			{items.map(item => renderItem(item))}
		</div>
	);
};

export default DropdownList;
