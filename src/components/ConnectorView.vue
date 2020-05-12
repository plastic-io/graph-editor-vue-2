<template>
    <div @wheel.stop @mousedown.stop @mouseup.stop @click.stop>
        <v-card class="connector-view" v-if="activity">
        <v-system-bar>
            <v-icon title="Connector Information">
                mdi-information-outline
            </v-icon>
            Field
            <span style="padding: 5px;">{{activity.event.connector.field}}</span>
            <span style="padding: 5px;">Duration</span>
            <span style="padding: 5px;">{{activity.duration}}ms</span>
            <v-divider/>
            <v-icon @click="$emit('close');">
                mdi-close
            </v-icon>
        </v-system-bar>
            <v-card-text>
                <div class="connector-view-value">
                    <pre class="dont-propagate-copy">{{activity.event.value}}</pre>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
export default {
    name: "connector-view",
    props: {
        activity: Object,
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
