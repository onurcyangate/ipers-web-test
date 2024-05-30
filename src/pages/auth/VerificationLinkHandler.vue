<template>
  <v-container fluid class="flex-col-center justify-center fill-height" style="background: linear-gradient(to right bottom, #003058, #00517A)">
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
        <v-btn v-else @click="resendVerificationEmail" color="primary" class="mt-2 no-uppercase auto-width"
               :loading="loadingResend" style="margin-bottom:15px">Resend Verification Email
        </v-btn>
      </div>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiService from "@/services/api.service"
import { consoleError } from "@/utils/logger"
import AppLogo from "@/components/app/AppLogo.vue"

const loading = ref(true)
const loadingResend = ref(false)
const route = useRoute()
const router = useRouter()
const messageTitle = ref('')
const messageContent = ref('')
const isVerified = ref(false)

const verifyEmail = async (token) => {
  try {
    const response = await apiService.verifyEmail({ token })
    messageTitle.value = 'Account Verified'
    messageContent.value = 'Your account has been successfully verified. You can now login.'
    isVerified.value = true
  } catch (err) {
    consoleError(err)
    messageTitle.value = 'Invalid Link'
    messageContent.value = 'This verification link is invalid.'
  } finally {
    loading.value = false
  }
}

const resendVerificationEmail = async () => {
  try {
    loadingResend.value = true
    const response = await apiService.resendVerificationEmail()
    messageContent.value = response.data.message || 'Verification email sent.'
  } catch (err) {
    consoleError(err)
    messageContent.value = 'Failed to resend verification email.'
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

body-1 {
  font-size: 1rem;
  color: #333;
}

.fill-height {
  height: 100vh;
}
</style>
