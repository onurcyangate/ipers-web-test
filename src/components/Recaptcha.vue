<template>
  <div ref="recaptchaContainer" class="g-recaptcha"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useConfigStore } from "@/store/configStore";

const configStore = useConfigStore()

const emit = defineEmits(['verify', 'expired']);
const recaptchaContainer = ref(null);

const loadReCaptcha = () => {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve(window.grecaptcha);
    } else {
      window.vueRecaptchaApiLoaded = () => {
        resolve(window.grecaptcha);
      };

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
};

const onVerify = (response) => {
  emit('verify', response);
  console.log("Verified:", response);
};

const onExpired = () => {
  emit('expired');
  console.log("Expired");
};

onMounted(async () => {
  try {
    const grecaptcha = await loadReCaptcha();
    grecaptcha.render(recaptchaContainer.value, {
      sitekey: configStore.captchaSiteKey,
      callback: onVerify,
      'expired-callback': onExpired,
    });
  } catch (error) {
    console.error("Failed to load reCAPTCHA", error);
  }
});
</script>

<style scoped>
.g-recaptcha {
  margin: 1rem 0;
}
</style>
