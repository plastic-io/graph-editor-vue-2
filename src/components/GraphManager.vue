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
                                        <v-card style="padding-top: 30px;">
                                            <v-icon left x-large style="margin-top: -30px;margin-left: 10px;">
                                                {{item.icon || 'mdi-graph'}}
                                            </v-icon>
                                            <v-menu>
                                                <template v-slot:activator="{ on: menu }">
                                                    <v-btn absolute right class="ma-3" style="top: 0;right: 0;" color="primary" dark v-on="{...menu}">
                                                        <v-icon>
                                                            mdi-menu
                                                        </v-icon>
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item @click="download(item)">
                                                        <v-list-item-title>
                                                            <v-icon>
                                                                mdi-download
                                                            </v-icon>
                                                            Download
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                    <v-list-item @click="confirmDelete(item);">
                                                        <v-list-item-title>
                                                            <v-icon>
                                                                mdi-delete
                                                            </v-icon>
                                                            Delete
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <v-card-title class="subheading font-weight-bold">
                                                {{item.name || "Untitled"}}
                                            </v-card-title>
                                            <v-card-title>
                                                <v-btn block @click="openGraph(item.id);" v-if="item.type === 'graph'">
                                                    Open
                                                    <v-icon right>
                                                        mdi-folder-open
                                                    </v-icon>
                                                </v-btn>
                                                <v-spacer/>
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
                                                        >{{key}}:</v-list-item-content
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
                                        <template v-slot:activator="{on}">
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
                                        Page {{page}} of {{numberOfPages}}
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
        <v-dialog v-model="deleteConfirm" width="500">
            <v-card>
                <v-card-title class="headline" primary-title>
                    Confirm Resource Deletion
                </v-card-title>
                <v-card-text>
                    This cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn @click="deleteConfirm = false">Cancel</v-btn>
                    <v-btn @click="deleteItem">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
<script>
import {mapState, mapActions} from "vuex";
export default {
    name: "graph-manager",
    methods: {
        ...mapActions([
            "download",
            "removeArtifact",
            "remove",
            "create",
            "clearError",
            "getToc",
        ]),
        confirmDelete(e) {
            this.deleteConfirm = true;
            this.deleteRef = e;
        },
        deleteItem() {
            this.deleteConfirm = false;
            if (this.deleteRef.type === "graph") {
                this.remove(this.deleteRef.id);
            } else {
                this.removeArtifact(this.deleteRef);
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
        deleteConfirm: false,
        deleteRef: null,
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
            "version",
            "description",
        ],
    }),
    watch: {
        preferences: {
            handler: function () {
                this.$vuetify.theme.dark = this.preferences.appearance.theme === "dark";
            },
            deep: true,
        },
        toc: {
            handler: function () {
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
            }).filter((item) => {
                return !/published/.test(item.type);
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
