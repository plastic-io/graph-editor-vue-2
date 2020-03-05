<template>
    <div v-if="vector">
        <v-toolbar>
            <v-toolbar-title>
                Inputs and Outputs
            </v-toolbar-title>
        </v-toolbar>
        <v-expansion-panels style="width: 260px" accordion flat multiple :value="panels">
            <v-expansion-panel v-for="ioKey in ['inputs', 'outputs']" :key="ioKey">
                <v-expansion-panel-header>
                    <v-toolbar color="transparent" flat dense :key="'toolbar_' + ioKey">
                        <v-btn
                            @click.stop="add(ioKey)"
                             :disabled="controlsDisabled"
                            color="info"
                            fab
                            dark
                            x-small
                            absolute
                            left
                        >
                            <v-icon>mdi-plus-circle-outline</v-icon>
                        </v-btn>
                        <v-icon style="margin-left: 45px;margin-right: 10px;">{{ioKey === "outputs" ? 'mdi-power-plug' : 'mdi-power-socket'}}</v-icon>
                        <v-toolbar-title>
                            {{ioKey}}
                        </v-toolbar-title>
                    </v-toolbar>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-card :key="'card_' + ioKey" style="width: 215px;margin-bottom: 5px;" flat>
                        <v-list two-line subheader :key="'list_' + ioKey">
                            <v-list-item v-for="(io, index) in vector.properties[ioKey]" :key="index">
                                <v-list-item-avatar style="overflow: visible;">
                                    <table style="transform: scale(1) translate(-35px);">
                                        <tr>
                                            <td>
                                                <v-icon
                                                    :disabled="index === 0 || controlsDisabled"
                                                    @click="moveUp(ioKey, io)">mdi-arrow-up-bold-box-outline</v-icon>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <v-icon
                                                    :disabled="index === vector.properties[ioKey].length - 1 || controlsDisabled"
                                                    @click="moveDown(ioKey, io)">mdi-arrow-down-bold-box-outline</v-icon>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <v-icon :disabled="controlsDisabled" @click="remove(ioKey, io)">mdi-delete</v-icon>
                                            </td>
                                        </tr>
                                    </table>
                                </v-list-item-avatar>
                                <v-list-item-content style="overflow: visible;">
                                    <v-tabs class="hide-arrows" style="transform: scale(0.7) translate(-110px, -20%); width: 250px;">
                                        <v-tab>
                                            <v-icon>mdi-rename-box</v-icon>
                                        </v-tab>
                                        <v-tab>
                                            <v-icon>mdi-power-plug</v-icon>
                                        </v-tab>
                                        <v-tab-item style="transform: scale(1.3) translate(10%); width: 85%;margin-bottom: -20%;">
                                            <v-text-field :disabled="controlsDisabled" v-model.lazy="io.name"/>
                                            <v-checkbox v-if="!controlsDisabled" v-model.lazy="io.external" label="External"/>
                                        </v-tab-item>
                                        <v-tab-item>
                                            <v-card flat>
                                                <v-list two-line subheader class="connector-info">
                                                    <v-list-item
                                                        v-for="(connectorInfo, index) in getConnectors(ioKey, io.name)"
                                                        @mouseover="connectorHover(connectorInfo.connector);"
                                                        @click="connectorSelect(connectorInfo.connector);"
                                                        :title="`Field: ${connectorInfo.connector.field}\nVector Id: ${connectorInfo.connector.vectorId}\nConnector Id: ${connectorInfo.connector.id}\nGraph Id: ${connectorInfo.connector.graphId}\nVersion: ${connectorInfo.connector.version}`"
                                                        :key="index">
                                                        <v-list-item-avatar style="overflow: visible;">
                                                            <v-icon>mdi-power-plug</v-icon>
                                                        </v-list-item-avatar>
                                                        <v-list-item-content>
                                                            {{connectorInfo.connector.field}}
                                                        </v-list-item-content>
                                                        <v-list-item-avatar style="overflow: visible;">
                                                            <table style="transform: scale(0.70) translate(5px, -20%); padding-top: 50px;">
                                                                <tr>
                                                                    <td>
                                                                        <v-icon
                                                                            :disabled="index === 0 || controlsDisabled"
                                                                            @click="moveConnectorUp(connectorInfo)">mdi-arrow-up-bold-box-outline</v-icon>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <v-icon
                                                                            :disabled="index === vector.properties[ioKey].length - 1 || controlsDisabled"
                                                                            @click="moveConnectorDown(connectorInfo)">mdi-arrow-down-bold-box-outline</v-icon>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <v-icon :disabled="controlsDisabled" @click="removeConnector(connectorInfo)">mdi-delete</v-icon>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </v-list-item-avatar>
                                                    </v-list-item>
                                                    <v-card v-if="getConnectors(ioKey, io.name).length === 0">
                                                        <v-card-text>
                                                            <i>No Connectors</i>
                                                        </v-card-text>
                                                    </v-card>
                                                </v-list>
                                            </v-card>
                                        </v-tab-item>
                                    </v-tabs>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
        <v-dialog absolute v-model="showMessage" max-width="290">
            <v-card>
                <v-card-title class="headline">Confirm</v-card-title>
                <v-card-text>
                    {{message}}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="showMessage = false">Cancel</v-btn>
                    <v-btn @click="messageClick">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import {mapState, mapActions} from "vuex";
