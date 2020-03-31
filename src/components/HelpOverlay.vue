<template>
    <v-overlay v-if="showHelp">
        <div
            v-for="(topic, index) in topics"
            :key="index + '_canvas'"
            :style="topicStyle(topic)" @mouseover="setTopic(topic)">
            <v-icon small color="warning" style="transform: translate(-10px, -15px);">
                mdi-help-circle
            </v-icon>
        </div>
        <canvas ref="canvas" class="help-topic-canvas"></canvas>
        <v-alert
            style="max-width: 700px;max-height: 80vh; overflow: auto;"
            ref="card"
            icon="mdi-help-circle-outline"
            border="left"
            v-model="open"
            dismissible
            @wheel.stop
            :color="preferences.appearance.helpColor">
            <h3 class="headline" v-html="topicTitle"></h3>
            <div v-html="topicText"></div>
        </v-alert>
        <v-card style="position: fixed; bottom: 40px; right: 10px;">
            <v-card-title>
                Keyboard Shortcuts
            </v-card-title>
            <v-card-text>
                <table style="width: 380px;">
                    <tr>
                        <th style="width: 150px;">Key</th>
                        <th>Action</th>
                    </tr>
                </table>
                <div style="max-height: 65vh;overflow: auto;">
                    <table style="width: 380px;">
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + =</td><td>Zoom in</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + -</td><td>Zoom out</td></tr>
                        <tr><td>Delete</td><td>Delete selected vectors and connectors</td></tr>
                        <tr><td>Arrow Keys</td><td>Nudge seelcted vectors</td></tr>
                        <tr><td>\</td><td>Toggle selected vector presentation visibility</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + ]</td><td>Bring forward</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + <v-icon>mdi-apple-keyboard-shift</v-icon> + ]</td><td>Bring to front</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + [</td><td>Send back</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + <v-icon>mdi-apple-keyboard-shift</v-icon> + [</td><td>Send to back</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + Z</td><td>Undo</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + <v-icon>mdi-apple-keyboard-shift</v-icon> + Z</td><td>Redo</td></tr>
                        <tr><td><v-icon>mdi-apple-keyboard-control</v-icon> + <v-icon>mdi-apple-keyboard-shift</v-icon> + D</td><td>Duplicate selected</td></tr>
                        <tr><td>Tab</td><td>Toggle control panel visibility</td></tr>
                        <tr><td>ALT + `</td><td>Toggle presentation mode</td></tr>
                        <tr><td>Space + Left Mouse Button</td><td>Hold to move graph view</td></tr>
                        <tr><td>Middle Mouse Button</td><td>Hold to move graph view</td></tr>
                    </table>
                </div>
            </v-card-text>
        </v-card>
    </v-overlay>
</template>
<script>
import colors from "vuetify/lib/util/colors";
import {mapState} from "vuex";
export default {
    name: "help-overlay",
    props: {},
    destroyed() {
        window.removeEventListener("resize", this.resize);
    },
    mounted() {
        this.drawHelp();
        window.addEventListener("resize", this.resize);
        const missing = [];
        this.topics.forEach((topic) => {
            if (!this.helpTopics[topic]) {
                missing.push(topic);
            }
        });
        if (missing.length > 0) {
            console.warn("missing topics", missing);
        }
    },
    data() {
        return {
            localVersion: 1,
            ratio: 1,
            ctx: null,
            topic: null,
            open: true,
            lineRects: {},
        };
    },
    computed: {
        ...mapState({
            view: state => state.view,
            showHelp: state => state.showHelp,
            helpTopics: state => state.helpTopics,
            preferences: state => state.preferences,
        }),
        preferences(){
            return this.$store.state.preferences;
        },
        topicTitle() {
            if (!this.helpTopics[this.topic]) {
                return "Sorry!"; 
            }
            return this.helpTopics[this.topic].title || this.topic;
        },
        topicText() {
            if (!this.helpTopics[this.topic]) {
                return "No help topic currently exists for this item.";
            }
            return this.helpTopics[this.topic].html;
        },
        topics() {
            this.localVersion;
            return [...document.querySelectorAll("*[help-topic]")].map(e => e.getAttribute("help-topic"));
        },
        topicEl() {
            return (topic) => {
                this.localVersion;
                return document.querySelector(`*[help-topic='${topic}']`);
            };
        },
        topicRect() {
            return (topic) => {
                this.localVersion;
                return this.topicEl(topic).getBoundingClientRect();
            };
        },
        topicStyle() {
            return (topic) => {
                const rect = this.topicRect(topic);
                return {
                    cursor: "help",
                    padding: "10px",
                    position: "fixed",
                    top: rect.y + "px",
                    left: rect.x + "px",
                };
            };
        },
    },
    watch: {
        open() {
            this.$emit("close");
        },
        topic() {
            if (this.topic === "vueTemplate") {
                this.topic = "template";
            }
            if (this.topic === "setTemplate") {
                this.topic = "set";
            }
        },
        view: {
            handler() {
                this.localVersion += 1;
            },
            deep: true,
        },
    },
    methods: {
        resize() {
            this.drawHelp();
            this.localVersion += 1;
        },
        setTopic(e) {
            this.topic = e;
            this.drawHelp();
        },
        drawHelp() {
            this.topics.forEach((topic) => {
                if (topic === this.topic) {
                    this.localGraph = this.graph;
                    this.ctx = this.$refs.canvas.getContext("2d");
                    this.$refs.canvas.height = window.innerHeight;
                    this.$refs.canvas.width = window.innerWidth;
                    this.ctx.scale(this.ratio, this.ratio);
                    const source = this.topicEl(topic).getBoundingClientRect();
                    const target = this.$refs.card.$el.getBoundingClientRect();
                    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                    this.ctx.strokeStyle = colors["pink"].base;
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(source.x + 5, source.y + 5);
                    this.ctx.lineTo(target.x + (target.width / 2), target.y);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            });
        }
    },
};
</script>
<style>
.help-topic-canvas {
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
}
</style>
