<template>
    <v-card flat style="height: calc(100vh - 51px);" class="pa-2">
        <v-card-title>
            <v-icon left help-topic="historyPanel">mdi-history</v-icon>
            History
        </v-card-title>
        <v-card>
            <v-card-text>
                <v-list style="height: calc(100vh - 171px);overflow-y: auto;">
                    <v-list-item
                        v-for="(event, index) in localEvents"
                        :key="index"
                        :style="historyColor(index)"
                        @click="moveHistoryPosition(-(historyPosition - index))">
                        <v-list-item-icon>
                            <v-icon>{{getIcon(event.name)}}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content style="font-size: 14px;">
                            {{event.name}}
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-card>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "history-panel",
    methods: {
        historyColor(index) {
            let color = "";
            if (this.historyPosition === index) {
                color = "background: var(--v-info-base);";
            } else if (index > this.historyPosition) {
                color = "opacity: 0.45;";
            }
            return color;
        },
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
                "Update Template": "mdi-pencil",
                "Toggle Vector Presentation": "mdi-presentation",
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
