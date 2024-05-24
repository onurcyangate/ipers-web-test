<template>
  <v-snackbar
    v-model="snackbar.active"
    :color="snackbar.color"
    :right="true"
    :bottom="true"
    :timeout="snackbar.timer"
  >
    <v-icon left>{{ icon }}</v-icon>
    {{ snackbar.message }}
  </v-snackbar>
</template>
<script setup>
import { useSnackBarStore } from '@/store/snackBarStore.js';
import { onMounted, watch, computed } from "vue";

const snackbar = computed(() => store.snackbar);
const store = useSnackBarStore();
let icon;

const setIcon = () => {
  const color = snackbar.value.color;
  switch (color) {
    case 'error':
    case 'warning':
      icon = "mdi-alert-circle-outline"
      break
    case 'info':
      icon = "mdi-information-outline"
      break
    case 'success':
      icon = "mdi-check-circle-outline"
      break
  }
};

onMounted(() => {
  setIcon();
  watch(snackbar, setIcon);
})
</script>
