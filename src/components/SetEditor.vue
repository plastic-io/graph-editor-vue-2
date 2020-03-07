<template>
    <div>
        <v-toolbar short flat dense>
            <v-toolbar-title>Vector - Set Function</v-toolbar-title>
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
# Set

    This function runs when your vector is invoked directly, either by the scheudler
    url function or by another vector's edge.

# Globals

    edges: These edge outputs are defined in the designer.  E.x.: edges.x = "foo" sends "foo" out of the x edge.
    state: Scheduler state.  Use this shared object to track your application state.
    field: The name of the input field trigged by the remote vector edge.
    value: The value passed to the field.
    vector: The vector schema, contains many of the other fields.
    cache: Vector specific runtime cache object.  Stick what you want here, it's yours, but it goes away.
    graph: The entire graph.
    data: Vector specific data.  This data persists between runs.  Requires graph modification to change.
    properties: Graph editor properties and input/output field list.

                        </pre>
                    </v-card-text>
                </v-card>
            </v-menu>
        </v-toolbar>
        <editor
            v-model="value"
            @init="editorInit"
            lang="javascript"
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
    name: "set-editor",
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
                key: "set",
            });
        },
        setValue() {
            if (!this.selectedVector) {
                return;
            }
            this.vector = this.selectedVector;
            if (!this.vector) {
                throw new Error("Set editor invoked with no selected vector.");
            }
            if (this.vector.template.set) {
                this.value = this.vector.template.set;
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
            preferences: state => state.preferences,
            selectedVector: state => state.selectedVector,
        }),
    }
};
</script>
<style></style>
