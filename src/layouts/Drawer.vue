<template>
    <v-navigation-drawer :color="COLORS.PRIMARY" permanent>
      <v-list dense>
        <div v-for="menuItem in menuItems" :key="menuItem.title">
          <v-list-group v-if="menuItem.children" :value="menuItem.title" style="padding-right: 0">
            <template v-slot:activator="{ props }">
              <v-list-item :prepend-icon="menuItem.icon" v-bind="props" class="white--text">
                <v-list-item-title class="white--text">{{ menuItem.title }}</v-list-item-title>
              </v-list-item>
            </template>
            <v-list-item v-for="child in menuItem.children" :key="child.title" :to="child.to"
                         :prepend-icon="child.icon">
              <v-list-item-title>{{ child.title }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :to="menuItem.to" :prepend-icon="menuItem.icon">
            <v-list-item-title class="white--text">{{ menuItem.title }}</v-list-item-title>

          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>

    <slot></slot>
</template>

<script setup>
import {ref} from 'vue';
import {COLORS} from "@/styles/colors";

const menuItems = ref([
  {title: 'Dashboard', icon: 'mdi-view-dashboard', to: {name: 'dashboard'}},
  {title: 'Case', icon: 'mdi-calendar', to: {name: 'case-detail'}},
]);
</script>

<style scoped>

.v-list-group__items .v-list-item {
  padding-inline-start: 24px !important;
}

.white--text {

}

</style>
