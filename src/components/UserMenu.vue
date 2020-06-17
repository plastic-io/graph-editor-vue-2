<template>
    <div class="ma-3" v-if="identity.provider !== 'local'">
        <v-menu v-if="identity.user">
            <template v-slot:activator="{ on }">
                <v-avatar v-on="on" :size="`${size}px`">
                    <v-img :src="identity.user.avatar"/>
                </v-avatar>
            </template>
            <v-list>
                <v-list-item style="white-space: nowrap;">
                    Logged on as {{identity.user.email}}
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>
                        <v-btn @click="logoff">
                            Logout
                        </v-btn>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-progress-circular indeterminate v-else :size="`${size}`"/>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "user-menu",
    props: {
        size: {
            type: Number,
            default: 36,
        },
    },
    methods: {
        ...mapActions([
            "logoff",
        ]),
    },
    computed: {
        ...mapState({
            identity: state => state.identity,
        }),
    },
};
</script>
<style></style>
