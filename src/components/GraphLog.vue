<template>
    <v-card flat style="overflow-y: hidden;">
        <v-card-title>
            <v-icon left help-topic="logs">mdi-format-list-text</v-icon>
            Logs and State
        </v-card-title>
        <v-card-subtitle>
            State monitoring, execution and error logs.
        </v-card-subtitle>
        <v-card-text style="overflow-y: hidden;">
            <v-tabs hide-slider>
                <v-tab help-topic="logState">
                    State
                </v-tab>
                <v-tab help-topic="logErrors">
                    Errors <v-btn
                            v-if="getLogByType('error').length"
                            fab
                            x-small
                            right
                            color="error"
                            style="margin-left: 5px;">{{getLogByType('error').length}}</v-btn>
                </v-tab>
                <v-tab help-topic="logWarnings">
                    Warnings <v-btn
                                v-if="getLogByType('warn').length"
                                fab
                                x-small
                                right
                                color="warning"
                                style="margin-left: 5px;">{{getLogByType('warn').length}}</v-btn>
                </v-tab>
                <v-tab help-topic="logInfo">
                    Info <v-btn
                                v-if="getLogByType('info').length"
                                fab
                                x-small
                                right
                                color="info"
                                style="margin-left: 5px;">{{getLogByType('info').length}}</v-btn>
                </v-tab>
                <v-tab v-if="preferences.debug" help-topic="logDebug">
                    Debug <v-btn
                                v-if="getLogByType('debug').length"
                                fab
                                x-small
                                right
                                color="info"
                                style="margin-left: 5px;">{{getLogByType('debug').length}}</v-btn>
                </v-tab>
                <v-tab v-if="preferences.debug" help-topic="logEdges">
                    Edges <v-btn
                                v-if="getLogByType('edge').length"
                                fab
                                x-small
                                right
                                color="info"
                                style="margin-left: 5px;">{{getLogByType('edge').length}}</v-btn>
                </v-tab>
                <v-tab-item style="height: calc(100vh - 195px); width: calc(100% - 4px);">
                    <v-card flat>
                        <v-system-bar style="position: absolute; width: 100%;" color="primary">
                            <v-spacer/>
                            <v-icon help-topic="logStateRefresh" title="Clear" style="cursor: pointer;" @click="$forceUpdate">mdi-refresh</v-icon>
                        </v-system-bar>
                        <v-card-text style="padding-top: 20px;height: calc(100vh - 195px); overflow: auto;">
                            <div :style="preferences.appearance.theme === 'dark' ? 'filter: invert(1);' : ''">
                                <json-viewer copyable style="background: transparent; margin-left: -25px;" :value="state"></json-viewer>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab-item class="log-tab">
                    <v-system-bar style="position: absolute; width: 100%;" color="primary">
                        <v-spacer/>
                        <v-icon help-topic="logClear" title="Clear" @click="clearLog('error')">mdi-notification-clear-all</v-icon>
                    </v-system-bar>
                    <br>
                    <div v-for="(item, index) in getLogByType('error')" :key="index">
                        <div>{{item._t}}</div>
                        <pre>{{item.event.err.stack}}</pre>
                        <v-divider/>
                    </div>
                </v-tab-item>
                <v-tab-item class="log-tab">
                    <v-system-bar style="position: absolute; width: 100%;" color="primary">
                        <v-spacer/>
                        <v-icon help-topic="logClear" title="Clear" @click="clearLog('warn')">mdi-notification-clear-all</v-icon>
                    </v-system-bar>
                    <br>
                    <div v-for="(item, index) in getLogByType('warn')" :key="index">
                        <div>{{item._t}}</div>
                        <pre>{{item.event.err.stack}}</pre>
                        <v-divider/>
                    </div>
                </v-tab-item>
                <v-tab-item class="log-tab">
                    <v-system-bar style="position: absolute; width: 100%;" color="primary">
                        <v-spacer/>
                        <v-icon help-topic="logClear" title="Clear" @click="clearLog('info')">mdi-notification-clear-all</v-icon>
                    </v-system-bar>
                    <br>
                    <div v-for="(item, index) in getLogByType('info')" :key="index">
                        <div>{{item._t}}</div>
                        <pre>{{item.event}}</pre>
                        <v-divider/>
                    </div>
                </v-tab-item>
                <v-tab-item class="log-tab" v-if="preferences.debug">
                    <v-system-bar style="position: absolute; width: 100%;" color="primary">
                        <v-spacer/>
                        <v-icon help-topic="logClear" title="Clear" @click="clearLog('debug')">mdi-notification-clear-all</v-icon>
                    </v-system-bar>
                    <br>
                    <div v-for="(item, index) in getLogByType('debug')" :key="index">
                        <div>{{item._t}}</div>
                        <pre>{{item.event}}</pre>
                        <v-divider/>
                    </div>
                </v-tab-item>
                <v-tab-item class="log-tab" v-if="preferences.debug">
                    <v-system-bar style="position: absolute; width: 100%;" color="primary">
                        <v-spacer/>
                        <v-icon help-topic="logClear" title="Clear" @click="clearLog('edge')">mdi-notification-clear-all</v-icon>
                    </v-system-bar>
                    <br>
                    <div v-for="(item, index) in getLogByType('edge')" :key="index">
                        <div>{{item._t}}</div>
                        <pre>{{item.event}}</pre>
                        <v-divider/>
                    </div>
                </v-tab-item>
            </v-tabs>
        </v-card-text>
    </v-card>
</template>
<script>
import JsonViewer from "vue-json-viewer";
import {mapState, mapMutations} from "vuex";
export default {
    name: "graph-log",
    components: {JsonViewer},
    data: () => {
        return {};
    },
    methods: {
        ...mapMutations([
            "clearLog",
        ]),
    },
    computed: {
        ...mapState({
            preferences: state => state.preferences,
            state: state => state.scheduler.state,
            log: state => state.log,
        }),
        getLogByType() {
            return (type) => {
                return this.log.filter((item) => {
                    return item.eventName === type;
                });
            };
        },
    },
};
</script>
<style>
.log-tab div {
    padding: 10px;
}
.log-tab pre {
    padding: 10px;
    font-size: 0.8rem;
}
.log-tab {
    height: calc(100vh - 195px);
    width: calc(100% - 4px);
    overflow: auto;
}

</style>
