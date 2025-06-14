<template>
  <v-container fluid style="padding-right: 5em; padding-left: 5em">
    <v-card class="pa-4 light-border elevation-10">
      <v-row class="d-flex align-center mb-4">
        <v-col cols="3" class="d-flex align-center">
          <v-text-field
            v-model="search"
            label="Search"
            clearable
            variant="outlined"
            density="compact"
            class="pt-3"
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col v-if="isUniversityUser === false" cols="3" class="d-flex align-center justify-end">
          <v-btn
            @click="isAddCaseModalOpen = true"
            class="ml-2"
            :color="COLORS.PRIMARY"
            :loading="addingCase"
            :disabled="addingCase"
          >
            Add New Case
          </v-btn>
        </v-col>
      </v-row>

      <!-- Skeleton Loader -->
      <div v-if="loading">
        <v-skeleton-loader
          type="table-thead"
          class="mb-2"
        ></v-skeleton-loader>
        <v-skeleton-loader
          v-for="n in 5"
          :key="n"
          type="table-tbody"
          class="mb-1"
        ></v-skeleton-loader>
      </div>

      <!-- Data Table -->
      <v-data-table
        v-else
        :headers="headers"
        :items="filteredCases"
        item-value="caseIdStr"
        :items-per-page="shouldShowPagination ? 10 : -1"
        :disable-pagination="!shouldShowPagination"
      >
        <template v-slot:item="{ item, index }">
          <tr
            :style="{ backgroundColor: index % 2 === 0 ? 'white' : '#f3f3f3' }"
            class="custom-row clickable"
            @click="rowClicked(item)"
          >
            <td class="text-left">{{ item.caseIdStr }}</td>
            <td class="text-left">{{ item.memberFirstName }}</td>
            <td class="text-left">{{ item.memberLastName }}</td>
            <td class="text-left">
              <v-chip
                :color="getStatusColor(item.LlifeCycleStatusDomained)"
                text-color="white"
                size="small"
                class="font-weight-medium"
              >
                {{ getStatusText(item.LlifeCycleStatusDomained) }}
              </v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          <div class="text-center py-8">
            <div v-if="cases.length === 0">You do not have any case to work on.</div>
            <div v-else>No case available for this search</div>
          </div>
        </template>
        <template v-slot:bottom v-if="shouldShowPagination">
          <v-data-table-footer
            :items-per-page="10"
            :items-length="filteredCases.length"
          />
        </template>
        <template v-slot:bottom v-else>
          <!-- Empty slot to override default footer -->
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
import { getApiService } from '@/services/api.service'
const apiService = getApiService()
import {consoleError} from "@/utils/logger";
import {errorMessage, successMessage} from "@/utils/message";
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

const isUniversityUser = computed(() => authStore.isUniversityUser());
const search = ref('');
const isAddCaseModalOpen = ref(false);
const addingCase = ref(false);
const router = useRouter();
const emit = defineEmits(['cases-updated']);

const headers = [
  {title: 'Case ID', value: 'caseIdStr'},
  {title: 'Member First Name', value: 'memberFirstName'},
  {title: 'Member Last Name', value: 'memberLastName'},
  {title: 'Case Status', value: 'LlifeCycleStatusDomained'},
];

const getStatusColor = (status) => {
  return status === 'Created' ? 'info' : 'success';
};

const getStatusText = (status) => {
  return status === 'Created' ? 'Created' : 'In Progress';
};

const addNewCase = async (caseNumber) => {
  try {
    addingCase.value = true;
    await apiService.addCase(caseNumber, authStore.username);
    successMessage('Case added successfully.');
    isAddCaseModalOpen.value = false;
    emit('cases-updated');
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to add case.');
  } finally {
    addingCase.value = false;
  }
};

const rowClicked = (item) => {
  router.push(`/case-detail/${item.caseIdStr}`);
};

const filteredCases = computed(() => {
  if (!search.value) return props.cases;

  const searchLower = search.value.toLowerCase();

  return props.cases.filter((c) => {
    // Search in Case ID
    if (c?.caseIdStr?.toLowerCase().includes(searchLower)) return true;

    // Search in Member First Name
    if (c?.memberFirstName?.toLowerCase().includes(searchLower)) return true;

    // Search in Member Last Name
    if (c?.memberLastName?.toLowerCase().includes(searchLower)) return true;

    // Search in Status
    const statusText = getStatusText(c?.LlifeCycleStatusDomained)?.toLowerCase();
    if (statusText?.includes(searchLower)) return true;

    return false;
  });
});

const shouldShowPagination = computed(() => {
  return filteredCases.value.length > 10;
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

/* Custom skeleton loader styles */
.v-skeleton-loader {
  background: transparent !important;
}
</style>
