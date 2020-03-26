const template = `<template>
    <v-card style="width: 500px;" class="pa-2">
        <v-card-title>
            THIS IS A NEW VECTOR
        </v-card-title>
        <v-card-subtitle>
            There are many like it, but this one is yours
        </v-card-subtitle>
        <v-card-subtitle>
            After selecting your vector, you can click the following icons on the left hand edge of the screen.
        </v-card-subtitle>
        <v-card-text class="pa-2">
            <v-icon>
                mdi-network-outline
            </v-icon>
            to see properties for this vector
            <v-spacer class="pa-2"></v-spacer>
            <v-icon>
                mdi-transit-connection-variant
            </v-icon>
            to add connectors to this vector.
            <v-spacer class="pa-2"></v-spacer>
            <v-icon>
                mdi-vuejs
            </v-icon>
            To edit this vector's appearnce (change this message)
            <v-spacer class="pa-2"></v-spacer>
            <v-icon>
                mdi-lambda
            </v-icon>
            Set what happens when invoked
            <v-spacer class="pa-2"></v-spacer>
            <v-icon>
                mdi-vue mdi-play-network
            </v-icon>
            To invoke this vector
            <v-btn class="ma-2" @click="buttonClick">
                Or click here
            </v-btn>
            <v-spacer class="pa-2"></v-spacer>
            <v-icon>
                mdi-help-circle-outline
            </v-icon>
            Contextual help overlay
            <v-spacer class="pa-2"></v-spacer>
            <v-alert 
                border="left"
                colored-border
                color="deep-purple accent-4"
                elevation="2"
                class="ma-2">
Vectors are the buliding blocks of the graph.
<v-spacer class="ma-4"></v-spacer>
Vectors can do anything your host can do.
if your host is a browser, you can use graphics, audio and other multimedia
as well as presentation mode <v-icon small>mdi-presentation</v-icon> to show off your graph creations.
<v-spacer class="ma-4"></v-spacer>
If you're running your graph on a server you have access to all the powerful
APIs your server has access to.  When on a server your graph is a living API.
<v-spacer class="ma-4"></v-spacer>
The same graph can be run on the server and on the browser at the same time.
When on the server, the graph can emit runtime telemetry just like when on the browser.
<v-spacer class="ma-4"></v-spacer>
This runtime telelmetry data can be picked up by the graph IDE (this program) to show execution
information in real time.
            </v-alert>
            <v-spacer class="pa-2"></v-spacer>
            Vector Id: {{vector.id}}
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    methods: {
      buttonClick() {
        this.$emit("set", \`Hello World from vector \${this.vector.id}\`);
      },
    },
    props: {
        vector: Object,
        state: Object,
    }
}
</script>
<style>
</style>
`;
const set = `console.info(value);
alert(value);
`;
export default {template, set};
