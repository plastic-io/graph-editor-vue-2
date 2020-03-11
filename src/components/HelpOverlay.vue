<template>
    <div>
        Hello
    </div>
</template>
<script>
import {mapState} from "vuex";
export default {
    name: "edge-connector",
    props: {},
    data() {
        return {};
    },
    computed: {
        ...mapState({}),
    },
    watch: {},
    methods: {}
};
</script>
<style>
    .edge-inactive {
        animation-duration: 0.5s;
        animation-name: edge-deactivate;
    }
    .edge-active {
        animation-duration: 0.5s;
        animation-name: edge-activate;
    }
    .edge-connector {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        height: 200px;
        width: 200px;
        z-index: -1597463006;
    }
    @keyframes edge-deactivate {
        from {
            opacity: 0.5;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes edge-activate {
        from {
            opacity: 1;
        }
        to {
            opacity: 0.5;
        }
    }

</style>
