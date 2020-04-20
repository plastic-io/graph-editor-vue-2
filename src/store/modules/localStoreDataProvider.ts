import {applyChange} from "deep-diff";
import Hashes from "jshashes";
const preferencesKey = "preferences";
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
    crc: number,
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
// Note: localStorage methods are not async.  Async  methods are used to show
// what it would look like to implement an async data provider which are far
// more typical than sync providers like local store.
async function updateToc(key: string, value: TocItem) {
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
    await localStorage.setItem(tocKey, JSON.stringify(toc));
}
const provider = {
    events: {},
    async subscribe(url: string | null, callback: Function): Promise<void> {
        let lastLength = -1;
        const updateState = async () => {
            if (url === "toc.json") {
                const strToc: string = (await localStorage.getItem(tocKey) || "");
                let toc: object;
                try {
                    toc = JSON.parse(strToc);
                } catch (err) {
                    throw new Error("Cannot parse TOC. Error: " + err.toString());
                }
                callback({
                    type: "toc",
                    toc,
                });
            } else if (url === "preferences") {
                const strPreferences: string = (await localStorage.getItem(preferencesKey) || "");
                let preferences: object;
                try {
                    preferences = JSON.parse(strPreferences);
                } catch (err) {
                    throw new Error("Cannot parse preferences. Error: " + err.toString());
                }
                callback({
                    type: "preferences",
                    preferences,
                });
            } else {
                const eventStr = (await localStorage.getItem(eventsPrefix + url) || "");
                let events;
                if (!eventStr) {
                    events = [];
                } else if (eventStr) {
                    try {
                        events = JSON.parse(eventStr);
                    } catch (err) {
                        throw new Error("Cannot parse events. Error: " + err.toString());
                    }
                }
                if (lastLength !== events.length) {
                    if (lastLength !== -1) {
                        callback({
                            type: "events",
                            events: events.slice(lastLength),
                        });
                    }
                    lastLength = events.length;
                }
            }
        };
        window.addEventListener("storage", updateState);
        if (!(url === tocKey || url === preferencesKey)) {
            // if this is not a document, do not try and fetch an initial state
            updateState();
        }
    },
    async get(url: string): Promise<object> {
        let item: string = (await localStorage.getItem(url) || "");
        let obj: object;
        if (!item) {
            throw new Error("Resource not found." + url);
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
                    throw new Error("Cannot parse events. Error: " + err.toString());
                }
            }
            value.time = Date.now();
            events.push(value);
            events.forEach((event) => {
                event.changes.forEach((change: any) => {
                    applyChange(state, true, change);
                });
            });
            const crc = Hashes.CRC32(JSON.stringify(state));
            if (crc !== value.crc) {
                console.log("state", value, JSON.parse(JSON.stringify(state)));
                throw new Error(`CRC Mismatch.  Expected ${crc} got ${value.crc}`);
            }
            await localStorage.setItem(eventsPrefix + url, JSON.stringify(events));
            await localStorage.setItem(url, JSON.stringify(state));
            await updateToc(url, {
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
            await updateToc(key, {
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
            await updateToc(key, {
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
        await localStorage.setItem(tocKey, JSON.stringify(toc));
        return await localStorage.removeItem(url);
    },
};
export default provider;
