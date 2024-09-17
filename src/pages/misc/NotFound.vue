<script setup>
import {useRouter} from 'vue-router';

const router = useRouter();

const goBackToDashboard = () => {
  router.push({name: 'dashboard'});
};
</script>

<template>
  <div class="flex-col-center page-not-found">
    <div class="text-center flex-col-center light-border content-wrapper">
      <v-icon
        class="mb-6 icon-block"
        icon="mdi-alert-circle-outline"
        size="64"
      ></v-icon>

      <div class="text-h4 custom-font">Page Not Found</div>

      <v-divider class="divider-custom"></v-divider>

      <p class="text-subtitle-1 mb-6">The page you're looking for doesn't exist.</p>

      <v-btn
        color="primary"
        large
        variant="tonal"
        @click="goBackToDashboard"
        class="no-uppercase"
      >
        Back to Dashboard
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.page-not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding-bottom: 150px;
}

.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  border-width: 10px;
}

.divider-custom {
  width: 60%;
  margin: 20px auto;
}

</style>
