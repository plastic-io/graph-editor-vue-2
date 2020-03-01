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
            >
                <graph-properties   v-if="panel === 'graph'"        :style="gutterStyle"/>
                <vector-properties  v-if="panel === 'properties'"   :style="gutterStyle"/>
                <set-editor         v-if="panel === 'set'"          :style="gutterStyle" :width="this.navWidth - this.iconGutterSize"/>
                <template-editor    v-if="panel === 'template'"     :style="gutterStyle" :width="this.navWidth - this.iconGutterSize"/>
                <history-panel      v-if="panel === 'history'"      :style="gutterStyle"/>
                <edge-properties    v-if="panel === 'edge'"         :style="gutterStyle"/>
                <import-panel       v-if="panel === 'import'"       :style="gutterStyle"/>
                <editor-settings    v-if="panel === 'settings'"     :style="gutterStyle"/>
            </v-card>
            <v-card
                class="icon-nav"
                tile
                elevation="0"
            >
                <div style="margin-top: 5px;">
                    <v-icon
                        title="Graph Properties"
                        :color="panel === 'graph' ? 'info' : ''"
                        @click="selectPanel('graph')"
                    >
                        mdi-lan
                    </v-icon>
                    <v-icon
                        title="Vector Properties"
                        v-if="selectedVector"
                        :color="panel === 'properties' ? 'info' : ''"
                        @click="selectPanel('properties')"
                    >
                        mdi-network
                    </v-icon>
                    <v-icon
                        title="Vector Set Code.  Code that runs when your vector is invoked at run time."
                        v-if="selectedVector"
                        :color="panel === 'set' ? 'info' : ''"
                        @click="selectPanel('set')"
                    >
                        mdi-lambda
                    </v-icon>
                    <v-icon
                        title="Vector Template Code.  Code that runs when your vector appears in the graph IDE."
                        v-if="selectedVector"
                        :color="panel === 'template' ? 'info' : ''"
                        @click="selectPanel('template')"
                    >
                        mdi-vuejs
                    </v-icon>
                    <v-icon
                        title="Vector edges."
                        v-if="selectedVector"
                        :color="panel === 'edge' ? 'info' : ''"
                        @click="selectPanel('edge')"
                    >
                        mdi-video-input-component
                    </v-icon>
                </div>
                <div style="position: absolute; bottom: 5px;">
                    <v-icon
                        title="History of changes for this session."
                        :color="panel === 'history' ? 'info' : ''"
                        @click="selectPanel('history')"
                    >
                        mdi-history
                    </v-icon>
                    <v-icon
                        title="Import new vectors and graphs into this graph."
                        :color="panel === 'import' ? 'info' : ''"
                        @click="selectPanel('import')"
                    >
                        mdi-package
                    </v-icon>
                    <v-icon
                        title="View and edit the settings of the graph IDE."
                        :color="panel === 'settings' ? 'info' : ''"
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
import {mapState} from "vuex";
import HistoryPanel from "./HistoryPanel";
import VectorProperties from "./VectorProperties";
import GraphProperties from "./GraphProperties";
import EdgeProperties from "./EdgeProperties";
import SetEditor from "./SetEditor";
import TemplateEditor from "./TemplateEditor";
import EditorSettings from "./EditorSettings";
import ImportPanel from "./ImportPanel";
export default {
    name: "control-panel",
    components: {
        VectorProperties,
        GraphProperties,
        SetEditor,
        TemplateEditor,
        EdgeProperties,
        EditorSettings,
        ImportPanel,
        HistoryPanel,
    },
    watch: {
        "mouse.y"() {
            this.mouseTranslate();
        },
        "mouse.x"() {
            this.mouseTranslate();
        },
        graph: {
            handler: function() {
                this.$set(this, "localGraph", this.graph);
            },
            deep: true
        },
    },
    computed: {
        ...mapState({
            historyPosition: state => state.historyPosition,
            events: state => state.events,
            selectRect: state => state.selectRect,
            selectedConnectors: state => state.selectedConnectors,
            selectedVector: state => state.selectedVector,
            selectedVectors: state => state.selectedVectors,
            hoveredConnectors: state => state.hoveredConnectors,
            hoveredVectors: state => state.hoveredVectors,
            hoveredPorts: state => state.hoveredPorts,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
            preferences: (state) => state.preferences,
        }),
        gutterStyle: function () {
            return {
                width: (this.navWidth - this.iconGutterSize) + "px",
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
            navWidth: 450,
            navWidths: {
                properties: "300px",
                history: "250px",
                graph: "250px",
                set: null,
                template: null,
                edge: "300px",
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
.main-nav {
    padding-right: 38px;
}
</style>
