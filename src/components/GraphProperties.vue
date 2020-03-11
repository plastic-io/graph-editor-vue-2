<template>
    <v-card flat v-if="graph" class="pa-0">
        <v-card-title>
            <v-icon left>{{graph.properties.icon}}</v-icon>
            {{graph.properties.name || "Graph"}}
        </v-card-title>
        <v-card-subtitle>
            {{graph.properties.description}}
        </v-card-subtitle>
        <v-card-text class="ma-0 pa-0">
            <v-expansion-panels flat v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>General</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field label="Name" v-model="name"></v-text-field>
                                <v-textarea label="Description" v-model="description"></v-textarea>
                                <v-text-field label="Graph Id" disabled :value="id"></v-text-field>
                                <v-combobox
                                    :prepend-icon="graph.properties.icon"
                                    persistent-hint
                                    hint="https://cdn.materialdesignicons.com/4.9.95/"
                                    :eager="true"
                                    title="Icon"
                                    :items="icons"
                                    v-model="icon"/>
                                <v-text-field label="Version" disabled :value="version"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Presentation</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-switch label="Start In Presentation Mode" v-model="startInPresentationMode"></v-switch>
                                <v-text-field label="Height" v-model.number="height"></v-text-field>
                                <v-text-field label="Width" v-model.number="width"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Meta</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field label="Created By" v-model="createdBy"></v-text-field>
                                <v-text-field label="Created On" v-model="createdOn"></v-text-field>
                                <v-text-field label="Last Update" v-model="lastUpdate"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Vectors</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-list>
                                    <v-list-item-group v-model="vectorList" color="primary">
                                        <v-list-item
                                            @click="selectVector(vector.id)"
                                            v-for="vector in graph.vectors"
                                            :key="'select_' + vector.id">
                                            <v-list-item-icon>
                                                <v-icon v-text="vector.properties.icon"></v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                <v-list-item-title :title="vector.id" v-text="vector.name || 'Untitled Vector'"></v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Publishing</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-btn color="info" style="margin-top: 10px;" @click="publishGraph">
                                    Publish<br>Graph
                                    <v-icon right>
                                        mdi-share-variant
                                    </v-icon>
                                </v-btn>
                                <v-combobox
                                    :items="domainTags"
                                    persistent-hint
                                    hint="Which domains this resource works in"
                                    chips
                                    deletable-chips
                                    clearable
                                    multiple
                                    hide-selected
                                    label="Tags"
                                    prepend-icon="mdi-tag-multiple-outline"
                                    v-model="tags"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>External Graph IO</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-list style="width: 110%;">
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
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>
<script>
import {mapState, mapActions, mapMutations} from "vuex";
import {mapFields} from "vuex-map-fields";
import * as mdi from "@mdi/js";
export default {
    name: "graph-properties",
    methods: {
        ...mapActions([
            "publishGraph",
            "save",
        ]),
        ...mapMutations([
            "selectVector",
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
    },
    data: () => {
        return {
            panel: 0,
            vectorList: null,
        };
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
        icons() {
            return Object.keys(mdi).map(this.hyphenateProperty);
        },
        ...mapFields([
            "graph.properties.startInPresentationMode",
            "graph.properties.name",
            "graph.properties.icon",
            "graph.properties.description",
            "graph.properties.createdOn",
            "graph.properties.lastUpdate",
            "graph.properties.height",
            "graph.properties.width",
            "graph.properties.createdBy",
            "graph.properties.tags",
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
                        if (i.external && i.graphId === this.graph.id) {
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
            domainTags: state => state.tags,
        }),
    }
};
</script>
<style></style>
