<template>
    <v-app>
        <div class="provider-background">
            <v-card class="provider-card">
                <div class="mx-auto" style="width: 75px;">
                    <a href="/graph-editor/graphs">
                        <v-avatar color="primary" class="ma-5">
                            <v-img src="https://avatars1.githubusercontent.com/u/60668496?s=200&v=4"/>
                        </v-avatar>
                    </a>
                </div>
                <v-card-text>
                    <v-switch
                        help-topic="useLocalStorage"
                        :label="useLocalStorage ? 'Local Storage' : 'Server Storage'"
                        v-model="useLocalStorage"></v-switch>
                    <v-text-field
                        :disabled="useLocalStorage"
                        v-model="graphHTTPServer"
                        help-topic="HTTPServer"
                        label="HTTPS Server"
                    />
                    <v-text-field
                        :disabled="useLocalStorage"
                        v-model="graphWSSServer"
                        help-topic="WSSServer"
                        label="WSS Server"
                    />
                    <v-text-field
                        :disabled="useLocalStorage"
                        v-model="authDomain"
                        help-topic="authDomain"
                        label="Authentication Domain"
                    />
                    <v-text-field
                        :disabled="useLocalStorage"
                        v-model="authClientId"
                        help-topic="authClientId"
                        label="Authentication ClientId"
                    />
                    <v-btn @click="saveDbPrefs" class="ma-2">Update Configuration</v-btn>
                </v-card-text>
            </v-card>
        </div>
    </v-app>
</template>
<script>
import {mapState, mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";
export default {
    name: "user-menu",
    methods: {
        ...mapActions([
            "savePreferences",
        ]),
        saveDbPrefs() {
            if (this.originalPreferences !== JSON.stringify(this.preferences)) {
                this.showWarning = true;
                this.warningMessage = "Changes to data source provider will not take effect until you refresh your browser.";
            }
            this.showDataSourceProviderSetup = false;
            this.savePreferences();
            setTimeout(() => {
                window.location.reload();
            }, 10);
        },
        dataSourceProviderSetup() {
            this.originalPreferences = JSON.stringify(this.preferences);
            this.showDataSourceProviderSetup = true;
        },
    },
    computed: {
        ...mapFields([
            "preferences.useLocalStorage",
            "preferences.authClientId",
            "preferences.authDomain",
            "preferences.graphHTTPServer",
            "preferences.graphWSSServer",
            "preferences.userName",
            "preferences.avatar",
            "preferences.workstationId",
        ]),
        ...mapState({
            preferences: state => state.preferences,
        }),
    },
};
</script>
<style>
    .provider-background {
        background: radial-gradient(ellipse at bottom, #000000 -60%, #111111 50%, #333333 100%);
        height: 100vh;
    }
    .provider-card {
        margin: auto;
        margin-top: 30px;
        width: 400px;
    }
</style>
