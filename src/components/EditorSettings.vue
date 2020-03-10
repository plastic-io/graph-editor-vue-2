<template>
    <v-card flat>
        <v-card-title>
            <v-icon left>mdi-cogs</v-icon>
            Settings
        </v-card-title>
        <v-card-text class="ma-0 pa-0">
            <v-expansion-panels flat>
                <v-expansion-panel>
                    <v-expansion-panel-header>General</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-select label="Theme" :items="['dark', 'light']" v-model="theme"></v-select>
                                <v-text-field disabled label="Grid Size" persistent-hint hint="Cannot change for now" v-model.number="gridSize"/>
                                <v-switch label="Snap To Grid" v-model="snapToGrid"></v-switch>
                                <v-switch label="Show Grid" v-model="showGrid"></v-switch>
                                <v-switch label="Input/Output Labels" v-model="showLabels"/>
                                <v-switch persistent-hint hint="Captures debug logs and show edge values" label="Debug" v-model="debug"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Canvas Appearance</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-select :items="colorBaseKeys" label="Selection Rectange Color" v-model="selectionRectColor"/>
                                <v-select :items="colorBaseKeys" label="Bounding Rectangle Color" v-model="boundingRectColor"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Connector Appearance</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field label="Connector Drag Dead Zone" v-model.number="dragDeadZone"/>
                                <v-select :items="colorBaseKeys" label="Control Fill Style" v-model="controlFillStyle"/>
                                <v-select :items="colorBaseKeys" label="Stroke Style" v-model="strokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Selected Stroke Style" v-model="selectedStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Hover Stroke Style" v-model="hoverStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Watch Stroke Style" v-model="watchStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Activity Stroke Style" v-model="activityStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Error Stroke Style" v-model="errorStrokeStyle"/>
                                <v-text-field label="Line Width" v-model.number="lineWidth"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
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
            "preferences.showLabels",
            "preferences.debug",
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
