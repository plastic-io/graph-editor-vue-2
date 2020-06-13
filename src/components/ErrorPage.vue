<template>
<v-app>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card color="transparent" flat>
          <v-card-title>
            <v-icon class="mr-4">mdi-skull</v-icon>
            {{ error.statusCode }}
            <v-divider class="mx-4" vertical />
            <span v-if="error.statusCode === 404">{{ pageNotFound }}</span>
            <span v-else>{{ otherError }}</span>
          </v-card-title>
          <v-card-subtitle>
            {{ userMessage }}
          </v-card-subtitle>
          <v-card-actions>
            <v-btn color="primary" to="/graph-editor/graphs">
              Back to the Graph Manager
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</v-app>

</template>

<script>
import {mapState} from "vuex";
import {randomErrorMessage} from "../names";
export default {
    name: "error-page",
    props: {
        error: {
            type: Object,
            default: null
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
            return randomErrorMessage();
        }
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
h1 {
  font-size: 20px;
}
</style>
