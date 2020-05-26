<template>
    <v-bottom-sheet
        v-model="transport"
        persistent
        inset
        hide-overlay
        @click.stop
        @mousedown.stop
        @mouseup.stop
        no-click-animation
        :retain-focus="false">
        <v-card tile class="text-center ma-0">
            <v-card-text>
                <v-slider
                    v-model="currentSelectedVersion"
                    step="1"
                    :min="1"
                    thumb-label="always"
                    :max="maxVersion"
                >
                </v-slider>
                <v-btn-toggle mandatory v-model="transportSelection">
                    <v-btn @click="currentSelectedVersion = 1;">
                        <v-icon>
                            mdi-step-backward-2
                        </v-icon>
                    </v-btn>
                    <v-btn @click="setVersion(currentSelectedVersion - 1)">
                        <v-icon>mdi-step-backward</v-icon>
                    </v-btn>
                    <v-btn :color="playForward ? '' : 'accent'" @click="playForward = !playForward">
                        <v-icon>mdi-rewind</v-icon>
                    </v-btn>
                    <v-btn :color="!playing ? 'accent' : ''" @click="stop">
                        <v-icon>mdi-stop</v-icon>
                    </v-btn>
                    <v-btn :color="playing ? 'accent' : ''" @click="playing = true; startPlayback(); playbackRate = 1000;">
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                    <v-btn>
                        <v-icon color="red" @click="commitRewind">mdi-record</v-icon>
                    </v-btn>
                    <v-btn
                        :color="playbackRate === 500 ? 'accent' : ''"
                        @click="playbackRate === 500 ? playbackRate = 1000 : playbackRate = 500;">
                        <v-icon>mdi-fast-forward</v-icon>
                    </v-btn>
                    <v-btn  @click="setVersion(currentSelectedVersion + 1)">
                        <v-icon>mdi-step-forward</v-icon>
                    </v-btn>
                    <v-btn @click="currentSelectedVersion = maxVersion;">
                        <v-icon>
                            mdi-step-forward-2
                        </v-icon>
                    </v-btn>
                    <v-btn @click="discardRewind">
                        <v-icon>mdi-eject</v-icon>
                    </v-btn>
                </v-btn-toggle>
                <v-card-subtitle>
                    Version: {{currentSelectedVersion}} &bull;
                    Changed: {{getLastTime(lastUpdate)}} &bull;
                    By: {{lastUpdatedBy || 'Unknown userArn'}}
                </v-card-subtitle>
            </v-card-text>
            <component :is="'style'">
                .vector {
                    transition: top 0.1s linear, left 0.1s linear;
                }
            </component>
        </v-card>
        <v-dialog absolute v-model="showMessage" max-width="320">
            <v-card>
                <v-card-title class="headline">Confirm</v-card-title>
                <v-card-text>
                    {{message}}
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="showMessage = false">Cancel</v-btn>
                    <v-btn @click="messageClick">{{btnMessage}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-bottom-sheet>
</template>
<script>
import {mapState, mapActions, mapMutations} from "vuex";
import moment from "moment";
export default {
    name: "graph-rewind",
    data: () => {
        return {
            showMessage: false,
            maxVersion: 0,
            transportSelection: 4,
            currentSelectedVersion: 0,
            transport: true,
            maxPlaybackRate: 10000,
            minPlaybackRate: 500,
            playbackRate: 1000,
            playing: false,
            playForward: true,
            btnMessage: "",
            lastUpdate: "",
            lastUpdatedBy: "",
            message: "",
            messageClick: () => {},
        };
    },
    watch: {
        graphSnapshot: {
            handler() {
                this.lastUpdate = this.graphSnapshot.properties.lastUpdate;
                this.lastUpdatedBy = this.graphSnapshot.properties.lastUpdatedBy;
                if (this.playing) {
                    this.startPlayback();
                }
            },
            deep: true,
        },
        currentSelectedVersion() {
            this.setToRewindVersion(this.currentSelectedVersion);
        },
    },
    methods: {
        ...mapActions([
            "setToRewindVersion",
            "showGraphDiff",
            "raiseError",
            "open",
        ]),
        ...mapMutations([
            "commitToRewindVersion",
            "raiseResync",
            "rewindEnabled",
            "rewindDisabled",
        ]),
        setVersion(ver) {
            if (ver < this.maxVersion && ver > 0) {
                this.currentSelectedVersion = ver;
            }
        },
        discardRewind() {
            this.stop();
            this.messageClick = () => {
                this.showMessage = true;
                this.open({
                    graphId: this.graphSnapshot.id,
                });
                this.rewindDisabled();
            };
            this.showMessage = true;
            this.btnMessage = "Exit Rewind";
            this.message = "Are you sure you want exit rewind?  No changes will be made.";
        },
        commitRewind() {
            this.stop();
            this.messageClick = () => {
                this.showMessage = true;
                this.commitToRewindVersion();
                this.open({
                    graphId: this.graphSnapshot.id,
                });
            };
            this.btnMessage = "Revert to This State";
            this.showMessage = true;
            this.message = "Are you sure you want to revert back to this previous state?";
        },
        increasePlaybackRate() {
            this.playbackRate += 500;
        },
        stop() {
            this.playing = false;
            clearTimeout(this.playbackTimeout);
        },
        startPlayback() {
            clearTimeout(this.playbackTimeout);
            this.playbackTimeout = setTimeout(() => {
                if (this.playForward) {
                    if (this.currentSelectedVersion < this.maxVersion) {
                        this.currentSelectedVersion += 1;
                        return;
                    }
                } else {
                    if (this.currentSelectedVersion > 1) {
                        this.currentSelectedVersion -= 1;
                        return;
                    }
                }
                this.stop();
            }, this.playbackRate);
        },
        getLastTime(e) {
            if (this.lastUpdate === "Loading...") {
                return this.lastUpdate;
            }
            return moment(new Date(e)).fromNow();
        },
    },
    computed: {
        ...mapState({
            inRewindMode: state => state.inRewindMode,
            graphSnapshot: state => state.graphSnapshot,
        }),
    },
    beforeDestroy() {
        this.rewindDisabled();
    },
    mounted() {
        this.rewindEnabled();
        this.currentSelectedVersion = this.graphSnapshot.version;
        this.maxVersion = this.graphSnapshot.version;
        this.lastUpdate = this.graphSnapshot.properties.lastUpdate;
        this.lastUpdatedBy = this.graphSnapshot.properties.lastUpdatedBy;
    },
};
</script>
