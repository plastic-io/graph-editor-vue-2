import createAuth0Client from "@auth0/auth0-spa-js";
export default class Auth0AuthProvider {
    client: any;
    async create(domain: string, client_id: string, audience: string, redirect_uri: string) {
        try {
            this.client = await createAuth0Client({
                domain,
                client_id,
                audience,
                redirect_uri,
            });
        } catch (err) {
            throw new Error("Auth0AuthProvider: Error creating client: " + err);
        }
    }
    async handleRedirectCallback() {
        return await this.client.handleRedirectCallback();
    }
    async getUser() {
        try {
            return await this.client.getUser();
        } catch (err) {
            throw new Error("Auth0AuthProvider getUser:" + err);
        }
    }
    async getToken() {
        try {
            return await this.client.getTokenSilently();
        } catch (err) {
            throw new Error("Auth0AuthProvider getToken:" + err);
        }
    }
    async login() {
        try {
            return await this.client.loginWithRedirect();
        } catch (err) {
            throw new Error("Auth0AuthProvider login:" + err);
        }
    }
    async logoff() {
        try {
            return await this.client.logout();
        } catch (err) {
            throw new Error("Auth0AuthProvider logout:" + err);
        }
    }
}
