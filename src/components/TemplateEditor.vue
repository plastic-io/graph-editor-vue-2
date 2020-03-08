<template>
    <div>
        <v-toolbar short flat dense>
            <v-icon style="margin-right: 10px;">{{selectedVector.properties.icon}}</v-icon>
            <v-toolbar-title>{{selectedVector.properties.name || "Vector"}} - Vue Template</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="save" title="Save">
                <v-icon>mdi-content-save</v-icon>
            </v-btn>
            <v-menu bottom :close-on-content-click="false">
                <template v-slot:activator="{ on: tooltip }">
                    <v-icon style="margin: 0 7px 0 14px;" v-on="{ ...tooltip }">mdi-information-outline</v-icon>
                </template>
                <v-card>
                    <v-card-text>
                        <pre class="dont-propagate-copy">
# Props

vector: This vector
state: Runtime state
scheduler: Graph execution scheduler

# Scheduler Events

beginedge: When an edge is about to be invoked
endedge: When an edge is finished invoking
error: When an error occurs
set: When a set function is run
begin: When the scheduler starts to run
end: When the scheduler is done running
warning: When a warning occurs
load: When a remote resourse is loaded
                        </pre>
                    </v-card-text>
                </v-card>
            </v-menu>
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
            if (this.vector.template.vue) {
                this.value = this.vector.template.vue;
            }
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
