<template>
  <v-app>
    <v-btn
      icon
      elevation="0"
      @click="goBackToDashboard"
      style="top: 25px; left: 15px; z-index: 5"
      class="position-absolute no-uppercase"
    >
      <v-icon style="scale: 1.2">mdi-keyboard-backspace</v-icon>
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        Go Back
      </v-tooltip>
    </v-btn>
    <v-container fluid style="padding-right: 5em; padding-left: 5em">
      <v-row class="py-5">
        <!-- Case Details Section -->
        <v-col cols="12" md="5" class="d-flex flex-column">
          <v-card class="flex-grow-1 d-flex flex-column justify-space-between light-border elevation-10 pa-2">
            <v-card-title class="mb-10" style="color: #003058; font-weight: 800">CASE DETAILS</v-card-title>
            <v-card-text>
              <v-row class="pl-2">
                <v-col cols="12" v-for="(label, key) in caseDetailFields" :key="key">
                  <strong style="color: #003058">{{ label }}:</strong> {{ caseDetails[key] }}
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions v-if="!userStore.user.role">
              <v-btn :color="COLORS.PRIMARY" variant="outlined" class="mr-auto no-uppercase"
                     @click="openAppointmentDialog">
                {{ caseDetails.appointmentDate ? 'Update Appointment Date' : 'Set Appointment Date' }}
              </v-btn>
              <v-btn @click="openDecisionDialog" :color="COLORS.PRIMARY" variant="flat" class="no-uppercase"
                     :disabled="caseDetails.decision">
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
                :previouslyUploadedFiles="previouslyUploadedFiles"
                @update:uploadedFiles="handleFileUpload"
                @submitDocuments="submitAllDocuments"
                @deleteFile="deleteFile"
                :loading="loading"
                :fileUploadProgress="fileUploadProgress"
                :resetTrigger="resetFileInputTrigger"
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
import router from "@/router";

const userStore = useAuthStore();
const route = useRoute();
const caseId = ref(route.params.case_id);
const fileUploadProgress = ref([]);
const resetFileInputTrigger = ref(false);
const previouslyUploadedFiles = ref([{ name: "sampletestt.pdf" }]);

const caseDetails = ref({});
const uploadedFiles = ref([]);
const downloads = ref([]);
const isSetApptDateModalOpen = ref(false);
const isSetDecisionModalOpen = ref(false);
const loading = ref(false);

const caseDetailFields = {
  caseIdStr: 'Case #',
  memberFirstName: 'Member Name',
  memberLastName: 'Member Last Name',
  caseStatus: 'Case Status',
  appointmentDate: 'Appointment Date',
};

const fetchCaseDetails = async () => {
  try {
    loading.value = true;
    const response = await apiService.fetchCaseDetails(caseId.value);
    caseDetails.value = response.data._embedded.filterListExternalUID[0].Properties;
    userStore.setBusinessWorkspaceId(response.data._embedded.filterListExternalUID[0].BusinessWorkspace.BusinessWorkspaceId)
    userStore.setBusinessWorkspaceObjectId(response.data._embedded.filterListExternalUID[0].BusinessWorkspace.BusinessWorkspaceObjectId)
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch case details.');
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = async (files) => {
  try {
    loading.value = true;
    fileUploadProgress.value = files.map(() => 0);

    for (const [index, file] of files.entries()) {
      const formData = new FormData();
      formData.append('file', file);

      const progressController = {stop: false};
      simulateFileUploadProgress(index, progressController);

      try {
        await apiService.uploadFile(userStore.businessWorkspaceId, formData);
        previouslyUploadedFiles.value.push({ name: file.name });
      } finally {
        stopFileUploadProgressLoader(index);
        progressController.stop = true;
        resetFileInputTrigger.value = true;
        uploadedFiles.value = [];
        fileUploadProgress.value = [];
      }
    }

    successMessage('Files uploaded successfully.');
  } catch (error) {
    consoleError('Error uploading documents: ', error);
    errorMessage('Failed to upload documents');
  } finally {
    loading.value = false;
    resetFileInputTrigger.value = true;
    uploadedFiles.value = [];
    fileUploadProgress.value = [];
  }
};

const submitAllDocuments = async () => {
  try {
    loading.value = true;
    // TODO move files from temp to other folder
    // await apiService.uploadFile(userStore.businessWorkspaceId, formData);
    resetFileInputTrigger.value = true;
    successMessage('Files submitted successfully.');
    uploadedFiles.value = [];
    fileUploadProgress.value = [];
  } catch (error) {
    consoleError('Error submitting documents: ', error);
    errorMessage('Failed to submit documents');
  } finally {
    loading.value = false;
  }
};

const stopFileUploadProgressLoader = (index) => {
  fileUploadProgress.value[index] = 100;
}

const simulateFileUploadProgress = (index, controller) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      if (controller.stop || progress >= 100) {
        clearInterval(interval);
        resolve();
      } else {
        // Reduce the increment size as the progress approaches 100
        const remainingProgress = 100 - progress;
        const increment = Math.random() * (remainingProgress / 10); // Smaller increment as it gets closer to 100
        progress += increment;
        fileUploadProgress.value[index] = Math.min(progress, 100);
      }
    }, 100);
  });
};

const deleteFile = async (file) => {
  try {
    loading.value = true;
    await apiService.deleteFile(userStore.businessWorkspaceId, file.name);
    successMessage('File deleted successfully.');
  } catch (error) {
    consoleError('Error deleting file: ', error);
    errorMessage('Failed to delete file');
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
  if (!caseId.value) {
    await router.push({name: 'not-found'});
    return;
  }

  await fetchCaseDetails();
});

const openAppointmentDialog = () => {
  isSetApptDateModalOpen.value = true;
};

const openDecisionDialog = () => {
  isSetDecisionModalOpen.value = true;
};

const goBackToDashboard = () => {
  router.back();
};
</script>

<style scoped>
</style>
