<template>
  <v-app>
    <v-container fluid>
      <v-row class="py-5">
        <!-- Case Details Section -->
        <v-col cols="12" md="5" class="d-flex flex-column">
          <v-card class="flex-grow-1 d-flex flex-column justify-space-between light-border elevation-10 pa-2">
            <v-card-title class="mb-10">CASE DETAILS</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" v-for="(label, key) in caseDetailFields" :key="key">
                  <strong>{{ label }}:</strong> {{ caseDetails[key] }}
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions v-if="!userStore.user.role">
              <v-btn :color="COLORS.PRIMARY" variant="outlined" class="mr-auto no-uppercase"
                     @click="openAppointmentDialog">
                {{ caseDetails.appointmentDate ? 'Update Appointment Date' : 'Set Appointment Date' }}
              </v-btn>
              <v-btn @click="openDecisionDialog" :color="COLORS.PRIMARY" variant="flat" class="no-uppercase" :disabled="caseDetails.decision">
                Set the Decision
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-row>
            <!-- File Upload Section -->
            <v-col cols="12">
              <FileUpload
                :uploadedFiles="uploadedFiles"
                @update:uploadedFiles="uploadedFiles = $event"
                @submitDocuments="submitAllDocuments"
                :loading="loading"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="12" :md="downloads.length ? 8 : 12">
              <SecureMessages/>
            </v-col>

            <!-- Downloads Section -->
            <v-col v-if="downloads.length" cols="12" md="4">
              <v-card class="light-border elevation-10 pa-2">
                <v-card-title>DOWNLOADS</v-card-title>
                <v-card-text>
                  <div v-for="(download, index) in downloads" :key="index">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>{{ download.name }}</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-icon>
                        <v-icon>mdi-download</v-icon>
                      </v-list-item-icon>
                    </v-list-item>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <Dialog
        v-model="isSetApptDateModalOpen"
        heading="Schedule Appointment Date"
        label="Date"
        inputType="date"
        @submit="updateAppointmentDate"
      ></Dialog>
      <DecisionDialog
        v-model="isSetDecisionModalOpen"
        heading="Set Decision"
        @submit="updateAppointmentDate"
      ></DecisionDialog>
    </v-container>
  </v-app>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import Dialog from "@/components/common/Dialog.vue";
import SecureMessages from "@/components/SecureMessages.vue";
import FileUpload from "@/components/FileUpload.vue";
import {COLORS} from "@/styles/colors";
import {useAuthStore} from "@/store/authStore";
import {consoleError} from "@/utils/logger";
import {errorMessage, successMessage} from "@/utils/message";
import apiService from "@/services/api.service";
import {useRoute} from 'vue-router';
import DecisionDialog from "@/components/common/DecisionDialog.vue";

const userStore = useAuthStore();
const route = useRoute();
const caseId = ref(route.params.case_id);

const caseDetails = ref({});
const uploadedFiles = ref([]);
const downloads = ref([]);
const isSetApptDateModalOpen = ref(false);
const isSetDecisionModalOpen = ref(false);
const loading = ref(false);

const caseDetailFields = {
  caseNumber: 'Case #',
  memberName: 'Member Name',
  memberSurname: 'Member Surname',
  email: 'Email',
  caseStatus: 'Case Status',
  appointmentDate: 'Appointment Date',
  decision: 'Decision',
};

const fetchCaseDetails = async (id) => {
  try {
    loading.value = true;
    const response = await apiService.fetchCaseDetails(userStore.user.name, id);
    caseDetails.value = response.data;
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch case details.');
  } finally {
    loading.value = false;
  }
};

const submitAllDocuments = async () => {
  try {
    loading.value = true;
    const payload = {file: uploadedFiles.value}
    await apiService.uploadFile(caseId, payload);
    successMessage('Files submitted successfully.')
  } catch (error) {
    consoleError('Error submitting documents: ', error);
    errorMessage('Failed to submit documents');
  } finally {
    loading.value = false;
  }
};

const updateAppointmentDate = async (date) => {
  try {
    loading.value = true;
    await apiService.updateCase(caseId.value, {Properties: {appointmentDate: date}});
  } catch (error) {
    consoleError('Error updating appointment date: ', error);
    errorMessage('Failed to update appointment date');
  } finally {
    isSetApptDateModalOpen.value = false;
    loading.value = false;
  }
};

const updateDecision = async (date) => {
  try {
    loading.value = true;
    await apiService.updateCase(caseId.value, {Properties: {decision: date}});
  } catch (error) {
    consoleError('Error updating appointment date: ', error);
    errorMessage('Failed to update appointment date');
  } finally {
    isSetApptDateModalOpen.value = false;
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchCaseDetails();
});

const openAppointmentDialog = () => {
  isSetApptDateModalOpen.value = true;
};

const openDecisionDialog = () => {
  isSetDecisionModalOpen.value = true;
};
</script>

<style scoped>
.light-border {
  border: 1px solid #e0e0e0;
}
</style>
