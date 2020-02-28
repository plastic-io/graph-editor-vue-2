<template>
    <div v-if="preferences">
        <v-card class="pa-3" style="width: 210px;">
            <v-card-title>
                Settings
            </v-card-title>
            <v-card-subtitle>
                General Appearance
            </v-card-subtitle>
            <v-list-item-content>
                <v-select label="Theme" :items="['dark', 'light']" v-model="preferences.appearance.theme"></v-select>
                <v-select :items="colorBaseKeys" label="Selection Rectange Color" v-model="preferences.appearance.selectionRectColor"/>
                <v-select :items="colorBaseKeys" label="Bounding Rectangle Color" v-model="preferences.appearance.boundingRectColor"/>
                <v-checkbox label="Snap To Grid" v-model="preferences.snapToGrid"></v-checkbox>
                <v-checkbox label="Show Grid" v-model="preferences.appearance.showGrid"></v-checkbox>
                <v-text-field disabled label="Grid Size" v-model.number="preferences.gridSize"/>
            </v-list-item-content>
            <v-card-subtitle>
                General Appearance
            </v-card-subtitle>
            <v-list-item-content>
                <v-text-field disabled label="Grid Size" v-model.number="preferences.gridSize"/>
            </v-list-item-content>
            <v-card-subtitle>
                Connector Style
            </v-card-subtitle>
            <v-list-item-content>
                <v-text-field label="Connector Drag Dead Zone" v-model.number="preferences.appearance.connectors.dragDeadZone"/>
                <v-select :items="colorBaseKeys" label="Control Fill Style" v-model="preferences.appearance.connectors.controlFillStyle"/>
                <v-select :items="colorBaseKeys" label="Stroke Style" v-model="preferences.appearance.connectors.strokeStyle"/>
                <v-select :items="colorBaseKeys" label="Selected Stroke Style" v-model="preferences.appearance.connectors.selectedStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Hover Stroke Style" v-model="preferences.appearance.connectors.hoverStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Watch Stroke Style" v-model="preferences.appearance.connectors.watchStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Activity Stroke Style" v-model="preferences.appearance.connectors.activityStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Error Stroke Style" v-model="preferences.appearance.connectors.errorStrokeStyle"/>
                <v-text-field label="Line Width" v-model.number="preferences.appearance.connectors.lineWidth"/>
            </v-list-item-content>
        </v-card>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
import colors from "vuetify/lib/util/colors";
export default {
    name: "edge-properties",
    methods: {
        ...mapActions([
            "moveHistoryPosition",
        ]),
    },
    data() {
        return {
            localPreferences: null,
        };
    },
    watch: {
        "preferences.appearance.theme"(){
            this.$vuetify.theme.dark = this.preferences.appearance.theme === "dark";
        },
    },
    computed: {
        colorBaseKeys() {
            return Object.keys(colors);
        },
        ...mapState({
            preferences: state => state.preferences,
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
    },
    mounted() {
        console.log("preferences mounted");
        this.localPreferences = this.preferences;
    },
};
</script>
<style></style>
