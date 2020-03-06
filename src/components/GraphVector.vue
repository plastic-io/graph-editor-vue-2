<template>
    <div
        v-if="loaded"
        ref="vector"
        class="vector"
        :style="vectorStyle">
        <div class="vector-inputs">
            <vector-field
                v-for="field in inputs"
                :key="'input_' + field.name"
                :field="field"
                :vector="localVector"
                type="input"
            />
        </div>
        <div
            v-if="component"
            :id="'vector-' + localVector.id"
            @mouseover="hover"
            @mouseout="unhover"
            :class="translating && mouse.lmb ? 'no-select' : ''"
        >
            <component
                :is="'vector-' + localVector.id"
                :vector="localVector"
                :state="scheduler.state"
            />
            <component
                :is="'style'"
                v-html="style"
            />
        </div>
        <div class="vector-outputs">
            <vector-field
                v-for="field in outputs"
                :key="'output_' + field.name"
                :field="field"
                :vector="localVector"
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
                const changes = diff(this.localVectorSnapshot.template.vue, this.vector.template.vue);
                this.localVector = this.vector;
                this.localVectorSnapshot = JSON.parse(JSON.stringify(this.vector));
                if (changes) {
                    this.compileTemplate(this.localVector.id, this.localVector.template.vue);
                }
            },
            deep: true,
        }
    },
    data() {
        return {
            loaded: null,
            localHoveredVector: null,
            localSelectedVectors: [],
            component: null,
            dragged: null,
            localVector: null,
            localVectorSnapshot: null,
            template: null,
            compileCount: 0,
            remoteGraph: null,
            style: "",
        };
    },
    async mounted() {
        if (this.vector.url) {
            const v = await this.dataProviders.publish.get(this.vector.url);
            if (v.vectors) {
                this.importGraph(v);
            } else {
                this.importVector(v);
            }
        } else {
            this.localVector = this.vector;
            const tmp = this.compileTemplate(this.localVector.id, this.localVector.template.vue);
            this.component = tmp.component;
            this.style = tmp.style;
        }
        this.localVectorSnapshot = JSON.parse(JSON.stringify(this.vector));
        this.localSelectedVectors = this.selectedVectors;
        this.loaded = true;
    },
    methods: {
        importGraph(v) {
            this.remoteGraph = v;
            this.localVector = this.vector;
            // compile a template for every vector marked 
            const templates = this.remoteGraph.vectors.map((v) => {
                return this.compileTemplate(this.vector.id + "-" + v.id, v.template.vue);
            });
            const temp = [];
            temp.push("<template><div>");
            this.remoteGraph.vectors.forEach((v) => {
                if (v.properties.appearsInExportedGraph) {
                    temp.push("<component is=\"vector-" + this.vector.id + "-" + v.id + "\" :state=\"$store.state.scheduler.state\"/>");
                }
            });
            temp.push("</div></template>");
            const tmp = this.compileTemplate(this.vector.id, temp.join(""));
            this.component = tmp.component;
            this.style = templates.map(t => t.style).join("\n");
        },
        importVector(v) {
            v.url = this.vector.url;
            v.originalId = v.id;
            v.id = this.vector.id;
            v.properties.x = this.vector.properties.x;
            v.properties.y = this.vector.properties.y;
            v.properties.z = this.vector.properties.z;
            v.properties.presentation.x = this.vector.properties.presentation.x;
            v.properties.presentation.y = this.vector.properties.presentation.y;
            v.properties.presentation.z = this.vector.properties.presentation.z;
            this.localVector = v;
            const tmp = this.compileTemplate(this.localVector.id, this.localVector.template.vue);
            this.component = tmp.component;
            this.style = tmp.style;
        },
        hover() {
            this.$store.dispatch("hoveredVector", this.localVector);
        },
        unhover() {
            this.$store.dispatch("hoveredVector", null);
        },
        compileTemplate(id, tmp) {
            let script;
            let template;
            let style;
            let component;
            const handler = new DomHandler(function(error, dom) {
                if (error) {
                    // Handle error
                } else {
                    // Parsing completed, do something
                    dom.forEach((el) => {
                        if (el.tagName === "script") {
                            if (script !== undefined) {
                                this.$store.dispatch("error", new Error(`Vector ${id} contains a Vue template with more than one script tag.`));
                                return;
                            }
                            script = domutils.getInnerHTML(el);
                        }
                        if (el.tagName === "template") {
                            if (template !== undefined) {
                                this.$store.dispatch("error", new Error(`Vector ${id} contains a Vue template with more than one template tag.`));
                                return;
                            }
                            template = domutils.getInnerHTML(el);
                        }
                        if (el.tagName === "style") {
                            if (style !== undefined) {
                                this.$store.dispatch("error", new Error(`Vector ${id} contains a Vue template with more than one style tag.`));
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
            parser.write(tmp);
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
                component = Vue.component("vector-" + id, {
                    ...obj,
                    template,
                });
            } catch (err) {
                this.$store.dispatch("error", new Error(`Vector ${id} contains an error in the Vue script. ${err}.`));
            }
            return {
                style,
                component,
            };
        },
    },
    computed: {
        ...mapState({
            dataProviders: state => state.dataProviders,
            scheduler: state => state.scheduler,
            hoveredVector: state => state.hoveredVector,
            selectedVectors: state => state.selectedVectors,
            graph: state => state.graph,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
        }),
        inputs: function () {
            return this.localVector.properties.inputs;
        },
        outputs: function () {
            return this.localVector.properties.outputs;
        },
        vectorStyle: function () {
            const hovered = this.localHoveredVector && this.localHoveredVector.id === this.localVector.id;
            const selected = !!this.localSelectedVectors.find(v => v.id === this.localVector.id);
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
