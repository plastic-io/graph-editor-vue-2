<template>
    <div
        ref="edge"
        :style="vectorFieldStyle"
        class="vector-field"
        @mouseout="unhoverPort"
        @mouseover="hoverPort"
        :id="`vector-${type}-${vector.id}-${field.name}`"
    ></div>
</template>
<script>
import {mapState} from "vuex";
import {Vector} from "@plastic-io/plastic-io";
export default {
    name: "vector-field",
    computed: {
        ...mapState({
            hoveredPort: state => state.hoveredPort,
        }),
        vectorFieldStyle() {
            const isHovered = this.hoveredPort && this.hoveredPort.vector.id === this.vector.id
                && this.hoveredPort.field.name === this.field.name
                && this.type === this.hoveredPort.type;
            return {
                background: this.type === "output" ? "chartreuse" : "lavender",
                outline: isHovered ? "solid 2px yellow" : undefined,
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
</style>
