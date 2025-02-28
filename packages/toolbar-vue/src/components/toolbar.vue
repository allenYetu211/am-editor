<template>
    <div
    ref="toolbarRef"
    :class="['editor-toolbar', className, {'editor-toolbar-mobile': isMobile }]"
    :style="isMobile ? { top: `${mobileView.top}px` } : {}"
    data-element="ui"
    @mousedown="triggerMouseDown"
    @mouseover="triggerMouseOver"
    @mousemove="triggerMouseMove"
    @contextmenu="triggerContextMenu"
    >
        <div class="editor-toolbar-content">
            <am-group v-for="(group,index) in groups" :key="index" :engine="engine" v-bind="group" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, reactive } from 'vue'
import { merge, omit } from 'lodash-es';
import { isMobile } from '@aomao/engine'
import AmGroup from './group.vue'
import locales from '../locales';
import { getToolbarDefaultConfig } from '../config'
import { GroupDataProps, toolbarProps } from '../types'

export default defineComponent({
    name:"am-toolbar",
    components:{
        AmGroup
    },
    props:toolbarProps,
    setup(props){
        let groups = ref<Array<GroupDataProps>>([])
        const update = () => {
            calcuMobileView()
            const data: Array<GroupDataProps> = [];
            const defaultConfig = getToolbarDefaultConfig(props.engine);
            props.items.forEach(group => {
                const dataGroup: GroupDataProps = { items:[] };
                if(!Array.isArray(group)) {
                    dataGroup.icon = group.icon
                    dataGroup.content = group.content

                    group = group.items
                }
                group.forEach(item => {
                    let customItem = undefined;
                    if (typeof item === 'string') {
                        const defaultItem = defaultConfig.find(config =>
                            item === 'collapse' ? config.type === item : config.type !== 'collapse' && config.name === item,
                        );
                        if (defaultItem) customItem = defaultItem;
                    } else {
                        const defaultItem = defaultConfig.find(config =>
                            item.type === 'collapse' ? config.type === item.type : config.type !== 'collapse' && config.name === item.name,
                        );
                        customItem = merge(defaultItem ? omit(item, 'type') : item, defaultItem);
                    }
                    if (customItem) {
                        if (customItem.type === 'button') {
                            if (customItem.onActive)
                                customItem.active = customItem.onActive();
                            else if (props.engine.command.queryEnabled(customItem.name))
                                customItem.active = props.engine.command.queryState(
                                    customItem.name,
                                );
                        } else if (customItem.type === 'dropdown') {
                            if (customItem.onActive)
                                customItem.values = customItem.onActive();
                            else if (props.engine.command.queryEnabled(customItem.name))
                                customItem.values = props.engine.command.queryState(
                                    customItem.name,
                                );
                        }
                        if (customItem.type !== 'collapse' && customItem.onDisabled) customItem.disabled = customItem.onDisabled();
                        dataGroup.items.push(customItem);
                    }
                });
                if (dataGroup.items.length > 0) data.push(dataGroup);
            });
            groups.value = data
        }

        //移动端浏览器视图信息
        const toolbarRef = ref<HTMLDivElement | null>(null)
        const mobileView = reactive({ top: 0 })
        //计算移动浏览器的视图变化
        const calcuMobileView = () => {
            const rect = toolbarRef.value?.getBoundingClientRect()
            const height = rect?.height || 0
            mobileView.top = global.Math.max(document.body.scrollTop, document.documentElement.scrollTop) + (window.visualViewport.height || 0) - height
        }

        let scrollTimer:NodeJS.Timeout;

        const hideMobileToolbar = () => {
            mobileView.top = -120
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                calcuMobileView()
            }, 200);
        }

        onMounted(() => {
            props.engine.language.add(locales)
            props.engine.on("select",update)
            props.engine.on("change",update)
           
            if(isMobile) {
                document.addEventListener("scroll",hideMobileToolbar)
                visualViewport.addEventListener('resize', calcuMobileView);
                visualViewport.addEventListener('scroll', calcuMobileView);
            }
            update()
        })

        onUnmounted(() => {
            props.engine.off("select",update)
            props.engine.off("change",update)
            if(isMobile){
                document.removeEventListener("scroll",hideMobileToolbar)
                visualViewport.removeEventListener('resize', calcuMobileView);
                visualViewport.removeEventListener('scroll', calcuMobileView);
            }
        })

        return {
            toolbarRef,
            mobileView,
            isMobile,
            groups
        }
    },
    methods:{
        preventDefault(event:MouseEvent){
            event.preventDefault()
        },
        triggerMouseDown(){

        },
        triggerMouseOver(event:MouseEvent){
            this.preventDefault(event)
        },
        triggerMouseMove(event:MouseEvent){
            this.preventDefault(event)
        },
        triggerContextMenu(event:MouseEvent){
            this.preventDefault(event)
        }
    }
})
</script>
<style>
.ant-tooltip .toolbar-tooltip-title {
    font-size: 12px;
    text-align: center;
}

.ant-tooltip .toolbar-tooltip-hotkey {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
}

.editor-toolbar {
    position: relative;
    width: 100%;
    padding:0;
    z-index: 200;
    border-top:1px solid rgba(0,0,0,.05);
    border-bottom: 1px solid rgba(0,0,0,.05);
    user-select: none;
}

.editor-toolbar .editor-toolbar-content {
    position: relative;
    flex-direction: row;
    background: transparent;
    text-align: center;
    width: 100%;
}

.editor-toolbar.editor-toolbar-mobile,.editor-toolbar.editor-toolbar-popover {
    position: absolute;
    left: 0;
    box-shadow: none;
}

.editor-toolbar-mobile .editor-toolbar-content {
    text-align: left;
    padding: 0 12px;
}

.editor-toolbar-mobile .editor-toolbar-group {
    border: 0 none;
    padding: 0;
}

.editor-toolbar-popover .editor-toolbar {
    position: relative;
    box-shadow: none;
    border: 0 none;
    left: 0;
    top: 0;
}

.editor-toolbar-popover {
    border-radius: 3px;
    background: transparent;
}

.editor-toolbar-popover .ant-popover-inner {
    border-radius: 3px;
}

.editor-toolbar-popover .ant-popover-inner-content {
    padding: 2px;
}
</style>