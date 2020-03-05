<template>
    <div v-if="vector">
        <v-card class="" style="width: 250px;">
            <v-card-text class="pa-0">
                <v-tabs fixed-tabs>
                    <v-tab title="Location">
                        <v-icon>mdi-map-marker</v-icon>
                    </v-tab>
                    <v-tab title="Domain specific vector data">
                        <v-icon>mdi-database</v-icon>
                    </v-tab>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>
                                Vector
                            </v-card-title>
                            <v-alert
                                v-if="vector.url"
                                outlined
                                type="warning"
                                prominent
                                class="ma-4"
                                border="left">
                                This vector is from a remote source.
                            </v-alert>
                            <v-card-subtitle style="font-size: 12px;">
                                {{vector.id}}
                            </v-card-subtitle>
                            <v-card-subtitle>
                                <v-btn color="info" @click="publish" v-if="!vector.url">
                                    Publish<br>Vector
                                    <v-icon right>
                                        mdi-share-variant
                                    </v-icon>
                                </v-btn>
                            </v-card-subtitle>
                            <v-card-text>
                                <v-text-field v-if="vector.url" disabled label="URL" v-model="vector.url"></v-text-field>
                                <v-checkbox label="Appears In Presentation" v-model="vector.properties.appearsInPresentation"></v-checkbox>
                                <v-checkbox label="Appears In Exported Graph" v-model="vector.properties.appearsInExportedGraph"></v-checkbox>
                                <v-text-field label="Name" v-model="vector.properties.name"></v-text-field>
                                <v-textarea label="Description" v-model="vector.properties.description"></v-textarea>
                            </v-card-text>
                            <v-card-title>
                                Design
                            </v-card-title>
                            <v-card-text>
                                <v-text-field label="x" v-model.number="vector.properties.x"></v-text-field>
                                <v-text-field label="y" v-model.number="vector.properties.y"></v-text-field>
                                <v-text-field label="z" v-model.number="vector.properties.z"></v-text-field>
                            </v-card-text>
                        </v-card>
                        <v-card>
                            <v-card-title>
                                Presentation
                            </v-card-title>
                            <v-card-text>
                                <v-text-field label="x" v-model.number="vector.properties.presentation.x"></v-text-field>
                                <v-text-field label="y" v-model.number="vector.properties.presentation.y"></v-text-field>
                                <v-text-field label="z" v-model.number="vector.properties.presentation.z"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-textarea v-model="vector.data" disabled></v-textarea>
                    </v-tab-item>
                </v-tabs>
            </v-card-text>
        </v-card>
    </div>
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
            graph: state => state.graph,
            selectedVector: state => state.selectedVector,
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
    }
};
</script>
<style></style>
