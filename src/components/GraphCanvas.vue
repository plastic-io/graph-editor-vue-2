<template>
    <div
        v-if="graph"
        :style="graphCanvasStyle"
        :class="graphCanvasClasses"
    >
        <graph-vector
            v-for="vector in graph.vectors"
            style="transform: translate(5000vh, 5000vh);"
            :key="vector.id"
            :vector="vector"
        />
    </div>
</template>
<script>
import {Graph} from "@plastic-io/plastic-io";
import GraphVector from "./GraphVector";
export default {
    name: "graph-canvas",
    components: {GraphVector},
    props: {
        view: Object,
        showGrid: Boolean,
        graph: Graph
    },
    data() {
        return {
            dragged: null,
        };
    },
    computed: {
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
.graph-canvas-container {
    background: #333;
    transform-origin: 5000vh 5000vh;
    margin: -5000vh -5000vh;
    width: 10000vh;
    height: 10000vh;
}
.grid {
    background:
        linear-gradient(-90deg, rgba(0,0,0,.1) 1px, transparent 1px),
        linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
        linear-gradient(-90deg, rgba(0, 0, 0, .1) 1px, transparent 1px),
        linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
        linear-gradient(transparent 3px, #333 3px, #333 98px, transparent 98px),
        linear-gradient(-90deg, #000 1px, transparent 1px),
        linear-gradient(-90deg, transparent 3px, #333 3px, #333 98px, transparent 98px),
        linear-gradient(#000 1px, transparent 1px),
        #333;
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
