<template>
    <div>
        <div
            v-if="localVector"
            ref="vector"
            class="vector"
            :style="vectorStyle">
            <div v-if="component">
                <component :is="'vector-' + vector.id"/>
                <component :is="'style'" v-html="style"/>
            </div>
            <div class="vector-inputs">
                <vector-field
                    v-for="field in vector.properties.inputs"
                    :key="'input_' + field.name"
                    :field="field"
                    :vector="vector"
                    type="input"
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
    </div>
</template>
<script>
import {Vector} from "@plastic-io/plastic-io";
import Vue from "vue";
import {parseScript} from "meriyah";
import {generate} from "escodegen";
import VectorField from "./VectorField";
import {diff} from "deep-diff";
export default {
    name: "graph-vector",
    components: {VectorField},
    props: {
        renderOffset: Object,
        vector: Vector,
    },
    watch: {
        vector: {
            handler: function () {
                if (diff(this.localVector, this.vector)) {
                    this.$set(this, "localVector", this.vector);
                    this.compileTemplate();
                }
            },
            deep: true,
        }
    },
    data() {
        return {
            component: null,
            dragged: null,
            localVector: null,
            template: null,
        };
    },
    mounted() {
        this.localVector = this.vector;
        this.compileTemplate();
    },
    methods: {
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
        style: function () {
            return this.vector.template.style || "";
        },
        vectorStyle: function () {
            return {
                width: this.localVector.properties.width + "px",
                height: this.localVector.properties.height + "px",
                left: this.localVector.properties.x + "px",
                top: this.localVector.properties.y + "px",
            };
        },
    },
};
</script>
<style>
    .vector {
        position: absolute;
    }
    .vector-inputs {
        position: absolute;
        left: 0;
        top: 0;
    }
    .vector-outputs {
        position: absolute;
        right: 0;
        top: 0;
    }
</style>
