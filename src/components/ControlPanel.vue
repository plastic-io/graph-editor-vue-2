<template>
    <v-navigation-drawer
        disable-resize-watcher
        permanent
        :style="navStyle"
        class="nav-drawer"
        ref="nav"
        app
        flat
        :key="localVersion"
        height="calc(100vh - 48px)">
        <v-container
            class="flex-d align-stretch pa-0"
            fill-height
            style="z-index: 1; overflow: hidden;">
            <v-card
                class="main-nav"
                style="overflow: hidden;"
                elevation="0"
                v-if="panel">
                <v-tabs
                    v-model="graphPanelTabs"
                    v-if="panel === 'graph'"
                    :style="{width: this.navWidth - this.iconGutterSize + 'px'}">
                    <v-tab key="properties">
                        <v-icon>
                            mdi-graph-outline
                        </v-icon>
                    </v-tab>
                    <v-tab key="vectors">
                        <v-badge
                          overlap
                          :color="selectedVectors.length > 0 ? 'accent' : 'transparent'"
                          :content="selectedVectors.length"
                        >
                            <v-icon>
                                mdi-vector-point
                            </v-icon>
                        </v-badge>
                    </v-tab>
                    <v-tab key="presentationTemplate">
                        <v-icon>
                            mdi-vuejs
                        </v-icon>
                    </v-tab>
                    <v-tab-item key="properties">
                        <graph-properties
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                    <v-tab-item key="vectors">
                        <vector-list
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                    <v-tab-item key="presentationTemplate">
                        <presentation-editor
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                </v-tabs>
                <v-tabs
                    v-model="vectorPanelTabs"
                    v-if="selectedVector && panel === 'properties'"
                    :style="{width: this.navWidth - this.iconGutterSize + 'px'}">
                    <v-tab key="properties">
                        <v-icon>
                            mdi-vector-point
                        </v-icon>
                    </v-tab>
                    <v-tab key="edge">
                        <v-icon help-topic="edge">
                            mdi-video-input-component
                        </v-icon>
                    </v-tab>
                    <v-tab key="template">
                        <v-icon help-topic="template">
                            mdi-vuejs
                        </v-icon>
                    </v-tab>
                    <v-tab key="set">
                        <v-icon help-topic="set">
                            mdi-lambda
                        </v-icon>
                    </v-tab>
                    <v-tab key="tests">
                        <v-icon help-topic="tests">
                            mdi-flask
                        </v-icon>
                    </v-tab>
                    <v-tab-item key="properties">
                        <vector-properties
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                    <v-tab-item key="edge">
                        <edge-properties
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                    <v-tab-item key="template">
                        <template-editor
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                    <v-tab-item key="set">
                        <set-editor
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                    <v-tab-item key="tests">
                        <vector-tests
                            :style="gutterStyle"
                            :width="this.navWidth - this.iconGutterSize"/>
                    </v-tab-item>
                </v-tabs>
                <history-panel
                    v-if="panel === 'history'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <graph-log
                    v-if="panel === 'log'"
                    :style="gutterStyle"
                    :width="this.navWidth - this.iconGutterSize"/>
                <import-panel
                    v-if="panel === 'library'"
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
                elevation="0"
                style="border-left: solid 1px hsla(0,0%,100%,.12);">
                <div style="margin-top: 5px;">
                    <v-icon
                        help-topic="vectorProperties"
                        class="control-panel-icon"
                        title="Vector Properties"
                        :disabled="!selectedVector"
                        :color="panel === 'properties' ? 'info' : ''"
                        @click="selectPanel('properties')">
                        mdi-vector-point
                    </v-icon>
                    <v-icon
                        help-topic="graphProperties"
                        class="control-panel-icon"
                        title="Graph Properties"
                        :color="panel === 'graph' ? 'info' : ''"
                        @click="selectPanel('graph')">
                        mdi-graph-outline
                    </v-icon>
                    <v-divider/>
                </div>
                <div style="position: absolute; bottom: 5px;" class="control-panel-bottom">
                    <v-divider style="margin-bottom: 15px;margin-right: 5px;"/>
                    <v-badge
                      style="transform: scale(0.8);"
                      overlap
                      :color="log.length > 0 ? 'accent' : 'transparent'"
                      :content="log.length"
                    >
                        <v-icon
                            style="transform: scale(1.2);"
                            help-topic="log"
                            class="control-panel-icon"
                            title="Graph Logs and State"
                            :color="panel === 'log' ? 'info' : ''"
                            @click="selectPanel('log')">
                            mdi-format-list-text
                        </v-icon>
                    </v-badge>
                    <v-icon
                        help-topic="history"
                        class="control-panel-icon"
                        title="History of changes for this session"
                        :color="panel === 'history' ? 'info' : ''"
                        @click="selectPanel('history')">
                        mdi-history
                    </v-icon>
                    <v-icon
                        help-topic="library"
                        class="control-panel-icon"
                        title="Import new vectors and graphs into this graph"
                        :color="panel === 'library' ? 'info' : ''"
                        @click="selectPanel('library')">
                        mdi-library
                    </v-icon>
                    <v-icon
                        help-topic="settings"
                        class="control-panel-icon"
                        title="View and edit the settings of the graph IDE"
                        :color="panel === 'settings' ? 'info' : ''"
                        @click="selectPanel('settings')">
                        mdi-cogs
                    </v-icon>
                    <v-icon
                        help-topic="dragResizePanel"
                        class="control-panel-icon"
                        title="Use this slider to resize the control panel for some tabs"
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
import {mapState, mapActions} from "vuex";
import HistoryPanel from "./HistoryPanel";
import VectorProperties from "./VectorProperties";
import GraphProperties from "./GraphProperties";
import GraphLog from "./GraphLog";
import EdgeProperties from "./EdgeProperties";
import SetEditor from "./SetEditor";
import TemplateEditor from "./TemplateEditor";
import EditorSettings from "./EditorSettings";
import ImportPanel from "./ImportPanel";
import VectorTests from "./VectorTests";
import VectorList from "./VectorList";
import PresentationEditor from "./PresentationEditor";
export default {
    name: "control-panel",
    components: {
        PresentationEditor,
        VectorTests,
        GraphLog,
        VectorProperties,
        GraphProperties,
        SetEditor,
        TemplateEditor,
        EdgeProperties,
        EditorSettings,
        ImportPanel,
        VectorList,
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
            log: state => state.log,
            showHelp: state => state.showHelp,
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
                zIndex: this.showHelp ? 5 : undefined,
                width: this.panel ? navWidth : "43px"
            };
        }
    },
    methods: {
        ...mapActions([
            "graphUrl",
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
            this.localVersion += 1;
        }
    },
    mounted() {
        this.localGraph = this.graph;
    },
    data: () => {
        return {
            graphPanelTabs: null,
            vectorPanelTabs: null,
            localVersion: 0,
            iconGutterSize: 43,
            graphVue: null,
            graphSet: null,
            graphJSON: null,
            panelDragging: null,
            navWidth: 450,
            navWidths: {
                properties: null,
                history: null,
                log: null,
                graph: null,
                set: null,
                template: null,
                edge: null,
                library: null,
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
.nav-drawer {
    margin-top: 24px;
    transition: width 0.25s;
}
.icon-nav {
    border: solid 1px black;
    width: 43px;
    right: 0;
    position: absolute;
    height: calc(100vh - 48px);
    padding: 8px;
}
.control-panel-icon {
    margin-bottom: 10px;
}
.control-panel-bottom .control-panel-icon:last-child {
    margin-bottom: 0;
}
</style>
