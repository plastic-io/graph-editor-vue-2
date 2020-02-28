<template>
    <div v-if="localGraph">
        <v-card class="pa-3" style="width: 210px;">
            <v-card-title>
                Graph
            </v-card-title>
            <v-card-subtitle>
                {{localGraph.id}} v{{localGraph.version}}
            </v-card-subtitle>
            <v-text-field label="Name" v-model="localGraph.properties.name"></v-text-field>
            <v-textarea label="Description" v-model="localGraph.properties.description"></v-textarea>
            <v-text-field label="Created By" v-model="localGraph.properties.createdBy"></v-text-field>
            <v-text-field label="Created On" v-model="localGraph.properties.createdOn"></v-text-field>
            <v-text-field label="Last Update" v-model="localGraph.properties.lastUpdate"></v-text-field>
            <v-text-field label="Height" v-model.number="localGraph.properties.height"></v-text-field>
            <v-text-field label="Width" v-model.number="localGraph.properties.width"></v-text-field>
            <v-checkbox label="Exportable" v-model="localGraph.properties.exportable"></v-checkbox>
        </v-card>
    </div>
</template>
<script>
import {mapState} from "vuex";
export default {
    name: "graph-properties",
    data() {
        return {
            localGraph: null,
        };
    },
    watch: {
        localGraph: function () {
            this.$store.dispatch("updateGraphProperties", this.localGraph.properties);
        },
        graphSnapshot: function () {
            this.localGraph = this.graphSnapshot;
        },
    },
    mounted() {
        this.localGraph = this.graphSnapshot;
    },
    computed: {
        ...mapState({
            graphSnapshot: state => state.graphSnapshot,
        }),
    }
};
</script>
<style></style>
