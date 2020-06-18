<template>
    <div ref="vector-root">
        <v-alert v-if="broken" type="error">
            <pre>{{broken}}</pre>
        </v-alert>
        <div
            v-if="loaded[vectorComponentName] && visible"
            ref="vector"
            class="vector"
            :key="localVector.id"
            :x-vector-id="localVector.id"
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
            <div class="vector-inputs" v-if="!hostVector">
                <vector-field
                    v-for="field in inputs"
                    :key="'input_' + field.name"
                    :field="field"
                    :vector="localVector"
                    type="input"
                />
            </div>
            <div
                help-topic="vectorInstance"
                :id="'vector-' + localVector.id"
                :class="translating && mouse.lmb ? 'no-select' : ''"
            >
                <component
                    :is="'vector-' + vectorComponentName"
                    :graph="localVector.linkedGraph ? localVector.linkedGraph.graph : null"
                    :vector="localVector"
                    :scheduler="scheduler"
                    :state="$store.state.scheduler.state"
                    :vectorProps="vectorProps"
                    v-bind="vectorProps[localVector.__contextId]"
                    v-on="vectorEvents[localVector.__contextId]"
                    @dataChange="dataChange"
                    @set="set"
                />
                <component
                    v-for="(style, index) in styles"
                    :is="'style'"
                    v-html="style"
                    :key="index"
                />
            </div>
            <div class="vector-outputs" v-if="!hostVector">
                <vector-field
                    v-for="field in outputs"
                    :key="'output_' + field.name"
                    :field="field"
                    :vector="localVector"
                    type="output"
                />
            </div>
        </div>
    </div>
</template>
<script>
import compileTemplate from "../compileTemplate";
import {replacer} from "../store/mutations"; // eslint-disable-line
import {Vector, Graph} from "@plastic-io/plastic-io";
import {mapState, mapMutations, mapGetters} from "vuex";
import VectorField from "./VectorField";
import {diff} from "deep-diff";
export default {
    name: "graph-vector",
    components: {VectorField},
    props: {
        vector: Vector,
        hostVector: Vector,
        graph: Graph,
        presentation: Boolean,
    },
    watch: {
        vectorProps: {
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
                this.localVectorSnapshot = JSON.parse(JSON.stringify(this.vector, replacer));
                if (changes) {
                    this.styles = [];
                    this.broken = null;
                    // recompile template after change
                    compileTemplate(this, this.localVector.id, this.localVector.template.vue, true);
                }
            },
            deep: true,
        }
    },
    data() {
        return {
            broken: false,
            longLoadingTimer: null,
            longLoading: false,
            loaded: {},
            localHoveredVector: null,
            localSelectedVectors: [],
            vectorEvents: {},
            vectorProps: {},
            dragged: null,
            localVector: null,
            localVectorSnapshot: null,
            localVectorDataSnapshot: null,
            template: null,
            stateVersion: 0,
            compileCount: 0,
            contextId: null,
            artifactVectors: {},
            styles: [],
        };
    },
    async mounted() {
        this.styles = [];
        this.broken = null;
        this.localVector = this.vector;
        this.updateContextId();
        this.bindVectorEvents(this.localVector);
        this.bindVectorProps(this.localVector);
        this.localVectorSnapshot = JSON.parse(JSON.stringify(this.vector, replacer));
        this.localVectorDataSnapshot = JSON.parse(JSON.stringify(this.vector.data));
        this.localSelectedVectors = this.selectedVectors;
        this.longLoadingTimer = setTimeout(() => {
            this.longLoading = true;
        }, 500);
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
        setLinkedVector(e) {
            console.log("setLinkedVector", e);
        },
        bindVectorEvents(vect) {
            const events = {};
            vect.properties.outputs.forEach((output) => {
                events[output.name] = (val) => {
                    this.scheduler.instance.url(this.vector.url, val, output.name, this.hostVector);
                };
            });
            this.vectorEvents[vect.__contextId] = events;
        },
        bindVectorProps(vect) {
            const props = {};
            vect.properties.inputs.forEach((input) => {
                props[input.name] = undefined;
            });
            this.vectorProps[vect.__contextId] = props;
        },
        updateContextId() {
            this.$store.commit("setGraphReferences", {
                [this.localVector.__contextId]: this,
            });
        },
        dataChange(e) {
            this.updateVectorData({
                vectorId: this.vector.id,
                data: e,
            });
        },
        set(e) {
            this.scheduler.instance.url(this.vector.url, e, "$url", this.hostVector);
        },
        artifactKey(key) {
            if (!key) {
                return;
            }
            return key.replace(/\/|\./g, "_").replace(/@/g, "_at_").replace(/:/g, "_col_");
        },
        async importRoot(vect) {
            if (vect.artifact) {
                let v;
                if (/^https?:\/\//.test(vect.artifact)) {
                    try {
                        const seralizedV = await fetch(vect.artifact);
                        v = await seralizedV.json();
                    } catch (err) {
                        this.$store.dispatch("raiseError", new Error(`Cannot load remote resource. ${err}.`));
                    }
                } else {
                    v = await this.dataProviders.publish.get(vect.artifact);
                }
                const l = {
                    key: vect.artifact,
                    value: v,
                };
                this.setArtifact(l);
                if (v.vectors) {
                    await this.importGraph(v);
                } else {
                    await this.importVector(v, this.artifactKey(vect.artifact));
                }
            } else {
                const l = {
                    key: vect.id,
                    value: vect,
                };
                this.setArtifact(l);
                await compileTemplate(this, vect.id, vect.template.vue);
            }
        },
        async importGraph(g) {
            console.log("importGraph", g);
            await compileTemplate(this, this.vectorComponentName, g.properties.presentationTemplate);
            this.loaded[this.vectorComponentName] = true;
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
            await compileTemplate(this, artifactKey, v.template.vue);
        },
    },
    computed: {
        ...mapState({
            dataProviders: state => state.dataProviders,
            state: state => state.scheduler.state,
            scheduler: state => state.scheduler,
            hoveredVector: state => state.hoveredVector,
            selectedVectors: state => state.selectedVectors,
            mouse: state => state.mouse,
            translating: state => state.translating,
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
            if (this.presentation || this.hostVector) {
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
