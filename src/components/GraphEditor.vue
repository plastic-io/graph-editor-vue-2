<template>
    <v-app class="graph-editor" v-if="localGraph">
        <v-system-bar style="z-index: 2;">
            <span>Plastic-IO</span>
            <v-divider />
            <v-icon>mdi-folder</v-icon>
            <v-icon>mdi-undo-variant</v-icon>
            <v-icon>mdi-redo-variant</v-icon>
            <v-icon
                @click="showGrid = !showGrid"
                :color="showGrid ? 'accent' : ''"
                >mdi-grid</v-icon
            >
            <v-icon>mdi-lock-open</v-icon>
            <v-icon>mdi-share</v-icon>
        </v-system-bar>
        <v-navigation-drawer
            disable-resize-watcher
            permanent
            :style="navStyle"
            class="nav-drawer"
            ref="nav"
            app
            color="secondary"
            height="calc(100vh - 48px)"
        >
            <v-container
                class="flex-d align-stretch pa-0"
                fill-height
                style="z-index: 1;"
            >
                <v-card
                    class="main-nav"
                    tile
                    elevation="0"
                    v-if="panel"
                    color="secondary darken-2"
                >
                    <div
                        v-if="panel === 'graph'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        <PropertiesForm />
                    </div>
                    <div
                        v-if="panel === 'properties'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        <PropertiesForm />
                    </div>
                    <div
                        v-if="panel === 'set'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        VECTOR.TEMPLATE.SET
                    </div>
                    <div
                        v-if="panel === 'template'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        VECTOR.TEMPLATE.VUE
                    </div>
                    <div
                        v-if="panel === 'raw'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        <editor
                            v-model="graphJSON"
                            @init="editorInit"
                            lang="json"
                            theme="twilight"
                            :width="navWidth - iconGutterSize + 'px'"
                            height="calc(100vh - 55px)"
                        ></editor>
                    </div>
                    <div
                        v-if="panel === 'import'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        IMPORT GALLERY
                    </div>
                    <div
                        v-if="panel === 'settings'"
                        :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                    >
                        EDITOR SETTINGS
                    </div>
                </v-card>
                <v-card
                    class="icon-nav"
                    tile
                    elevation="0"
                    color="secondary darken-2"
                >
                    <div style="margin-top: 5px;">
                        <v-icon
                            :color="panel === 'graph' ? 'accent' : ''"
                            @click="selectPanel('graph')"
                        >
                            mdi-file-document
                        </v-icon>
                        <v-icon
                            v-if="selectedVectors.length"
                            :color="panel === 'properties' ? 'accent' : ''"
                            @click="selectPanel('properties')"
                        >
                            mdi-view-list
                        </v-icon>
                        <v-icon
                            v-if="selectedVectors.length === 1"
                            :color="panel === 'set' ? 'accent' : ''"
                            @click="selectPanel('set')"
                        >
                            mdi-ray-end
                        </v-icon>
                        <v-icon
                            v-if="selectedVectors.length === 1"
                            :color="panel === 'template' ? 'accent' : ''"
                            @click="selectPanel('template')"
                        >
                            mdi-vuejs
                        </v-icon>
                        <v-icon
                            v-if="selectedVectors.length === 1"
                            :color="panel === 'raw' ? 'accent' : ''"
                            @click="selectPanel('raw')"
                        >
                            mdi-json
                        </v-icon>
                    </div>
                    <div style="position: absolute; bottom: 5px;">
                        <v-icon
                            :color="panel === 'import' ? 'accent' : ''"
                            @click="selectPanel('import')"
                        >
                            mdi-package
                        </v-icon>
                        <v-icon
                            :color="panel === 'settings' ? 'accent' : ''"
                            @click="selectPanel('settings')"
                        >
                            mdi-cogs
                        </v-icon>
                        <v-icon
                            :style="
                                !navWidths[panel]
                                    ? 'cursor: ew-resize;'
                                    : 'cursor: not-allowed;'
                            "
                            :color="!navWidths[panel] ? '' : 'secondary'"
                            @mousedown="startPanelDrag"
                        >
                            mdi-drag-vertical
                        </v-icon>
                    </div>
                </v-card>
            </v-container>
        </v-navigation-drawer>
        <div class="graph-container" :style="graphContainerStyle">
            <graph-canvas
                :showGrid="showGrid"
                :graph="localGraph"
                :view="view"
                @select-vector="selectVector"
            ></graph-canvas>
        </div>
        <v-system-bar
            style="position: absolute; z-index: 2; bottom: 0; width: 100vw;"
        >
            <v-divider />
            <span
                >Graph ID: {{ graph.id }} : Vectors:
                {{ graph.vectors.length }} : x:{{ view.x }} y:{{ view.y }}
                {{ (view.k * 100).toFixed(2) }}%</span
            >
        </v-system-bar>
    </v-app>
</template>
<script>
import GraphCanvas from "./GraphCanvas";
import editor from "vue2-ace-editor";
import { mapState } from "vuex";
import PropertiesForm from "./PropertiesForm";

