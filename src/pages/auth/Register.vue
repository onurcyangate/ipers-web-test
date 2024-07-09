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
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const step = ref({stepIndex: 0, steps: ['UniqueCode', 'Registration']})

const formState = reactive({
  unique_code: {value: '', label: 'Unique Code', type: 'text'},
  givenName: {value: '', label: 'Given Name', type: 'text'},
  sn: {value: '', label: 'Surname', type: 'text'},
  initials: {value: '', label: 'Initials', type: 'text'},
  mail: {value: '', label: 'Email', type: 'email'},
  userPassword: {value: '', label: 'Password', type: 'password'},
  confirmPassword: {value: '', label: 'Confirm Password', type: 'password'},
});

const registerAttempt = async () => {
  try {
    loading.value = true
    const payload = {
      customAttributes: [],
      values: [
        {name: 'userPassword', values: [formState.userPassword.value]},
        {name: 'givenName', values: [formState.givenName.value]},
        {name: 'initials', values: [formState.initials.value]},
        {name: 'mail', values: [formState.mail.value]},
        {name: 'oTTelephoneNumber', values: ['']},
        {name: 'sn', values: [formState.sn.value]},
        {name: "accountDisabled", values: [true]},
      ],
      name: formState.mail.value.slice(0, formState.mail.value.indexOf('@')),
    };
    const response = await apiService.register(payload)
    await router.replace('/verify-email')
  } catch (err) {
    if (err.response.data.status === '409 CONFLICT') {
      errorMessage('Email already exists.')
    } else {
      errorMessage('Registration failed.')
    }
    consoleError(err)
  } finally {
    loading.value = false
  }
}

const getRules = (field) => {
  const rules = [v => !!v || field.label + ' is required']
  if (field.type === 'email') {
    rules.push(v => /.+@.+\..+/.test(v) || 'E-mail must be valid')
  }
  if (field.type === 'password') {
    rules.push(v => v.length >= 8 || 'Password must be at least 8 characters')
    rules.push(v => /[a-z]/.test(v) || 'Password must contain at least 1 lowercase character')
    rules.push(v => /[A-Z]/.test(v) || 'Password must contain at least 1 uppercase character')
    rules.push(v => /[\W_]/.test(v) || 'Password must contain at least 1 symbol')
  }
  if (field.label === 'Confirm Password') {
    rules.push(v => v === formState.userPassword.value || 'Password and Confirm Password must match')
  }
  return rules
}

const togglePasswordVisibility = (key) => {
  if (key === 'userPassword') {
    showPassword.value = !showPassword.value;
  } else if (key === 'confirmPassword') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
}

const goNextStep = () => {
  step.value.stepIndex += 1
}

const goPreviousStep = () => {
  if (step.value.stepIndex > 0) {
    step.value.stepIndex -= 1;
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
      <v-icon v-if="step.stepIndex === 1" @click="goPreviousStep" color="black" class="mt-2 no-uppercase"
              :disabled=loading style=" align-self: flex-start">mdi-arrow-left
      </v-icon>
      <div style="min-width: fit-content; display: flex; flex-direction: column; align-items: center; padding: 16px">
        <AppLogo></AppLogo>
      </div>
      <p class="font-weight-medium"
         style="text-align: center; margin: 10px 0 25px 0; font-size: 20px;">Register</p>
      <v-form :model=formState v-model="isFormValid" fast-fail
              @submit.prevent="registerAttempt" style="width: 300px">
        <v-text-field v-if="step.stepIndex === 0" v-model="formState.unique_code.value" label="Unique Code"
                      variant="underlined"
                      :rules="[v => !!v || 'Unique Code is required']"></v-text-field>
        <v-btn v-if="step.stepIndex === 0" @click="goNextStep()" color="primary" block class="mt-2 no-uppercase"
               :disabled="!formState.unique_code.value">Next
        </v-btn>

        <div v-if="step.stepIndex === 1">
          <v-text-field v-for="(field, key) in formState" :key="key" v-model="field.value" :label="field.label"
                        :type="key === 'userPassword' ? (showPassword ? 'text' : 'password') : (key === 'confirmPassword' ? (showConfirmPassword ? 'text' : 'password') : field.type)"
                        variant="underlined"
                        density="comfortable"
                        :rules="getRules(field)"
                        :disabled="key === 'unique_code'"
                        :append-icon="key === 'userPassword' ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : (key === 'confirmPassword' ? (showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye') : '')"
                        @click:append="togglePasswordVisibility(key)">
          </v-text-field>
          <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading=loading
                 :disabled="!isFormValid" style="margin-bottom:15px">Register
          </v-btn>
        </div>
        <v-btn @click="() => router.push('/login')" variant="text" block color="grey" class="mt-2 no-uppercase"
               :disabled=loading style="font-size: 13px">Already registered? Sign in here
        </v-btn>

      </v-form>
    </v-container>
  </v-container>
</template>

<style scoped>

.v-list-group__items .v-list-item {
  padding-inline-start: 24px !important;
}

</style>
