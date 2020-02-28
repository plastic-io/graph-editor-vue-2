<template>
    <div v-if="vector">
        <v-toolbar>
            <v-toolbar-title>
                Inputs and Outputs
            </v-toolbar-title>
        </v-toolbar>
        <template v-for="ioKey in ['outputs', 'inputs']">
            <v-card :key="'card_' + ioKey" style="width: 215px;margin-bottom: 5px;">
                <v-card-title>
                    <v-toolbar flat dense :key="'toolbar_' + ioKey">
                        <v-icon style="margin-right: 10px;">{{ioKey === "outputs" ? 'mdi-power-plug' : 'mdi-power-socket-us'}}</v-icon>
                        <v-toolbar-title>
                            {{ioKey}}
                        </v-toolbar-title>
                        <v-icon @click="add(ioKey)" style="margin-left: 10px;">mdi-plus-circle-outline</v-icon>
                    </v-toolbar>
                </v-card-title>
                <v-list two-line subheader :key="'list_' + ioKey">
                    <v-list-item v-for="(io, index) in vector.properties[ioKey]" :key="io.name">
                        <v-list-item-avatar style="overflow: visible;">
                            <v-icon @click="remove(ioKey, io)">mdi-minus-circle-outline</v-icon>
                            <table style="transform: scale(0.70) translate(5px, 0);">
                                <tr>
                                    <td>
                                        <v-icon
                                            :disabled="index === 0"
                                            @click="moveUp(ioKey, io)">mdi-arrow-up-bold-box-outline</v-icon>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <v-icon
                                            :disabled="index === vector.properties[ioKey].length - 1"
                                            @click="moveDown(ioKey, io)">mdi-arrow-down-bold-box-outline</v-icon>
                                    </td>
                                </tr>
                            </table>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-text-field v-model="io.name"></v-text-field>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card>
        </template>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "edge-properties",
    methods: {
        ...mapActions([
            "moveHistoryPosition",
        ]),
        moveUp(ioKey, io) {
            this.$store.dispatch(ioKey === "inputs" ? "changeInputOrder" : "changeOutputOrder", {
                vectorId: this.vector.id,
                name: io.name,
                direction: "up",
            });
        },
        moveDown(ioKey, io) {
            this.$store.dispatch(ioKey === "inputs" ? "changeInputOrder" : "changeOutputOrder", {
                vectorId: this.vector.id,
                name: io.name,
                direction: "down",
            });
        },
        add(ioKey) {
            // if a key with this name exists, don't do it
            const isInput = ioKey === "inputs";
            const newName = isInput ? "new input" : "new output";
            if (isInput && this.vector.properties[ioKey].map(i => i.name).indexOf(newName) !== -1) {
                return;
            }
            if (!isInput && this.vector.properties.outputs.map(i => i.name).indexOf(newName) !== -1) {
                return;
            }
            this.$store.dispatch(isInput ? "addInput" : "addOutput", {
                vectorId: this.vector.id,
                name: newName,
            });
        },
        remove(ioKey, io, override) {
            // if there are connectors attached to edges, warn the user of the eventual removal of the connectors
            const isInput = ioKey === "inputs";
            if (isInput) {
                for (let x = 0; x < this.graph.vectors.length; x += 1) {
                    if (this.graph.vectors[x].edges.find(e => e.vectorId === this.vector.id && e.field === io.name)) {
                        if (!override) {
                            this.showMessage = true;
                            this.message = "There are connectors connected to this input.  Are you sure you want to delete it?";
                            this.messageCallback = () => {
                                this.remove(ioKey, io, true);
                            };
                            return;
                        }
                    }
                }
            } else {
                const edge = this.vector.edges.find(e => e.field === io.name);
                if (!edge) {
                    return;
                }
                if (edge.connectors) {
                    this.showMessage = true;
                    this.message = "There are connectors connected to this output.  Are you sure you want to delete it?";
                    this.messageCallback = () => {
                        this.remove(ioKey, io, true);
                    };
                }
            }
            this.$store.dispatch(isInput ? "removeInput" : "removeOutput", {
                vectorId: this.vector.id,
                name: io.name,
            });
        },
    },
    data() {
        return {
            vector: null,
            override: false,
            showMessage: false,
            message: "",
            messageCallback: null,
        };
    },
    watch: {
        selectedVectors: function () {
            if (this.selectedVectors.length !== 1) {
                return;
            }
            this.vector = this.selectedVectors[0];
        },
    },
    mounted() {
        if (this.selectedVectors.length !== 1) {
            return;
        }
        this.vector = this.selectedVectors[0];
    },
    computed: {
        ...mapState({
            selectedVectors: state => state.selectedVectors,
            graph: state => state.graph,
        }),
    },
};
</script>
<style></style>
