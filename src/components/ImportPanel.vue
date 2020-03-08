<template>
    <v-card flat>
        <v-card-title>
            <v-icon left>mdi-timeline-plus-outline</v-icon>
            Vectors
        </v-card-title>
        <v-card-subtitle>
            Create and import vectors
        </v-card-subtitle>
        <v-card-text>
            <v-tabs grow icons-and-text hide-slider>
                <v-tab>
                    Local
                    <v-icon>mdi-folder</v-icon>
                </v-tab>
                <v-tab>
                    Public
                    <v-icon>mdi-folder-network</v-icon>
                </v-tab>
                <v-tab-item v-if="localToc">
                    <import-panel-list :list="Object.keys(localToc).map(i => localToc[i])"/>
                </v-tab-item>
            </v-tabs>
        </v-card-text>
    </v-card>
</template>
<script>
import ImportPanelList from "./ImportPanelList";
import {mapState} from "vuex";
export default {
    name: "import-panel",
    components: {ImportPanelList},
    data: () => {
        return {
            localToc: null,
            selectedItem: null,
        };
    },
    watch: {
        toc: {
            handler() {
                this.updateLocalToc();
            },
            deep: true,
        },
    },
    methods: {
        updateLocalToc() {
            this.localToc = {
                "0": {type: "newVector", name: "Empty Vector", description: "An new, empty vector."},
                ...JSON.parse(JSON.stringify(this.toc)),
            };
        },
    },
    computed: {
        ...mapState({
            toc: state => state.toc,
        }),
        artifacts() {
            return (id) => {
                return Object.keys(this.toc).map((id) => {
                    return this.toc[id];
                }).filter((item) => {
                    return /published|newVector/.test(item.type) && item.id === id;
                });
            };
        },
        items() {
            const items = {};
            Object.keys(this.toc).forEach((id) => {
                const item = this.toc[id];
                if (/published|newVector/.test(item.type)) {
                    if (!items[item.id] || items[item.id].version < item.version) {
                        items[item.id] = item;
                    }
                }
            });
            return Object.keys(items).map(key => items[key]);
        }
    },
    mounted() {
        this.updateLocalToc();
    },
};
</script>
<style></style>
