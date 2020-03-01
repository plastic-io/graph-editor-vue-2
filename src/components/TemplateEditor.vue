<template>
    <div>
        <v-toolbar short flat dense>
            <v-toolbar-title>Vue Template</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="save" title="Save">
                <v-icon>mdi-content-save</v-icon>
            </v-btn>
        </v-toolbar>
        <editor
            v-model="value"
            @init="editorInit"
            lang="html"
            :theme="preferences.appearance.theme === 'dark' ? 'twilight' : 'chrome'"
            :width="width + 'px'"
            height="calc(100vh - 96px)"
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
        selectedVector: {
            handler: function () {
                this.setValue();
            },
        },
    },
    mounted() {
        this.setValue();
    },
    methods: {
        save() {
            this.$store.dispatch("updateTemplate", {
                id: this.vector.id,
                value: this.value,
                key: "vue",
            });
        },
        setValue() {
            if (!this.selectedVector) {
                return;
            }
            this.vector = this.selectedVector;
            if (!this.vector) {
                throw new Error("Template editor invoked with no selected vector.");
            }
            this.value = this.vector.template.vue;
        },
        editorInit() {
            require("brace/mode/html"); // eslint-disable-line
            require("brace/ext/language_tools"); // eslint-disable-line
            require("brace/theme/twilight"); // eslint-disable-line
            require("brace/theme/chrome"); // eslint-disable-line
        },
    },
    computed: {
        ...mapState({
            preferences: state => state.preferences,
            selectedVector: state => state.selectedVector,
        }),
    }
};
</script>
<style></style>
