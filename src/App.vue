<template>
  <v-app>
    <v-main>
      <router-view/>
      <SnackBar/>
    </v-main>
  </v-app>
</template>

<script setup>
import { consoleWarning } from "@/utils/logger";
import { onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";
import SnackBar from "@/components/common/SnackBar.vue";

const authStore = useAuthStore();

const fetchInitialData = async () => {
  try {
    await authStore.fetchUser()
  } catch (err) {
    consoleWarning("Failed to fetch user.")
  } finally {
    // loading.value = false
  }
}
onMounted(fetchInitialData)
</script>

<style>
</style>
