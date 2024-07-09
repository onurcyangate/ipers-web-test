<template>
  <v-row class="flex-col-center justify-center align-center fill-height">
    <span class="mb-5" v-if="cases.length === 0">You do not have any case to work on.</span>
    <v-btn v-if="cases.length === 0" color="#003058">Add a New Case</v-btn>
    <div v-else>
      <!-- Render cases here if needed -->
      <span class="mb-5">You have {{ cases.length }} cases to work on.</span>
    </div>
  </v-row>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import apiService from "@/services/api.service";
import {errorMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";

const loading = ref(false)

const fetchUserCases = async () => {
  try {
    loading.value = true
    await apiService.fetchUserCases()
  } catch (err) {
    consoleError(err)
    errorMessage('Falied to fetch cases.')
  } finally {
    loading.value = false
  }
}

const cases = ref([]);

onMounted(async () => {
  cases.value = await fetchUserCases();
});
</script>

<style scoped>
.flex-col-center {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height to center vertically */
  text-align: center; /* Center text */
}
</style>
