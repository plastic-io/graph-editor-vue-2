<template>
    <div
        v-if="localVector"
        ref="vector"
        class="vector"
        :style="vectorStyle">
        <div class="vector-inputs">
            <vector-field
                v-for="field in vector.properties.inputs"
                :key="'input_' + field.name"
                :field="field"
                :vector="vector"
                type="input"
            />
        </div>
        <div
            v-if="component"
            :id="'vector-' + vector.id"
            @mouseover="hover"
            @mouseout="unhover"
            :class="translating && mouse.lmb ? 'no-select' : ''"
        >
            <component
                :is="'vector-' + vector.id"
                :vector="vector"
            />
            <component
                :is="'style'"
                v-html="style"
            />
        </div>
        <div class="vector-outputs">
            <vector-field
                v-for="field in vector.properties.outputs"
                :key="'output_' + field.name"
                :field="field"
                :vector="vector"
                type="output"
            />
        </div>
    </div>
</template>
<script>
import {Vector} from "@plastic-io/plastic-io";
import Vue from "vue";
import {mapState} from "vuex";
import {parseScript} from "meriyah";
import {generate} from "escodegen";
import VectorField from "./VectorField";
import {diff} from "deep-diff";
export default {
    name: "graph-vector",
    components: {VectorField},
    props: {
        vector: Vector,
    },
    watch: {
        hoveredVector: {
            handler: function () {
                this.localHoveredVector = this.hoveredVector;
            },
        },
        selectedVectors: {
            handler: function () {
                this.localSelectedVectors = this.selectedVectors;
            },
            deep: true,
        },
        vector: {
            handler: function () {
                const changes = diff(this.localVector, this.vector);
                if (changes) {
                    this.localVector = this.vector;
                    this.compileTemplate();
                }
            },
            deep: true,
        }
    },
    data() {
        return {
            localHoveredVector: null,
            localSelectedVectors: [],
            component: null,
            dragged: null,
            localVector: null,
            template: null,
        };
    },
    mounted() {
        this.localVector = this.vector;
        this.localSelectedVectors = this.selectedVectors;
        this.compileTemplate();
    },
    methods: {
        hover() {
            this.$store.dispatch("hoveredVector", this.vector);
        },
        unhover() {
            this.$store.dispatch("hoveredVector", null);
        },
        compileTemplate() {
            const ast = parseScript(this.vector.template.vue.replace("export default", "return "), {
                globalReturn: true,
                module: true,
                next: true,
            });
            const vueFn = new Function(generate(ast));
            const obj = vueFn();
            this.component = Vue.component("vector-" + this.vector.id, obj);
        },
    },
    computed: {
        ...mapState({
            hoveredVector: state => state.hoveredVector,
            selectedVectors: state => state.selectedVectors,
            graph: state => state.graph,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
        }),
        style: function () {
            return this.vector.template.style || "";
        },
        vectorStyle: function () {
            const hovered = this.localHoveredVector && this.localHoveredVector.id === this.localVector.id;
            const selected = !!this.localSelectedVectors.find(v => v.id === this.vector.id);
            const hoveredAndSelected = hovered && selected;
            let borderColor = "transparent";
            if (hoveredAndSelected) {
                borderColor = "orange";
            } else if (selected) {
                borderColor = "yellow";
            } else if (hovered) {
                borderColor = "white";
            }
            return {
                outline: "solid 5px " + borderColor,
                width: this.localVector.properties.width + "px",
                height: this.localVector.properties.height + "px",
                left: this.localVector.properties.x + "px",
                top: this.localVector.properties.y + "px",
                zIndex: this.localVector.properties.z,
            };
        },
    },
};
</script>
<style>
    .vector {
        position: absolute;
        cursor: pointer;
    }
    .vector-inputs {
        position: absolute;
        left: -10px;
        top: 0;
        width: 10px;
    }
    .vector-outputs {
        position: absolute;
        right: -10px;
        top: 0;
        width: 10px;
    }
</style>
