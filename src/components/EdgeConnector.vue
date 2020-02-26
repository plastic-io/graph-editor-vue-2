<template>
    <canvas
        ref="canvas"
        class="edge-connector"
        :style="connectorStyle"
        :height="height * ratio"
        :width="width * ratio"/>
</template>
<script>
import {Connector, Vector, Edge} from "@plastic-io/plastic-io";
import {mapState} from "vuex";
import bezier from "./bezier";
import {diff} from "deep-diff";
export default {
    name: "edge-connector",
    props: {
        connector: Connector,
        vector: Vector,
        edge: Edge,
    },
    data() {
        return {
            localGraph: null,
            connections: null,
            sourceRect: null,
            targetRect: null,
            source: null,
            target: null,
            height: 20,
            width: 20,
            x: 0,
            y: 0,
            ctx: null,
            ratio: 1,
            calls: 0,
        };
    },
    computed: {
        ...mapState({
            historyPosition: (state) => state.historyPosition,
            addingConnector: (state) => state.addingConnector,
            graphSnapshot: (state) => state.graphSnapshot,
            graph: (state) => state.graph,
            view: (state) => state.view,
            mouse: (state) => state.mouse,
            translating: (state) => state.translating,
            preferences: (state) => state.preferences,
            selectedConnectors: state => state.selectedConnectors,
            hoveredConnector: state => state.hoveredConnector,
            errorConnectors: state => state.errorConnectors,
            watchConnectors: state => state.watchConnectors,
            activityConnectors: state => state.activityConnectors,
            movingConnector: state => state.movingConnector,
        }),
        output() {
            const field = this.vector.properties.outputs.find((output) => {
                return this.edge.field === output.name;
            });
            const index = this.vector.properties.outputs.indexOf(field);
            return {
                index,
                vector: this.vector,
                field
            };
        },
        input() {
            const vector = (this.localGraph || this.graph).vectors.find((v) => {
                return v.id === this.connector.vectorId;
            });
            const field = vector ? vector.properties.inputs.find((input) => {
                return this.connector.field === input.name;
            }) : null;
            const index = vector ? vector.properties.inputs.indexOf(field) : null;
            return {
                index,
                vector,
                field
            };
        },
        connectorStyle() {
            return {
                height: (this.height * this.ratio) + "px",
                width: (this.width * this.ratio) + "px",
                left: this.x + "px",
                top: this.y + "px",
            };
        },
    },
    watch: {
        graphSnapshot: {
            handler: function () {
                this.localGraph = this.graphSnapshot;
                this.redraw();
            },
            deep: true,
        },
        graph: {
            handler: function () {
                this.localGraph = this.graph;
                this.redraw();
            },
            deep: true,
        },
        translating: {
            handler: function () {
                this.redraw();
            },
            deep: true,
        },
        movingConnector: {
            handler: function () {
                this.redraw();
            },
            deep: true,
        },
        mouse: {
            handler: function () {
                if (this.movingConnector || this.addingConnector) {
                    this.redraw();
                }
            },
            deep: true,
        },
        selectedConnectors: {
            handler: function () {
                this.redraw();
            },
        },
        historyPosition: {
            handler: function () {
                this.redraw();
            },
        },
        hoveredConnector: {
            handler: function () {
                this.redraw();
            },
        },
        vector: {
            handler: function () {
                const o = {
                    input: this.input,
                    output: this.output,
                };
                if (diff(this.connections, o)) {
                    this.connections = JSON.parse(JSON.stringify(o));
                    this.redraw();
                }
            },
            deep: true,
        },
    },
    methods: {
        redraw() {
            this.calls += 1;
            this.$nextTick(() => {
                bezier(this);
            });
        },
        getCanvasRatio() {
            return (1 /
                (this.ctx.webkitBackingStorePixelRatio ||
                    this.ctx.mozBackingStorePixelRatio ||
                    this.ctx.msBackingStorePixelRatio ||
                    this.ctx.oBackingStorePixelRatio ||
                    this.ctx.backingStorePixelRatio || 1));
        },
    },
    updated() {
        this.redraw();
    },
    mounted() {
        this.localGraph = this.graph;
        this.ctx = this.$refs.canvas.getContext("2d");
        // this.ratio = 2;//this.getCanvasRatio();
        this.ctx.scale(this.ratio, this.ratio);
        this.connections = JSON.parse(JSON.stringify({
            input: this.input,
            output: this.output,
        }));
        this.redraw();
    }
};
</script>
<style>
    .edge-connector {
/*        background: rgba(244, 0, 0, .1);
        border: solid 1px red;*/
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 200px;
        width: 200px;
        z-index: -1597463006;
    }
</style>
