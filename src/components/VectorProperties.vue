<template>
    <v-card flat v-if="vector" style="height: calc(100vh - 98px); overflow-y: auto;">
        <v-card-title>
            <v-icon left help-topic="vector">mdi-network-outline</v-icon>
            Vector Properties
            <v-spacer/>
            <v-menu flat bottom color="secondary" open-on-hover>
                <template v-slot:activator="{ on: tooltip }">
                    <v-icon v-on="{ ...tooltip }">
                        {{vector.artifact ? 'mdi-link' : 'mdi-information-outline'}}
                    </v-icon>
                </template>
                <v-card v-if="!vector.artifact">
                    <v-card-text>
                        <i>Vector Id: {{vector.id}}</i>
                    </v-card-text>
                </v-card>
                <v-alert
                    v-if="vector.artifact"
                    type="warning"
                    prominent
                    class="ma-0"
                    style="width: 35vw;"
                    border="left">
                    This vector did not originate on this graph.
                    <i>Vector artifact: {{vector.artifact}}</i>
                </v-alert>
            </v-menu>
        </v-card-title>
        <v-card-text class="ma-0">
            <v-expansion-panels flat v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>General</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field
                                    help-topic="vectorName"
                                    label="Name"
                                    v-model="vector.properties.name"/>
                                <v-textarea
                                    help-topic="vectorDescription"
                                    label="Description"
                                    v-model="vector.properties.description"/>
                                <v-text-field
                                    help-topic="vectorUrl"
                                    label="URL"
                                    @change="updateVectorUrl($event)"
                                    :value="vector.url"/>
                                <v-text-field
                                    disabled
                                    help-topic="vectorId"
                                    label="ID"
                                    @change="updateVectorUrl($event)"
                                    :value="vector.id"/>
                                <v-combobox
                                    help-topic="vectorIcon"
                                    :prepend-icon="vector.properties.icon"
                                    persistent-hint
                                    hint="https://cdn.materialdesignicons.com/4.9.95/"
                                    :eager="true"
                                    title="Icon"
                                    :items="icons"
                                    v-model="vector.properties.icon"/>
                                <v-checkbox help-topic="vectorAppearsInExportedGraph" label="Appears In Exported Graph" v-model="vector.properties.appearsInExportedGraph"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Location</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0" help-topic="vectorLocation">
                                <v-text-field label="x" v-model.number="vector.properties.x"></v-text-field>
                                <v-text-field label="y" v-model.number="vector.properties.y"></v-text-field>
                                <v-text-field label="z" v-model.number="vector.properties.z"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Presentation</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0" help-topic="vectorPresentationLocation">
                                <v-checkbox label="Appears In Presentation" v-model="vector.properties.appearsInPresentation"></v-checkbox>
                                <v-checkbox label="Position Absolutely" v-model="vector.properties.positionAbsolute"></v-checkbox>
                                <v-text-field label="x" v-model.number="vector.properties.presentation.x"></v-text-field>
                                <v-text-field label="y" v-model.number="vector.properties.presentation.y"></v-text-field>
                                <v-text-field label="z" v-model.number="vector.properties.presentation.z"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Vector Data</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0" help-topic="vectorData">
                                <v-textarea label="Data" v-model="vector.data"></v-textarea>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel v-if="!vector.artifact">
                    <v-expansion-panel-header>Publishing</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-3">
                                <v-btn color="info" @click="publish" help-topic="vectorPublish">
                                    Publish<br>Vector
                                    <v-icon right>
                                        mdi-share-variant
                                    </v-icon>
                                </v-btn>
                                <v-combobox
                                    help-topic="vectorTags"
                                    :items="tags"
                                    chips
                                    deletable-chips
                                    clearable
                                    multiple
                                    hide-selected
                                    label="Tags"
                                    persistent-hint
                                    hint="Which domains this resource works in"
                                    prepend-icon="mdi-tag-multiple-outline"
                                    v-model="vector.properties.tags"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel v-if="!vector.artifact">
                    <v-expansion-panel-header>Testing</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-3">
                                <v-btn disabled color="info" block help-topic="vectorTests">
                                    Run Tests
                                    <v-icon right>
                                        mdi-flask
                                    </v-icon>
                                </v-btn>
                                <i>No tests.  Add tests in input connectors.</i>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>
<script>
import {mapState, mapActions} from "vuex";
import * as mdi from "@mdi/js";
export default {
    name: "vector-properties",
    methods: {
        ...mapActions([
            "publishVector",
            "moveHistoryPosition",
        ]),
        hyphenateProperty(prop) {
            var p = "";
            Array.prototype.forEach.call(prop, function (char) {
                if (char === char.toUpperCase()) {
                    p += "-" + char.toLowerCase();
                    return;
                }
                p += char;
            });
            return p;
        },
        updateVectorUrl(e) {
            this.vector.url = e;
        },
        publish() {
            this.publishVector(this.vector.id);
        },
    },
    data() {
        return {
            vector: null,
            panel: 0,
        };
    },
    watch: {
        "vector.url": {
            handler: function () {
                this.$store.commit("updateVectorUrl", {
                    vectorId: this.vector.id,
                    url: this.vector.url,
                });
            },
            deep: true,
        },
        "vector.properties": {
            handler: function () {
                this.$store.dispatch("updateVectorProperties", {
                    vectorId: this.vector.id,
                    properties: JSON.parse(JSON.stringify(this.vector.properties)),
                    version: this.graph.version,
                });
            },
            deep: true,
        },
        selectedVector: function () {
            if (!this.selectedVector) {
                return;
            }
            this.vector = JSON.parse(JSON.stringify(this.selectedVector));
        },
    },
    mounted() {
        if (!this.selectedVector) {
            return;
        }
        this.vector = JSON.parse(JSON.stringify(this.selectedVector));
    },
    computed: {
        ...mapState({
            tags: state => state.tags,
            graph: state => state.graph,
            selectedVector: state => state.selectedVector,
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
        icons() {
            return Object.keys(mdi).map(this.hyphenateProperty);
        },
    }
};
</script>
<style></style>
