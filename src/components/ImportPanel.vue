<template>
    <div v-if="localToc">
        <v-list style="width: 270px;">
            <v-subheader>Items</v-subheader>
            <v-list-item-group v-model="selectedItem">
                <v-list-item v-for="(item, index) in items" :key="index">
                    <v-list-item-icon>
                        <v-icon>mdi-cube-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{item.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn icon @click="addItem(item)">
                            <v-icon>mdi-plus-circle-outline</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "import-panel",
    data: () => {
        return {
            localToc: null,
            selectedItem: null,
        };
    },
    watch: {
        toc: {
            handler() {
                this.localToc = this.toc;
            },
            deep: true,
        },
    },
    methods: {
        ...mapActions([
            "addItem",
        ]),
    },
    computed: {
        ...mapState({
            toc: state => state.toc,
        }),
        items() {
            return Object.keys(this.toc).map((id) => {
                return this.toc[id];
            }).filter((item) => {
                return /published/.test(item.type);
            });
        }
    },
    mounted() {
        this.localToc = this.toc;
    },
};
</script>
<style></style>
