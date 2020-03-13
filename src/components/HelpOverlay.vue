<template>
    <v-overlay>
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
        console.warn("missing topics", missing);
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
