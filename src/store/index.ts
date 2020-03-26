import actions from "./actions";
import mutations from "./mutations";
import helpTopics from "../helpTopics";
import {getField, updateField} from "vuex-map-fields";
import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
const defaultNewSetTemplate = "console.info(value)";
const defaultNewVueTemplate = `<template>
    <div>
        New Vector
    </div>
</template>
<script>
export default {
    props: {
        vector: Object,
        state: Object,
    }
}
</script>
<style>
</style>
`;
const preferences = {
    newVectorHelp: true,
    showLabels: true,
    debug: false,
    newVectorOffset: {
        x: 100,
        y: 100,
        z: 0,
    },
    defaultNewSetTemplate,
    defaultNewVueTemplate,
    snapToGrid: true,
    gridSize: 10, // cannot be changed for now
    appearance: {
        theme: "dark",
        helpColor: "blue",
        showGrid: true,
        selectionRectColor: "lightBlue",
        boundingRectColor: "shades",
        connectors: {
            dragDeadZone: 10,
            controlFillStyle: "blue",
            strokeStyle: "pink",
            selectedStrokeStyle: "amber",
            hoverStrokeStyle: "deepPurple",
            watchStrokeStyle: "orange",
            activityStrokeStyle: "indigo",
            errorStrokeStyle: "red",
            lineWidth: 1,
        }
    }
};
export default function () {
    return {
        strict: false,
        state: {
            helpTopics,
            log: [],
            pathPrefix: "/graph-editor/",
            ioTypes: [
                "Object",
                "String",
                "Boolean",
                "Number",
                "null",
                "undefined",
            ],
            tags: [
                "any",
                "browser",
                "lambda",
                "cli",
            ],
            registry: {},
            artifacts: {},
            publicGraphRegistries: [
                "https://unpkg.com/@plastic-io/registry@1.0.0",
                "https://unpkg.com/@plastic-io/registry@1.0.1",
                "https://unpkg.com/@plastic-io/registry@1.0.2",
                "https://unpkg.com/@plastic-io/registry@1.0.3",
            ],
            vectorMimeType: "application/json+plastic-io",
            jsonMimeType: "application/json",
            remoteSnapshot: {},
            showHelp: false,
            panelVisibility: true,
            graphSnapshot: null,
            graph: null,
            loading: {},
            dataProviders: {
                publish: null,
                graph: null,
                session: null,
            },
            error: null,
            showError: false,
            connectorWarn: null,
            scheduler: {
                state: {},
                errors: {},
                instance: null,
            },
            presentation: false,
            locked: false,
            historyPosition: 0,
            vectorZCounter: 0,
            selectedGroups: [],
            boundingRect: {
                visible: false,
                x: 0,
                y: 0,
                height: 0,
                width: 0
            },
            selectionRect: {
                visible: false,
                x: 0,
                y: 0,
                height: 0,
                width: 0
            },
            groupBounds: {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
            },
            addingConnector: null,
            movingConnector: null,
            primaryGroup: null,
            movingVectors: [],
            selectedConnectors: [],
            groupVectors: [],
            selectedVector: null,
            selectedVectors: [],
            errorConnectors: [],
            watchConnectors: [],
            activityConnectors: {},
            hoveredConnector: null,
            hoveredVector: null,
            hoveredPort: null,
            mouse: {
                lmb: false,
                rmb: false,
                mmb: false,
                x: 0,
                y: 0
            },
            luts: {},
            translating: {},
            keys: {},
            view: {
                x: 0,
                y: 0,
                k: 1
            },
            toc: null,
            events: [],
            preferences,
            originalPreferences: JSON.parse(JSON.stringify(preferences)),
        },
        actions,
        mutations: {
            ...mutations,
            updateField,
        },
        getters: {
            getArtifactByUrl(state: any) {
                return (url: string) => {
                    if (!state.artifacts[url]) {
                        console.warn("Cannot find artifact ", url);
                    }
                    return state.artifacts[url];
                };
            },
            getVectorById(state: any) {
                return (vectorId: string) => {
                    return state.graph.vectors.find((v: Vector) => v.id === vectorId);
                };
            },
            getLoadingStatus(state: any) {
                return (type: string, id: string) => {
                    const projection = {
                        count: 0,
                        events: [] as {time: number, event: any, loading: boolean}[],
                        loading: false as boolean,
                    };
                    state.loading[type][id].forEach((status: any) => {
                        projection.count += 1;
                        projection.events.push({
                            time: status.time,
                            event: status.event,
                            loading: status.loading,
                        });
                        projection.loading = status.loading;
                    });
                    return projection;
                };
            },
            getField,
        },
    };
}
