<template>
    <v-app>
        <div :style="`background: radial-gradient(ellipse at -100% 0, ${getRandomColor}, ${bgColor} 55%, transparent 100%);`" class="error-wrap d-flex justify-center align-center">
            <v-icon
                :color="getRandomColor"
                class="mr-md-3 bg-icon"
                v-html="messageIcon"
            />
            <v-card max-width="477px" class="align-self-center" color="transparent" flat>
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
                            <v-card-text style="">
                                <h1 class="mb-3" v-html="pageNotFound" />
                                <v-slide-x-transition>
                                    <p class="mb-0" style="min-height: 46px;" v-show="showFortune" v-html="topFortune" />
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
            bgColor: "#000000",
            version: 0,
        };
    },
    methods: {
        ...mapActions([
            "getFortune",
        ]),
        async refreshFortune() {
            this.showFortune = false;
            this.version += 1;
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
                return Math.floor(Math.random() * (max - min)) + min;
            }
            const colorNames = Object.keys(colors).map((colorName) => {
                return colors[colorName].base;
            });
            return colorNames[getRandomInt(0, colorNames.length)];
        },
    },
    created() {
        const isDark = this.preferences.appearance.theme === "dark";
        this.$vuetify.theme.dark = isDark;
        this.bgColor = isDark ? "#000000" : "#FFFFFF";
        this.getFortune();
        setInterval(() => {
            this.refreshFortune();
        }, 15000);
    },
};
</script>

<style>
html {
    overflow: hidden;
}
.error-wrap {
    position: relative;
    height: 100%;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    z-index: 2;
}
.bg-icon {
    position: absolute;
    opacity: .10;
    height: 0;
    width: 0;
    overflow: visible;
    font-size: 400vw !important;
    animation-duration: 500s;
    animation-name: bg-icon-scale;
    animation-iteration-count: infinite;
    transform: translateZ(0);
    transform: rotateZ(360deg);
    will-change: transform;
}
@keyframes bg-icon-scale {
    from {
        top: -150vh;
        left: -10vw;
        transform: scale(1);
    }
    50% {
        left: -100vw;
        transform: scale(2);
    }
    to {
        top: -150vh;
        left: -10vw;
        transform: scale(1);
    }
}
</style>
