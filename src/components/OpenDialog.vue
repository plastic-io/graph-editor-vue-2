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
                <DataItorator />
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
import DataItorator from "../components/DataItorator";
export default {
    name: "open-dialog",
    components: {
        DataItorator
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
    computed: {}
};
</script>
<style></style>
