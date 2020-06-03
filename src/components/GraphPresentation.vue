<template>
    <div>
        <component
            :key="localVersion"
            v-if="loaded[graphSnapshot.id]"
            :is="'vector-' + graphSnapshot.id"
            :graph="graphSnapshot"/>
    </div>
</template>
<script>
import compileTemplate from "../compileTemplate.ts";
import {mapState} from "vuex";
export default {
    name: "graph-presentation",
    computed: {
        ...mapState({
            graphSnapshot: state => state.graphSnapshot,
        }),
    },
    watch: {
        graphSnapshot: {
            handler() {
                if (this.localTemplate !== this.graphSnapshot.properties.presentationTemplate) {
                    this.localTemplate = this.graphSnapshot.properties.presentationTemplate;
                    this.styles = [];
                    this.broken = null;
                    // recompile template after change
                    compileTemplate(this, this.graphSnapshot.id, this.localTemplate, true);
                    setTimeout(() => {
                        this.localVersion += 1;
                    }, 100);
                }
            },
            deep: true,
        },
    },
    mounted() {
        this.localTemplate = this.graphSnapshot.properties.presentationTemplate;
        compileTemplate(this, this.graphSnapshot.id, this.localTemplate, true);
    },
    data: () => {
        return {
            broken: false,
            longLoadingTimer: null,
            longLoading: false,
            loaded: {},
            styles: [],
            localVersion: 0,
        };
    },
};
</script>
<style></style>
