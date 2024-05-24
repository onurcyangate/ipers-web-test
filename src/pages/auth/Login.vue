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
const formState = reactive({
  username: '',
  password: ''
})

const loginAttempt = async () => {
  try {
    loading.value = true
    const payload = {
      username: formState.username,
      password: formState.password
    };
    const response = await apiService.login(payload)
    const responseBody = response.data.response_body
    const userRole = responseBody.user.role
    if (userRole === 'admin' || userRole === 'editor') {
      authStore.login(responseBody)
      await router.replace('/dashboard')
    }
  } catch (err) {
    consoleError(err)
    errorMessage('Login failed.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="flex-col-center justify-center fill-height" style="background-color: #003058">
    <v-container class="flex-col-center justify-center" style="width: fit-content;  height: fit-content; background-color: white; border-radius: 5px">
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
         style="text-align: center; margin: 10px 0 25px 0; font-size: 20px;">Sign In</p>
      <v-form :model=formState v-model="isFormValid" fast-fail @submit.prevent="loginAttempt" style="width: 300px">
        <v-text-field v-model="formState.username" label="Username" variant="underlined"
                      prepend-inner-icon="mdi-account"
                      :rules="[v => !!v || 'Username is required']"></v-text-field>

        <v-text-field v-model="formState.password" type="password" label="Password" variant="underlined"
                      prepend-inner-icon="mdi-lock"
                      :rules="[v => !!v || 'Password is required']"></v-text-field>
        <div style="display: flex">
          <v-btn @click="() => router.push('/reset-password')" variant="text" color="grey"
                 class="no-uppercase forgot-password-btn"
                 :disabled=loading
                 style="font-size: 13px">
            Forgot Password
          </v-btn>
        </div>
        <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading=loading style="margin-bottom:15px"
               :disabled="!isFormValid">
          Sign In
        </v-btn>
        <v-btn variant="outlined" color="primary" block class="mt-2 no-uppercase" :disabled=loading>Sign In with OKTA
        </v-btn>
        <v-btn @click="() => router.push('/register')" variant="text" block color="grey" class="mt-2 no-uppercase"
               :disabled=loading style="font-size: 13px">Not registered yet? Register here
        </v-btn>

      </v-form>
    </v-container>

  </v-container>
</template>

<style scoped>
.forgot-password-btn {
  color: #1976d2;
  text-decoration: underline;
  margin-top: -15px;
  margin-right: -5px;
  margin-left: auto;
}

</style>
