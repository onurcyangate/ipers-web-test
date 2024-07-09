<script setup>
import Drawer from "@/layouts/Drawer.vue";
import TopBar from "@/components/app/TopBar.vue";
</script>

<template>
  <TopBar>
    <Drawer>
      <router-view></router-view>
    </Drawer>
  </TopBar>
</template>

<style scoped>

</style>
