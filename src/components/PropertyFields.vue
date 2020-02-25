<template>
    <div>
        <v-text-field
            label="string"
            placeholder="Placeholder"
            outlined
            dense
        ></v-text-field>
        <v-switch></v-switch>
        <v-select
            label="Outlined style"
            dense
            outlined
        ></v-select>
        <v-color-picker></v-color-picker>
        <v-text-field
            label="number"
            number
            placeholder="Placeholder"
            outlined
            dense
        ></v-text-field>
    </div>
</template>
<script>
export default {
    name: "property-fields",
    components: {},
    computed: {}
};
</script>
<style></style>
