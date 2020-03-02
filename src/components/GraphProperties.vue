<template>
    <div v-if="properties">
        <v-card class="pa-3" style="width: 210px;">
            <v-card-title>
                Graph
            </v-card-title>
            <v-card-subtitle>
                {{graph.id}} v{{graph.version}}
            </v-card-subtitle>
            <v-text-field label="Name" v-model="properties.name"></v-text-field>
            <v-textarea label="Description" v-model="properties.description"></v-textarea>
            <v-text-field label="Created By" v-model="properties.createdBy"></v-text-field>
            <v-text-field label="Created On" v-model="properties.createdOn"></v-text-field>
            <v-text-field label="Last Update" v-model="properties.lastUpdate"></v-text-field>
            <v-text-field label="Height" v-model.number="properties.height"></v-text-field>
            <v-text-field label="Width" v-model.number="properties.width"></v-text-field>
            <v-checkbox label="Exportable" v-model="properties.exportable"></v-checkbox>
        </v-card>
    </div>
</template>
<script>
import {mapState} from "vuex";
export default {
    name: "graph-properties",
    data() {
        return {
            properties: null,
        };
    },
    watch: {
        properties: {
            handler: function () {
                this.$store.dispatch("updateGraphProperties", JSON.parse(JSON.stringify(this.properties)));
            },
            deep: true,
        },
        graph: function () {
            this.properties = JSON.parse(JSON.stringify(this.graph.properties));
        },
    },
    mounted() {
        this.properties = JSON.parse(JSON.stringify(this.graph.properties));
    },
    computed: {
        ...mapState({
            graph: state => state.graph,
        }),
    }
};
</script>
<style></style>
