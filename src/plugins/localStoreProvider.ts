const provider = {
    async list(): Promise<{[key: string]: number}> {
        const item: string = (await localStorage.getItem("index") || "");
        let items: {[key: string]: number} = {} as {[key: string]: number};
        try {
            items = JSON.parse(item);
        } catch (ignore) {
            console.warn("No list found");
            items = {} as {[key: string]: number};
        }
        return items;
    },
    async get(url: string): Promise<object> {
        let item: string = (await localStorage.getItem(url) || "");
        let obj: object = {};
        try {
            obj = JSON.parse(item);
        } catch (ignore) {
            obj = {};
        }
        return obj;
    },
    async set(url: string, value: object): Promise<void> {
        await localStorage.setItem(url, JSON.stringify(value));
        const items: {[key: string]: number} = await provider.list();
        items[url] = Date.now();
        localStorage.setItem("index", JSON.stringify(items));
    },
    async delete(url: string): Promise<void> {
        const items: {[key: string]: number} = await provider.list();
        delete items[url];
        localStorage.setItem("index", JSON.stringify(items));
        return await localStorage.removeItem(url);
    },
};
export default provider;
