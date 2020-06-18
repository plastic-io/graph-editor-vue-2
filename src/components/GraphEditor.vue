<template>
    <v-app class="graph-editor" :style="`background: ${bgColor};`">
        <ErrorPage v-if="notFound" />
        <template v-if="graph && !graph.err">
            <v-system-bar
                v-if="!presentation && panelVisibility"
                ref="topBar"
                style="z-index: 2;white-space: nowrap; top: 0; position: fixed; width: 100vw;">
                <div
                    title="Graph ID"
                    style="padding-right: 10px;cursor: pointer;">
                    <v-icon help-topic="openGraph" @click="openGraph" title="Show open graph dialog (^ + O)">
                        mdi-folder
                    </v-icon>
                    <span v-if="inRewindMode">
                        Rewinding...
                    </span>
                    <i v-else style="display: inline-block; width: 75px; overflow: visible;" help-topic="saveStatus" v-html="pending ? 'Saving...' : 'Saved'"/>
                </div>
                <v-spacer style="margin-right: 5%;"/>
                <span help-topic="documentName" class="pa-1">
                    {{ graph.properties.name || "Untitled" }}
                </span>
                <span>-</span>
                <span help-topic="plastic" class="pa-1">Plastic-IO</span>
                <v-spacer/>
                <graph-users/>
                <span>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon :disabled="historyPosition === 0 || events.length === 0"
                        @click="undo"
                        help-topic="undo"
                        title="Undo last action (^ + Z)">mdi-undo-variant</v-icon>
                    <v-icon :disabled="historyPosition === events.length"
                        @click="redo"
                        help-topic="redo"
                        title="Redo last undone action (^ + Shift + Z)">mdi-redo-variant</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon :disabled="selectedVectors.length === 0"
                        @click="duplicateSelection"
                        help-topic="duplicate"
                        title="Duplicate selected vectors (^ + Shift + D)">mdi-content-duplicate</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon :disabled="selectedVectors.length < 2"
                        @click="groupSelected"
                        help-topic="group"
                        title="Group (^ + G)">mdi-group</v-icon>
                    <v-icon :disabled="primaryGroup === null"
                        @click="ungroupSelected"
                        help-topic="ungroup"
                        title="Ungroup (^ + Shift + G)" >mdi-ungroup</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon
                        @click="bringForward"
                        help-topic="bringForward"
                        title="Bring forward (^ + ])">mdi-arrange-bring-forward</v-icon>
                    <v-icon
                        @click="bringToFront"
                        help-topic="bringToFront"
                        title="Bring to front (^ + Shift + ])">mdi-arrange-bring-to-front</v-icon>
                    <v-icon
                        @click="sendBackward"
                        help-topic="sendBackward"
                        title="Send backward (^ + [)">mdi-arrange-send-backward</v-icon>
                    <v-icon
                        @click="sendToBack"
                        help-topic="sendToBack"
                        title="Send to back (^ + Shift + [)">mdi-arrange-send-to-back</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon
                        help-topic="deleteSelected"
                        @click="deleteSelected"
                        title="Delete selected (delete)"
                        :disabled="selectedVectors.length === 0 && selectedConnectors === 0">mdi-delete</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon
                        @click="toggleHelp"
                        help-topic="toggleHelp"
                        :color="showHelp ? 'info' : ''"
                        title="Help">mdi-help-circle-outline</v-icon>
                </span>
                <user-menu :size="17"/>
            </v-system-bar>
            <div :style="showHelp ? 'pointer-events: none;' : ''">
                <control-panel v-if="!presentation && panelVisibility" ref="panel"/>
            </div>
            <div :class="presentation ? '' : 'graph-container'" :style="graphContainerStyle">
                <graph-canvas
                    :class="translating && mouse.lmb ? 'no-select' : ''"
                    :showGrid="preferences.appearance.showGrid && !presentation"
                ></graph-canvas>
            </div>
            <v-system-bar
                v-if="!presentation && panelVisibility"
                ref="bottomBar"
                style="position: absolute; z-index: 2; bottom: 0; width: 100vw;"
                class="no-select bottom-system-bar"
            >
                <div
                    help-topic="mouseCoordinates"
                    title="Mouse Coordinates"
                    style="width: 110px;cursor: crosshair;">
                    <v-icon>mdi-crosshairs-gps</v-icon>{{ Math.floor((mouse.x - view.x) / view.k) }} : {{ Math.floor((mouse.y - view.y) / view.k) }}
                </div>
                <div
                help-topic="selectionCoordinates"
                title="Selection Coordinates"
                style="width: 240px;cursor: crosshair;">
                    <v-icon>mdi-selection</v-icon>
                        x: {{Math.floor(selectionRect.x)}}
                        y: {{Math.floor(selectionRect.x)}}
                        h: {{Math.floor(selectionRect.height)}}
                        w: {{Math.floor(selectionRect.width)}}
                </div>
                <v-spacer/>
                <div help-topic="selectedVectors" title="Selected Vectors / Total Vectors" style="padding-right: 10px;cursor: pointer;">
                    <v-icon>mdi-network</v-icon>{{ selectedVectors.length }}/{{ graph.vectors.length }}
                </div>
                <div help-topic="viewportLocation" title="Viewport localtion" style="padding-right: 10px;cursor: crosshair;" @click="resetView">
                    <v-icon>mdi-crosshairs-gps</v-icon>x:{{ view.x.toFixed(0) }} y:{{ view.y.toFixed(0) }}
                </div>
                <v-icon title="Zoom Out (^ + -)" style="cursor: pointer;" @click="zoomOut">mdi-magnify-minus-outline</v-icon>
                <div
                    help-topic="viewportZoom"
                    @click="resetZoom"
                    title="Zoom Level"
                    style="padding-right: 5px;cursor: crosshair;">
                    {{ (view.k * 100).toFixed(2) }}%
                </div>
                <v-icon
                    @click="zoomIn"
                    title="Zoom In (^ + +)"
                    style="padding-right: 10px;cursor: pointer;"
                    >mdi-magnify-plus-outline</v-icon>
                <v-icon
                    help-topic="showConnectorView"
                    title="Show Connector Information"
                    @click="showConnectorView = !showConnectorView"
                    style="padding-right: 10px;cursor: pointer;"
                    :color="showConnectorView ? 'info' : ''"
                    >mdi-information-outline</v-icon>
                <v-icon
                    help-topic="toggleLabels"
                    title="Toggle Input/Output Labels"
                    @click="toggleLabels"
                    style="padding-right: 10px;cursor: pointer;"
                    :color="preferences.showLabels ? 'info' : ''"
                    >{{preferences.showLabels ? 'mdi-label' : 'mdi-label-off'}}</v-icon>
                <v-icon
                    title="Toggle Grid Visibility"
                    @click="toggleGrid"
                    help-topic="toggleGrid"
                    style="padding-right: 10px;cursor: pointer;"
                    :color="preferences.appearance.showGrid ? 'info' : ''"
                    >mdi-grid</v-icon>
                <v-icon
                    title="Toggle Map Visibility"
                    @click="toggleMap"
                    help-topic="toggleMap"
                    style="padding-right: 10px;cursor: pointer;"
                    :color="preferences.showMap ? 'info' : ''"
                    >mdi-map</v-icon>
                <v-icon
                    title="Toggle Lock"
                    @click="toggleLock"
                    help-topic="toggleLock"
                    :color="locked ? 'info' : ''"
                    style="padding-right: 10px;cursor: pointer;"
                    >{{locked ? 'mdi-lock' : 'mdi-lock-open'}}</v-icon>
                <v-icon
                    title="Toggle Presentation (Alt + `)"
                    @click="togglePresentation"
                    help-topic="togglePresentation"
                    :color="presentation ? 'info' : ''"
                    style="padding-right: 10px;cursor: pointer;"
                    >{{presentation ? 'mdi-presentation-play' : 'mdi-presentation'}}</v-icon>
            </v-system-bar>
        </template>
        <v-bottom-sheet hide-overlay inset :timeout="2000" v-model="presentationWarning" multi-line>
            <v-alert>
                <v-row>
                    <v-col>Press Alt + ` to toggle Presentation Mode</v-col>
                </v-row>
            </v-alert>
        </v-bottom-sheet>
        <v-snackbar :timeout="0" v-model="localShowError" :top="!graph" color="transparent">
            <v-alert type="error" prominent>
                <v-row>
                    <v-col>
                        <h2>Error</h2>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>{{localErrorMessage}}</v-col>
                </v-row>
                <v-row>
                    <v-col v-if="graph">
                        <v-btn @click="clearError">Dismiss</v-btn>
                    </v-col>
                </v-row>
            </v-alert>
        </v-snackbar>
        <v-progress-linear v-if="!graph && !localShowError" indeterminate></v-progress-linear>
        <help-overlay v-if="showHelp" @close="toggleHelp" style="z-index: 14;"/>
        <component :is="'style'" v-if="!presentation">
            html, body {
                overflow: hidden;
            }
        </component>
        <graph-mouse/>
        <connector-view v-if="showConnectorView" @close="showConnectorView = false;" :activity="hoveredActivity"/>
        <v-snackbar :timeout="2000" :value="showInfo" @input="clearInfo">
            {{infoMessage}}
        </v-snackbar>
        <v-bottom-sheet hide-overlay inset v-model="showAnnoyingHelpMessage">
            <v-alert type="info" prominent border="left" color="primary" colored-border elevation="2" middle icon="mdi-help-circle-outline">
                <v-row>
                    <v-col>
                        <h2>Welcome to the Plastic-IO Graph Editor</h2>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        Click the <v-icon>mdi-help-circle-outline</v-icon> in the upper right corner for contextual help.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        To start building, select <v-icon>mdi-library</v-icon> on the left, then click and drag an item from the library onto your graph.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        Or double click on the canvas to create a new vector.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <i style="font-size: 0.8rem;">&bull; To disable this message, click on <v-icon>mdi-cogs</v-icon> settings, then click the "Graph" section, then turn off "Show Help Messages".</i>
                    </v-col>
                </v-row>
            </v-alert>
        </v-bottom-sheet>
        <test-view/>
        <graph-rewind v-if="rewindVisible"/>
        <graph-map v-if="preferences.showMap && !presentation"/>
    </v-app>
</template>
<script>
import GraphMap from "./GraphMap";
import ErrorPage from "./ErrorPage";
import GraphRewind from "./GraphRewind";
import GraphCanvas from "./GraphCanvas";
import {mapState, mapActions, mapMutations} from "vuex";
import ControlPanel from "./ControlPanel";
import HelpOverlay from "./HelpOverlay";
import GraphUsers from "./GraphUsers";
import GraphMouse from "./GraphMouse";
import ConnectorView from "./ConnectorView";
import UserMenu from "./UserMenu";
import TestView from "./TestView";
export default {
    name: "GraphEditor",
    props: {
        route: Object,
    },
    components: {
        UserMenu,
        GraphMap,
        GraphRewind,
        TestView,
        GraphCanvas,
        ControlPanel,
        HelpOverlay,
        GraphUsers,
        GraphMouse,
        ConnectorView,
        ErrorPage,
    },
    watch: {
        notFound() {
            if (!this.notFound) {
                this.showAnnoyingHelpMessage = !!this.preferences.newVectorHelp;
            }
        },
        presentationWarning() {
            this.hasSeenPresentationWarning = true;
            setTimeout(() => {
                this.presentationWarning = false;
            }, 3000);
        },
        presentation() {
            this.presentationWarning = !this.hasSeenPresentationWarning;
        },
        graph: {
            handler: function () {
                if (this.graph) {
                    if (!this.graphLoaded && this.graph.properties.startInPresentationMode) {
                        this.hasSeenPresentationWarning = true;
                        this.togglePresentation();
                    }
                    this.graphLoaded = true;
                }
            },
            deep: true,
        },
        showError() {
            if (/NoSuchKey/.test(this.error)) {
                return;
            }
            this.localShowError = this.showError;
            if (this.error) {
                this.localErrorMessage = this.error.toString();
            }
        },
        "keys.32"(e) {
            this.translate = e;
        }
    },
    computed: {
        ...mapState({
            notFound: state => state.notFound,
            buttonMap: state => state.buttonMap,
            inRewindMode: state => state.inRewindMode,
            rewindVisible: state => state.rewindVisible,
            showInfo: state => state.showInfo,
            infoMessage: state => state.infoMessage,
            dataProviders: state => state.dataProviders,
            pendingEvents: state => state.pendingEvents,
            activityConnectors: state => state.activityConnectors,
            pathPrefix: state => state.pathPrefix,
            showHelp: state => state.showHelp,
            panelVisibility: state => state.panelVisibility,
            vectorMimeType: state => state.vectorMimeType,
            showError: state => state.showError,
            error: state => state.error,
            presentation: state => state.presentation,
            locked: state => state.locked,
            events: state => state.events,
            historyPosition: state => state.historyPosition,
            primaryGroup: state => state.primaryGroup,
            groupVectors: state => state.groupVectors,
            boundingRect: state => state.boundingRect,
            selectionRect: state => state.selectionRect,
            selectedConnectors: state => state.selectedConnectors,
            selectedVectors: state => state.selectedVectors,
            hoveredConnector: state => state.hoveredConnector,
            hoveredVector: state => state.hoveredVector,
            hoveredPort: state => state.hoveredPort,
            graph: state => state.graph,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
            preferences: (state) => state.preferences,
        }),
        pending: function() {
            return Object.keys(this.pendingEvents).length;
        },
        hoveredActivity: function() {
            if (!this.hoveredConnector && this.selectedConnectors.length === 0) {
                return null;
            }
            const key = this.hoveredConnector ? this.hoveredConnector.connector.id : this.selectedConnectors[0].id;
            return this.activityConnectors[key];
        },
        graphContainerStyle: function() {
            let cursor = "";
            if ((this.mouse.lmb && this.translate) || this.mouse.mmb) {
                cursor = "grabbing";
            } else if (this.keys[this.spaceKeyCode]) {
                cursor = "grab";
            } else if (this.hoveredConnector) {
                cursor = "move";
            }
            return {
                pointerEvents: this.showHelp ? "none" : undefined,
                cursor
            };
        },
    },
    methods: {
        ...mapMutations([
            "toggleLabels",
            "clearInfo",
            "toggleHelp",
        ]),
        ...mapActions([
            "toggleMap",
            "save",
            "raiseError",
            "clearError",
            "createNewVector",
            "undo",
            "redo",
            "duplicateSelection",
            "pasteVectors",
            "deleteSelected",
            "groupSelected",
            "ungroupSelected",
            "bringForward",
            "sendBackward",
            "bringToFront",
            "sendToBack",
            "toggleLock",
            "togglePresentation",
        ]),
        openGraph() {
            window.open(
                this.pathPrefix + "graphs",
                "_graphs",
            );
        },
        toggleGrid() {
            this.$store.dispatch("preferences", {
                ...this.preferences,
                ...{
                    appearance: {
                        ...this.preferences.appearance,
                        showGrid: !this.preferences.appearance.showGrid,
                    },
                },
            });
        },
        zoomOut() {
            this.$store.dispatch("view", {
                ...this.view,
                k: Math.max(this.view.k - .10, .10),
            });
        },
        zoomIn() {
            this.$store.dispatch("view", {
                ...this.view,
                k: Math.min(this.view.k + .10, 4),
            });
        },
        resetView() {
            this.$store.dispatch("view", {
                ...this.view,
                x: 0,
                y: 0,
            });
        },
        resetZoom() {
            this.$store.dispatch("view", {
                ...this.view,
                k: 1,
            });
        },
        isGraphTarget(e) {
            let parentNode = e.target;
            if (this.locked) {
                while (parentNode) {
                    if (parentNode.className === "vector") {
                        return false;
                    }
                    parentNode = parentNode.parentNode;
                }
            }
            return (!/^(no-graph-target|v-list|v-menu)/.test(e.target.className)) &&
                !((this.$refs.panel && this.$refs.panel.$el.contains(e.target))
                    || (this.$refs.topBar && this.$refs.topBar.$el.contains(e.target))
                    || (this.$refs.bottomBar && this.$refs.bottomBar.$el.contains(e.target)));
        },
        getItemAt(e) {
            while (e.parentNode) {
                if (e.className === "vector-inputs" || e.className === "vector-outputs") {
                    return {port: true};
                }
                if (e.className === "vector") {
                    const vectorId = e.getAttribute("x-vector-id");
                    return {
                        vector: this.graph.vectors.find((v) => {
                            return v.id === vectorId;
                        }),
                    };
                }
                e = e.parentNode;
            }
            return {};
        },
        mousemove(e) {
            if (this.showHelp || this.inRewindMode) {
                return;
            }
            const mouse = this.getMousePosFromEvent(e);
            const item = this.getItemAt(e.target);
            if (item.vector) {
                this.$store.dispatch("hoveredVector", item.vector);
            } else {
                this.$store.dispatch("hoveredVector", null);
            }
            if (!item.port) {
                this.$store.dispatch("hoveredPort", null);
            }
            this.$store.dispatch("mouse", {
                ...this.mouse,
                event: e,
                x: mouse.x,
                y: mouse.y,
            });
        },
        dblclick(e) {
            if (!/graph-canvas-container/.test(e.target.className)) {
                return;
            }
            this.createNewVector({
                x: e.clientX,
                y: e.clientY,
            });
        },
        mousedown(e) {
            let isMap = false;
            if (!this.graph || this.showHelp || this.inRewindMode) {
                return;
            }
            // do not track control panel inputs
            if (!this.isGraphTarget(e)) {
                return;
            }
            if (/graph-map-view-port|graph-map/.test(e.target.className)) {
                isMap = true;
            }
            const translating = {
                isMap,
                mouse: {
                    x: this.mouse.x,
                    y: this.mouse.y,
                    event: e,
                },
                view: {
                    y: this.view.y,
                    x: this.view.x,
                },
                vectors: this.graph.vectors.map((v) => {
                    return {
                        id: v.id,
                        properties: {
                            x: v.properties.x,
                            y: v.properties.y,
                            presentation: {
                                x: v.properties.presentation.x,
                                y: v.properties.presentation.y,
                            },
                            newX: 0,
                            newY: 0,
                        },
                    };
                }),
            };
            this.$store.dispatch("translating", translating);
            this.$store.dispatch("mouse", {
                ...this.mouse,
                event: e,
                [this.buttonMap[e.button]]: true,
            });
        },
        mouseup(e) {
            this.$store.dispatch("mouse", {
                ...this.mouse,
                event: e,
                [this.buttonMap[e.button]]: false,
            });
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
            // do not track control panel inputs
            if (!this.isGraphTarget(e) || this.showHelp || this.presentation) {
                return;
            }
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
            const view = {
                k,
                x: Math.floor(x),
                y: Math.floor(y),
            };
            this.$store.dispatch("view", view);
        },
        copyVectors(vectors) {
            vectors = JSON.parse(JSON.stringify(vectors));
            const vectorIds = vectors.map(v => v.id);
            // get rid of connectors that point to vectors not in this array
            vectors.forEach((vector) => {
                vector.edges.forEach((edge) => {
                    const dropConnectors = [];
                    edge.connectors.forEach((connector) => {
                        if (vectorIds.indexOf(connector.vectorId) === -1) {
                            dropConnectors.push(connector);
                        }
                    });
                    dropConnectors.forEach((connector) => {
                        edge.connectors.splice(edge.connectors.indexOf(connector), 1);
                    });
                });
            });
            return vectors;
        },
        evCut(e) {
            if (!this.isGraphTarget(e)
                || /dont-propagate-copy/.test(e.target.className)
                || this.selectedVectors.length === 0
                || /input|textarea/i.test(e.target.tagName)) {
                return;
            }
            console.warn("Clipboard cut captured by graph editor");
            e.clipboardData.setData(this.vectorMimeType, JSON.stringify(this.copyVectors(this.selectedVectors), null, "\t"));
            this.deleteSelected();
            e.preventDefault();
        },
        evCopy(e) {
            if (!this.isGraphTarget(e)
                    || /dont-propagate-copy/.test(e.target.className)
                    || this.selectedVectors.length === 0
                    || /input|textarea/i.test(e.target.tagName)) {
                return;
            }
            console.warn("Clipboard copy captured by graph editor");
            e.clipboardData.setData(this.vectorMimeType, JSON.stringify(this.copyVectors(this.selectedVectors), null, "\t"));
            e.preventDefault();
        },
        evPaste(e) {
            if (!this.isGraphTarget(e)
                || /dont-propagate-copy/.test(e.target.className)
                || /input|textarea/i.test(e.target.tagName)) {
                return;
            }
            console.warn("Clipboard paste captured by graph editor");
            const data = e.clipboardData.getData(this.vectorMimeType);
            this.tryPasteVectorString(data);
            e.preventDefault();
        },
        tryPasteVectorString(data) {
            const msg = "The text pasted onto the graph does not appear to be vector data.";
            let vectors;
            const er = () => {
                this.raiseError(msg);
                console.warn(msg);
            };
            try {
                vectors = JSON.parse(data);
            } catch(err) {
                console.error(err);
                return er();
            }
            if (!Array.isArray(vectors)) {
                return er();
            }
            for (var x = 0; x < vectors.length; x += 1) {
                if(!this.validateVector(vectors[x])){
                    return er();
                }
            }
            this.pasteVectors(vectors);
        },
        validateVector(vector) {
            if (
                !vector.id ||
                !vector.edges ||
                !Array.isArray(vector.edges) ||
                typeof vector.properties !== "object" ||
                vector.properties.x === undefined ||
                vector.properties.y === undefined ||
                vector.properties.z === undefined ||
                typeof vector.template !== "object" ||
                vector.template.set === undefined ||
                vector.template.vue === undefined
            ) {
                return false;
            }
            return true;
        },
        keyup(e) {
            if (e.target !== document.body) {
                return;
            }
            this.$store.dispatch("keyup", e);
        },
        keydown(e) {
            if (e.target !== document.body) {
                return;
            }
            this.$store.dispatch("keydown", e);
        }
    },
    created() {
        const isDark = this.preferences.appearance.theme === "dark";
        this.$vuetify.theme.dark = isDark;
        this.bgColor = isDark ? "#000000" : "#FFFFFF";
    },
    mounted() {
        document.onwheel = e => {
            this.scale(e);
        };
        document.oncut = this.evCut;
        document.onpaste = this.evPaste;
        document.oncopy = this.evCopy;
        document.onmousedown = this.mousedown;
        document.ondblclick = this.dblclick;
        document.onmouseup = this.mouseup;
        document.onmousemove = this.mousemove;
        window.onkeyup = this.keyup;
        window.onkeydown = this.keydown;
        let graphId = "index";
        if (this.route.path.split("/")[2]) {
            graphId = this.route.path.split("/")[2];
        }
        this.$store.dispatch("open", {
            graphId,
        });
    },
    data: () => {
        return {
            bgColor: "#000000",
            spaceKeyCode: 32,
            translate: false,
            showDialog: false,
            localErrorMessage: "",
            localShowError: false,
            localVersion: 0,
            graphLoaded: false,
            presentationWarning: false,
            hasSeenPresentationWarning: false,
            showAnnoyingHelpMessage: false,
            showConnectorView: false,
        };
    }
};
</script>
<style>
.graph-container {
    position: fixed;
    top: 0;
    left: 0;
}
.bottom-system-bar {
    white-space: nowrap;
}
.no-pointer-events {
    pointer-events: none;
}
.no-select {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
}
</style>
