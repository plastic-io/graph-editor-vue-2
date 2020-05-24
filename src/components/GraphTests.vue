<template>
    <div @keydown="keydown($event)">
        <v-toolbar short flat dense>
            <v-toolbar-title help-topic="graphTestsTemplate">
                Tests
                <span v-if="dirty" title="Unsaved changes">*</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="runTests" :loading="running" title="Run Tests">
                <v-icon>mdi-play</v-icon>
            </v-btn>
            <v-btn @click="save" :loading="saving" title="Save">
                <v-icon>mdi-content-save</v-icon>
            </v-btn>
        </v-toolbar>
        <editor
            v-model="value"
            @init="editorInit"
            lang="javascript"
            :theme="preferences.appearance.theme === 'dark' ? 'twilight' : 'chrome'"
            :width="width + 'px'"
            height="calc(100vh - 145px)"
        ></editor>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
import editor from "vue2-ace-editor";
export default {
    name: "graph-tests",
    components: {editor},
    props: {
        width: Number,
    },
    data: () => {
        return {
            localGraph: null,
            dirty: false,
            value: "",
            saving: false,
            running: false,
        };
    },
    watch: {
        value: {
            handler: function () {
                if (this.value !== this.localGraph.properties.graphTests) {
                    localStorage.setItem("_cached_graphTests_" + this.localGraph.id, this.value);
                    this.dirty = true;
                } else {
                    localStorage.removeItem("_cached_graphTests_" + this.localGraph.id);
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
        ...mapActions([
            "runTest",
        ]),
        runTests() {
            this.runTest(this.localGraph.properties.graphTests);
        },
        keydown(e) {
            if (e.keyCode === 83 && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.save();
            }
        },
        save() {
            this.$store.commit("updateGraphTestTemplate", {
                value: this.value,
            });
            this.saving = true;
            localStorage.removeItem("_cached_graphTests_" + this.localGraph.id);
            setTimeout(() => {
                this.saving = false;
                this.dirty = false;
            }, 250);
        },
        setValue() {
            if (this.localGraph.properties.graphTests) {
                this.value = this.localGraph.properties.graphTests;
            }
            const cached = localStorage.getItem("_cached_graphTests_" + this.localGraph.id);
            if (cached) {
                this.value = cached;
                this.dirty = true;
            }
        },
        editorInit() {
            require("brace/mode/javascript"); // eslint-disable-line
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
