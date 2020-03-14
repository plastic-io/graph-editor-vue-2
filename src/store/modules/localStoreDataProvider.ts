import {applyChange} from "deep-diff";
const tocKey = "toc.json";
const eventsPrefix = "events/";
const artifactsPrefix = "artifacts/";
import {Vector, Graph} from "@plastic-io/plastic-io"; // eslint-disable-line
interface Toc {
    [key: string]: TocItem;
}
interface TocItem {
    id: string;
    lastUpdate: number;
    type: string;
    description: string;
    icon: string;
    name: string;
    version: number;
}
interface GraphDiff {
    time: number
    changes: object[]
}
interface VectorArtifact {
    vector: Vector;
}
interface GraphArtifact {
    graph: Graph;
}
interface PreferencesArtifact {
    preferences: any;
}
async function updateToc(key: string, value: TocItem) {
    // write new data to TOC
    let sToc: string | null = await localStorage.getItem(tocKey);
    let toc: Toc;
    if (!sToc) {
        toc = {};
    } else {
        try {
            toc = JSON.parse(sToc);
        } catch (err) {
            throw new Error("Cannot parse toc");
        }
    }
    toc[key] = value;
    // write TOC
    localStorage.setItem(tocKey, JSON.stringify(toc));
}
const provider = {
    async get(url: string): Promise<object> {
        let item: string = (await localStorage.getItem(url) || "");
        let obj: object;
        if (!item) {
            throw new Error("Resource not found.");
        }
        try {
            obj = JSON.parse(item);
        } catch (err) {
            throw new Error("Cannot parse resource." + err.toString());
        }
        return obj;
    },
    async set(url: string, value: GraphDiff | VectorArtifact | GraphArtifact | PreferencesArtifact): Promise<void> {
        let events: GraphDiff[] = [];
        const state: any = {};
        if ("preferences" in value) {
            // set preferences
            await localStorage.setItem(url, JSON.stringify(value.preferences));
        } else if ("changes" in value) {
            // load the events
            const eventStr = await localStorage.getItem(eventsPrefix + url);
            if (!eventStr) {
                events = [];
            } else if(eventStr) {
                try {
                    events = JSON.parse(eventStr);
                } catch (err) {
                    throw new Error("Cannot parse events");
                }
            }
            value.time = Date.now();
            events.push(value);
            // roll up events into a projection then save it
            await localStorage.setItem(eventsPrefix + url, JSON.stringify(events));
            events.forEach((event) => {
                event.changes.forEach((change: any) => {
                    applyChange(state, true, change);
                });
            });
            localStorage.setItem(url, JSON.stringify(state));
            updateToc(url, {
                id: state.id,
                lastUpdate: Date.now(),
                type: "graph",
                icon: state.properties.icon,
                description: state.properties.description,
                name: state.properties.name,
                version: state.version,
            } as TocItem);
        } else if ("vector" in value) {
            const key = artifactsPrefix + url + "." + value.vector.version;
            localStorage.setItem(key, JSON.stringify(value.vector));
            updateToc(key, {
                id: value.vector.id,
                lastUpdate: Date.now(),
                type: "publishedVector",
                description: value.vector.properties.description,
                icon: value.vector.properties.icon,
                name: value.vector.properties.name,
                version: value.vector.version,
            } as TocItem);
        } else if ("graph" in value) {
            const key = artifactsPrefix + url + "." + value.graph.version;
            localStorage.setItem(artifactsPrefix + url + "." + value.graph.version, JSON.stringify(value.graph));
            updateToc(key, {
                id: value.graph.id,
                lastUpdate: Date.now(),
                type: "publishedGraph",
                icon: value.graph.properties.icon,
                description: value.graph.properties.description,
                name: value.graph.properties.name,
                version: value.graph.version,
            } as TocItem);
        } else {
            throw new Error("Set called without a recognized type");
        }
    },
    async delete(url: string): Promise<void> {
        const sToc = await localStorage.getItem(tocKey);
        let toc: Toc;
        if (!sToc) {
            throw new Error("Cannot find TOC.");
        } else {
            try {
                toc = JSON.parse(sToc);
            } catch (err) {
                throw new Error("Cannot parse toc");
            }
        }
        delete toc[url];
        localStorage.setItem(tocKey, JSON.stringify(toc));
        return await localStorage.removeItem(url);
    },
};
export default provider;
