
<template>
    <div style="overflow: hidden;">
        <canvas-datagrid ref="grid" :style="gridStyle" :data.prop="data"/>
    </div>
</template>
<script>
import Vue from "vue";
Vue.config.ignoredElements = ["canvas-datagrid"];
import CanvasDatagrid from "canvas-datagrid"; // eslint-disable-line
import gridThemes from "../grid-themes"; // eslint-disable-line
import {mapState} from "vuex";
export default {
    name: "data-grid",
    props: {
        schema: Array,
        data: Array,
        width: Number,
    },
    data() {
        return {
            localData: [],
        };
    },
    computed: {
        ...mapState({
            preferences: state => state.preferences,
        }),
        gridStyle() {
            return `margin-left: -10px;margin-top: -6px;width: ${this.width - 24}px;height: auto;`;
        },
        height() {
            return window.innerHeight - 230;
        },
    },
    watch: {
        data: {
            handler() {
                this.localData = this.data;
                this.$refs.grid.style.height = this.height + "px";
            },
            deep: true,
        }
    },
    mounted() {
        [1, 10, 50, 100, 200, 400, 700, 1000].forEach((n) => {
            let setTheme = false;
            setTimeout(() => {
                if (!setTheme && this.$refs.grid) {
                    setTheme = true;
                    this.$refs.grid.style = gridThemes[this.preferences.appearance.theme];
                }
                this.$refs.grid.style.height = this.height + "px";
            }, n);
        });
    },
};
</script>
<style>
</style>
