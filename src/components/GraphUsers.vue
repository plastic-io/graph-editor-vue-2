<template>
    <span>
        <span v-for="(user, index) in users" :key="index">
            <v-tooltip bottom v-if="user.workstationId !== workstationId">
                <template v-slot:activator="{ on }">
                    <v-img
                        v-on="on"
                        :src="user.avatar"
                        class="graphUserAvatar"
                    ></v-img>
                </template>
                <span>{{user.userName}}</span>
            </v-tooltip>
        </span>
    </span>
</template>
<script>
import {mapState} from "vuex";
export default {
    name: "graph-users",
    computed: {
        ...mapState({
            workstationId: state => state.preferences.workstationId,
            graphUsers: state => state.graphUsers,
        }),
        users() {
            return Object.keys(this.graphUsers).map((userKey) => {
                return this.graphUsers[userKey];
            });
        },
    },
};
</script>
<style>
.graphUserAvatar {
    width: 15px;
    border-radius: 10;
    border: solid 1px rgba(255, 255, 255, 0.5);
    display: inline-block;
    margin: 5px 3px 0 3px;
}
</style>
