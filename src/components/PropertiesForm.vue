<template>
    <v-form class="property-form">
        <property-fields/>
    </v-form>
</template>
<script>
import PropertyFields from "./PropertyFields";
export default {
    name: "property-form",
    components: {
        PropertyFields
    },
    computed: {},
    props: {}
};
</script>
<style>
    .property-form {
        width: 210px;
        max-width: 210px;
        min-width: 210px;
        padding: 10px 0 0 10px;
    }
</style>
