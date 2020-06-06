<template>
    <div @wheel.stop @mousedown.stop @mouseup.stop @click.stop>
        <v-card class="connector-view" v-if="activity" elevation="7">
        <v-system-bar :key="activity.length">
            <v-icon title="Connector Information">
                mdi-information-outline
            </v-icon>
            [{{selectedIndex + 1}}/{{activity.length}}]
            <v-spacer></v-spacer>
            <v-icon style="margin-left: 3px;" title="Previous" :disabled="selectedIndex <= 0" @click="goPrevious">
                mdi-arrow-left-drop-circle-outline
            </v-icon>
            <v-icon title="Next" :disabled="!(selectedIndex < activity.length - 1)" @click="goNext">
                mdi-arrow-right-drop-circle-outline
            </v-icon>
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <span v-on="on" style="padding: 5px;">{{selectedActivity.event.connector.field}}</span>
                </template>
                Field
            </v-tooltip>
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <span v-on="on" style="padding: 5px;">{{selectedActivity.activityType}}</span>
                </template>
                Event Type
            </v-tooltip>
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <span v-on="on" style="padding: 5px;">{{typeof selectedActivity.event.value}}</span>
                </template>
                typeof
            </v-tooltip>
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <span v-on="on" style="padding: 5px;">{{fromNow(selectedActivity.event.time)}}</span>
                </template>
                Occured
            </v-tooltip>
            <v-divider/>
            <v-icon @click="$emit('close');">
                mdi-close
            </v-icon>
        </v-system-bar>
            <v-card-text>
                <div class="connector-view-value">
                    <pre class="dont-propagate-copy">{{selectedActivity.event.value}}</pre>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import moment from "moment";
export default {
    name: "connector-view",
    watch: {
        activity: {
            handler() {
                this.changeVersion += 1;
            },
            deep: true,
        },
    },
    methods: {
        goPrevious() {
            if (this.selectedIndex > 0) {
                this.selectedIndex -= 1;
            }
        },
        goNext() {
            console.log("Go next");
            if (this.selectedIndex < this.activity.length - 1) {
                this.selectedIndex += 1;
            }
        },
        fromNow(e) {
            return moment(new Date(e)).fromNow();
        }
    },
    computed: {
        selectedActivity() {
            return this.activity[this.selectedIndex];
        },
    },
    data: () => ({
        selectedIndex: 0,
        changeVersion: 0,
    }),
    props: {
        activity: Array,
    },
};
</script>
<style>
.connector-view-value {
    max-width: 50vw;
    max-height: 50vh;
    overflow: auto;
}
.connector-view {
    position: fixed;
    bottom: 30px;
    right: 10px;
}
</style>
