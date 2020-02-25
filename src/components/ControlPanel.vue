<template>
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
                <properties-form
                    v-if="panel === 'graph'"
                    :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                />
                <properties-form
                    v-if="panel === 'properties'"
                    :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                />
                <div
                    v-if="panel === 'set'"
                    :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                >
                    <editor
                        v-model="graphSet"
                        @init="editorInit"
                        lang="json"
                        theme="twilight"
                        :width="navWidth - iconGutterSize + 'px'"
                        height="calc(100vh - 55px)"
                    ></editor>
                </div>
                <div
                    v-if="panel === 'template'"
                    :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                >
                    <editor
                        v-model="graphVue"
                        @init="editorInit"
                        lang="json"
                        theme="twilight"
                        :width="navWidth - iconGutterSize + 'px'"
                        height="calc(100vh - 55px)"
                    ></editor>
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
                    v-if="panel === 'history'"
                    :style="'width: ' + (navWidth - iconGutterSize) + 'px'"
                >
                    <div
                        v-for="(event, index) in events"
                        :key="index"
                        :style="historyPosition === index + 1 ? 'background: tan;' : ''"
                        @click="moveHistoryPosition(-(historyPosition - (index + 1)))">
                        {{index}} {{historyPosition}}
                    </div>
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
                        title="Graph Properties"
                        :color="panel === 'graph' ? 'accent' : ''"
                        @click="selectPanel('graph')"
                    >
                        mdi-file-document
                    </v-icon>
                    <v-icon
                        title="Vector Properties"
                        v-if="selectedVectors.length"
                        :color="panel === 'properties' ? 'accent' : ''"
                        @click="selectPanel('properties')"
                    >
                        mdi-view-list
                    </v-icon>
                    <v-icon
                        title="Vector Set Code.  Code that runs when your vector is invoked at run time."
                        v-if="selectedVectors.length === 1"
                        :color="panel === 'set' ? 'accent' : ''"
                        @click="selectPanel('set')"
                    >
                        mdi-ray-end
                    </v-icon>
                    <v-icon
                        title="Vector Template Code.  Code that runs when your vector appears in the graph IDE."
                        v-if="selectedVectors.length === 1"
                        :color="panel === 'template' ? 'accent' : ''"
                        @click="selectPanel('template')"
                    >
                        mdi-vuejs
                    </v-icon>
                </div>
                <div style="position: absolute; bottom: 5px;">
                    <v-icon
                        title="History of changes for this session."
                        :color="panel === 'history' ? 'accent' : ''"
                        @click="selectPanel('history')"
                    >
                        mdi-history
                    </v-icon>
                    <v-icon
                        title="Raw Graph JSON.  View and edit the raw JSON that created this graph."
                        :color="panel === 'raw' ? 'accent' : ''"
                        @click="selectPanel('raw')"
                    >
                        mdi-json
                    </v-icon>
                    <v-icon
                        title="Import new vectors and graphs into this graph."
                        :color="panel === 'import' ? 'accent' : ''"
                        @click="selectPanel('import')"
                    >
                        mdi-package
                    </v-icon>
                    <v-icon
                        title="View and edit the settings of the graph IDE."
                        :color="panel === 'settings' ? 'accent' : ''"
                        @click="selectPanel('settings')"
                    >
                        mdi-cogs
                    </v-icon>
                    <v-icon
                        title="Use this slider to resize the control panel for some tabs."
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
</template>
<script>
import editor from "vue2-ace-editor";
import {mapState, mapActions} from "vuex";
import PropertiesForm from "./PropertiesForm";
export default {
    name: "control-panel",
    components: {
        editor,
        PropertiesForm,
    },
    watch: {
        "mouse.y"() {
            this.mouseTranslate();
        },
        "mouse.x"() {
            this.mouseTranslate();
        },
        localGraph: {
            handler: function() {
                this.graphJSON = JSON.stringify(this.localGraph, null, "\t");
            },
            deep: true
        },
        graph: {
            handler: function() {
                this.$set(this, "localGraph", this.graph);
            },
            deep: true
        },
        graphVue(val) {
            this.graph.template.vue = val;
            // this.$store.dispatch("graph", this.graph);
        },
        graphSet(val) {
            this.graph.template.set = val;
            // this.$store.dispatch("graph", this.graph);
        },
        graphJSON(val) {
            let dGraph; // eslint-disable-line
            try {
                dGraph = JSON.parse(val);
            } catch (e) {
                console.log(e);
            }
            // this.$store.dispatch("graph", dGraph);
        },
    },
    computed: {
        ...mapState({
            historyPosition: state => state.historyPosition,
            events: state => state.events,
            selectRect: state => state.selectRect,
            selectedConnectors: state => state.selectedConnectors,
            selectedVectors: state => state.selectedVectors,
            hoveredConnectors: state => state.hoveredConnectors,
            hoveredVectors: state => state.hoveredVectors,
            hoveredPorts: state => state.hoveredPorts,
            graph: state => state.graph,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
            preferences: (state) => state.preferences,
        }),
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
        ...mapActions([
            "moveHistoryPosition",
        ]),
        mouseTranslate() {
            if (this.panelDragging) {
                this.$refs.nav.$el.style.transition = "none";
                this.navWidth =
                    this.panelDragging.w +
                    (this.mouse.x - this.panelDragging.x);
                this.$refs.nav.$el.style.transition = undefined;
            }
        },
        startPanelDrag() {
            console.log(this.navWidths, this.panel);
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
        selectPanel(panel) {
            if (this.panel === panel) {
                this.panel = "";
                return;
            }
            this.panel = panel;
        }
    },
    mounted() {
        this.localGraph = this.graph;
    },
    data: () => {
        return {
            iconGutterSize: 55,
            graphVue: null,
            graphSet: null,
            graphJSON: null,
            panelDragging: null,
            navWidth: 250,
            navWidths: {
                properties: "250px",
                history: "250px",
                graph: "250px",
                set: null,
                template: null,
                raw: null,
                import: "250px",
                settings: "250px"
            },
            panel: "",
            panelOpen: true,
            localGraph: null,
        };
    }
};
</script>
<style>
</style>
