<script setup>
import {ref, reactive} from 'vue'
import apiService from "@/services/api.service";
import {errorMessage, warningMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import AppLogo from "@/components/app/AppLogo.vue";
import {useAuthStore} from '@/store/authStore'
import router from "@/router";

const userStore = useAuthStore();
const isFormValid = ref(null);
const authStore = useAuthStore();
const loading = ref(false);
const showPassword = ref(false);
const formState = reactive({
  username: '',
  password: ''
});

const loginAttempt = async () => {
  try {
    loading.value = true;
    // TODO discuss with team
    const modifiedUsername = formState.username.slice(0, formState.username.indexOf('@'));
    const payload = {
      username: modifiedUsername,
      password: formState.password.trim()
    };
    const response = await apiService.login(payload);
    const responseMessage = response.data.message;
    userStore.login(response.data.user)
    if (responseMessage === 'Account is disabled') {
      warningMessage('Your account is disabled. Please verify your account.');
      await apiService.resendVerificationEmail();
      await router.replace('/verify-email');
      return;
    }
    authStore.login(response.data);
    authStore.setUserRole(response.data.isExternal)
    console.log("isExternal: ", response.data.isExternal)
    authStore.setUsername(payload.username);
    await router.replace('/dashboard');
  } catch (err) {
    if (err.response.data.status === '401 UNAUTHORIZED') {
      warningMessage('Account is not verified. Please verify your email.')
    } else {
      errorMessage('Login failed.');
    }
    consoleError(err);
  } finally {
    loading.value = false;
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <v-container fluid class="flex-col-center justify-center fill-height" style="background-color: #003058">
    <v-container class="flex-col-center justify-center"
                 style="width: fit-content;  height: fit-content; background-color: white; border-radius: 5px">
      <v-progress-linear
        v-if="loading"
        color="#003058"
        height="6"
        indeterminate
        rounded
      ></v-progress-linear>
      <div style="min-width: fit-content; display: flex; flex-direction: column; align-items: center; padding: 16px">
        <AppLogo></AppLogo>
      </div>
      <p class="font-weight-medium"
         style="text-align: center; margin: 10px 0 25px 0; font-size: 20px;">Sign In</p>
      <v-form :model="formState" v-model="isFormValid" fast-fail @submit.prevent="loginAttempt" style="width: 300px">
        <v-text-field v-model="formState.username" label="Username" variant="underlined"
                      prepend-inner-icon="mdi-account"
                      :rules="[v => !!v || 'Username is required']"></v-text-field>

        <v-text-field v-model="formState.password" :type="showPassword ? 'text' : 'password'" label="Password"
                      variant="underlined"
                      prepend-inner-icon="mdi-lock"
                      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append="togglePasswordVisibility"
                      :rules="[v => !!v || 'Password is required']"></v-text-field>
        <div style="display: flex">
          <v-btn @click="() => router.push('/reset-password')" variant="text" color="grey"
                 class="no-uppercase forgot-password-btn"
                 :disabled="loading"
                 style="font-size: 13px">
            Forgot Password
          </v-btn>
        </div>
        <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading="loading"
               style="margin-bottom:15px"
               :disabled="!isFormValid">
          Sign In
        </v-btn>
        <v-btn @click="() => router.push('/register')" variant="text" block color="grey" class="mt-2 no-uppercase"
               :disabled="loading" style="font-size: 13px">Not registered yet? Register here
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
