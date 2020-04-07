<template>
    <div @keydown="keydown($event)" v-if="selectedVector">
        <v-toolbar short flat dense>
            <v-icon style="margin-right: 10px;">{{selectedVector.properties.icon}}</v-icon>
            <v-toolbar-title help-topic="vueTemplate">
                Template
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
        };
    },
    watch: {
        value: {
            handler: function () {
                if (this.value !== this.vector.template.vue) {
                    localStorage.setItem("_cached_vue_" + this.selectedVector.id, this.value);
                    this.dirty = true;
                } else {
                    localStorage.removeItem("_cached_vue_" + this.selectedVector.id);
                    this.dirty = false;
                }
            },
        },
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
        keydown(e) {
            if (e.keyCode === 83 && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.save();
            }
        },
        save() {
            this.$store.dispatch("updateTemplate", {
                id: this.vector.id,
                value: this.value,
                key: "vue",
            });
            this.saving = true;
            localStorage.removeItem("_cached_vue_" + this.selectedVector.id);
            setTimeout(() => {
                this.saving = false;
                this.dirty = false;
            }, 250);
        },
        setValue() {
            if (!this.selectedVector) {
                return;
            }
            this.vector = this.selectedVector;
            if (!this.vector) {
                throw new Error("Template editor invoked with no selected vector.");
            }
            if (this.vector.template.vue) {
                this.value = this.vector.template.vue;
            }
            const cached = localStorage.getItem("_cached_vue_" + this.selectedVector.id);
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
            preferences: state => state.preferences,
            selectedVector: state => state.selectedVector,
        }),
    }
};
</script>
<style></style>
