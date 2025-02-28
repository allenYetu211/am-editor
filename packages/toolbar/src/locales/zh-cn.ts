import { isMacos } from '@aomao/engine';

export default {
	toolbar: {
		collapse: {
			title: `输入  <code>${
				isMacos ? '⌘' : 'Ctrl'
			}</code> + <code>/</code>  快速插入卡片`,
		},
		undo: {
			title: '撤销',
		},
		redo: {
			title: '重做',
		},
		paintformat: {
			title: '格式刷',
		},
		removeformat: {
			title: '清除格式',
		},
		heading: {
			title: '正文与标题',
			p: '正文',
			h1: '标题 1',
			h2: '标题 2',
			h3: '标题 3',
			h4: '标题 4',
			h5: '标题 5',
			h6: '标题 6',
		},
		fontsize: {
			title: '字号',
		},
		fontcolor: {
			title: '字体颜色',
			more: '更多颜色',
		},
		backcolor: {
			title: '背景颜色',
			more: '更多颜色',
		},
		bold: {
			title: '粗体',
		},
		italic: {
			title: '斜体',
		},
		strikethrough: {
			title: '删除线',
		},
		underline: {
			title: '下划线',
		},
		moremark: {
			title: '更多文本样式',
			sup: '上标',
			sub: '下标',
			code: '行内代码',
		},
		alignment: {
			title: '对齐方式',
			left: '左对齐',
			center: '居中对齐',
			right: '右对齐',
			justify: '两端对齐',
		},
		unorderedlist: {
			title: '无序列表',
		},
		orderedlist: {
			title: '有序列表',
		},
		tasklist: {
			title: '任务列表',
		},
		indent: {
			title: '缩进',
			in: '增加缩进',
			out: '减少缩进',
		},
		link: {
			title: '链接',
		},
		quote: {
			title: '插入引用',
		},
		hr: {
			title: '插入分割线',
		},
		colorPicker: {
			defaultText: '默认',
			nonFillText: '无填充色',
			'#000000': '黑色',
			'#262626': '深灰 3',
			'#595959': '深灰 2',
			'#8C8C8C': '深灰 1',
			'#BFBFBF': '灰色',
			'#D9D9D9': '浅灰 4',
			'#E9E9E9': '浅灰 3',
			'#F5F5F5': '浅灰 2',
			'#FAFAFA': '浅灰 1',
			'#FFFFFF': '白色',
			'#F5222D': '红色',
			'#FA541C': '朱红',
			'#FA8C16': '橙色',
			'#FADB14': '黄色',
			'#52C41A': '绿色',
			'#13C2C2': '青色',
			'#1890FF': '浅蓝',
			'#2F54EB': '蓝色',
			'#722ED1': '紫色',
			'#EB2F96': '玫红',
			'#FFE8E6': '红色 1',
			'#FFECE0': '朱红 1',
			'#FFEFD1': '橙色 1',
			'#FCFCCA': '黄色 1',
			'#E4F7D2': '绿色 1',
			'#D3F5F0': '青色 1',
			'#D4EEFC': '浅蓝 1',
			'#DEE8FC': '蓝色 1',
			'#EFE1FA': '紫色 1',
			'#FAE1EB': '玫红 1',
			'#FFA39E': '红色 2',
			'#FFBB96': '朱红 2',
			'#FFD591': '橙色 2',
			'#FFFB8F': '黄色 2',
			'#B7EB8F': '绿色 2',
			'#87E8DE': '青色 2',
			'#91D5FF': '浅蓝 2',
			'#ADC6FF': '蓝色 2',
			'#D3ADF7': '紫色 2',
			'#FFADD2': '玫红 2',
			'#FF4D4F': '红色 3',
			'#FF7A45': '朱红 3',
			'#FFA940': '橙色 3',
			'#FFEC3D': '黄色 3',
			'#73D13D': '绿色 3',
			'#36CFC9': '青色 3',
			'#40A9FF': '浅蓝 3',
			'#597EF7': '蓝色 3',
			'#9254DE': '紫色 3',
			'#F759AB': '玫红 3',
			'#CF1322': '红色 4',
			'#D4380D': '朱红 4',
			'#D46B08': '橙色 4',
			'#D4B106': '黄色 4',
			'#389E0D': '绿色 4',
			'#08979C': '青色 4',
			'#096DD9': '浅蓝 4',
			'#1D39C4': '蓝色 4',
			'#531DAB': '紫色 4',
			'#C41D7F': '玫红 4',
			'#820014': '红色 5',
			'#871400': '朱红 5',
			'#873800': '橙色 5',
			'#614700': '黄色 5',
			'#135200': '绿色 5',
			'#00474F': '青色 5',
			'#003A8C': '浅蓝 5',
			'#061178': '蓝色 5',
			'#22075E': '紫色 5',
			'#780650': '玫红 5',
		},
		component: {
			placeholder: '卡片名称',
		},
		image: {
			title: '图片',
		},
		codeblock: {
			title: '代码块',
		},
		table: {
			title: '表格',
		},
		file: {
			title: '附件',
		},
		video: {
			title: '视频',
		},
		math: {
			title: '公式',
		},
		commonlyUsed: {
			title: '常用',
		},
	},
};
