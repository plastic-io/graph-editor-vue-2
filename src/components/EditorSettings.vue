<template>
    <v-card flat style="height: calc(100vh - 49px);overflow-y: auto;">
        <v-card-title>
            <v-icon left>mdi-cogs</v-icon>
            Settings
        </v-card-title>
        <v-card-text class="ma-0">
            <v-expansion-panels flat v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>User</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-img
                                    :title="userName"
                                    :src="avatar"
                                    style="width: 50px; border-radius: 25px;border: solid 2px rgba(255, 255, 255, 0.5);"/>
                                <v-text-field
                                    v-model="userName"
                                    help-topic="userName"
                                    label="User Name"
                                />
                                <v-text-field
                                    disabled
                                    v-model="workstationId"
                                    help-topic="workstationId"
                                    label="Workstation Id"
                                />
                                <v-text-field
                                    v-model="avatar"
                                    help-topic="avatar"
                                    label="Avatar"
                                />
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Graph</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-text-field
                                    help-topic="settingsGridSize"
                                    label="Grid Size"
                                    persistent-hint
                                    type="number"
                                    :disabled="!snapToGrid"
                                    v-model.number="gridSize"/>
                                <v-switch
                                    help-topic="settingsSnapToGrid"
                                    label="Snap To Grid"
                                    v-model="snapToGrid"></v-switch>
                                <v-switch help-topic="settingsShowGrid" label="Show Grid" v-model="showGrid"></v-switch>
                                <v-switch help-topic="settingsShowLabels" label="Input/Output Labels" v-model="showLabels"/>
                                <v-switch help-topic="settingsDebug" persistent-hint hint="Captures debug logs and show edge values.  Performance penalty." label="Debug" v-model="debug"/>
                                <v-switch help-topic="settingsNewVectorHelp" label="Use tutorial vector" persistent-hint hint="When on, new vectors contain a help message." v-model="newVectorHelp"></v-switch>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>General Appearance</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-select label="Theme" :items="['dark', 'light']" v-model="theme"></v-select>
                                <v-select :items="colorBaseKeys" label="Help Dialog Background" v-model="helpColor"/>
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
                                <v-text-field label="Connector Drag Dead Zone" v-model.number="dragDeadZone" type="number"/>
                                <v-select :items="colorBaseKeys" label="Control Fill Style" v-model="controlFillStyle"/>
                                <v-select :items="colorBaseKeys" label="Stroke Style" v-model="strokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Selected Stroke Style" v-model="selectedStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Hover Stroke Style" v-model="hoverStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Watch Stroke Style" v-model="watchStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Activity Stroke Style" v-model="activityStrokeStyle"/>
                                <v-select :items="colorBaseKeys" label="Error Stroke Style" v-model="errorStrokeStyle"/>
                                <v-text-field label="Line Width" v-model.number="lineWidth" type="number"/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>Danger Zone</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0">
                                <v-btn @click="clearEditorSettings">
                                    Clear editor settings
                                </v-btn>
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
                this.savePreferences();
            },
            deep: true,
        },
    },
    methods: {
        clearEditorSettings() {
            localStorage.removeItem("preferences");
            this.getPreferences();
        },
        ...mapActions([
            "getPreferences",
            "savePreferences",
        ]),
    },
    data() {
        return {
            panel: 0,
        };
    },
    computed: {
        ...mapState({
            preferences: state => state.preferences,
        }),
        ...mapFields([
            "preferences.useLocalStorage",
            "preferences.graphHTTPServer",
            "preferences.graphWSSServer",
            "preferences.userName",
            "preferences.avatar",
            "preferences.workstationId",
            "preferences.showLabels",
            "preferences.debug",
            "preferences.appearance.theme",
            "preferences.appearance.helpColor",
            "preferences.appearance.selectionRectColor",
            "preferences.appearance.boundingRectColor",
            "preferences.snapToGrid",
            "preferences.appearance.showGrid",
            "preferences.gridSize",
            "preferences.newVectorHelp",
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
