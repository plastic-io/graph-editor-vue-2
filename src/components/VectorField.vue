<template>
    <div
        v-if="!presentation"
        @mouseout="unhoverPort"
        @mouseover="hoverPort"
    >
        <div
            ref="edge"
            :style="vectorFieldStyle"
            class="vector-field"
            :title="field.name"
            :key="preferences.showLabels"
            :id="`vector-${type}-${vector.id}-${field.name}`"
        ></div>
        <div
            v-if="preferences.showLabels"
            :style="vectorNameStyle"
            :class="(type === 'output' ? 'vector-field-output' : 'vector-field-input')">
                {{field.name}}
        </div>
    </div>
</template>
<script>
import {mapState} from "vuex";
import {Vector} from "@plastic-io/plastic-io";
export default {
    name: "vector-field",
    computed: {
        ...mapState({
            presentation: state => state.presentation,
            hoveredPort: state => state.hoveredPort,
            preferences: state => state.preferences,
        }),
        isHovered() {
            return this.hoveredPort && this.hoveredPort.vector.id === this.vector.id
                && this.hoveredPort.field.name === this.field.name
                && this.type === this.hoveredPort.type;
        },
        vectorFieldStyle() {
            return {
                background: this.type === "output" ? "var(--v-info-lighten2)" : "var(--v-info-lighten2)",
                outline: this.isHovered ? "solid 1px var(--v-info-lighten2)" : undefined,
            };
        },
        vectorNameStyle() {
            return {
                outline: this.isHovered ? "solid 1px var(--v-info-lighten2)" : undefined,
            };
        },
        edge() {
            return this.vector.edges.find((edge) => {
                return edge.field === this.field.name;
            });
        },
    },
    methods: {
        unhoverPort() {
            this.$store.dispatch("hoveredPort", null);
        },
        hoverPort() {
            this.$store.dispatch("hoveredPort", {
                field: this.field,
                vector: this.vector,
                edge: this.edge,
                type: this.type,
            });
        },
    },
    props: {
        field: Object,
        vector: Vector,
        type: String,
    }
};
</script>
<style>
.vector-field {
    height: 10px;
    width: 10px;
}
.vector-field-output {
    color: var(--v-primary-base);
    position: absolute;
    left: 200%;
    top: -100%;
}
.vector-field-input {
    color: var(--v-accent-darken1);
    position: absolute;
    right: 200%;
    top: -100%;
}
</style>
