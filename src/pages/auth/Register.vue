<script setup>
import {ref, reactive} from 'vue'
import apiService from "@/services/api.service";
import {errorMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import AppLogo from "@/components/app/AppLogo.vue";
import {useAuthStore} from '@/store/authStore'
import router from "@/router";

const isFormValid = ref(null);
const authStore = useAuthStore()
const loading = ref(false);
const formState = reactive({})

const mockBackendResponse = () => {
  return [
    {name: 'name', label: 'Full Name', type: 'text'},
    {name: 'email', label: 'E-mail', type: 'text'},
    {name: 'organization', label: 'Organization', type: 'text'},
    {name: 'password', label: 'Password', type: 'password'},
    {name: 'confirm_password', label: 'Confirm Password', type: 'password'},
  ]
}

const getFormFields = async () => {
  const fields = await mockBackendResponse()
  fields.forEach(field => {
    formState[field.name] = {value: '', ...field}
  })
}

getFormFields()

const registerAttempt = async () => {
  try {
    loading.value = true
    const payload = formState
    const response = await apiService.register(payload)
    const responseBody = response.data.response_body
    const userRole = responseBody.user.role
    if (userRole === 'admin' || userRole === 'editor') {
      authStore.login(responseBody)
      await router.replace('/dashboard')
    }
  } catch (err) {
    consoleError(err)
    errorMessage('Registration failed.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="flex-col-center justify-center fill-height" style="background-color: #003058">
    <v-container class="flex-col-center justify-center"
                 style="width: fit-content; height: fit-content; background-color: white; border-radius: 5px">
      <v-progress-linear
        v-if="loading"
        color="#003058"
        height="6"
        indeterminate
        rounded
      ></v-progress-linear>
      <div style="min-width: fit-content; display: flex; flex-direction: column; align-items: center; padding: 16px">
        <AppLogo :width="400"></AppLogo>
      </div>
      <p class="font-weight-medium"
         style="text-align: center; margin: 10px 0 25px 0; font-size: 20px;">Register</p>
      <v-form :model=formState v-model="isFormValid" fast-fail @submit.prevent="registerAttempt" style="width: 300px">
        <v-text-field v-for="(field, key) in formState" :key="key" v-model="field.value" :label="field.label"
                      :type="field.type" variant="underlined"
                      density="comfortable"
                      :rules="[v => !!v || field.label + ' is required']"></v-text-field>

        <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading=loading
               :disabled="!isFormValid" style="margin-bottom:15px">Register
        </v-btn>
        <v-btn @click="() => router.push('/login')" variant="text" block color="grey" class="mt-2 no-uppercase"
               :disabled=loading style="font-size: 13px">Already registered? Sign in here
        </v-btn>

      </v-form>
    </v-container>
  </v-container>
</template>

<style scoped>

</style>
