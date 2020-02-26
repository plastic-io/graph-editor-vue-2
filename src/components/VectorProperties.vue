<template>
    <div>
        
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "vector-properties",
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
