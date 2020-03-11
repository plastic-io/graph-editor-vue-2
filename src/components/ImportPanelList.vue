<template>
    <v-list v-if="list">
        <v-subheader>
            <v-list-item-icon>
                <v-icon>mdi-magnify</v-icon>
            </v-list-item-icon>
            <v-text-field placeholder="Search" v-model="search"></v-text-field>
        </v-subheader>
        <v-divider class="ma-3"/>
        <v-list-item-group v-model="selectedItem" style="overflow-y: auto; height: calc(100vh - 287px);">
            <v-list-group
            v-for="item in items"
            :key="item.title"
            v-model="item.active"
            :prepend-icon="item.action"
            >
                <template v-slot:activator>
                    <v-list-item-icon draggable="true" style="cursor: copy;" @dragstart="dragStart($event, item)">
                        <v-icon :title="item.type === 'publishedGraph' ? 'Graph' : 'Vector'">
                            {{item.icon || iconType(item.type)}}
                        </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        {{item.name || "Untitled"}}
                        <v-list-item-subtitle>
                            <span v-if="item.description">{{item.description}}</span>
                            <span v-else><i>No description</i></span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-icon v-if="item.type !== 'newVector'">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                                <v-icon v-on="{ ...tooltip }">mdi-information-outline</v-icon>
                            </template>
                            <div>Latest Version: {{item.version}}</div>
                            <div>Last Updated: {{item.lastUpdate}}</div>
                            <div>Total Versions: {{artifacts(item.id).length}}</div>
                            <div v-if="item.description">{{item.description}}</div>
                            <div v-else><i>No description</i></div>
                        </v-tooltip>
                    </v-list-item-icon>
                </template>
                <template v-if="item.type !== 'newVector'">
                    <v-list-item v-for="(artifact, index) in artifacts(item.id)" :key="index">
                        <v-list-item-icon draggable="true" style="cursor: copy; margin-left: 25px;" @dragstart="dragStart($event, artifact)">
                            <v-icon>{{artifact.icon}}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>v{{artifact.version}}</v-list-item-title>
                            <v-list-item-subtitle>
                                <div v-if="item.description">{{item.description}}</div>
                                <div v-else><i>No description</i></div>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-icon>
                            <v-btn @click.stop="download(item)" title="Download">
                                 <v-icon>
                                    mdi-download
                                </v-icon>
                         </v-btn>
                        </v-list-item-icon>
                    </v-list-item>
                </template>
            </v-list-group>
        </v-list-item-group>
    </v-list>
</template>
<script>
import {mapActions} from "vuex";
export default {
    name: "import-panel-list",
    props: {
        list: Array,
    },
    data: () => {
        return {
            search: "",
            selectedItem: null,
        };
    },
    methods: {
        ...mapActions([
            "download",
        ]),
        dragStart(e, item) {
            e.dataTransfer.setData("application/json+plastic-io", JSON.stringify(item));
            e.dataTransfer.dropEffect = "link";
        },
        iconType(item) {
            return {
                newVector: "mdi-shape-rectangle-plus",
                publishedVector: "mdi-network",
                publishedGraph: "mdi-switch",
            }[item] || "";
        },
    },
    computed: {
        artifacts() {
            return (id) => {
                const regEx = new RegExp(this.search, "ig");
                return this.list.filter((item) => {
                    return /published|newVector/.test(item.type) && item.id === id
                        && (this.search === "" || (regEx.test(item.name) || regEx.test(item.description)));
                });
            };
        },
        items() {
            const items = {};
            const regEx = new RegExp(this.search, "ig");
            this.list.filter((item) => {
                return (this.search === "" || (regEx.test(item.name) || regEx.test(item.description)));
            }).forEach((item) => {
                if (/published|newVector/.test(item.type)) {
                    if (!items[item.id] || items[item.id].version < item.version) {
                        items[item.id] = item;
                    }
                }
            });
            return Object.keys(items).map(key => items[key]);
        }
    },
};
</script>
<style></style>
