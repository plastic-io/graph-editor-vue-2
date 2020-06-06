<template>
    <div @wheel.stop @click.stop v-if="graphSnapshot">
        <v-card class="map-view" elevation="7">
            <v-system-bar>
                <v-icon title="Close Map" @click="toggleMap">
                    mdi-map
                </v-icon>
                <div help-topic="viewportLocation" title="Viewport localtion" style="padding-right: 10px;cursor: crosshair;" @click="resetView">
                    x:{{ view.x.toFixed(0) }} y:{{ view.y.toFixed(0) }}
                </div>
                <v-spacer/>
                <v-icon title="Zoom Out (^ + -)" style="cursor: pointer;" @click="zoomOut">mdi-magnify-minus-outline</v-icon>
                <div
                    help-topic="viewportZoom"
                    @click="resetZoom"
                    title="Zoom Level"
                    style="padding-right: 5px;cursor: crosshair;">
                    {{ (view.k * 100).toFixed(2) }}%
                </div>
                <v-icon
                    @click="zoomIn"
                    title="Zoom In (^ + +)"
                    style="cursor: pointer;"
                    >mdi-magnify-plus-outline</v-icon>
                <v-icon title="Close Map" @click="toggleMap">
                    mdi-close
                </v-icon>
            </v-system-bar>
            <v-card-text class="pa-0">
                <div class="graph-map" ref="map">
                    <div style="position: relative;">
                        <div class="graph-map-view-port" :style="viewMapStyle"></div>
                        <div class="graph-map-vector" :style="vectorMapStyle(vector)" v-for="vector in graphSnapshot.vectors" :key="vector.id"></div>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import {mapState, mapMutations, mapActions} from "vuex";
export default {
    name: "graph-map",
    data() {
        return {
            min: {},
            max: {},
            scale: 1,
            mapPosOffset: {
                x: 0,
                y: 0,
            },
        };
    },
    watch: {
        view() {
            this.updateScale();
        },
        graphSnapshot: {
            handler() {
                this.updateScale();
            },
            deep: true,
        },
    },
    methods: {
        ...mapActions([
            "toggleMap",
        ]),
        ...mapMutations([
            "setMapScale",
        ]),
        // TODO: resetView, resetZoom, zoomIn, zoomOut, shamelessly copied from the graph editor component
        resetView() {
            this.$store.dispatch("view", {
                ...this.view,
                x: 0,
                y: 0,
            });
        },
        resetZoom() {
            this.$store.dispatch("view", {
                ...this.view,
                k: 1,
            });
        },
        zoomOut() {
            this.$store.dispatch("view", {
                ...this.view,
                k: Math.max(this.view.k - .10, .10),
            });
        },
        zoomIn() {
            this.$store.dispatch("view", {
                ...this.view,
                k: Math.min(this.view.k + .10, 4),
            });
        },
        updateScale() {
            if (!this.$refs.map) {
                return;
            }
            const rect = this.$refs.map.getBoundingClientRect();
            this.mapPosOffset = {
                x: (rect.width / 2) - 20,
                y: rect.height / 2 - 20,
            };
            this.min = {
                x: Math.min.apply(null, this.graphSnapshot.vectors.map(v => v.properties.x)),
                y: Math.min.apply(null, this.graphSnapshot.vectors.map(v => v.properties.y)),
            };
            this.max = {
                x: Math.max.apply(null, this.graphSnapshot.vectors.map(v => v.properties.x)),
                y: Math.max.apply(null, this.graphSnapshot.vectors.map(v => v.properties.y)),
            };
            const ratio = Math.max((-Math.min((this.min.y - this.max.y), (this.min.x - this.max.x)) / 50), 10);
            this.scale = ratio;
            this.setMapScale(this.scale);
        },
    },
    mounted() {
        [1, 100, 1000, 2000, 4000].forEach((n) => {
            setTimeout(() => {
                this.updateScale();
            }, n);
        });
        window.addEventListener("resize", this.updateScale);
    },
    unmounted() {
        window.removeEventListener("resize", this.updateScale);
    },
    computed: {
        ...mapState({
            graphSnapshot: state => state.graphSnapshot,
            view: state => state.view,
            buttonMap: state => state.buttonMap,
            mouse: state => state.mouse,
        }),
        viewMapStyle() {
            return {
                background: this.$vuetify.theme.parsedTheme.primary.base,
                opacity: 0.4,
                outline: `solid 0.5px ${this.$vuetify.theme.parsedTheme.accent.base}EE`,
                left: ((-this.view.x / this.scale) / this.view.k) + this.mapPosOffset.x + "px",
                top: ((-this.view.y / this.scale) / this.view.k) + this.mapPosOffset.y + "px",
                height: (window.innerHeight / this.scale) / this.view.k + "px",
                width: (window.innerWidth / this.scale) / this.view.k + "px",
            };
        },
        vectorMapStyle() {
            return (vect) => {
                const el = document.getElementById("vector-" + vect.id);
                if (!el) {
                    return {};
                }
                const rect = el.getBoundingClientRect();
                return {
                    opacity: 1,
                    background: this.$vuetify.theme.parsedTheme.accent.base,
                    outline: `solid 0.5px ${this.$vuetify.theme.parsedTheme.secondary.base}EE`,
                    left: (vect.properties.x / this.scale) + this.mapPosOffset.x + "px",
                    top: (vect.properties.y / this.scale) + this.mapPosOffset.y + "px",
                    height: (rect.height / this.scale) / this.view.k + "px",
                    width: (rect.width / this.scale) / this.view.k + "px",
                };
            };
        },
    },
};
</script>
<style>
.graph-map-view-port {
    position: absolute;
}
.graph-map-vector {
    position: absolute;
}
.map-view {
    position: fixed;
    top: 30px;
    right: 10px;
}
.graph-map {
    overflow: hidden;
    padding: 0;
    width: 280px;
    height: 120px;
}
</style>
