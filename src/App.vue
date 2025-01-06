<template>
  <v-app>
    <v-main>
      <router-view v-if="!loading"/>
      <SnackBar/>
    </v-main>
  </v-app>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useConfigStore} from '@/store/configStore'
import SnackBar from '@/components/common/SnackBar.vue'
import {consoleWarning} from '@/utils/logger'
import {initializeApiService} from '@/services/api.service'

const loading = ref(true)
const configStore = useConfigStore()

onMounted(async () => {
  try {
    const res = await fetch('/config.json')
    if (!res.ok) {
      throw new Error('Failed to load /config.json')
    }
    const configData = await res.json()
    console.log("baseUrl: ", configData.apiBaseUrl)
    configStore.setConfig(configData)

    initializeApiService(configData.apiBaseUrl)
  } catch (err) {
    consoleWarning('Failed to initialize app:', err)
  } finally {
    loading.value = false
  }
})
</script>
