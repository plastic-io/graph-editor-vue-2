<template>
    <div
        v-if="loaded[vectorComponentName] && visible"
        ref="vector"
        class="vector"
        :style="vectorStyle">
        <template v-if="errors.length > 0">
            <div v-for="(error, index) in errors" :key="index">
                <v-alert type="error" class="vector-error" style="pointer-events: all; cursor: text;">
                    <div style="text-align: right;">
                        <i style="font-weight: bold;padding-left: 10px;" v-if="errors.length > 1">(+ {{errors.length - 1}} more errors)</i>
                    </div>
                    <div
                        :style="errors.length > 1 ? 'margin-top: -24px;' : ''"
                        @click="clearSchedulerErrorItem({key: localVector.id, item: error});">
                        <v-btn class="ma-3">
                            Dismiss
                        </v-btn>
                        <v-btn class="ma-3" @click="clearSchedulerError({key: localVector.id})">
                            Dismiss All
                        </v-btn>
                    </div>
                    <v-divider/>
                    <pre class="no-graph-target">{{error.stack}}</pre>
                    <v-divider/>
                </v-alert>
            </div>
        </template>
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
            :id="'vector-' + localVector.id"
            @mouseover="hover"
            @mouseout="unhover"
            :class="translating && mouse.lmb ? 'no-select' : ''"
        >
            <component
                v-if="loaded[vectorComponentName]"
                :is="'vector-' + vectorComponentName"
                :vector="localVector"
                :scheduler="scheduler"
            />
            <component
                v-for="(style, index) in styles"
                :is="'style'"
                v-html="style"
                :key="index"
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
import {mapState, mapMutations, mapGetters} from "vuex";
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
        localVector: {
            handler: function () {
                const changes = diff(this.localVectorDataSnapshot, this.vector.data);
                this.localVectorDataSnapshot = JSON.parse(JSON.stringify(this.vector.data));
                if (changes) {
                    this.updateVectorData({
                        vectorId: this.vector.id,
                        data: this.vector.data,
                    });
                }
            },
            deep: true,
        },
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
                    // recompile template after change
                    this.compileTemplate(this.localVector.id, this.localVector.template.vue, true);
                }
            },
            deep: true,
        }
    },
    data() {
        return {
            loaded: {},
            localHoveredVector: null,
            localSelectedVectors: [],
            dragged: null,
            localVector: null,
            localVectorSnapshot: null,
            localVectorDataSnapshot: null,
            template: null,
            compileCount: 0,
            artifactVectors: {},
            styles: [],
        };
    },
    async mounted() {
        // used by the compiler scripts
        window.Vue = Vue;
        this.localVector = this.vector;
        this.localVectorSnapshot = JSON.parse(JSON.stringify(this.vector));
        this.localVectorDataSnapshot = JSON.parse(JSON.stringify(this.vector.data));
        this.localSelectedVectors = this.selectedVectors;
        await this.importRoot(this.localVector);
    },
    methods: {
        ...mapGetters([
            "getVectorById",
        ]),
        ...mapMutations([
            "clearSchedulerErrorItem",
            "clearSchedulerError",
            "setArtifact",
            "updateVectorData",
            "clearArtifact",
        ]),
        artifactKey(key) {
            if (!key) {
                return;
            }
            return key.replace(/\/|\./g, "_");
        },
        async importRoot(vect) {
            if (vect.artifact) {
                const v = await this.dataProviders.publish.get(vect.artifact);
                const l = {
                    key: vect.artifact,
                    value: v,
                };
                this.setArtifact(l);
                if (v.vectors) {
                    await this.importGraph(v, this.artifactKey(vect.artifact));
                } else {
                    await this.importVector(v, this.artifactKey(vect.artifact));
                }
            } else {
                const l = {
                    key: vect.id,
                    value: vect,
                };
                this.setArtifact(l);
                await this.compileTemplate(vect.id, vect.template.vue);
            }
        },
        async importGraph(g, artifactKey) {
            // compile a template for every vector marked 
            for (let v of g.vectors) {
                await this.importRoot(v);
            }
            const temp = [];
            temp.push("<template><div>");
            g.vectors.forEach((v) => {
                if (v.properties.appearsInExportedGraph) {
                    const vectorKey = (this.artifactKey(v.artifact) || v.id);
                    temp.push("<component is=\"vector-" + vectorKey + "\" :vector=\"$store.getters.getArtifactByUrl('" + (v.artifact || v.id) + "')\" :scheduler=\"$store.state.scheduler\"/>");
                }
            });
            temp.push("</div></template>");
            await this.compileTemplate(artifactKey, temp.join(""));
        },
        async importVector(v, artifactKey) {
            v.artifact = this.vector.artifact;
            v.url = this.vector.url;
            v.artifactlId = v.id;
            v.id = this.vector.id;
            v.properties.x = this.vector.properties.x;
            v.properties.y = this.vector.properties.y;
            v.properties.z = this.vector.properties.z;
            v.properties.presentation.x = this.vector.properties.presentation.x;
            v.properties.presentation.y = this.vector.properties.presentation.y;
            v.properties.presentation.z = this.vector.properties.presentation.z;
            await this.compileTemplate(artifactKey, v.template.vue);
        },
        hover() {
            this.$store.dispatch("hoveredVector", this.localVector);
        },
        unhover() {
            this.$store.dispatch("hoveredVector", null);
        },
        compileTemplate(id, tmp, clearLoad) {
            if (clearLoad) {
                this.loaded[id] = undefined;
            }
            if (this.loaded[id] !== undefined) {
                return;
            }
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
            // create a script that can use module imports and registers our vector's component
            const scriptTemplate = script.replace("export default", "const c = {}; c.comp = ")
                + ";c.comp.template = `" + template + "`;"
                + "c.comp.name = 'vector-" + id + "';"
                + "Vue.component(c.comp.name, c.comp);";
            const ast = parseScript(scriptTemplate, {
                globalReturn: true,
                module: true,
                next: true,
            });
            const astString = generate(ast);
            const scr = document.createElement("script");
            scr.type = "module";
            document.body.appendChild(scr);
            this.loaded[id] = false;
            try {
                scr.innerHTML = astString;
            } catch (err) {
                this.$store.dispatch("raiseError", new Error(`Vector ${id} contains an error in the Vue script. ${err}.`));
            }
            const checkReg = () => {
                if (Vue.options.components["vector-" + id]) {
                    this.loaded[id] = true;
                    let allLoaded = true;
                    Object.keys(this.loaded).forEach((key) => {
                        if (!this.loaded[key]) {
                            allLoaded = false;
                        }
                    });
                    if (allLoaded) {
                        this.$forceUpdate();
                    }
                    return;
                }
                setTimeout(checkReg, 10);
            };
            checkReg();
            // add styles on this component to the style list
            this.styles.push(style);
        },
    },
    computed: {
        ...mapState({
            presentation: state => state.presentation,
            dataProviders: state => state.dataProviders,
            scheduler: state => state.scheduler,
            hoveredVector: state => state.hoveredVector,
            selectedVectors: state => state.selectedVectors,
            mouse: state => state.mouse,
            translating: state => state.translating,
            keys: state => state.keys,
            view: state => state.view,
        }),
        vectorComponentName() {
            const name = this.artifactKey(this.vector.artifact) || this.vector.id;
            return name;
        },
        visible: function () {
            if (this.presentation && !this.localVector.properties.appearsInPresentation) {
                return false;
            }
            return true;
        },
        errors: function () {
            return this.scheduler.errors[this.localVector.id] || [];
        },
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
            if (this.presentation) {
                borderColor = "transparent";
            } else if (hoveredAndSelected) {
                borderColor = "var(--v-info-lighten4)";
            } else if (selected) {
                borderColor = "var(--v-info-lighten3)";
            } else if (hovered) {
                borderColor = "var(--v-info-lighten2)";
            }
            if (this.presentation) {
                if (this.localVector.properties.positionAbsolute) {
                    return {
                        position: "absolute",
                        outline: "solid 1px " + borderColor,
                        left: this.localVector.properties.presentation.x + "px",
                        top: this.localVector.properties.presentation.y + "px",
                        zIndex: this.localVector.properties.presentation.z,
                    };
                }
                return {
                    outline: "solid 1px " + borderColor,
                };
            }
            return {
                position: "absolute",
                outline: "solid 1px " + borderColor,
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
    .vector-error {
        position: absolute;
        left: 150%;
        top: 150%;
    }
</style>
