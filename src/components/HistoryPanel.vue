<template>
    <div>
        <v-card>
            <v-card-title>
                History
            </v-card-title>
            <v-list>
                <v-list-item
                    v-for="(event, index) in localEvents"
                    :key="index"
                    :style="historyPosition === index ? 'background: var(--v-info-base);' : ''"
                    @click="moveHistoryPosition(-(historyPosition - index))">
                    <v-list-item-icon>
                        <v-icon>{{getIcon(event.name)}}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content style="font-size: 14px;">
                        {{event.name}}
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "property-fields",
    methods: {
        ...mapActions([
            "moveHistoryPosition",
        ]),
        getIcon(name) {
            return {
                "Start": "mdi-flag-variant",
                "Nudge": "mdi-move-resize-variant",
                "Duplicate": "mdi-content-duplicate",
                "Paste": "mdi-content-paste",
                "Send Forward": "mdi-arrange-bring-forward",
                "Send Backward": "mdi-arrange-send-backward",
                "Bring to Front": "mdi-arrange-bring-to-front",
                "Send to Back": "mdi-arrange-send-to-back",
                "Group": "mdi-group",
                "Ungroup": "mdi-ungroup",
                "Delete": "mdi-delete",
                "Write to Graph": "mdi-pencil",
                "Move Connector": "mdi-vector-point",
                "Add Connector": "mdi-shape-circle-plus",
                "Move Vectors": "mdi-vector-polygon",
                "Change Input Order": "mdi-swap-vertical",
                "Change Output Order": "mdi-swap-vertical",
                "Add Input": "mdi-ray-start-arrow",
                "Add Output": "mdi-ray-end-arrow",
                "Remove Input": "mdi-minus-circle-outline",
                "Remove Output": "mdi-minus-circle-outline",
                "Update Vector Properties": "mdi-pencil",
                "Update Graph Properties": "mdi-pencil",
                "Reorder Connectors": "mdi-sync",
                "Delete Connector": "mdi-delete",
                "Rename IO": "mdi-pencil",
            }[name] || "mdi-pencil";
        },
    },
    computed: {
        localEvents() {
            return [
                {
                    name: "Start",
                },
                ...this.events,
            ];
        },
        ...mapState({
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
    }
};
</script>
<style></style>
