<template>
    <div :style="graphCanvasStyle" v-if="localGraph" @drop="drop($event)" @dragover="dragOver($event)">
        <div
            :style="preferences.appearance.theme === 'dark' ? '' : 'filter: invert(1);'"
            :class="graphCanvasClasses"
        ></div>
        <edge-connector
            v-for="c in connectors"
            :key="c.connector.id"
            :connector="c.connector"
            :edge="c.edge"
            :vector="c.vector"
        />
        <graph-vector
            v-for="vector in localGraph.vectors"
            :key="vector.id"
            :vector="vector"
        />
        <div v-if="selectionRect.visible" class="selection-rect" :style="selectionRectStyle"></div>
        <div :key="historyPosition" v-if="selectedVectors.length > 0" class="bounding-rect" :style="boundingRectStyle"></div>
    </div>
</template>
<script>
import EdgeConnector from "./EdgeConnector";
import GraphVector from "./GraphVector";
import {mapState, mapActions} from "vuex";
import {diff} from "deep-diff";
import colors from "vuetify/lib/util/colors";
export default {
    name: "graph-canvas",
    components: {GraphVector, EdgeConnector},
    props: {
        showGrid: Boolean
    },
    data() {
        return {
            dragged: null,
            localGraph: null,
        };
    },
    mounted() {
        this.$vuetify.theme.dark = this.preferences.appearance.theme === "dark";
        this.localGraph = this.graphSnapshot;
    },
    methods: {
        ...mapActions([
            "createNewVector",
            "addItem",
        ]),
        dragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "link";
        },
        drop(e) {
            const data = JSON.parse(e.dataTransfer.getData(this.vectorMimeType));
            console.log("drop", data);
            if (data.type === "newVector") {
                this.createNewVector({
                    x: e.clientX,
                    y: e.clientY,
                });
                return;
            }
            this.addItem({
                x: e.clientX,
                y: e.clientY,
                ...data,
            });
        },
    },
    watch: {
        graphSnapshot: {
            handler: function () {
                // when this becomes unbound
                const changes = diff(this.localGraph, this.graphSnapshot);
                if (changes) {
                    this.localGraph = this.graphSnapshot;
                }
            },
            deep: true,
        },
    },
    computed: {
        ...mapState({
            vectorMimeType: state => state.vectorMimeType,
            historyPosition: state => state.historyPosition,
            addingConnector: state => state.addingConnector,
            selectionRect: state => state.selectionRect,
            boundingRect: state => state.boundingRect,
            selectedVectors: state => state.selectedVectors,
            graphSnapshot: state => state.graphSnapshot,
            view: state => state.view,
            preferences: state => state.preferences,
        }),
        selectionRectStyle: function() {
            return {
                borderWidth: 0.5 / this.view.k + "px",
                left: this.selectionRect.x + "px",
                top: this.selectionRect.y + "px",
                width: this.selectionRect.width + "px",
                height: this.selectionRect.height + "px",
                borderColor: colors[this.preferences.appearance.selectionRectColor].base,
            };
        },
        boundingRectStyle: function() {
            return {
                borderWidth: 0.5 / this.view.k + "px",
                left: this.boundingRect.x + "px",
                top: this.boundingRect.y + "px",
                width: this.boundingRect.width + "px",
                height: this.boundingRect.height + "px",
                borderColor: colors[this.preferences.appearance.boundingRectColor].base,
            };
        },
        connectors: function () {
            let connectors = [];
            this.localGraph.vectors.forEach((vector) => {
                vector.edges.forEach((edge) => {
                    edge.connectors.forEach((connector) => {
                        connectors.push({
                            connector,
                            edge,
                            vector,
                        });
                    });
                });
            });
            if (this.addingConnector) {
                connectors.push({
                    connector: this.addingConnector.connector,
                    edge: this.addingConnector.edge,
                    vector: this.addingConnector.vector,
                });
            }
            return connectors;
        },
        graphCanvasStyle: function () {
            return {
                transform: `translate(${this.view.x}px, ${this.view.y}px) scale(${this.view.k})`,
            };
        },
        graphCanvasClasses: function () {
            return "graph-canvas-container " + (this.showGrid ? "grid" : "");
        },
    },
};
</script>
<style>
.bounding-rect {
    pointer-events: none;
    position: absolute;
    border-style: solid;
}
.selection-rect {
    position: absolute;
    border-style: dotted;
}
.graph-canvas-container {
    background: #000;
    position: absolute;
    width: 10000vw;
    height: 10000vh;
    top: -5000vh;
    left: -5000vw;
    z-index: -1597463007;
}
.grid {
    /* creates grid pattern at 10px */
    background:
        linear-gradient(-90deg, rgba(128, 128, 128, .1) 1px, transparent 1px),
        linear-gradient(rgba(128, 128, 128, .1) 1px, transparent 1px),
        linear-gradient(-90deg, rgba(128, 128, 128, .1) 1px, transparent 1px),
        linear-gradient(rgba(128, 128, 128, .1) 1px, transparent 1px),
        linear-gradient(transparent 3px, #111 3px, #111 98px, transparent 98px),
        linear-gradient(-90deg, #222 1px, transparent 1px),
        linear-gradient(-90deg, transparent 3px, #111 3px, #111 98px, transparent 98px),
        linear-gradient(#222 1px, transparent 1px),
        #111;
    background-size:
        10px 10px,
        10px 10px,
        100px 100px,
        100px 100px,
        100px 100px,
        100px 100px,
        100px 100px,
        100px 100px;
}
</style>
