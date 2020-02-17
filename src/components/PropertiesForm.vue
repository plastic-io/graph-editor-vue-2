<template>
    <v-form light>
        <PropertyFields />
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
<style scoped></style>
