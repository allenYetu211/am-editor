import { EngineInterface } from '@aomao/engine';
import { ExtractPropTypes, PropType, VNode } from 'vue';
import { omit } from 'lodash-es';

//命令
export type Command =
	| { name: string; args: Array<any> }
	| Array<any>
	| undefined;
//tooltip 位置
export type Placement =
	| 'top'
	| 'left'
	| 'right'
	| 'bottom'
	| 'topLeft'
	| 'topRight'
	| 'bottomLeft'
	| 'bottomRight'
	| 'leftTop'
	| 'leftBottom'
	| 'rightTop'
	| 'rightBottom';
//按钮
export const buttonProps = {
	engine: Object as PropType<EngineInterface | undefined>,
	name: {
		type: String,
		required: true,
	} as const,
	icon: String,
	content: [String, Function] as PropType<string | (() => string) | VNode>,
	title: String,
	placement: String as PropType<Placement>,
	hotkey: [String, Object] as PropType<boolean | string | undefined>,
	command: Object as PropType<Command>,
	autoExecute: [Boolean, undefined] as PropType<boolean | undefined>,
	className: String,
	active: [Boolean, undefined] as PropType<boolean | undefined>,
	disabled: [Boolean, undefined] as PropType<boolean | undefined>,
	onClick: Function as PropType<(event: MouseEvent) => void | boolean>,
	onMouseDown: Function as PropType<(event: MouseEvent) => void | boolean>,
	onMouseEnter: Function as PropType<(event: MouseEvent) => void | boolean>,
	onMouseLevel: Function as PropType<(event: MouseEvent) => void | boolean>,
};

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;
//增加type
export type GroupButtonProps = {
	type: 'button';
	values?: any;
} & Omit<ButtonProps, 'engine'>;
//下拉项
export type DropdownListItem = {
	key: string;
	icon?: string;
	content?: string | (() => string);
	hotkey?: boolean | string;
	isDefault?: boolean;
	title?: string;
	placement?: Placement;
	className?: string;
	command?: { name: string; args: Array<any> } | Array<any>;
	autoExecute?: boolean;
};
//下拉列表
export const dropdownListProps = {
	engine: Object as PropType<EngineInterface | undefined>,
	name: {
		type: String,
		required: true,
	} as const,
	direction: String as PropType<'vertical' | 'horizontal'>,
	items: {
		type: Array as PropType<Array<DropdownListItem>>,
		required: true,
	} as const,
	values: {
		type: [String, Array, Number] as PropType<
			string | number | Array<string>
		>,
		required: true,
	} as const,
	className: String,
	onSelect: Function as PropType<
		(event: MouseEvent, key: string) => void | boolean
	>,
	hasDot: [Boolean, undefined] as PropType<boolean | undefined>,
};
export type DropdownListProps = ExtractPropTypes<typeof dropdownListProps>;
//下拉
export const dropdownProps = {
	engine: Object as PropType<EngineInterface | undefined>,
	name: {
		type: String,
		required: true,
	} as const,
	values: [String, Array, Number] as PropType<
		string | number | Array<string>
	>,
	items: {
		type: Array as PropType<Array<DropdownListItem>>,
		default: [],
	} as const,
	icon: String,
	content: [String, Function] as PropType<string | (() => string)>,
	title: String,
	disabled: [Boolean, undefined] as PropType<boolean | undefined>,
	single: [Boolean, undefined] as PropType<boolean | undefined>,
	className: String,
	direction: String as PropType<'vertical' | 'horizontal'>,
	onSelect: Function as PropType<
		(event: MouseEvent, key: string) => void | boolean
	>,
	hasArrow: [Boolean, undefined] as PropType<boolean | undefined>,
	hasDot: [Boolean, undefined] as PropType<boolean | undefined>,
};
export type DropdownProps = ExtractPropTypes<typeof dropdownProps>;

export type GroupDropdownProps = {
	type: 'dropdown';
} & Omit<DropdownProps, 'engine'>;

//颜色
export const colorPickerItemProps = {
	engine: {
		type: Object as PropType<EngineInterface>,
		required: true,
	} as const,
	color: {
		type: String,
		required: true,
	} as const,
	active: Boolean,
	setStroke: [Boolean, undefined] as PropType<boolean | undefined>,
	onSelect: Function as PropType<(color: string, event: MouseEvent) => void>,
};
export type ColorPickerItemProps = ExtractPropTypes<
	typeof colorPickerItemProps
>;
//颜色分组
export const colorPickerGroupProps = {
	engine: colorPickerItemProps.engine,
	colors: {
		type: Array as PropType<Array<{ value: string; active: boolean }>>,
		required: true,
	} as const,
	setStroke: colorPickerItemProps.setStroke,
	onSelect: colorPickerItemProps.onSelect,
};

