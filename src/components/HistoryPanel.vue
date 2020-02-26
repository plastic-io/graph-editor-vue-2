<template>
    <div>
        <div
            v-for="(event, index) in events"
            :key="index"
            :style="historyPosition === index + 1 ? 'background: tan;' : ''"
            @click="moveHistoryPosition(-(historyPosition - (index + 1)))">
            {{event.name}}
        </div>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "property-fields",
    methods: {
        ...mapActions([
            "moveHistoryPosition",
        ]),
    },
    computed: {
        ...mapState({
            historyPosition: state => state.historyPosition,
            events: state => state.events,
        }),
    }
};
</script>
<style></style>
