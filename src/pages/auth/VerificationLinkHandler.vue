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
      <div v-if="!loading" class="pa-5" style="text-align: center;">
        <h1 class="display-1">{{ messageTitle }}</h1>
        <v-divider class="my-4"></v-divider>
        <p class="body-1 mb-10" style="line-height: 1.6em">{{ messageContent }}</p>
        <v-btn v-if="isVerified" @click="redirectToLogin" color="primary" class="mt-2 no-uppercase auto-width"
               style="margin-bottom:15px">Login
        </v-btn>
        <v-form v-else @submit.prevent="resendVerificationEmail" style="width: 300px">
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
                 :loading="loadingResend" :disabled="!isEmailValid" style="margin-bottom:15px">Resend Verification Email
          </v-btn>
        </v-form>
      </div>
    </v-container>
  </v-container>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { getApiService } from '@/services/api.service'
const apiService = getApiService()
import {consoleError} from "@/utils/logger"
import AppLogo from "@/components/app/AppLogo.vue"
import {errorMessage, infoMessage, successMessage, warningMessage} from "@/utils/message"

const loading = ref(true)
const loadingResend = ref(false)
const route = useRoute()
const router = useRouter()
const messageTitle = ref('')
const messageContent = ref('')
const isVerified = ref(false)
const email = ref('')
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const isEmailValid = computed(() => {
  return emailRules.every(rule => rule(email.value) === true)
})

const verifyEmail = async (token) => {
  try {
    await apiService.verifyEmail(token)
    successMessage("Your account has been successfully verified. You can now login.")
    messageTitle.value = 'Account Verified'
    messageContent.value = 'Your account has been successfully verified. You can now login.'
    isVerified.value = true
  } catch (err) {
    if (err.response?.data.status === '409 CONFLICT') {
      warningMessage('Account already verified.')
      messageTitle.value = 'Account Already Verified'
      messageContent.value = 'Your account has been verified. You can now login.'
      isVerified.value = true
    } else {
      errorMessage('Account verification failed.')
      consoleError(err)
      messageTitle.value = 'Invalid Link'
      messageContent.value = 'This verification link is invalid.'
    }
  } finally {
    loading.value = false
  }
}

const resendVerificationEmail = async () => {
  try {
    loadingResend.value = true
    const payload = {
      email: email.value
    }
    await apiService.resendVerificationEmail(payload)
    await router.replace('/verify-email');
    infoMessage("Account verification email has been sent.")
  } catch (err) {
    if (err.response?.data.status === '409 CONFLICT') {
      warningMessage('Account already verified.')
      messageTitle.value = 'Account Already Verified'
      messageContent.value = 'Your account has been verified. You can now login.'
      isVerified.value = true
    } else {
      errorMessage('Failed to resend verification email.')
    }
    consoleError(err)
  } finally {
    loadingResend.value = false
  }
}

const redirectToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  const token = route.query.token || null
  if (token) {
    verifyEmail(token)
  } else {
    messageTitle.value = 'Invalid Link'
    messageContent.value = 'This verification link is invalid or has expired.'
    loading.value = false
  }
})
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
