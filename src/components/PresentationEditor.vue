<template>
    <div @keydown="keydown($event)">
        <v-toolbar short flat dense>
            <v-toolbar-title help-topic="presentationTemplate">
                Presentation
                <span v-if="dirty" title="Unsaved changes">*</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn :loading="saving" @click="save" title="Save">
                <v-icon>mdi-content-save</v-icon>
            </v-btn>
        </v-toolbar>
        <editor
            v-model="value"
            @init="editorInit"
            lang="html"
            :theme="preferences.appearance.theme === 'dark' ? 'twilight' : 'chrome'"
            :width="width + 'px'"
            height="calc(100vh - 145px)"
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
            dirty: false,
            saving: false,
            value: "",
            localGraph: "",
        };
    },
    watch: {
        value: {
            handler: function () {
                if (this.value !== this.localGraph.properties.presentationTemplate) {
                    localStorage.setItem("_cached_presentation_" + this.localGraph.id, this.value);
                    this.dirty = true;
                } else {
                    localStorage.removeItem("_cached_presentation_" + this.localGraph.id);
                    this.dirty = false;
                }
            },
        },
    },
    mounted() {
        this.localGraph = this.graph;
        this.setValue();
    },
    methods: {
        keydown(e) {
            if (e.keyCode === 83 && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.save();
            }
        },
        save() {
            this.$store.dispatch("updateGraphPresentationTemplate", {
                value: this.value,
            });
            this.saving = true;
            localStorage.removeItem("_cached_presentation_" + this.localGraph.id);
            setTimeout(() => {
                this.saving = false;
                this.dirty = false;
            }, 250);
        },
        setValue() {
            if (this.localGraph.properties.presentationTemplate) {
                this.value = this.localGraph.properties.presentationTemplate;
            }
            const cached = localStorage.getItem("_cached_presentation_" + this.localGraph.id);
            if (cached) {
                this.value = cached;
                this.dirty = true;
            }
        },
        editorInit() {
            require(["emmet/emmet"],function (data) { // eslint-disable-line
                window.emmet = data.emmet;
            });
            require("brace/mode/html"); // eslint-disable-line
            require("brace/ext/language_tools"); // eslint-disable-line
            require("brace/theme/twilight"); // eslint-disable-line
            require("brace/theme/chrome"); // eslint-disable-line
        },
    },
    computed: {
        ...mapState({
            graph: state => state.graph,
            preferences: state => state.preferences,
        }),
    }
};
</script>
<style></style>
