<template>
    <div>
        <editor
            v-model="value"
            @init="editorInit"
            lang="javascript"
            theme="twilight"
            :width="width + 'px'"
            height="calc(100vh - 55px)"
        ></editor>
    </div>
</template>
<script>
import {mapState} from "vuex";
import editor from "vue2-ace-editor";
export default {
    name: "template-editor",
    components: {editor},
    props: {
        width: Number,
    },
    data: () => {
        return {
            value: "",
        };
    },
    watch: {
        graph: {
            handler: function () {
                this.value = this.selectedVectors[0].template.vue;
            },
        },
    },
    mounted() {
        this.value = this.selectedVectors[0].template.vue;
    },
    methods: {
        editorInit() {
            require("brace/mode/javascript"); // eslint-disable-line
            require("brace/ext/language_tools"); // eslint-disable-line
            require("brace/theme/twilight"); // eslint-disable-line
        },
    },
    computed: {
        ...mapState({
            selectedVectors: state => state.selectedVectors,
        }),
    }
};
</script>
<style></style>
