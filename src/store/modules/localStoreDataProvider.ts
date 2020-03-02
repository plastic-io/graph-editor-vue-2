// import toc from "../../../tests/stubs/toc.json";
// import acidGraph from "../../../graphs/acid.json";
// import simpleGraph from "../graphs/simple.json";
// const graph = acidGraph;
import {applyChange} from "deep-diff";
const tocKey = "toc.json";
const eventsPrefix = "events/";
const provider = {
    async get(url: string): Promise<object> {
        let item: string = (await localStorage.getItem(url) || "");
        let obj: object;
        if (!item) {
            throw new Error("Graph not found.");
        }
        try {
            obj = JSON.parse(item);
        } catch (err) {
            throw new Error("Cannot parse graph." + err.toString());
        }
        return obj;
    },
    async set(url: string, value: {time: number, changes: object[]}): Promise<void> {
        // look for existing graph
        let toc: object, events: {time: number, changes: object[]}[] = [];
        const state: any = {};
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
        state.version = events.length;
        // localStorage.setItem("/" + url + "." + events.length, JSON.stringify(state));
        localStorage.setItem(url, JSON.stringify(state));
        // write new data to TOC
        toc = await localStorage.getItem(tocKey);
        if (!toc) {
            toc = {};
        } else if (toc) {
            try {
                toc = JSON.parse(toc);
            } catch (err) {
                throw new Error("Cannot parse toc");
            }
        }
        toc[url] = {
            id: state.id,
            lastUpdate: Date.now(),
            description: state.properties.description,
            name: state.properties.name,
            version: state.version,
        };
        // write TOC
        localStorage.setItem(tocKey, JSON.stringify(toc));
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
