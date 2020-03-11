import {applyChange} from "deep-diff";
const tocKey = "toc.json";
const eventsPrefix = "events/";
const artifactsPrefix = "artifacts/";
async function updateToc(key, value) {
    // write new data to TOC
    let toc: object = await localStorage.getItem(tocKey);
    if (!toc) {
        toc = {};
    } else if (toc) {
        try {
            toc = JSON.parse(toc);
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
    async set(url: string, value: {time: number, changes: object[]}): Promise<void> {
        let events: {time: number, changes: object[]}[] = [];
        const state: any = {};
        if (value.preferences) {
            // set preferences
            await localStorage.setItem(url, JSON.stringify(value.preferences));
        } else if (value.changes) {
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
            });
        } else if (value.vector) {
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
            });
        } else if (value.graph) {
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
            });
        } else {
            throw new Error("Set called without a recognized type");
        }
    },
    async delete(url: string): Promise<void> {
        let toc = await localStorage.getItem(tocKey);
        if (!toc) {
            throw new Error("Cannot find TOC.");
        } else if (toc) {
            try {
                toc = JSON.parse(toc);
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
