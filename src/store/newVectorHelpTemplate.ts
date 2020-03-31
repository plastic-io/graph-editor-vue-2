const template = `<template>
    <v-card style="width: 500px;" class="pa-2">
        <v-card-title>
            THIS IS A NEW VECTOR
        </v-card-title>
        <v-card-subtitle>
            There are many like it, but this one is yours
        </v-card-subtitle>
        <v-card-subtitle>
            <ul>
                <li>
                    After selecting your vector, click
                    <v-icon>
                        mdi-vector-point
                    </v-icon>
                    on the left to show vector properties.  From
                    there you can change this message.
                </li>
                <li>
                    Click
                    <v-icon>
                        mdi-help-circle-outline
                    </v-icon>
                    in the upper right corner to show contextual help
                </li>
            </ul>
        </v-card-subtitle>
        <v-card-text class="pa-2">
            <v-icon class="ma-2">
                mdi-vector-point
            </v-icon>
            Properties for this vector
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-video-input-component
            </v-icon>
            Connectors for this vector
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-vuejs
            </v-icon>
            This vector's appearnce (change this message)
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-lambda
            </v-icon>
            Set what happens when this vector is invoked
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-graph-outline
            </v-icon>
            to see properties for the whole graph
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-history
            </v-icon>
            Undo history
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-library
            </v-icon>
            Local and public library of vectors you can import here
            <v-spacer class="pa-2"></v-spacer>
            <v-icon class="ma-2">
                mdi-cogs
            </v-icon>
            Graph editor properties
            <v-spacer class="pa-2"></v-spacer>
            Check out this source of this button to see how to invoke the vector
            <v-btn class="ma-2" @click="buttonClick">
                <v-icon>
                    mdi-play
                </v-icon>
                Example invocation
            </v-btn>
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
This runtime telelmetry data can be picked up by the Graph Editor (this program) to show execution
information in real time.
            </v-alert>
            <v-spacer class="pa-2"></v-spacer>
            To stop this tutorial vector from appearing each time you create a new blank vector
            click on <v-icon>mdi-cogs</v-icon> and under "General" select: turn off "Use tutorial vector".
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
