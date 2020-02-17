<template>
    <div>
        <v-text-field
            label="string"
            placeholder="Placeholder"
            outlined
            dense
        ></v-text-field>
        <v-switch
            :disabled="disabled"
            :readonly="readonly"
            :loading="loading"
            :flat="flat"
            :inset="inset"
            :error="error"
            :success="success"
            :color="color"
            label="I'm a switch"
        ></v-switch>
        <v-select
            :items="items"
            label="Outlined style"
            dense
            outlined
        ></v-select>
        <v-color-picker v-model="color"></v-color-picker>
        <v-text-field
            v-model.number="5"
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
<style scoped></style>
