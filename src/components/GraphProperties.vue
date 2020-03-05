<template>
    <div v-if="graph">
        <v-card class="pa-3" style="width: 260px;">
            <v-card-title>
                Graph
            </v-card-title>
            <v-card-subtitle>
                <v-btn color="info" style="margin-top: 10px;" @click="publishGraph">
                    Publish<br>Graph
                    <v-icon right>
                        mdi-share-variant
                    </v-icon>
                </v-btn>
            </v-card-subtitle>
            <v-text-field label="Name" v-model="name"></v-text-field>
            <v-textarea label="Description" v-model="description"></v-textarea>
            <v-card-subtitle>
                Meta
            </v-card-subtitle>
            <v-text-field label="Created By" v-model="createdBy"></v-text-field>
            <v-text-field label="Created On" v-model="createdOn"></v-text-field>
            <v-text-field label="Last Update" v-model="lastUpdate"></v-text-field>
            <v-card-subtitle>
                Presentation
            </v-card-subtitle>
            <v-text-field label="Height" v-model.number="height"></v-text-field>
            <v-text-field label="Width" v-model.number="width"></v-text-field>
            <v-card-subtitle>
                Info
            </v-card-subtitle>
            <v-text-field label="Graph Id" disabled :value="id"></v-text-field>
            <v-text-field label="Version" disabled :value="version"></v-text-field>
            <v-list style="width: 110%;">
                <v-list-item>
                    <v-list-item-title>External Graph IO</v-list-item-title>
                </v-list-item>
                <template v-for="io in ['inputs', 'outputs']">
                    <v-list-group :key="io" value="true" :prepend-icon="io === 'inputs' ? 'mdi-power-socket' : 'mdi-power-plug'">
                        <template v-slot:activator>
                            <v-list-item-title>{{io}}</v-list-item-title>
                        </template>
                        <template v-for="(ios) in externalIO[io]">
                            {{ios.field.name}} : {{ios.vector.properties.name || ios.vector.id}}
                        </template>
                    </v-list-group>
                </template>
            </v-list>
        </v-card>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";
export default {
    name: "graph-properties",
    methods: {
        ...mapActions([
            "publishGraph",
            "save",
        ]),
    },
    watch: {
        "graph.properties": {
            handler: function () {
                this.save();
            },
            deep: true,
        },
    },
    computed: {
        ...mapFields([
            "graph.properties.name",
            "graph.properties.description",
            "graph.properties.createdOn",
            "graph.properties.lastUpdate",
            "graph.properties.height",
            "graph.properties.width",
            "graph.properties.createdBy",
            "graph.version",
            "graph.id",
        ]),
        externalIO() {
            const info = {
                inputs: [],
                outputs: [],
            };
            this.graph.vectors.forEach((v) => {
                ["inputs", "outputs"].forEach((io) => {
                    v.properties[io].forEach((i) => {
                        if (i.external) {
                            info[io].push({
                                vector: v,
                                field: i,
                            });
                        }
                    });
                });
            });
            return info;
        },
        ...mapState({
            graph: state => state.graph,
        }),
    }
};
</script>
<style></style>
