<template>
    <div class="data-link-preview">
        <a-tooltip :title="openTitle">
            <a
            class="data-icon data-icon-link data-link-preview-open"
            :href="href"
            target="_blank"
            >
                {{href}}
            </a>
        </a-tooltip>
        <a-tooltip :title="editTitle">
            <a class="data-icon data-icon-edit" @click="onEdit" />
        </a-tooltip>
        <a-tooltip :title="removeTitle">
            <a class="data-icon data-icon-unlink" @click="onRemove" />
        </a-tooltip>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, PropType } from 'vue'
import { LanguageInterface } from '@aomao/engine'
import ATooltip from 'ant-design-vue/es/tooltip'
import 'ant-design-vue/es/tooltip/style';

export default defineComponent({
    name:"am-link-preview",
    components:{
        ATooltip
    },
    props:{
        language:{
            type:Object as PropType<LanguageInterface>,
            required:true
        } as const,
        href:String,
        className:String,
        onEdit:Function as PropType<(event:MouseEvent) => void>,
        onRemove:Function as PropType<(event:MouseEvent) => void>,
        onLoad:Function as PropType<() => void>,
    },
    setup(props){
        const openTitle = props.language.get<string>('link', 'link_open')
        const editTitle = props.language.get<string>('link', 'link_edit')
        const removeTitle = props.language.get<string>('link', 'link_remove')

        onMounted(() => {
            if(props.onLoad) props.onLoad()
        })

        return {
            openTitle,
            editTitle,
            removeTitle
        }
    }
})
</script>