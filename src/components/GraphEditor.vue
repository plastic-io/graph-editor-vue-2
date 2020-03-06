<template>
    <v-app class="graph-editor">
        <template  v-if="graph">
            <v-system-bar ref="topBar" style="z-index: 2;white-space: nowrap;">
                <div title="Graph ID" style="padding-right: 10px;cursor: pointer;">
                    <v-icon @click="openGraph" title="Show open graph dialog (^ + O)">
                        mdi-folder
                    </v-icon>
                    {{ graph.properties.name || "Untitled" }}
                </div>
                <v-spacer style="margin-right: 5%;"/>
                <span>Plastic-IO</span>
                <v-spacer/>
                <span>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon :disabled="historyPosition === 0 || events.length === 0" @click="undo" title="Undo last action (^ + Z)">mdi-undo-variant</v-icon>
                    <v-icon :disabled="historyPosition === events.length" @click="redo" title="Redo last undone action (^ + Shift + Z)">mdi-redo-variant</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon :disabled="selectedVectors.length === 0"  @click="duplicateSelection"
                        title="Duplicate selected vectors (^ + Shift + D)">mdi-content-duplicate</v-icon>
                    <v-icon :disabled="selectedVectors.length === 0 && selectedConnectors === 0"
                        @click="deleteSelected" title="Delete selected (delete)">mdi-delete</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon :disabled="selectedVectors.length < 2" title="Group (^ + G)" @click="groupSelected">mdi-group</v-icon>
                    <v-icon :disabled="primaryGroup === null" title="Ungroup (^ + Shift + G)" @click="ungroupSelected">mdi-ungroup</v-icon>
                    <v-divider vertical style="margin: 5px;"/>
                    <v-icon @click="bringForward" title="Bring forward (^ + ])">mdi-arrange-bring-forward</v-icon>
                    <v-icon @click="bringToFront" title="Bring to front (^ + Shift + ])">mdi-arrange-bring-to-front</v-icon>
                    <v-icon @click="sendBackward" title="Send backward (^ + [)">mdi-arrange-send-backward</v-icon>
                    <v-icon @click="sendToBack" title="Send to back (^ + Shift + [)">mdi-arrange-send-to-back</v-icon>
                </span>
            </v-system-bar>
            <control-panel ref="panel"/>
            <div class="graph-container" :style="graphContainerStyle">
                <graph-canvas
                    :class="translating && mouse.lmb ? 'no-select' : ''"
                    :showGrid="preferences.appearance.showGrid"
                ></graph-canvas>
            </div>
            <v-system-bar
                ref="bottomBar"
                style="position: absolute; z-index: 2; bottom: 0; width: 100vw;"
                class="no-select bottom-system-bar"
            >
                <div title="Mouse Coordinates" style="width: 110px;cursor: crosshair;">
                    <v-icon>mdi-crosshairs-gps</v-icon>{{ Math.floor((mouse.x - view.x) / view.k) }} : {{ Math.floor((mouse.y - view.y) / view.k) }}
                </div>
                <div
                title="Selection Coordinates"
                style="width: 240px;cursor: crosshair;">
                    <v-icon>mdi-select</v-icon> x: {{Math.floor(selectionRect.x)}} y: {{Math.floor(selectionRect.x)}} h: {{Math.floor(selectionRect.height)}} w: {{Math.floor(selectionRect.width)}}
                </div>
                <v-spacer/>
                <div title="Selected Vectors / Total Vectors" style="padding-right: 10px;cursor: pointer;">
                    <v-icon>mdi-selection</v-icon>{{ selectedVectors.length }}/{{ graph.vectors.length }}
                </div>
                <div title="Viewport localtion" style="padding-right: 10px;cursor: crosshair;" @click="resetView">
                    <v-icon>mdi-crosshairs-gps</v-icon>x:{{ view.x }} y:{{ view.y }}
                </div>
                <v-icon title="Zoom Out (^ + -)" style="cursor: pointer;" @click="zoomOut">mdi-magnify-minus-outline</v-icon>
                <div
                    title="Zoom Level"
                    style="padding-right: 5px;cursor: crosshair;"
                    @click="resetZoom">
                    {{ (view.k * 100).toFixed(2) }}%
                </div>
                <v-icon
                    title="Zoom In (^ + +)"
                    style="padding-right: 10px;cursor: pointer;"
                    @click="zoomIn">mdi-magnify-plus-outline</v-icon>
                <v-icon
                    title="Toggle Grid Visibility"
                    @click="toggleGrid"
                    style="padding-right: 10px;cursor: pointer;"
                    :color="preferences.appearance.showGrid ? 'info' : ''"
                    >mdi-grid</v-icon
                >
                <v-icon
                    title="Toggle Lock"
                    :color="locked ? 'info' : ''"
                    style="padding-right: 10px;cursor: pointer;">{{locked ? 'mdi-lock' : 'mdi-lock-open'}}</v-icon>
                <v-icon
                    title="Toggle Presentation"
                    :color="presentation ? 'info' : ''"
                    style="padding-right: 10px;cursor: pointer;">{{presentation ? 'mdi-presentation-play' : 'mdi-presentation'}}</v-icon>
            </v-system-bar>
        </template>
        <v-snackbar :timeout="0" v-model="localShowError" :top="!graph">
            <v-alert prominent type="error">
                <v-row align="center">
                    <v-col class="grow">{{localErrorMessage}}</v-col>
                    <v-col class="shrink" v-if="graph">
                        <v-btn @click="clearError">That Sucks</v-btn>
                    </v-col>
                </v-row>
            </v-alert>
        </v-snackbar>
        <v-progress-linear v-if="!graph && !localShowError" indeterminate></v-progress-linear>
    </v-app>
