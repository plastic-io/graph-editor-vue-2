<template>
    <v-card flat v-if="vector">
        <v-card-title>
            Vector
            <v-spacer/>
            <v-tooltip bottom>
                <template v-slot:activator="{ on: tooltip }">
                    <v-icon style="margin-right: 7px;" v-on="{ ...tooltip }">mdi-information-outline</v-icon>
                </template>
                <i>Vector Id: {{vector.id}}</i>
                <v-alert
                    v-if="vector.url"
                    outlined
                    type="warning"
                    prominent
                    class="ma-4"
                    border="left">
                    This vector is from a remote source.
                    <i>Vector Url: {{vector.url}}</i>
                </v-alert>
            </v-tooltip>
        </v-card-title>
        <v-card-text class="ma-0 pa-0">
            <v-expansion-panels flat v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>General</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field label="Name" v-model="vector.properties.name"></v-text-field>
                                <v-textarea label="Description" v-model="vector.properties.description"></v-textarea>
                                <v-text-field v-if="vector.url" disabled label="URL" v-model="vector.url"></v-text-field>
                                <v-checkbox label="Appears In Exported Graph" v-model="vector.properties.appearsInExportedGraph"></v-checkbox>
                                <v-combobox
                                    :items="tags"
                                    small-chips
                                    clearable
                                    multiple
                                    hide-selected
                                    label="Tags"
                                    v-model="vector.properties.tags"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Location</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
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
                            <v-card-text class="ma-0 pa-0">
                                <v-checkbox label="Appears In Presentation" v-model="vector.properties.appearsInPresentation"></v-checkbox>
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
                            <v-card-text class="ma-0 pa-0">
                                <v-textarea label="Data" v-model="vector.data"></v-textarea>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Publishing</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-btn color="info" @click="publish" v-if="!vector.url">
                                    Publish<br>Vector
                                    <v-icon right>
                                        mdi-share-variant
                                    </v-icon>
                                </v-btn>
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
export default {
    name: "vector-properties",
    methods: {
        ...mapActions([
            "publishVector",
            "moveHistoryPosition",
        ]),
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
    }
};
</script>
<style></style>
