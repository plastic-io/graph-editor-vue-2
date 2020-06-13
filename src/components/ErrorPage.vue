<template>
    <v-app>
        <div class="error-wrap d-flex justify-center align-center">
            <v-card class="align-self-center" color="transparent" flat>
                <v-container>
                    <v-row class="flex-column flex-md-row">
                        <v-col class="pa-0 text-center" >
                            <v-icon :color="getRandomColor" class="mr-md-3" size="12rem">
                            {{messageIcon}}
                            </v-icon>
                        </v-col>
                        <v-col class="align-self-center pa-0 text-center text-md-left">
                            <v-card-text>
                                <h1 class="mb-3">{{ pageNotFound }}</h1>
                                <p class="mb-0">{{ userMessage }}</p>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn class="mx-auto-xs" color="primary" to="/graph-editor/graphs">
                                Back to the Graph Manager
                                </v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </div>
    </v-app>
</template>

<script>
import {mapState} from "vuex";
import colors from "vuetify/lib/util/colors";
import {randomNotFoundMessage, randomNotFoundIcons} from "../names";
export default {
    name: "error-page",
    props: {
        error: {
            type: Object,
            default: () => {
                return {
                    statusCode: 404,
                };
            },
        }
    },
    data() {
        return {
            pageNotFound: "Page Not Found",
        };
    },
    computed: {
        ...mapState({
            preferences: (state) => state.preferences,
        }),
        userMessage() {
            return randomNotFoundMessage();
        },
        messageIcon() {
            return randomNotFoundIcons();
        },
        getRandomColor() {
            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                //The maximum is exclusive and the minimum is inclusive
                return Math.floor(Math.random() * (max - min)) + min;
            }
            const colorNames = Object.keys(colors);
            return colorNames[getRandomInt(0, colorNames.length)];
        },
    },
    created() {
        this.$vuetify.theme.dark = this.preferences.appearance.theme === "dark";
    },
};
</script>

<style scoped>
.error-wrap {
  height: 100%;
  min-height: 100vh;
  width: 100%;
}

</style>
