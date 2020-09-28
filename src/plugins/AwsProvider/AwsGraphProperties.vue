<template>
    <v-card flat v-if="graphSnapshot" style="height: calc(100vh - 96px); overflow-y: auto;">
        <v-card-title>
            <v-icon left help-topic="graph">mdi-aws</v-icon>
            AWS Properties
        </v-card-title>
        <v-card-text class="ma-0">
            <v-expansion-panels flat v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>Deploy</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card class="ma-0 pa-0" flat>
                            <v-card-text class="ma-0 pa-0" help-topic="vectorLocation">
                                <v-text-field label="Application Name" disabled v-model="applicationName"/>
                                <v-combobox
                                    label="Compute Platform"
                                    v-model="computePlatform"
                                    :items="['Lambda']"
                                />
                                <v-textarea
                                    label="Dependencies"
                                    v-model="dependencies"
                                />
                                <v-textarea
                                    label="Role Statement"
                                    persistent-hint
                                    hint="e.g.: &quot;deep-diff&quot;: &quot;^1.0.2&quot; or just &quot;deep-diff&quot;"
                                    chips
                                    deletable-chips
                                    clearable
                                    multiple
                                    v-model="role"
                                />
                                <v-combobox
                                    label="Target Environment"
                                    v-model="targetEnv"
                                    :items="['Production', 'Development', 'Staging', 'Integration']"
                                />
                            </v-card-text>
                            <v-card-actions>
                                <v-btn @click="deployGraph">
                                    Deploy
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>
<script>
import {mapState, mapActions, mapMutations} from "vuex";
import {mapFields} from "vuex-map-fields";
export default {
    name: "aws-graph-properties",
    methods: {
        ...mapActions([
            "deploy",
            "save",
        ]),
        ...mapMutations([
            "selectVector",
        ]),
        deployGraph() {
            this.deploy({
                env: this.targetEnv,
                version: "latest",
                id: this.graphSnapshot.id,
            });
        },
    },
    data: () => {
        return {
            panel: 0,
            targetEnv: "Development",
        };
    },
    beforeMount() {
        // fix missing lambda properties from legacy graphs
        this.graphSnapshot.properties.deploy = this.graphSnapshot.properties.deploy || {
            provider: {
                aws: {
                    application: {
                        applicationName: this.graphSnapshot.id,
                        dependencies: "{}",
                        role: "{}",
                        computePlatform: "Lambda",
                    }
                }
            }
        };
    },
    watch: {
        "graphSnapshot.properties": {
            handler: function () {
                this.save();
            },
            deep: true,
        },
    },
    computed: {
        ...mapFields([
            "graphSnapshot.properties.deploy.provider.aws.application.applicationName",
            "graphSnapshot.properties.deploy.provider.aws.application.dependencies",
            "graphSnapshot.properties.deploy.provider.aws.application.computePlatform",
            "graphSnapshot.properties.deploy.provider.aws.application.role",
        ]),
        ...mapState({
            graphSnapshot: state => state.graphSnapshot,
        }),
    }
};
</script>