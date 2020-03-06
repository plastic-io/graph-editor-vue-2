<template>
    <v-app class="graph-manager">
        <v-app-bar app clipped-left>
            <v-toolbar-title>Plastic IO</v-toolbar-title>
            <v-spacer/>
            <v-btn color="info" @click="create">
                New Graph
                <v-icon right>
                    mdi-plus-circle-outline
                </v-icon>
            </v-btn>
        </v-app-bar>
        <v-content>
            <v-container>
                <v-row align="start" align-content="start" align-items="stretch">
                    <v-col align-self="start">
                        <v-data-iterator
                            :items="tocItems"
                            :items-per-page.sync="itemsPerPage"
                            :page="page"
                            :search="search"
                            :sort-by="sortBy.toLowerCase()"
                            :sort-desc="sortDesc"
                            hide-default-footer
                        >
                            <template v-slot:header>
                                <v-toolbar dark color="blue darken-3" class="mb-1">
                                    <v-text-field
                                        v-model="search"
                                        clearable
                                        flat
                                        solo-inverted
                                        hide-details
                                        prepend-inner-icon="mdi-magnify"
                                        label="Search"
                                    ></v-text-field>
                                    <template v-if="$vuetify.breakpoint.mdAndUp">
                                        <v-spacer></v-spacer>
                                        <v-select
                                            v-model="sortBy"
                                            flat
                                            solo-inverted
                                            hide-details
                                            :items="keys"
                                            prepend-inner-icon="mdi-magnify"
                                            label="Sort by"
                                        ></v-select>
                                        <v-spacer></v-spacer>
                                        <v-btn-toggle v-model="sortDesc" mandatory>
                                            <v-btn large depressed color="blue" :value="false">
                                                <v-icon>mdi-arrow-up</v-icon>
                                            </v-btn>
                                            <v-btn large depressed color="blue" :value="true">
                                                <v-icon>mdi-arrow-down</v-icon>
                                            </v-btn>
                                        </v-btn-toggle>
                                    </template>
                                </v-toolbar>
                            </template>
                            <template v-slot:default="props">
                                <v-row class="ma-1" style="height: calc(100vh - 250px); overflow-y: auto;">
                                    <v-col
                                        v-for="item in props.items"
                                        :key="item.key"
                                        cols="12"
                                        sm="6"
                                        md="4"
                                        lg="3"
                                    >
                                        <v-card>
                                            <v-card-title class="subheading font-weight-bold">
                                                {{item.name || "Untitled"}}
                                            </v-card-title>
                                            <v-card-title class="pa-00">
                                                <v-spacer/>
                                                <v-btn @click="openGraph(item.id);" v-if="item.type === 'graph'">
                                                    Open
                                                    <v-icon right>
                                                        mdi-folder-open
                                                    </v-icon>
                                                </v-btn>
                                                <v-spacer/>
                                                <v-btn @click="deleteItem(item);">
                                                    Delete
                                                    <v-icon right>
                                                        mdi-delete
                                                    </v-icon>
                                                </v-btn>
                                            </v-card-title>
                                            <v-divider></v-divider>
                                            <v-list dense>
                                                <v-list-item
                                                    v-for="(key, index) in filteredKeys"
                                                    :key="index"
                                                >
                                                    <v-list-item-content
                                                        :class="{
                                                            'blue--text': sortBy === key
                                                        }"
                                                        >{{ key }}:</v-list-item-content
                                                    >
                                                    <v-list-item-content
                                                        class="align-end"
                                                        :class="{
                                                            'blue--text': sortBy === key
                                                        }"
                                                        >{{
                                                            item[key.toLowerCase()]
                                                        }}</v-list-item-content
                                                    >
                                                </v-list-item>
                                            </v-list>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </template>
                            <template v-slot:footer>
                                <v-row class="mt-2" align="center" justify="center">
                                    <span class="grey--text">Items per page</span>
                                    <v-menu offset-y>
                                        <template v-slot:activator="{ on }">
                                            <v-btn
                                                dark
                                                text
                                                color="primary"
                                                class="ml-2"
                                                v-on="on"
                                            >
                                                {{ itemsPerPage }}
                                                <v-icon>mdi-chevron-down</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list>
                                            <v-list-item
                                                v-for="(number, index) in itemsPerPageArray"
                                                :key="index"
                                                @click="updateItemsPerPage(number)"
                                            >
                                                <v-list-item-title>{{
                                                    number
                                                }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                    <v-spacer></v-spacer>
                                    <span class="mr-4 grey--text">
                                        Page {{ page }} of {{ numberOfPages }}
                                    </span>
                                    <v-btn
                                        fab
                                        dark
                                        color="blue darken-3"
                                        class="mr-1"
                                        @click="formerPage"
                                    >
                                        <v-icon>mdi-chevron-left</v-icon>
                                    </v-btn>
                                    <v-btn
                                        fab
                                        dark
                                        color="blue darken-3"
                                        class="ml-1"
                                        @click="nextPage"
                                    >
                                        <v-icon>mdi-chevron-right</v-icon>
                                    </v-btn>
                                </v-row>
                            </template>
                        </v-data-iterator>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-snackbar :timeout="0" v-model="localShowError" top>
            <v-alert prominent type="error">
                <v-row align="center">
                    <v-col class="grow">{{localErrorMessage}}</v-col>
                    <v-col class="shrink">
                        <v-btn @click="clearError">That Sucks</v-btn>
                    </v-col>
                </v-row>
            </v-alert>
        </v-snackbar>
    </v-app>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "graph-ganager",
    methods: {
        ...mapActions([
            "removeArtifact",
            "remove",
            "create",
            "clearError",
            "getToc",
        ]),
        deleteItem(item) {
            if (item.type === "graph") {
                this.remove(item.id);
            } else {
                this.removeArtifact(item);
            }
        },
        openGraph(graphId) {
            window.open(
                "/" + graphId,
                "_" + graphId,
            );
        },
        nextPage() {
            if (this.page + 1 <= this.numberOfPages) this.page += 1;
        },
        formerPage() {
            if (this.page - 1 >= 1) this.page -= 1;
        },
        updateItemsPerPage(number) {
            this.itemsPerPage = number;
        },
    },
    data: () => ({
        localErrorMessage: "",
        localShowError: false,
        drawer: null,
        localItems: [],
        itemsPerPageArray: [8, 16, 64, 128, 256],
        search: "",
        filter: {},
        sortDesc: false,
        page: 1,
        itemsPerPage: 8,
        sortBy: "name",
        keys: [
            "name",
            "type",
            "version",
            "description",
        ],
    }),
    watch: {
        toc: {
            handler: function () {
                console.log(" >>>> TOC UPDATE");
                this.localItems = this.toc;
            },
            deep: true,
        },
        showError() {
            this.localShowError = this.showError;
            if (this.error) {
                this.localErrorMessage = this.error.toString();
            }
        },
    },
    computed: {
        ...mapState({
            toc: state => state.toc,
            preferences: state => state.preferences,
            showError: state => state.showError,
            error: state => state.error,
        }),
        numberOfPages() {
            return Math.ceil(Object.keys(this.localItems).length / this.itemsPerPage);
        },
        filteredKeys() {
            return this.keys.filter(key => key !== "Name");
        },
        tocItems() {
            return Object.keys(this.localItems).map(key => {
                return this.localItems[key];
            });
        }
    },
    created() {
        this.getToc();
        this.$vuetify.theme.dark = this.preferences.appearance.theme === "dark";
    }
};
</script>
<style></style>
