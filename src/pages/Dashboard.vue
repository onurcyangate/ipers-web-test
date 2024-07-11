<template>
  <v-row class="flex-col-center align-center fill-height mt-10">
    <CaseTable></CaseTable>
  </v-row>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import apiService from "@/services/api.service";
import {errorMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import CaseTable from "@/components/common/CaseTable.vue";

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
  height: 100vh;
  text-align: center;
}
</style>
