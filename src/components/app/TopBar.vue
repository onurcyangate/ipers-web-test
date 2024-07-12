<template>
  <v-app>
    <v-app-bar app dark>
      <v-img
        src="@/assets/logo.png"
        alt="Logo"
        contain
        max-width="150"
        max-height="50"
        class="logo ml-5"
      ></v-img>
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
          </v-col>

          <v-col cols="auto" class="d-flex align-center">
            <span>Welcome!</span>
            <v-btn color="primary" dark class="ml-4" @click="logout">
              <v-icon size="x-large">mdi-logout</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <slot></slot>
    </v-main>
  </v-app>
</template>

<script setup>
import {useAuthStore} from '@/stores/user';
import router from "@/router";

const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.logo {
  display: block;
  max-width: 150px;
  max-height: 50px;
}
</style>
