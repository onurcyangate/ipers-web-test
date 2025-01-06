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
        <h1 class="display-1">Reset Password</h1>
        <v-divider class="my-4"></v-divider>
        <v-form v-model="isFormValid" @submit.prevent="resetPassword" style="width: 300px">
          <v-text-field v-model="formState.code.value" :label="formState.code.label" :type="formState.code.type"
                        :rules="getRules(formState.code)" variant="underlined" dense></v-text-field>
          <v-text-field v-model="formState.email.value" :label="formState.email.label" :type="formState.email.type"
                        :rules="getRules(formState.email)" variant="underlined" dense></v-text-field>
          <v-text-field v-model="formState.userPassword.value" :label="formState.userPassword.label"
                        :type="showPassword ? 'text' : 'password'" :rules="getRules(formState.userPassword)"
                        variant="underlined" dense :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append="togglePasswordVisibility('userPassword')"></v-text-field>
          <v-text-field v-model="formState.confirmPassword.value" :label="formState.confirmPassword.label"
                        :type="showConfirmPassword ? 'text' : 'password'" :rules="getRules(formState.confirmPassword)"
                        variant="underlined" dense :append-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append="togglePasswordVisibility('confirmPassword')"></v-text-field>

          <Recaptcha @verify="handleVerify" @expired="handleExpired"></Recaptcha>

          <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading="loading"
                 :disabled="!isFormValid || !captchaVerified" style="margin-bottom:15px">Reset Password
          </v-btn>
        </v-form>
      </div>
    </v-container>
  </v-container>
</template>

<script setup>
import {reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import { getApiService } from '@/services/api.service'
const apiService = getApiService()
import {consoleError} from "@/utils/logger"
import AppLogo from "@/components/app/AppLogo.vue"
import {errorMessage, successMessage} from "@/utils/message"
import Recaptcha from '@/components/Recaptcha.vue'

const loading = ref(false)
const isFormValid = ref(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaVerified = ref(false)
const router = useRouter()

const formState = reactive({
  code: {value: '', label: 'Code sent to email', type: 'text'},
  email: {value: '', label: 'Email', type: 'email'},
  userPassword: {value: '', label: 'New Password', type: 'password'},
  confirmPassword: {value: '', label: 'Confirm New Password', type: 'password'},
})

const handleVerify = (response) => {
  captchaVerified.value = true
  console.log("Captcha success", response)
}

const handleExpired = () => {
  captchaVerified.value = false
  console.log("Captcha expired")
}

const resetPassword = async () => {
  if (!captchaVerified.value) {
    errorMessage('Please complete the CAPTCHA.')
    return
  }

  try {
    loading.value = true
    const payload = {
      newPassword: formState.userPassword.value
    }
    await apiService.resetPassword(formState.email.value, formState.code.value, payload)
    successMessage("Your password has been successfully reset. You can now login.")
    router.push('/login')
  } catch (err) {
    consoleError(err)
    errorMessage("Failed to reset password.")
  } finally {
    loading.value = false
  }
}

const getRules = (field) => {
  const rules = [v => !!v || `${field.label} is required`]
  if (field.type === 'email') {
    rules.push(v => /.+@.+\..+/.test(v) || 'E-mail must be valid')
  }
  if (field.type === 'password') {
    rules.push(v => v.length >= 8 || 'Password must be at least 8 characters')
    rules.push(v => /[a-z]/.test(v) || 'Password must contain at least 1 lowercase character')
    rules.push(v => /[A-Z]/.test(v) || 'Password must contain at least 1 uppercase character')
    rules.push(v => /[\W_]/.test(v) || 'Password must contain at least 1 symbol')
  }
  if (field.label === 'Confirm New Password') {
    rules.push(v => v === formState.userPassword.value || 'Password and Confirm Password must match')
  }
  return rules
}

const togglePasswordVisibility = (key) => {
  if (key === 'userPassword') {
    showPassword.value = !showPassword.value
  } else if (key === 'confirmPassword') {
    showConfirmPassword.value = !showConfirmPassword.value
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

body-1 {
  font-size: 1rem;
  color: #333;
}

.fill-height {
  height: 100vh;
}
</style>
