<template>
    <v-navigation-drawer
        disable-resize-watcher
        permanent
        :style="navStyle"
        class="nav-drawer"
        ref="nav"
        app
        flat
        height="calc(100vh - 48px)">
        <v-container
            class="flex-d align-stretch pa-0"
            fill-height
            style="z-index: 1;">
            <v-card
                class="main-nav"
                elevation="0"
                v-if="panel">
                <vector-properties
                    v-if="selectedVector && panel === 'properties'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <set-editor
                    v-if="selectedVector && panel === 'set'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <template-editor
                    v-if="selectedVector && panel === 'template'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <edge-properties
                    v-if="selectedVector && panel === 'edge'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <history-panel
                    v-if="panel === 'history'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <graph-properties
                    v-if="panel === 'graph'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <import-panel
                    v-if="panel === 'import'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <editor-settings
                    v-if="panel === 'settings'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <v-card
                    flat
                    v-if="!selectedVector && /properties$|set$|template$|edge$/.test(panel)">
                    <v-card-text>
                        <i>No Vectors Selected</i>
                    </v-card-text>
                </v-card>
            </v-card>
            <v-card
                class="icon-nav"
                tile
                elevation="0">
                <div style="margin-top: 5px;">
                    <v-icon
                        class="control-panel-icon"
                        title="Vector Properties"
                        :disabled="!selectedVector"
                        :color="panel === 'properties' ? 'info' : ''"
                        @click="selectPanel('properties')">
                        mdi-network
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="Vector Set Code.  Code that runs when your vector is invoked at run time."
                        :disabled="!selectedVector"
                        :color="panel === 'set' ? 'info' : ''"
                        @click="selectPanel('set')">
                        mdi-lambda
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="Vector Template Code.  Code that runs when your vector appears in the graph IDE."
                        :disabled="!selectedVector"
                        :color="panel === 'template' ? 'info' : ''"
                        @click="selectPanel('template')">
                        mdi-vuejs
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="Vector edges."
                        :disabled="!selectedVector"
                        :color="panel === 'edge' ? 'info' : ''"
                        @click="selectPanel('edge')">
                        mdi-video-input-component
                    </v-icon>
                </div>
                <div style="position: absolute; bottom: 5px;" class="control-panel-bottom">
                    <v-icon
                        class="control-panel-icon"
                        title="Graph Properties"
                        :color="panel === 'graph' ? 'info' : ''"
                        @click="selectPanel('graph')">
                        mdi-lan
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="History of changes for this session."
                        :color="panel === 'history' ? 'info' : ''"
                        @click="selectPanel('history')">
                        mdi-history
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="Import new vectors and graphs into this graph."
                        :color="panel === 'import' ? 'info' : ''"
                        @click="selectPanel('import')">
                        mdi-shape-rectangle-plus
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="View and edit the settings of the graph IDE."
                        :color="panel === 'settings' ? 'info' : ''"
                        @click="selectPanel('settings')">
                        mdi-cogs
                    </v-icon>
                    <v-icon
                        class="control-panel-icon"
                        title="Use this slider to resize the control panel for some tabs."
                        style="cursor: ew-resize;"
                        color="secondary"
                        @mousedown="startPanelDrag">
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
            iconGutterSize: 35,
            graphVue: null,
            graphSet: null,
            graphJSON: null,
            panelDragging: null,
            navWidth: 450,
            navWidths: {
                properties: null,
                history: null,
                graph: null,
                set: null,
                template: null,
                edge: null,
                import: null,
                settings: null
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
    padding-right: 18px;
    width: 100%;
}
.control-panel-icon {
    margin-bottom: 10px;
}
.control-panel-bottom .control-panel-icon:last-child {
    margin-bottom: 0;
}
</style>
