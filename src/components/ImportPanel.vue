<template>
    <v-card flat>
        <v-card-title help-topic="importPanel">
            <v-icon left>mdi-library</v-icon>
            Library
        </v-card-title>
        <v-card-subtitle>
            Create, Import, and Export Vectors and Graphs
        </v-card-subtitle>
        <v-card-text>
            <v-tabs grow icons-and-text hide-slider>
                <v-tab help-topic="importLocal">
                    Local
                    <v-icon>mdi-folder</v-icon>
                </v-tab>
                <v-tab help-topic="importPublic">
                    Public
                    <v-icon>mdi-folder-network</v-icon>
                </v-tab>
                <v-tab-item v-if="localToc">
                    <import-panel-list :list="Object.keys(localToc).map(i => localToc[i])"/>
                </v-tab-item>
                <v-tab-item>
                    <import-panel-registry/>
                </v-tab-item>
            </v-tabs>
        </v-card-text>
    </v-card>
</template>
<script>
import ImportPanelList from "./ImportPanelList";
import ImportPanelRegistry from "./ImportPanelRegistry";
import {mapState} from "vuex";
export default {
    name: "import-panel",
    components: {ImportPanelList, ImportPanelRegistry},
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
            this.localToc = JSON.parse(JSON.stringify(this.toc));
        },
    },
    computed: {
        ...mapState({
            toc: state => state.toc,
        }),
    },
    mounted() {
        this.updateLocalToc();
    },
};
</script>
<style></style>
