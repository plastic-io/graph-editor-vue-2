<template>
    <div>
        import-panel
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "import-panel",
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
