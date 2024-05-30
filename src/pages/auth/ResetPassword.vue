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
        <AppLogo ></AppLogo>
      </div>
      <p class="font-weight-medium"
         style="text-align: center; margin: 10px 0 25px 0; font-size: 20px;">Reset Password</p>
      <v-form :model=formState fast-fail @submit.prevent="resetPasswordAttempt" style="width: 300px">
        <v-text-field v-model="formState.email" label="E-mail" variant="underlined"
                      prepend-inner-icon="mdi-email"
                      :rules="[v => !!v || 'E-mail is required']"></v-text-field>

        <v-btn type="submit" color="primary" block class="mt-2 no-uppercase" :loading=loading
               style="margin-bottom:15px">Reset Password
        </v-btn>
        <v-btn @click="() => router.push('/login')" variant="text" block color="grey" class="mt-2 no-uppercase"
               :loading=loading style="font-size: 13px">Go Back to Sign In Page
        </v-btn>

      </v-form>
    </v-container>
  </v-container>
</template>

<script setup>
import {ref, reactive} from 'vue'
import apiService from "@/services/api.service";
import {errorMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import AppLogo from "@/components/app/AppLogo.vue";
import router from "@/router";

const loading = ref(false);
const formState = reactive({
  email: ''
})

const resetPasswordAttempt = async () => {
  try {
    loading.value = true
    const payload = {
      email: formState.email
    };
    const response = await apiService.resetPassword(payload)
    if (response.status === 200) {
      // TODO
    }
  } catch (err) {
    consoleError(err)
    errorMessage('Reset password failed.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

</style>
