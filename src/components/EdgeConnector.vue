<template>
    <canvas ref="canvas" class="edge-connector" :height="height" :width="width"></canvas>
</template>
<script>
import {Connector, Vector, Edge} from "@plastic-io/plastic-io";
import {mapState} from "vuex";
import Bezier from "bezier-js";
export default {
    name: "edge-connector",
    props: {
        connector: Connector,
        vector: Vector,
        edge: Edge,
    },
    data() {
        return {
            height: 200,
            width: 200,
            x: 0,
            y: 0,
            ctx: null,
        };
    },
    computed: {
        ...mapState({
            graph: (state) => state.graph,
        }),
        output() {
            const output = this.vector.properties.outputs.find((output) => {
                return this.connector.field === output.name;
            });
            const index = this.vector.properties.outputs.indexOf(output);
            return {
                index,
                vector: this.vector,
                output
            };
        },
        input() {
            const vector = this.graph.vectors.find((v) => {
                return v.id === this.connector.vectorId;
            });
            const input = vector.properties.inputs.find((input) => {
                return this.connector.field === input.name;
            });
            const index = vector.properties.inputs.indexOf(input);
            return {
                index,
                vector,
                input
            };
        },
    },
    methods: {
        drawCurve: function(curve, offset) {
            offset = offset || { x:0, y:0 };
            var ox = offset.x;
            var oy = offset.y;
            this.ctx.beginPath();
            var p = curve.points;
            this.ctx.moveTo(p[0].x + ox, p[0].y + oy);
            if(p.length === 3) {
                this.ctx.quadraticCurveTo(p[1].x + ox, p[1].y + oy, p[2].x + ox, p[2].y + oy);
            }
            if(p.length === 4) {
                this.ctx.bezierCurveTo(
                    p[1].x + ox, p[1].y + oy,
                    p[2].x + ox, p[2].y + oy,
                    p[3].x + ox, p[3].y + oy
                );
            }
            this.ctx.stroke();
            this.ctx.closePath();
        },
        redraw() {
            const input = this.input;
            const output = this.output;
            this.ctx = this.$refs.canvas.getContext("2d");
            const curve = new Bezier(0, 0, 80, 30, input.vector.properties.x, input.vector.properties.y);
            this.ctx.strokeStyle = "blue";
            this.drawCurve(curve);
            console.log(input, output, this.ctx, Bezier);
        },
    },
    updated() {
        this.redraw();
    },
    mounted() {
        this.redraw();
    }
};
</script>
<style>
    .edge-connector {
        position: absolute;
        top: 0;
        left: 0;
        height: 200px;
        width: 200px;
    }
</style>