export default {
    name: "GraphEditor",
    components: {
        GraphCanvas,
        editor,
        PropertiesForm
    },
    watch: {
        graphJSON() {
            let dGraph;
            try {
                dGraph = JSON.parse(this.graphJSON);
            } catch (e) {
                console.log(e);
            }
            console.log("send update to store");
            this.$store.dispatch("update", dGraph);
        },
        graph: {
            handler: function() {
                console.log("update from store");
                this.$set(this, "localGraph", this.graph);
            },
            deep: true
        },
        localGraph: {
            handler: function() {
                this.graphJSON = JSON.stringify(this.localGraph, null, "\t");
            },
            deep: true
        },
        "mouse.y"() {
            this.mouseTranslate();
        },
        "mouse.x"() {
            this.mouseTranslate();
        },
        "keys.32"(e) {
            this.translate = e;
        }
    },
    computed: {
        ...mapState({
            graph: state => state.graph
        }),
        graphContainerStyle: function() {
            let cursor = "";
            if ((this.mouse.lmb && this.translate) || this.mouse.mmb) {
                cursor = "grabbing";
            } else if (this.keys[this.spaceKeyCode]) {
                cursor = "grab";
            }
            return {
                cursor
            };
        },
        navStyle: function() {
            let navWidth = this.navWidths[this.panel];
            if (!navWidth) {
                navWidth = this.navWidth + "px";
            }
            return {
                width: this.panel ? navWidth : "38px"
            };
        }
    },
    methods: {
        startPanelDrag() {
            if (this.navWidths[this.panel]) {
                return;
            }
            this.$set(this, "panelDragging", {
                x: this.mouse.x,
                y: this.mouse.y,
                w: this.navWidth
            });
            const dragEnd = () => {
                this.panelDragging = false;
                document.removeEventListener("mouseup", dragEnd);
            };
            document.addEventListener("mouseup", dragEnd);
        },
        editorInit() {
            require("brace/mode/json"); // eslint-disable-line
            require("brace/mode/javascript"); // eslint-disable-line
            require("brace/ext/language_tools"); // eslint-disable-line
            require("brace/theme/twilight"); // eslint-disable-line
        },
        mouseTranslate() {
            if ((this.translate && this.mouse.lmb) || this.mouse.mmb) {
                this.view.x =
                    this.startTranslate.x +
                    (this.mouse.x - this.startTranslate.mouseX);
                this.view.y =
                    this.startTranslate.y +
                    (this.mouse.y - this.startTranslate.mouseY);
            }
            if (this.panelDragging) {
                this.$refs.nav.$el.style.transition = "none";
                this.navWidth =
                    this.panelDragging.w +
                    (this.mouse.x - this.panelDragging.x);
                this.$refs.nav.$el.style.transition = undefined;
            }
        },
        mousemove(e) {
            const mouse = this.getMousePosFromEvent(e);
            this.$set(this.mouse, "x", mouse.x);
            this.$set(this.mouse, "y", mouse.y);
        },
        mousedown(e) {
            this.startTranslate = {
                mouseX: this.mouse.x,
                mouseY: this.mouse.y,
                y: this.view.y,
                x: this.view.x
            };
            this.$set(this.mouse, this.buttonMap[e.button], true);
        },
        mouseup(e) {
            this.$set(this.mouse, this.buttonMap[e.button], false);
        },
        selectVector(e, vector) {
            if (e.ctrlKey || e.metaKey) {
                return this.selectedVectors.push(vector);
            }
            this.selectedVectors = [this.selectedVectors];
        },
        getMousePosFromEvent(e) {
            if (!this.$el) {
                return {
                    x: 0,
                    y: 0
                };
            }
            const rect = this.$el.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        },
        scale(e) {
            const mouse = this.getMousePosFromEvent(e);
            const ok = this.view.k;
            const delta =
                (e.wheelDelta ? e.wheelDelta / 120 : -e.deltaY / 3) * 0.01;
            let x = this.view.x;
            let y = this.view.y;
            let k = this.view.k;
            k += delta || 1;
            k = Math.min(Math.max(k, 0.1), 4);
            const target = {
                x: (mouse.x - x) / ok,
                y: (mouse.y - y) / ok
            };
            x = -target.x * k + mouse.x;
            y = -target.y * k + mouse.y;
            this.view.k = k;
            this.view.x = Math.floor(x);
            this.view.y = Math.floor(y);
        },
        selectPanel(panel) {
            if (this.panel === panel) {
                this.panel = "";
                return;
            }
            this.panel = panel;
        }
    },
    mounted() {
        document.onwheel = e => {
            this.scale(e);
        };
        document.onmousedown = this.mousedown;
        document.onmouseup = this.mouseup;
        document.onmousemove = this.mousemove;
        window.onkeyup = e => {
            this.$set(this.keys, e.keyCode, false);
        };
        window.onkeydown = e => {
            this.$set(this.keys, e.keyCode, true);
        };
        this.localGraph = this.graph;
    },
    data: () => {
        return {
            iconGutterSize: 55,
            graphJSON: null,
            panelDragging: null,
            navWidth: 250,
            navWidths: {
                properties: "250px",
                graph: "250px",
                set: null,
                template: null,
                raw: null,
                import: "250px",
                settings: "250px"
            },
            buttonMap: {
                "0": "lmb",
                "2": "rmb",
                "1": "mmb"
            },
            startTranslate: null,
            mouse: {
                lmb: false,
                rmb: false,
                mmb: false,
                x: 0,
                y: 0
            },
            spaceKeyCode: 32,
            keys: {},
            translate: false,
            view: {
                x: 0,
                y: 0,
                k: 1
            },
            panel: "",
            localGraph: null,
            panelOpen: true,
            showGrid: true,
            selectedVectors: ["1"]
        };
    }
};
</script>
<style>
.graph-container {
    color: red;
    width: 100vw;
}
.nav-drawer {
    margin-top: 24px;
}
.main-nav {
    padding-right: 38px;
}
.icon-nav {
    border: solid 1px black;
    width: 38px;
    right: 0;
    position: absolute;
    height: calc(100vh - 48px);
    padding: 5px;
}
</style>
