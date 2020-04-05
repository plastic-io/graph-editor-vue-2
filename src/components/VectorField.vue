<template>
    <div
        v-if="!presentation"
        @mouseover="hoverPort"
        :style="connectorWarn ? 'cursor: not-allowed;' : ''"
    >
        <div
            help-topic="vector-edge"
            ref="edge"
            :style="vectorFieldStyle"
            class="vector-field"
            :title="field.name"
            :key="preferences.showLabels"
            :id="`vector-${type}-${vector.id}-${field.name}`"
        ></div>
        <div
            v-if="preferences.showLabels || isHovered"
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
            connectorWarn: state => state.connectorWarn,
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
    height: 15px;
    width: 15px;
    margin-bottom: 5px;
}
.vector-field-output, .vector-field-input {
    position: absolute;
    white-space: nowrap;
    transform: translate(0, -23px);
    text-shadow: 0 0 1px rgba(255,255,255,.1), 0 0 1px rgba(0,0,0,.5);
}
.vector-field-output {
    color: var(--v-primary-base);
    left: 200%;
}
.vector-field-input {
    color: var(--v-accent-darken1);
    right: 200%;
}
</style>
