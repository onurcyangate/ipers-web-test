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
        <AppLogo></AppLogo>
      </div>
      <p class="font-weight-medium"
         style="text-align: center; margin: 10px 0 25px 0; font-size: 20px;">Register</p>
      <v-form :model="formState" v-model="isFormValid" fast-fail @submit.prevent="registerAttempt" style="width: 300px">
        <v-text-field v-for="(field, key) in formState" :key="key" v-model="field.value" :label="field.label"
                      :type="getFieldType(key)"
                      variant="underlined"
                      density="comfortable"
                      :rules="getRules(field)"
                      :append-icon="getAppendIcon(key)"
                      @click:append="togglePasswordVisibility(key)">
        </v-text-field>

        <Recaptcha @verify="handleVerify" @expired="handleExpired"></Recaptcha>

        <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading="loading"
               :disabled="!isFormValid || !captchaVerified" style="margin-bottom:15px">Register
        </v-btn>
        <v-btn @click="() => router.push('/login')" variant="text" block color="grey" class="mt-2 no-uppercase"
               :disabled="loading" style="font-size: 13px">Already registered? Sign in here
        </v-btn>
      </v-form>
    </v-container>
  </v-container>
</template>

<script setup>
import {ref, reactive} from 'vue';
import apiService from "@/services/api.service";
import {errorMessage, successMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import AppLogo from "@/components/app/AppLogo.vue";
import {useAuthStore} from '@/store/authStore';
import router from "@/router";
import Recaptcha from '../../components/Recaptcha.vue';

const isFormValid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const captchaVerified = ref(false);

const formState = reactive({
  unique_code: {value: '', label: 'Case Number', type: 'text'},
  givenName: {value: '', label: 'Given Name', type: 'text'},
  sn: {value: '', label: 'Last Name', type: 'text'},
  mail: {value: '', label: 'Email', type: 'email'},
  userPassword: {value: '', label: 'Password', type: 'password'},
  confirmPassword: {value: '', label: 'Confirm Password', type: 'password'},
});

const handleVerify = () => {
  captchaVerified.value = true;
};

const handleExpired = () => {
  captchaVerified.value = false;
};

const registerAttempt = async () => {
  if (!captchaVerified.value) {
    errorMessage('Please complete the CAPTCHA.');
    return;
  }

  try {
    loading.value = true;
    const payload = {
      customAttributes: [],
      values: [
        {name: 'userPassword', values: [formState.userPassword.value]},
        {name: 'givenName', values: [formState.givenName.value]},
        {name: 'mail', values: [formState.mail.value]},
        {name: 'oTTelephoneNumber', values: ['']},
        {name: 'sn', values: [formState.sn.value]},
        {name: "accountDisabled", values: [true]},
      ],
      name: formState.mail.value.slice(0, formState.mail.value.indexOf('@')),
    };
    const response = await apiService.register(payload, formState.unique_code.value);
    successMessage('Account has been successfully created. Verify your email to login.')
    await router.replace('/verify-email');
  } catch (err) {
    if (err.response.data.status === '409 CONFLICT') {
      errorMessage('Email already exists.');
    } else if (err.response.data.responseFromUniqueCodeControl.status === '404 NOT_FOUND') {
      errorMessage('Case Number is invalid.');
    } else {
      errorMessage('Registration failed.');
    }
    consoleError(err);
  } finally {
    loading.value = false;
  }
};

const getRules = (field) => {
  const rules = [v => !!v || field.label + ' is required'];
  if (field.type === 'email') {
    rules.push(v => /.+@.+\..+/.test(v) || 'E-mail must be valid');
  }
  if (field.type === 'password') {
    rules.push(v => v.length >= 8 || 'Password must be at least 8 characters');
    rules.push(v => /[a-z]/.test(v) || 'Password must contain at least 1 lowercase character');
    rules.push(v => /[A-Z]/.test(v) || 'Password must contain at least 1 uppercase character');
    rules.push(v => /[\W_]/.test(v) || 'Password must contain at least 1 symbol');
  }
  if (field.label === 'Confirm Password') {
    rules.push(v => v === formState.userPassword.value || 'Password and Confirm Password must match');
  }
  return rules;
};

const togglePasswordVisibility = (key) => {
  if (key === 'userPassword') {
    showPassword.value = !showPassword.value;
  } else if (key === 'confirmPassword') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};

const getFieldType = (key) => {
  if (key === 'userPassword') {
    return showPassword.value ? 'text' : 'password';
  }
  if (key === 'confirmPassword') {
    return showConfirmPassword.value ? 'text' : 'password';
  }
  return formState[key].type;
};

const getAppendIcon = (key) => {
  if (key === 'userPassword') {
    return showPassword.value ? 'mdi-eye-off' : 'mdi-eye';
  }
  if (key === 'confirmPassword') {
    return showConfirmPassword.value ? 'mdi-eye-off' : 'mdi-eye';
  }
  return '';
};
</script>

<style scoped>
.v-list-group__items .v-list-item {
  padding-inline-start: 24px !important;
}
</style>
