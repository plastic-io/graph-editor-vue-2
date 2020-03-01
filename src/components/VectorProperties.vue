<template>
    <div v-if="vector">
        <v-card class="" style="width: 300px;">
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
                            <v-card-subtitle>
                                {{vector.id}}
                            </v-card-subtitle>
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
            "moveHistoryPosition",
        ]),
    },
    data() {
        return {
            vector: null,
        };
    },
    watch: {
        "vector.properties": function () {
            this.$store.dispatch("updateVectorProperties", {
                vectorId: this.vector.id,
                properties: this.vector.properties,
            });
        },
        selectedVectors: function () {
            if (!this.selectedVector) {
                return;
            }
            this.vector = this.selectedVector;
        },
    },
    mounted() {
        if (!this.selectedVector) {
            return;
        }
        this.vector = this.selectedVector;
    },
    computed: {
        ...mapState({
            selectedVector: state => state.selectedVector,
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
    }
};
</script>
<style></style>
