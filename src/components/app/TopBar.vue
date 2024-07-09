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
            <v-btn color="primary" dark class="ml-4" @click="router.push('/login')"><v-icon size="x-large">mdi-logout</v-icon></v-btn>
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
import router from "@/router";
</script>

<style scoped>
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.logo {
  display: block; /* Ensure the image is displayed as a block element */
  max-width: 150px; /* Adjust the width as needed */
  max-height: 50px; /* Ensure the height is not too large */
}
</style>
