<template>
  <v-container fluid class="px-10">
    <v-card class="pa-4 light-border elevation-10">
      <v-row class="d-flex align-center mb-4">
        <v-col cols="3" class="d-flex align-center">
          <v-text-field
            v-model="search"
            label="Search"
            clearable
            variant="outlined"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="3" class="d-flex align-center justify-end">
          <v-btn @click="isAddCaseModalOpen = true" class="ml-2" :color="COLORS.PRIMARY">Add New Case</v-btn>
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="filteredCases"
        item-value="caseID"
        :items-per-page="5"
      >
        <template v-slot:item="{ item, index }">
          <tr
            :style="{ backgroundColor: index % 2 === 0 ? 'white' : '#f3f3f3' }"
            class="custom-row clickable"
            @click="rowClicked(item)"
          >
            <td class="text-left">{{ item.caseID }}</td>
            <td class="text-left">{{ item.memberFirstName }}</td>
            <td class="text-left">{{ item.memberLastName }}</td>
            <td class="text-left">
              <v-chip :color="statusColorMap[item.caseStatus]" dark>{{ item.caseStatus }}</v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          <div v-if="!loading">
            <div v-if="cases.length === 0">You do not have any case to work on.</div>
            <div v-else>No case available for this search</div>
          </div>
          <div v-else>
            Loading...
          </div>
        </template>
      </v-data-table>
    </v-card>
    <Dialog
      v-model="isAddCaseModalOpen"
      heading="Add New Case"
      label="Case Number"
      inputType="text"
      @submit="addNewCase"
    ></Dialog>
  </v-container>
</template>

<script setup>
import {ref, computed, defineEmits} from 'vue';
import {useRouter} from 'vue-router';
import Dialog from "@/components/common/Dialog.vue";
import {COLORS} from "@/styles/colors";
import apiService from "@/services/api.service";
import {consoleError} from "@/utils/logger";
import {errorMessage} from "@/utils/message";
import {useAuthStore} from "@/store/authStore";

const authStore = useAuthStore();
const props = defineProps({
  cases: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const search = ref('');
const isAddCaseModalOpen = ref(false);
const router = useRouter();
const emit = defineEmits(['cases-updated']);


const headers = [
  {title: 'Case ID', value: 'caseID'},
  {title: 'Member First Name', value: 'memberFirstName'},
  {title: 'Member Last Name', value: 'memberLastName'},
  {title: 'Case Status', value: 'caseStatus'},
];

const statusColorMap = {
  complete: 'green',
  'in progress': 'orange',
  Created: 'blue',
  rejected: 'red',
};

const addNewCase = async () => {
  try {
    const response = await apiService.addCase(authStore.username);
    const userCases = response.data.externalUserCaseList._embedded.filterListExternalUID.map(item => item.Properties);
    emit('cases-updated');
    return userCases;
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to add case.');
    return [];
  }
};

const rowClicked = (item) => {
  router.push(`/case-detail/${item.caseID}`);
};

const filteredCases = computed(() => {
  return props.cases.filter(
    (c) =>
      c?.memberFirstName?.toLowerCase().includes(search.value.toLowerCase()) ||
      c?.memberLastName?.toLowerCase().includes(search.value.toLowerCase()) ||
      c?.caseStatus?.toLowerCase().includes(search.value.toLowerCase())
  );
});
</script>

<style scoped>
.clickable {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clickable:hover {
  background-color: #e0e0e0 !important;
}

.text-left {
  text-align: left;
}
</style>
