import {applyChange} from "deep-diff";
import * as Automerge from "automerge";
const preferencesKey = "preferences";
const tocKey = "toc.json";
const eventsPrefix = "events/";
const crdtPrefix = "crdt/";
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
    userId: string,
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
export default class LocalStorageDataProvider {
    updateToc(key: string, value: TocItem) {
        let sToc: string | null = localStorage.getItem(tocKey);
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
        localStorage.setItem(tocKey, JSON.stringify(toc));
    }
    subscribe(url: string | null, callback: (e: any) => void) {
        let lastLength = -1;
        const updateState = () => {
            if (url === "toc.json") {
                const strToc: string = (localStorage.getItem(tocKey) || "");
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
                const strPreferences: string = (localStorage.getItem(preferencesKey) || "");
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
                const eventStr = (localStorage.getItem(eventsPrefix + url) || "");
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
    }
    getString(url: string): string {
        let item: string = (localStorage.getItem(url) || "");
        if (!item) {
            throw new Error("Resource not found." + url);
        }
        return item;
    }
    get(url: string): object {
        let item: string = (localStorage.getItem(url) || "");
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
    }
    setChanges(value: GraphDiff, url: string) {
        // load the document
        console.log("Save local changes");
        const docStr = localStorage.getItem(crdtPrefix + url);
        const currentDoc = docStr ? Automerge.load(docStr, value.userId) : Automerge.init(value.userId);
        const state = Automerge.change(currentDoc, (doc: any) => {
            value.changes.forEach((change: any) => {
                applyChange(doc, true, change);
            });
        }) as Graph;
        const changedDocStr = Automerge.save(state) as any;
        localStorage.setItem(crdtPrefix + url, changedDocStr);
        localStorage.setItem(url, JSON.stringify(state));
        this.updateToc(url, {
            id: state.id,
            lastUpdate: Date.now(),
            type: "graph",
            icon: state.properties.icon,
            description: state.properties.description,
            name: state.properties.name,
            version: state.version,
        } as TocItem);
    }
    setPublishedVector(value: VectorArtifact, url: string) {
        const key = artifactsPrefix + url + "." + value.vector.version;
        localStorage.setItem(key, JSON.stringify(value.vector));
        this.updateToc(key, {
            id: value.vector.id,
            lastUpdate: Date.now(),
            type: "publishedVector",
            description: value.vector.properties.description,
            icon: value.vector.properties.icon,
            name: value.vector.properties.name,
            version: value.vector.version,
        } as TocItem);
    }
    setPublishedGraph(value: GraphArtifact, url: string) {
        const key = artifactsPrefix + url + "." + value.graph.version;
        localStorage.setItem(artifactsPrefix + url + "." + value.graph.version, JSON.stringify(value.graph));
        this.updateToc(key, {
            id: value.graph.id,
            lastUpdate: Date.now(),
            type: "publishedGraph",
            icon: value.graph.properties.icon,
            description: value.graph.properties.description,
            name: value.graph.properties.name,
            version: value.graph.version,
        } as TocItem);
    }
    set(url: string, value: GraphDiff | VectorArtifact | GraphArtifact | PreferencesArtifact) {
        if ("preferences" in value) {
            // set preferences
            localStorage.setItem(url, JSON.stringify(value.preferences));
        } else if ("changes" in value) {
            this.setChanges(value, url);
        } else if ("vector" in value) {
            this.setPublishedVector(value, url);
        } else if ("graph" in value) {
            this.setPublishedGraph(value, url);
        } else {
            throw new Error("Set called without a recognized type");
        }
    }
    delete(url: string) {
        // HACK: also do this for event prefix, silently fail if there's nothing there
        const sToc = localStorage.getItem(tocKey);
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
        if (localStorage.getItem(eventsPrefix + url) !== null) {
            localStorage.removeItem(eventsPrefix + url);
        }
        localStorage.removeItem(url);
    }
}