export type ColorPickerGroupProps = ExtractPropTypes<
	typeof colorPickerGroupProps
>;

//picker
export const colorPickerProps = {
	engine: colorPickerGroupProps.engine,
	colors: Array as PropType<Array<Array<string>>>,
	defaultColor: {
		type: String,
		required: true,
	} as const,
	defaultActiveColor: {
		type: String,
		required: true,
	} as const,
	setStroke: colorPickerGroupProps.setStroke,
	onSelect: colorPickerItemProps.onSelect,
};
export type ColorPickerProps = ExtractPropTypes<typeof colorPickerProps>;
//color
export const colorProps = {
	engine: buttonProps.engine,
	name: buttonProps.name,
	content: {
		type: [String, Function] as PropType<
			| string
			| ((color: string, stroke: string, disabled?: boolean) => string)
		>,
		required: true,
	} as const,
	buttonTitle: String,
	dropdownTitle: String,
	command: buttonProps.command,
	autoExecute: buttonProps.autoExecute,
	disabled: buttonProps.disabled,
	...omit(colorPickerProps, 'engine'),
};
export type ColorProps = ExtractPropTypes<typeof colorProps>;

export type GroupColorProps = {
	type: 'color';
} & Omit<ColorProps, 'engine'>;

//collapse item
export const collapseItemProps = {
	name: buttonProps.name,
	engine: buttonProps.engine,
	icon: buttonProps.icon,
	title: buttonProps.title,
	search: {
		type: String,
		required: true,
	} as const,
	description: buttonProps.content,
	prompt: buttonProps.content,
	command: buttonProps.command,
	autoExecute: buttonProps.autoExecute,
	className: buttonProps.className,
	placement: buttonProps.placement,
	onClick: Function as PropType<
		(event: MouseEvent, name: string) => boolean | void
	>,
	onMouseDown: Function as PropType<(event: MouseEvent) => void>,
};
export type CollapseItemProps = ExtractPropTypes<typeof collapseItemProps>;

//collapse group
export const collapseGroupProps = {
	engine: buttonProps.engine,
	title: String,
	items: {
		type: Array as PropType<Array<Omit<CollapseItemProps, 'engine'>>>,
		required: true,
	} as const,
	onSelect: collapseItemProps.onClick,
};
export type CollapseGroupProps = ExtractPropTypes<typeof collapseGroupProps>;
//collapse
export const collapseProps = {
	engine: collapseGroupProps.engine,
	header: String,
	groups: {
		type: Array as PropType<Array<CollapseGroupProps>>,
		required: true,
	} as const,
	className: collapseItemProps.className,
	icon: collapseItemProps.icon,
	content: buttonProps.content,
	onSelect: collapseGroupProps.onSelect,
};
export type CollapseProps = ExtractPropTypes<typeof collapseProps>;

export type ToolbarCollapseGroupProps = {
	type: 'collapse';
} & Omit<CollapseProps, 'engine'>;

export const groupProps = {
	engine: {
		type: Object as PropType<EngineInterface>,
		required: true,
	} as const,
	items: {
		type: Array as PropType<
			Array<
				| GroupButtonProps
				| GroupDropdownProps
				| GroupColorProps
				| ToolbarCollapseGroupProps
			>
		>,
		default: [],
	},
	icon: collapseItemProps.icon,
	content: buttonProps.content,
};

export type GroupProps = ExtractPropTypes<typeof groupProps>;

export type ToolbarButtonProps = {
	onActive?: () => boolean;
	onDisabled?: () => boolean;
} & GroupButtonProps;

export type ToolbarDropdownProps = {
	onActive?: () => string | Array<string>;
	onDisabled?: () => boolean;
} & GroupDropdownProps;

export type ToolbarColorProps = {
	onActive?: () => string | Array<string>;
	onDisabled?: () => boolean;
} & GroupColorProps;

export type ToolbarItemProps =
	| ToolbarButtonProps
	| ToolbarDropdownProps
	| ToolbarColorProps
	| ToolbarCollapseGroupProps;

export type GroupItemDataProps = {
	icon?: string;
	content?: string | (() => string) | VNode;
	items: Array<ToolbarItemProps | string>;
};

export type GroupItemProps =
	| Array<ToolbarItemProps | string>
	| GroupItemDataProps;

export type GroupDataProps = Omit<GroupItemDataProps, 'items'> & {
	items: Array<ToolbarItemProps>;
};

export const toolbarProps = {
	engine: {
		type: Object as PropType<EngineInterface>,
		required: true,
	} as const,
	items: {
		type: Array as PropType<Array<GroupItemProps>>,
		default: [],
	},
	className: String,
};

export type ToolbarProps = ExtractPropTypes<typeof toolbarProps>;
