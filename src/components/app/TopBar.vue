<template>
  <v-app-bar app color="blue lighten-3" dark>
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-img
            src="@/assets/logo.png"
            alt="Logo"
            contain
            max-width="150"
          ></v-img>
        </v-col>

        <v-col cols="auto" class="d-flex align-center">
          <span>Welcome!</span>
          <v-btn color="primary" dark class="ml-4">Sign Out</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
</script>

<style scoped>
.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}
</style>
