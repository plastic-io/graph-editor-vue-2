<template>
    <v-dialog :value="testsVisible" max-width="50%" @click:outside="hideTests" :key="testsVisible" hide-overlay persistent>
        <component :is="'link'" rel="stylesheet" href="https://unpkg.com/mocha/mocha.css"/>
        <component :is="'script'" src="https://unpkg.com/chai/chai.js" @load="loadedChai = true;"/>
        <component :is="'script'" src="https://unpkg.com/mocha/mocha.js" @load="loadedMocha = true;"/>
        <v-card>
            <v-toolbar>
                <v-app-bar-nav-icon>
                    <v-icon>
                        mdi-flask
                    </v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title>Tests</v-toolbar-title>
                <v-spacer></v-spacer>
                Pass: {{pass}} Fail: {{fail}}
            </v-toolbar>
            <v-progress-linear :value="pct"></v-progress-linear>
            <div ref="tests" style="height: 60vh; overflow: auto;">
                <v-list three-line>
                    <template v-for="(item, index) in tests">
                        <v-list-item :key="index + '_title'">
                            <v-list-item-avatar>
                                <v-icon
                                    v-if="/pass|fail/.test(item[0])"
                                    :color="item[0] === 'fail' ? 'red' : 'green'"
                                    v-html="stepIcon(item[0])"></v-icon>
                                <v-icon
                                    v-if="item[0] === 'end'"
                                    :color="fail > 0 && item[0] === 'end' ? 'red' : 'green'"
                                    v-html="stepIcon(item[0])"></v-icon>
                                <v-icon
                                    v-if="item[0] === 'start'"
                                    v-html="stepIcon(item[0])"></v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title v-if="item[0] === 'end'">
                                    Pass: {{pass}} Fail: {{fail}}
                                </v-list-item-title>
                                <v-list-item-subtitle v-if="item[0] === 'end'">
                                    Duration {{item[1].duration + 'ms'}}
                                </v-list-item-subtitle>
                                <v-list-item-title v-if="item[0] !== 'end'" v-html="/start|end/.test(item[0]) ? item[0] : item[1].fullTitle"></v-list-item-title>
                                <v-list-item-subtitle v-if="!/start|end/.test(item[0])" v-html="item[1].duration + 'ms'"></v-list-item-subtitle>
                                <v-list-item-subtitle v-if="item[1].stack" v-html="item[1].stack"></v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider :key="index + '_divider'"></v-divider>
                    </template>
                </v-list>
            </div>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer/>
                <v-btn @click="hideTests" :disabled="!ended">
                    <v-icon>
                        mdi-close
                    </v-icon>
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import {mapState, mapMutations} from "vuex";
export default {
    name: "test-view",
    data: () => {
        return {
            totalTests: 0,
            currentTest: 0,
            pass: 0,
            fail: 0,
            pending: 0,
            ended: false,
            tests: [],
        };
    },
    watch: {
        testsVisible() {
            this.loadedChai = false;
            this.loadedMocha = false;
            this.ended = false;
            this.fail = 0;
            this.pass = 0;
            this.pending = 0;
            this.currentTest = 0;
            this.totalTests = 0;
            this.tests = [];
            if (this.testsVisible) {
                const log = console.log.bind(console);
                console.log = (...args) => {
                    this.logItem({args});
                    log(...args);
                };
            }
        },
    },
    methods: {
        ...mapMutations([
            "hideTests",
        ]),
        logItem(lastMessage) {
            let row;
            if (!lastMessage.args) {
                return;
            }
            try {
                row = JSON.parse(lastMessage.args[0]);
            } catch (ignore) {} // eslint-disable-line
            if (!row) {
                return;
            }
            this.tests.push(row);
            if (row[0] === "start" && "total" in row[1]) {
                this.totalTests = row[1].total;
            } else if (/pass/.test(row[0])) {
                this.pass += 1;
            } else if (/fail/.test(row[0])) {
                this.fail += 1;
            } else if (row[0] === "end") {
                this.ended = true;
            }
            this.$nextTick(this.scrollTests);
        },
        scrollTests() {
            const el = this.$refs.tests;
            el.scrollTop = el.scrollHeight;
        },
        stepIcon(state) {
            if (state === "end" && this.fail > 0) {
                return "mdi-shield-alert-outline";
            } else if (state === "end" && this.fail === 0) {
                return "mdi-shield-check-outline";
            }
            return {
                start: "mdi-flag-checkered",
                fail: "mdi-flask-remove",
                pass: "mdi-flask-plus",
                end: "mdi-flask-empty-outline",
            }[state] || "mdi-flask-empty";
        },
    },
    computed: {
        ...mapState({
            testOutput: state => state.testOutput,
            testOutputVersion: state => state.testOutputVersion,
            testsVisible: state => state.testsVisible,
        }),
        pct() {
            return (this.totalTests / (this.pass + this.fail)) * 100;
        }
    }
};
</script>
<style></style>
