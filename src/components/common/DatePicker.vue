<template>
  <v-menu v-model="isMenuOpen" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-text-field
        :label="label"
        :model-value="formattedDate"
        readonly
        v-bind="props"
        variant="outlined"
        density="comfortable"
        hint="Format: YYYY-MM-DD"
        :rules="rules"
      ></v-text-field>
    </template>
    <v-date-picker v-model="selectedDate" hide-header title="" :color="color">
      <template v-slot:header></template>
    </v-date-picker>
  </v-menu>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from "vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps([
  "label",
  "color",
  "modelValue",
  "rules",
]);
let isMenuOpen = ref(false);

const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const formattedDate = computed(() => {
  return props.modelValue ? formatDate(props.modelValue) : '';
});

const selectedDate = computed({
  get: () => {
    return props.modelValue ? new Date(props.modelValue) : new Date();
  },
  set: (val) => {
    emit('update:modelValue', formatDate(val));
    isMenuOpen.value = false;
  },
});
</script>
<style>
</style>
