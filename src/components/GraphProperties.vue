<template>
    <v-card flat v-if="graphSnapshot" style="height: calc(100vh - 96px); overflow-y: auto;">
        <v-card-title>
            <v-icon left help-topic="graph">mdi-graph-outline</v-icon>
            Graph Properties
        </v-card-title>
        <v-card-text class="ma-0">
            <v-expansion-panels flat v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>General</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field help-topic="graphName" label="Name" v-model="name"></v-text-field>
                                <v-text-field help-topic="graphDescription" label="Description" v-model="description"></v-text-field>
                                <v-text-field help-topic="graphUrl" label="URL" v-model="url"></v-text-field>
                                <v-text-field help-topic="graphId" label="Graph Id" disabled :value="id"></v-text-field>
                                <v-combobox
                                    help-topic="graphIcon"
                                    :prepend-icon="graphSnapshot.properties.icon"
                                    persistent-hint
                                    hint="https://cdn.materialdesignicons.com/4.9.95/"
                                    :eager="true"
                                    title="Icon"
                                    :items="icons"
                                    v-model="icon"/>
                                <v-text-field help-topic="graphVersion" label="Version" disabled :value="version"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Presentation</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0" help-topic="graphPresentation">
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
                            <v-card-text class="ma-0 pa-0" help-topic="graphMeta">
                                <v-text-field label="Created By" v-model="createdBy"></v-text-field>
                                <v-text-field label="Created On" v-model="createdOn"></v-text-field>
                                <v-text-field label="Last Update" v-model="lastUpdate"></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Publishing</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-btn color="info" style="margin-top: 10px;" @click="publishGraph" help-topic="graphPublishButton">
                                    Publish<br>Graph
                                    <v-icon right>
                                        mdi-share-variant
                                    </v-icon>
                                </v-btn>
                                <v-combobox
                                    help-topic="graphTags"
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
                        <v-card class="ma-0 pa-0" flat help-topic="graphIOList">
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
        };
    },
    watch: {
        "graphSnapshot.properties": {
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
            "graphSnapshot.properties.startInPresentationMode",
            "graphSnapshot.properties.name",
            "graphSnapshot.properties.icon",
            "graphSnapshot.properties.description",
            "graphSnapshot.properties.createdOn",
            "graphSnapshot.properties.lastUpdate",
            "graphSnapshot.properties.height",
            "graphSnapshot.properties.width",
            "graphSnapshot.properties.createdBy",
            "graphSnapshot.properties.tags",
            "graphSnapshot.version",
            "graphSnapshot.id",
            "graphSnapshot.url",
        ]),
        externalIO() {
            const info = {
                inputs: [],
                outputs: [],
            };
            this.graphSnapshot.vectors.forEach((v) => {
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
            graphSnapshot: state => state.graphSnapshot,
            domainTags: state => state.tags,
        }),
    }
};
</script>
<style></style>
