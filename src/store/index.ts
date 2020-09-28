import actions from "./actions";
import mutations from "./mutations";
import getRandomName from "../names";
import helpTopics from "../helpTopics";
import {getField, updateField} from "vuex-map-fields";
import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
const NODE_ENV = process.env.NODE_ENV;
const graphHTTPServer = process.env.VUE_APP_GRAPH_HTTP_SERVER;
const graphWSSServer = process.env.VUE_APP_GRAPH_WSS_SERVER;
const authDomain = process.env.VUE_APP_AUTH_DOMAIN;
const authClientId = process.env.VUE_APP_AUTH_CLIENT_ID;
const authAudience = process.env.VUE_APP_AUTH_AUDIENCE;
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
const defaultNewGraphTemplate = `<template>
    <div>
        <graph-vector
            v-for="vector in graph.vectors"
            :key="vector.id"
            :vector="vector"
            :graph="graph"
        ></graph-vector>
    </div>
</template>
<script>
    export default {
        props: {
            graph: Object,
        },
    }
</script>
`;
const randomName = getRandomName();
const preferences = {
    userName: randomName,
    email: "",
    userId: 0,
    avatar: "https://api.adorable.io/avatars/50/" + randomName.replace(/ /g, "") + ".png",
    workstationId: mutations.newId(),
    newVectorHelp: true,
    showLabels: true,
    debug: false,
    showMap: false,
    useLocalStorage: true,
    showRemoteMouseMovements: true,
    maxConnectorActivity: 100,
    graphHTTPServer,
    graphWSSServer,
    authDomain,
    authClientId,
    authAudience,
    newVectorOffset: {
        x: 100,
        y: 100,
        z: 0,
    },
    defaultNewGraphTemplate,
    defaultNewSetTemplate,
    defaultNewVueTemplate,
    snapToGrid: true,
    gridSize: 10,
    appearance: {
        theme: "light",
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
        // only turn this on for debugging, severe performance hit.
        // Always follow string mode rules
        strict: false,
        state: {
            token: null,
            plugins: {
                graphProperties: [],
                vectorProperties: [],
            },
            authProvider: null,
            identity: {},
            notFound: null,
            buttonMap: {
                "0": "lmb",
                "2": "rmb",
                "1": "mmb"
            },
            fortunes: [],
            inRewindMode: false,
            rewindVisible: false,
            testOutputVersion: 0,
            testOutput: [],
            ownEvents: [],
            testsVisible: false,
            mouseMovements: [],
            mouseTransmitInterval: 1000,
            heartBeatInterval: 50000,
            queuedEvent: null,
            resyncRequired: false,
            eventQueue: [],
            pendingEvents: {},
            graphUserMouse: {},
            graphUserChat: {},
            graphUsers: {},
            connectionState: "closed",
            NODE_ENV,
            createdGraphId: null,
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
            graphReferences: {},
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
            remoteEvents: [],
            remoteSnapshot: {},
            setMapScale: 1,
            showInfo: false,
            infoMessage: "",
            showHelp: false,
            panelVisibility: true,
            graphSnapshot: null,
            graph: null,
            loading: {},
            dataProviders: {
                artifact: null,
                toc: null,
                publish: null,
                notification: null,
                graph: null,
                preferences: null,
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
            getGraphReference(state: any) {
                return (refId: string) => {
                    return state.graphReferences[refId];
                };
            },
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
