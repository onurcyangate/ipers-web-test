<template>
  <v-row class="flex-col-center align-center fill-height mt-10">
    <CaseTable v-if="!loading" :cases="cases" :loading="loading" @cases-updated="updateCases"></CaseTable>
  </v-row>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import { getApiService } from '@/services/api.service'
const apiService = getApiService()
import {errorMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import CaseTable from "@/components/common/CaseTable.vue";
import {useAuthStore} from "@/store/authStore";

const authStore = useAuthStore();
const loading = ref(true);
const cases = ref([]);

const fetchUserCases = async () => {
  try {
    loading.value = true;
    let response;
    let userCases;
    if (authStore.isUniversityUser()) {
      response = await apiService.fetchUniversityCases();
      userCases = response.data.map(item => item.Properties)
    } else {
      response = await apiService.fetchUserCases(authStore.username);
      userCases = response.data.map(item => item.Properties);
    }
    return userCases;
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch cases.');
    return [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  cases.value = await fetchUserCases();
});

const updateCases = async () => {
  cases.value = await fetchUserCases();
};
</script>

<style scoped>
.flex-col-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
  text-align: center;
}
</style>
