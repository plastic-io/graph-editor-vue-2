export default function (context: any) {
    return {
        install: () => {
            let preferences;
            try {
                preferences = localStorage.getItem("preferences");
                if (preferences === null) {
                    throw "not found";
                }
                preferences = {
                    ...context.state.originalPreferences,
                    ...JSON.parse(preferences),
                };
            } catch (err) {
                if (/not found/.test(err.toString())) {
                    console.warn("No preferences found, writing defaults.");
                    localStorage.setItem("preferences", JSON.stringify(context.state.originalPreferences));
                    preferences = JSON.parse(JSON.stringify(context.state.originalPreferences));
                }
            }
            if (preferences.useLocalStorage !== false && preferences.useLocalStorage !== true) {
                preferences.useLocalStorage = true;
            }
            context.commit("setPreferences", preferences);
        },
    };
}
