<template>
    <v-app>
        <div class="error-wrap d-flex justify-center align-center">
            <v-icon
                :color="getRandomColor"
                class="mr-md-3 bg-icon"
                v-html="messageIcon"
            />
            <v-card max-width="476" class="align-self-center" color="transparent" flat>
                <v-container>
                    <v-row class="flex-column flex-md-row">
                        <v-col class="pa-0 text-center flex-md-grow-0"  @click="refreshFortune">
                            <v-icon
                                :color="getRandomColor"
                                class="mr-md-3"
                                size="12rem"
                                v-html="messageIcon"
                            />
                        </v-col>
                        <v-col class="align-self-center pa-0 text-center text-md-left flex-md-grow-0">
                            <v-card-text>
                                <h1 class="mb-3" v-html="pageNotFound" />
                                <v-slide-x-transition>
                                    <p class="mb-0" v-show="showFortune" v-html="topFortune" />
                                </v-slide-x-transition>
                            </v-card-text>
                            <v-card-actions class="justify-sm-center">
                                <v-btn class="mx-auto" color="primary" to="/graph-editor/graphs">
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
import {mapState, mapActions} from "vuex";
import colors from "vuetify/lib/util/colors";
import {randomNotFoundIcons} from "../names";
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
            showFortune: true,
        };
    },
    methods: {
        ...mapActions([
            "getFortune",
        ]),
        async refreshFortune() {
            this.showFortune = false;
            await this.getFortune();
            this.showFortune = true;
        }
    },
    computed: {
        ...mapState({
            preferences: (state) => state.preferences,
            fortunes: (state) => state.fortunes,
        }),
        topFortune() {
            if (this.fortunes.length > 0) {
                return this.fortunes[this.fortunes.length - 1][0].fortune.message;
            }
            return "";
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
        this.getFortune();
    },
};
</script>

<style scoped>
.error-wrap {
    position: relative;
    height: 100%;
    min-height: 100vh;
    width: 100%;
    z-index: 2;
}
.bg-icon {
    position: absolute;
    opacity: .10;
    animation-duration: 500s;
    animation-name: bg-icon-scale;
    animation-iteration-count: infinite;
}
@keyframes bg-icon-scale {
    from {
        top: -150vh;
        left: -100vw;
        font-size: 200vw;
    }
    50% {
        top: -50vh;
        left: 0vw;
        font-size: 300vw;
    }
    to {
        top: -150vh;
        left: -100vw;
        font-size: 200vw;
    }
}
</style>
