<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="80%">
            <v-card>
                <v-btn
                    class="mx-2"
                    fab
                    dark
                    large
                    color="primary"
                    @click="close"
                >
                    <v-icon dark>mdi-close</v-icon>
                </v-btn>
                <data-iterator :items="toc"/>
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
import DataIterator from "./DataIterator";
import {mapState} from "vuex";
export default {
    name: "open-dialog",
    components: {
        DataIterator
    },
    data() {
        return {
            dialog: true
        };
    },
    methods: {
        close() {
            this.$emit("close");
        }
    },
    computed: {
        ...mapState({
            toc: (state) => state.toc,
        }),
    }
};
</script>
<style></style>