</template>
<script>
import GraphCanvas from "./GraphCanvas";
import {mapState, mapActions} from "vuex";
import ControlPanel from "./ControlPanel";
export default {
    name: "GraphEditor",
    props: {
        route: Object,
    },
    components: {
        GraphCanvas,
        ControlPanel,
    },
    watch: {
        showError() {
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
            graphSnapshot: state => state.graphSnapshot,
            graph: state => state.graph,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
            preferences: (state) => state.preferences,
        }),
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
                cursor
            };
        },
    },
    methods: {
        ...mapActions([
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
        ]),
        openGraph() {
            window.open(
                "/graphs",
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
            return !((this.$refs.panel && this.$refs.panel.$el.contains(e.target))
                    || (this.$refs.topBar && this.$refs.topBar.$el.contains(e.target))
                    || (this.$refs.bottomBar && this.$refs.bottomBar.$el.contains(e.target)));
        },
        mousemove(e) {
            const mouse = this.getMousePosFromEvent(e);
            this.$store.dispatch("mouse", {
                ...this.mouse,
                x: mouse.x,
                y: mouse.y,
            });
        },
        mousedown(e) {
            if (!this.graph) {
                return;
            }
            // do not track control panel inputs
            if (!this.isGraphTarget(e)) {
                return;
            }
            const translating = {
                mouse: {
                    x: this.mouse.x,
                    y: this.mouse.y,
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
                [this.buttonMap[e.button]]: true,
            });
        },
        mouseup(e) {
            this.$store.dispatch("mouse", {
                ...this.mouse,
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
            if (!this.isGraphTarget(e)) {
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
            if (!this.isGraphTarget(e)) {
                return;
            }
            e.clipboardData.setData(this.vectorMimeType, JSON.stringify(this.copyVectors(this.selectedVectors), null, "\t"));
            this.deleteSelected();
            e.preventDefault();
        },
        evCopy(e) {
            console.log("copy");
            if (!this.isGraphTarget(e)) {
                return;
            }
            e.clipboardData.setData(this.vectorMimeType, JSON.stringify(this.copyVectors(this.selectedVectors), null, "\t"));
            e.preventDefault();
        },
        evPaste(e) {
            if (!this.isGraphTarget(e)) {
                return;
            }
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
    mounted() {
        document.onwheel = e => {
            this.scale(e);
        };
        document.oncut = this.evCut;
        document.onpaste = this.evPaste;
        document.oncopy = this.evCopy;
        document.onmousedown = this.mousedown;
        document.onmouseup = this.mouseup;
        document.onmousemove = this.mousemove;
        window.onkeyup = this.keyup;
        window.onkeydown = this.keydown;
        this.$store.dispatch("getToc");
        let graphId = "index";
        if (this.route.path.split("/")[1]) {
            graphId = this.route.path.split("/")[1];
        }
        this.$store.dispatch("open", {
            graphId,
        });
    },
    data: () => {
        return {
            buttonMap: {
                "0": "lmb",
                "2": "rmb",
                "1": "mmb"
            },
            spaceKeyCode: 32,
            translate: false,
            showDialog: false,
            localErrorMessage: "",
            localShowError: false,
            localVersion: 0,
        };
    }
};
</script>
<style>
.bottom-system-bar {
    white-space: nowrap;
}
.graph-container {
    position: fixed;
    top: 0;
    left: 0;
}
.nav-drawer {
    margin-top: 24px;
}
.icon-nav {
    border: solid 1px black;
    width: 38px;
    right: 0;
    position: absolute;
    height: calc(100vh - 48px);
    padding: 5px;
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
