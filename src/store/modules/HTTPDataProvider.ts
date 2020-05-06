import {Vector, Graph} from "@plastic-io/plastic-io"; // eslint-disable-line
export default class HTTPDataProvider {
    baseUrl: string;
    constructor(baseUrl: string) {
        if (!baseUrl) {
            throw new Error("No base url was passed to HTTPDataProvider");
        }
        this.baseUrl = baseUrl + (baseUrl[baseUrl.length - 1] === "/" ? "" : "/");
    }
    set(url: string, value: any) {
        console.log("httpDataProvider", url, value);
    }
    async get(url: string) {
        const data = await fetch(this.baseUrl + url);
        return await data.json();
    }
}
