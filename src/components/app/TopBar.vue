<template>
  <v-app>
    <v-app-bar app dark elevation="0" style="border-bottom: 4px solid #003058">
      <v-img
        src="@/assets/logo.png"
        alt="Logo"
        contain
        max-width="150"
        max-height="50"
        class="logo ml-5"
      ></v-img>

      <v-row align="center" justify="space-between">
        <v-col cols="auto">
        </v-col>

        <v-col cols="auto" class="d-flex align-center">
          <span>Welcome {{authStore.user.name}}</span>
          <v-btn
            class="ml-6 no-uppercase font-weight-bold"
            :color="COLORS.BLUE"
            dark
            @click="router.back()"
          >
            Go to Dashboard
          </v-btn>
          <v-btn :color="COLORS.PRIMARY" dark class="ml-2 no-uppercase font-weight-bold" @click="logout">
            Logout
          </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main>
      <slot></slot>
    </v-main>
  </v-app>
</template>

<script setup>
import {useAuthStore} from '@/store/authStore';
import router from "@/router";
import {COLORS} from "@/styles/colors";

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
