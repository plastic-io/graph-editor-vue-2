import actions from "./actions";
import mutations from "./mutations";
import {getField, updateField} from "vuex-map-fields";
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
export default function () {
    return {
        strict: true,
        state: {
            tags: [
                "any",
                "browser",
                "lambda",
                "cli",
            ],
            vectorMimeType: "application/json+plastic-io",
            remoteSnapshot: {},
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
            scheduler: {
                state: {},
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
            activityConnectors: [],
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
            preferences: {
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
            }
        },
        actions,
        mutations: {
            ...mutations,
            updateField,
        },
        getters: {
            getField,
        },
    };
}
