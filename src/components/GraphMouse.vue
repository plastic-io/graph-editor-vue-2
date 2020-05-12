<template>
    <div>
        <div
            v-for="mouse in mice"
            :key="mouse.workstationId"
            :style="mousePosition(mouse)"
            class="graph-user-mouse"
            >
                <div v-if="mouse.workstationId !== workstationId">
                    <v-icon v-text="(mouse.mouse.lmb || mouse.mouse.mmb || mouse.mouse.rmb) ? 'mdi-cursor-default-click-outline' : 'mdi-cursor-default-outline'" />
                    <v-card class="graph-user-mouse-label">
                        <v-card-title style="white-space: nowrap;">
                            <v-img class="graph-user-mouse-avatar" :src="mouse.avatar"/>
                            <v-spacer/>
                            {{mouse.userName}}
                        </v-card-title>
                    </v-card>
                </div>
        </div>
    </div>
</template>
<script>
import {mapState} from "vuex";
export default {
    name: "graph-mouse",
    methods: {
        mousePosition(data) {
            return {
                left: data.mouse.x + "px",
                top: data.mouse.y + "px",
            };
        },
    },
    computed: {
        ...mapState({
            workstationId: state => state.preferences.workstationId,
            graphUserMouse: state => state.graphUserMouse,
        }),
        mice() {
            return Object.keys(this.graphUserMouse).map((userKey) => {
                return this.graphUserMouse[userKey];
            });
        },
    },
};
</script>
<style>
.graph-user-mouse-avatar {
    width: 30px;
    border: solid 2px (127, 127, 127, 0.5);
    border-radius: 15px;
    margin-right: 10px;
}
.graph-user-mouse {
    position: absolute;
}
.graph-user-mouse-label {
    border: solid 2px (127, 127, 127, 0.5);
    transform: scale(0.5) translate(-40px, -40px);
}
</style>
