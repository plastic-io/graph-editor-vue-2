<template>
    <v-app>
        <div class="error-wrap d-flex">
            <v-card color="transparent" flat>
                <v-container>
                    <v-row>
                        <v-col class="flex-grow-0" >
                            <v-icon :color="getRandomColor" class="mr-4" size="10rem">
                            {{messageIcon}}
                            </v-icon>
                        </v-col>
                        <v-col class="flex-grow-1">
                            <v-card-text>
                                <h1 class="mb-4">{{ pageNotFound }}</h1>
                                <p class="mb-0">{{ userMessage }}</p>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn color="primary" to="/graph-editor/graphs">
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
            otherError: "An error occurred"
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
    head() {
        const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
        return {
            title
        };
    }
};
</script>

<style scoped>
.error-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100vh;
  width: 100%;
}

</style>
