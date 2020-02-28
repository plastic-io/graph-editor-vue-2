<template>
    <div v-if="vector">
        <v-card class="pa-3" style="width: 210px;">
            <v-card-title>
                Vector
            </v-card-title>
            <v-card-subtitle>
                Graph Location
            </v-card-subtitle>
            <v-list-item-content>
                <v-text-field label="x" v-model.number="vector.properties.x"></v-text-field>
                <v-text-field label="y" v-model.number="vector.properties.y"></v-text-field>
                <v-text-field label="z" v-model.number="vector.properties.z"></v-text-field>
            </v-list-item-content>
            <v-card-subtitle>
                Presentation Location
            </v-card-subtitle>
            <v-list-item-content>
                <v-text-field label="x" v-model.number="vector.properties.presentation.x"></v-text-field>
                <v-text-field label="y" v-model.number="vector.properties.presentation.y"></v-text-field>
                <v-text-field label="z" v-model.number="vector.properties.presentation.z"></v-text-field>
            </v-list-item-content>
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
            if (this.selectedVectors.length !== 1) {
                return;
            }
            this.vector = this.selectedVectors[0];
        },
    },
    mounted() {
        if (this.selectedVectors.length !== 1) {
            return;
        }
        this.vector = this.selectedVectors[0];
    },
    computed: {
        ...mapState({
            selectedVectors: state => state.selectedVectors,
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
    }
};
</script>
<style></style>
