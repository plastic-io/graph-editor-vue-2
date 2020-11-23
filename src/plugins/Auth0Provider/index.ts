import Auth0AuthProvider from "./Auth0AuthProvider";
export default function (context: any) {
    let auth = new Auth0AuthProvider();
    let token: any;
    let user: any;
    async function authenticate() {
        const cfg = context.state.preferences;
        // abort creation if no info is provided
        if (!(cfg.authDomain
            && cfg.authClientId
            && cfg.authAudience)) {
            console.warn("No authentication provider information supplied.  Probably working in local mode.");
            return;
        }
        // setup auth
        await auth.create(
            cfg.authDomain,
            cfg.authClientId,
            cfg.authAudience,
            window.location.origin + "/graph-editor/auth-callback",
        );
        if (/graph-editor\/auth-callback/.test(window.location.toString())) {
            await auth.handleRedirectCallback();
        }
        try {
            token = await auth.getToken();
            user = await auth.getUser();
        } catch (err) {
            console.info("getToken or getUser error", err);
        }
        if (!user) {
            if (!/graph-editor\/provider-settings/.test(window.location.toString())) {
                localStorage.setItem("redirectAfterLogin", window.location.href.toString());
                auth.login();
            }
            return;
        }
        context.commit("setIdentity", {
            provider: "auth0",
            token,
            user: {
                userName: user.name,
                email: user.email,
                emailVerified: user.email_verified,
                avatar: user.picture,
                updated: user.updated_at,
                sub: user.sub,
            },
        });
    }
    authenticate();
    return {
        install() {
            context.commit("setAuthProvider", auth);
        }
    };
}
