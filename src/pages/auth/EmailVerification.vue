<template>
  <v-container fluid class="flex-col-center justify-center fill-height"
               style="background: linear-gradient(to right bottom, #003058, #00517A)">
    <v-container class="flex-col-center justify-center"
                 style="width: fit-content; height: fit-content; background-color: rgba(255, 255, 255, 0.9); border-radius: 10px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2)">
      <v-progress-linear
        v-if="loading"
        color="#003058"
        height="6"
        indeterminate
        rounded
      ></v-progress-linear>
      <div style="min-width: fit-content; display: flex; flex-direction: column; align-items: center; padding: 24px">
        <AppLogo></AppLogo>
      </div>
      <div class="pa-5" style="text-align: center;">
        <h1 class="display-1">Verify Your Account</h1>
        <v-divider class="my-4"></v-divider>
        <p class="body-1 mb-10" style="line-height: 1.6em">
          Please verify your email by clicking the link sent to your email.
        </p>
        <v-form v-if="showResendButton" @submit.prevent="resendVerificationEmail" style="width: 300px">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="underlined"
            density="comfortable"
            :rules="emailRules"
            append-icon="mdi-email"
          ></v-text-field>
          <v-btn type="submit" color="primary" class="mt-2 no-uppercase auto-width"
                 :loading="loading" :disabled="!isEmailValid" style="margin-bottom:15px">Resend Verification Email
          </v-btn>
        </v-form>
      </div>
    </v-container>
  </v-container>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import apiService from "@/services/api.service"
import {errorMessage, successMessage} from "@/utils/message"
import {consoleError} from "@/utils/logger"
import AppLogo from "@/components/app/AppLogo.vue"

const loading = ref(false)
const showResendButton = ref(false)
const email = ref('')
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const isEmailValid = computed(() => {
  return emailRules.every(rule => rule(email.value) === true)
})

onMounted(() => {
  setTimeout(() => {
    showResendButton.value = true
  }, 10000)
})

const resendVerificationEmail = async () => {
  try {
    loading.value = true
    const payload = {
      email: email.value
    }
    const response = await apiService.resendVerificationEmail(payload)
    successMessage(response.data.message || 'Verification email sent.')
  } catch (err) {
    consoleError(err)
    errorMessage('Failed to resend verification email.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.text-center {
  text-align: center;
}

.v-btn {
  margin-bottom: 15px;
}

.pa-5 {
  padding: 24px !important;
}

.display-1 {
  font-size: 1.8rem;
  font-weight: bold;
}

.body-1 {
  font-size: 1rem;
  color: #333;
}

.fill-height {
  height: 100vh;
}
</style>
