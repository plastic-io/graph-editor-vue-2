<template>
    <div>
        <component
            v-if="loaded[this.graph.id]"
            :is="'vector-' + graph.id"
            :graph="graph"/>
    </div>
</template>
<script>
import compileTemplate from "../compileTemplate.ts";
import {mapState} from "vuex";
export default {
    name: "graph-presentation",
    props: {
        graph: Object,
    },
    watch: {
        graph: {
            handler() {
                if (this.localTemplate !== this.graph.properties.presentationTemplate) {
                    this.localTemplate = this.graph.properties.presentationTemplate;
                    this.styles = [];
                    this.broken = null;
                    // recompile template after change
                    compileTemplate(this, this.graph.id, this.localTemplate, true);
                }
            }
        },
    },
    mounted() {
        console.log("mounted");
        this.localTemplate = this.graph.properties.presentationTemplate;
        compileTemplate(this, this.graph.id, this.localTemplate, true);
    },
    data: () => {
        return {
            broken: false,
            longLoadingTimer: null,
            longLoading: false,
            loaded: {},
            styles: [],
        };
    },
    ...mapState({
        graph: state => state.graph,
    }),
};
</script>
<style></style>
