<template>
  <img src="../../assets/logo.png" alt="logo" :width="computedWidth" style="max-width: 90%"/>
</template>

<style scoped>
img {
  display: block;
  margin: 1rem;
}
</style>
<script setup>
import { computed } from 'vue';

const props = defineProps(['width']);
const computedWidth = computed(() => props.width || 350);
</script>
