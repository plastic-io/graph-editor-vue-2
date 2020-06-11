import {Vector, Graph} from "@plastic-io/plastic-io"; // eslint-disable-line
export default class HTTPDataProvider {
    baseUrl: string;
    constructor(baseUrl: string) {
        if (!baseUrl) {
            throw new Error("No base url was passed to HTTPDataProvider");
        }
        this.baseUrl = baseUrl + (baseUrl[baseUrl.length - 1] === "/" ? "" : "/");
    }
    async set(url: string, value: any) {
        const request = new Request(this.baseUrl + url, {method: "POST", body: value});
        try {
            const response = await fetch(request);
            return await response.json();
        } catch (err) {
            throw new Error("Cannot post event: " + err);
        }
    }
    async get(url: string) {
        const data = await fetch(this.baseUrl + url);
        return await data.json();
    }
}