import {diff} from "deep-diff";
export default {
    name: "edge-properties",
    methods: {
        ...mapActions([
            "deleteConnector",
            "selectConnector",
            "hoveredConnector",
            "moveHistoryPosition",
            "changeConnectorOrder",
        ]),
        output(connector) {
            const field = this.vector.properties.outputs.find((output) => {
                return connector.field === output.name;
            });
            const index = this.vector.properties.outputs.indexOf(field);
            return {
                index,
                vector: this.vector,
                field
            };
        },
        input(connector) {
            const vector = this.graphSnapshot.vectors.find((v) => {
                return v.id === connector.vectorId;
            });
            const field = vector ? vector.properties.inputs.find((input) => {
                return connector.field === input.name;
            }) : null;
            const index = vector ? vector.properties.inputs.indexOf(field) : null;
            return {
                index,
                vector,
                field
            };
        },
        moveConnectorUp(connectorInfo) {
            this.changeConnectorOrder({
                vectorId: connectorInfo.vector.id,
                connectorId: connectorInfo.connector.id,
                direction: "up",
            });
        },
        moveConnectorDown(connectorInfo) {
            this.changeConnectorOrder({
                vectorId: connectorInfo.vector.id,
                connectorId: connectorInfo.connector.id,
                direction: "down",
            });
        },
        removeConnector(connectorInfo) {
            this.deleteConnector(connectorInfo.connector);
        },
        connectorSelect(connector) {
            this.selectConnector(connector);
        },
        connectorHover(connector) {
            this.hoveredConnector({
                vector: this.vector,
                connector,
                input: this.input(connector),
                output: this.output(connector),
            });
        },
        getConnectors(ioKey, name) {
            const connectors = [];
            if (ioKey === "inputs") {
                this.graphSnapshot.vectors.forEach((v) => {
                    v.edges.forEach((edge) => {
                        connectors.push(...edge.connectors.filter((c) => {
                            c.vectorId === this.vectorId && c.field === name;
                        }).map((connector) => {
                            return {
                                connector,
                                vector: v,
                            };
                        }));
                    });
                });
            } else {
                connectors.push(...this.vector.edges.find(e => e.field === name).connectors.map((connector) => {
                    return {
                        connector,
                        vector: this.vector,
                    };
                }));
            }
            return connectors;
        },
        messageClick() {
            if (this.messageCallback) {
                this.messageCallback();
            }
        },
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
            console.log("add", ioKey);
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
            // HACK: this is just wrong. why?!
            this.$nextTick(() => {
                this.$forceUpdate();
            });
        },
        remove(ioKey, io, override) {
            // if there are connectors attached to edges, warn the user of the eventual removal of the connectors
            const isInput = ioKey === "inputs";
            if (isInput) {
                for (let x = 0; x < this.graphSnapshot.vectors.length; x += 1) {
                    for (let y =0; y < this.graphSnapshot.vectors[x].edges.length; y += 1) {
                        this.graphSnapshot.vectors[x].edges[y].connectors.find(c => c.vectorId === this.vector.id && c.field === io.name);
                        if (!override) {
                            this.showMessage = true;
                            this.message = "There are connectors connected to this input.  Are you sure you want to delete it?";
                            this.messageCallback = () => {
                                this.showMessage = false;
                                this.override = false;
                                this.showMessage = false;
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
                if (edge.connectors.length > 0 && !override) {
                    this.showMessage = true;
                    this.message = "There are connectors connected to this output.  Are you sure you want to delete it?";
                    this.messageCallback = () => {
                        this.showMessage = false;
                        this.override = false;
                        this.showMessage = false;
                        this.remove(ioKey, io, true);
                    };
                    return;
                }
            }
            this.$store.dispatch(isInput ? "removeInput" : "removeOutput", {
                vectorId: this.vector.id,
                name: io.name,
            });
        },
        setLocalVector() {
            this.vector = JSON.parse(JSON.stringify(this.getSelectedVector()));
        },
        getSelectedVector() {
            return this.graphSnapshot.vectors.find((v) => v.id === this.vectorId);
        },
    },
    data() {
        return {
            vector: null,
            override: false,
            showMessage: false,
            message: "",
            messageCallback: null,
            panels: [0],
        };
    },
    watch: {
        graphSnapshot: {
            handler: function () {
                if (diff(this.getSelectedVector(), this.vector)) {
                    this.setLocalVector();
                }
            }
        },
        "vector.properties": {
            handler: function () {
                this.$store.dispatch("updateVectorFields", {
                    vector: this.vector,
                });
            },
            deep: true,
        },
        selectedVector: function () {
            if (!this.selectedVector) {
                return;
            }
            this.vectorId = this.selectedVector.id;
            this.setLocalVector();
        },
    },
    mounted() {
        this.vectorId = this.selectedVector.id;
        this.setLocalVector();
    },
    computed: {
        controlsDisabled() {
            return !!this.vector.url;
        },
        ...mapState({
            selectedVector: state => state.selectedVector,
            graphSnapshot: state => state.graphSnapshot,
        }),
    },
};
</script>
<style>
    .hide-arrows .v-slide-group__prev, .hide-arrows .v-slide-group__next {
        display: none!important;
    }
    .connector-info {
        max-height: 300px;
        width: 290px;
        overflow-y: auto;
        overflow-x: visible;
        padding-top: 10px;
        margin-bottom: -55%;
    }
</style>
