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
                :state="scheduler.state"
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
import {Parser} from "htmlparser2";
import {DomHandler} from "domhandler";
import domutils from "domutils";
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
            style: "",
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
            let script;
            let template;
            let style;
            const handler = new DomHandler(function(error, dom) {
                if (error) {
                    // Handle error
                } else {
                    // Parsing completed, do something
                    dom.forEach((el) => {
                        if (el.tagName === "script") {
                            if (script !== undefined) {
                                this.$store.dispatch("error", new Error(`Vector ${this.vector.id} contains a Vue template with more than one script tag.`));
                                return;
                            }
                            script = domutils.getInnerHTML(el);
                        }
                        if (el.tagName === "template") {
                            if (template !== undefined) {
                                this.$store.dispatch("error", new Error(`Vector ${this.vector.id} contains a Vue template with more than one template tag.`));
                                return;
                            }
                            template = domutils.getInnerHTML(el);
                        }
                        if (el.tagName === "style") {
                            if (style !== undefined) {
                                this.$store.dispatch("error", new Error(`Vector ${this.vector.id} contains a Vue template with more than one style tag.`));
                                return;
                            }
                            style = domutils.getInnerHTML(el);
                        }
                    });
                }
            });
            const parser = new Parser(handler, {
                decodeEntities: true,
                recognizeSelfClosing: true,
            });
            parser.write(this.vector.template.vue);
            parser.end();
            if (script === undefined) {
                script = "export default {}";
            }
            const ast = parseScript(script.replace("export default", "return "), {
                globalReturn: true,
                module: true,
                next: true,
            });
            const astString = generate(ast);
            const vueFn = new Function(astString);
            try {
                const obj = vueFn();
                this.component = Vue.component("vector-" + this.vector.id, {
                    ...obj,
                    template,
                });
            } catch (err) {
                this.$store.dispatch("error", new Error(`Vector ${this.vector.id} contains an error in the Vue script. ${err}.`));
            }
            this.style = style;
        },
    },
    computed: {
        ...mapState({
            scheduler: state => state.scheduler,
            hoveredVector: state => state.hoveredVector,
            selectedVectors: state => state.selectedVectors,
            graph: state => state.graph,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
        }),
        vectorStyle: function () {
            const hovered = this.localHoveredVector && this.localHoveredVector.id === this.localVector.id;
            const selected = !!this.localSelectedVectors.find(v => v.id === this.vector.id);
            const hoveredAndSelected = hovered && selected;
            let borderColor = "transparent";
            if (hoveredAndSelected) {
                borderColor = "var(--v-info-lighten4)";
            } else if (selected) {
                borderColor = "var(--v-info-lighten3)";
            } else if (hovered) {
                borderColor = "var(--v-info-lighten2)";
            }
            return {
                outline: "solid 1px " + borderColor,
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
