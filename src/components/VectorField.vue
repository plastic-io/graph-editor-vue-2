<template>
    <div ref="edge" class="edge-connector">
        {{field.name}}
        <template v-if="edge">
            <edge-connector
                v-for="connector in edge.connectors"
                :key="connector.id"
                :edge="edge"
                :vector="vector"
                :connector="connector"
            />
        </template>
    </div>
</template>
<script>
import EdgeConnector from "./EdgeConnector";
import {Vector} from "@plastic-io/plastic-io";
export default {
    name: "vector-field",
    components: {EdgeConnector},
    computed: {
        edge: function () {
            return this.vector.edges.find((edge) => {
                return edge.field === this.field.name;
            });
        },
    },
    props: {
        field: Object,
        vector: Vector,
    }
};
</script>
<style>

</style>
