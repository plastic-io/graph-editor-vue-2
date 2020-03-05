<template>
    <div>
        <v-card class="pa-3" style="width: 210px;">
            <v-card-title>
                Settings
            </v-card-title>
            <v-card-subtitle>
                General Appearance
            </v-card-subtitle>
            <v-list-item-content>
                <v-select label="Theme" :items="['dark', 'light']" v-model="theme"></v-select>
                <v-select :items="colorBaseKeys" label="Selection Rectange Color" v-model="selectionRectColor"/>
                <v-select :items="colorBaseKeys" label="Bounding Rectangle Color" v-model="boundingRectColor"/>
                <v-checkbox label="Snap To Grid" v-model="snapToGrid"></v-checkbox>
                <v-checkbox label="Show Grid" v-model="showGrid"></v-checkbox>
                <v-text-field disabled label="Grid Size" v-model.number="gridSize"/>
            </v-list-item-content>
            <v-card-subtitle>
                General Appearance
            </v-card-subtitle>
            <v-list-item-content>
                <v-text-field label="Connector Drag Dead Zone" v-model.number="dragDeadZone"/>
                <v-select :items="colorBaseKeys" label="Control Fill Style" v-model="controlFillStyle"/>
                <v-select :items="colorBaseKeys" label="Stroke Style" v-model="strokeStyle"/>
                <v-select :items="colorBaseKeys" label="Selected Stroke Style" v-model="selectedStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Hover Stroke Style" v-model="hoverStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Watch Stroke Style" v-model="watchStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Activity Stroke Style" v-model="activityStrokeStyle"/>
                <v-select :items="colorBaseKeys" label="Error Stroke Style" v-model="errorStrokeStyle"/>
                <v-text-field label="Line Width" v-model.number="lineWidth"/>
            </v-list-item-content>
        </v-card>
    </div>
</template>
<script>
import colors from "vuetify/lib/util/colors";
import {mapFields} from "vuex-map-fields";
import {mapActions, mapState} from "vuex";
export default {
    name: "edge-properties",
    watch: {
        "theme"(){
            this.$vuetify.theme.dark = this.theme === "dark";
        },
        "preferences": {
            handler: function () {
                console.log("savePreferences");
                this.savePreferences();
            },
            deep: true,
        },
    },
    methods: {
        ...mapActions([
            "savePreferences",
        ]),
    },
    computed: {
        ...mapState({
            preferences: state => state.preferences,
        }),
        ...mapFields([
            "preferences.appearance.theme",
            "preferences.appearance.selectionRectColor",
            "preferences.appearance.boundingRectColor",
            "preferences.snapToGrid",
            "preferences.appearance.showGrid",
            "preferences.gridSize",
            "preferences.appearance.connectors.dragDeadZone",
            "preferences.appearance.connectors.controlFillStyle",
            "preferences.appearance.connectors.strokeStyle",
            "preferences.appearance.connectors.selectedStrokeStyle",
            "preferences.appearance.connectors.hoverStrokeStyle",
            "preferences.appearance.connectors.watchStrokeStyle",
            "preferences.appearance.connectors.activityStrokeStyle",
            "preferences.appearance.connectors.errorStrokeStyle",
            "preferences.appearance.connectors.lineWidth",
        ]),
        colorBaseKeys() {
            return Object.keys(colors);
        },
    },
};
</script>
<style></style>
