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
        <v-col cols="12" md="5" class="d-flex flex-column">
          <!-- Case Details Card -->
          <v-card
            class="flex-grow-1 d-flex flex-column justify-space-between light-border elevation-10 pa-2 mb-4"
            :style="{
    maxHeight: isUniversityUser ? '450px' : '600px',
    minHeight: '300px',
    flexGrow: medicalFiles.length > 0 ? 1 : 2
  }"
          >
            <v-card-title class="mb-10 blue-header-1">CASE DETAILS</v-card-title>
            <v-card-text style="overflow-y: auto">
              <v-row class="pl-2">
                <v-col cols="12" v-for="(label, key) in caseDetailFields" :key="key">
                  <strong style="color: #003058">{{ label }}:</strong> {{ caseDetails[key] }}
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions v-if="isUniversityUser === true">
              <v-btn
                :color="COLORS.PRIMARY"
                variant="outlined"
                class="mr-auto no-uppercase"
                @click="openAppointmentDialog"
              >
                {{ caseDetails.appointmentDate ? 'Update Appointment Date' : 'Set Appointment Date' }}
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Medical Files -->
          <v-card
            v-if="isUniversityUser === true"
            class="flex-grow-1 light-border elevation-10 pa-2 ö"
            style="min-height: 100px; max-height: 300px;"
          >
            <v-card-title class="blue-header-1">MEDICAL DOCUMENTS</v-card-title>
            <v-card-text style="overflow-y: auto">
              <div v-if="false">
                <div v-for="(file, index) in downloads" :key="index">
                  <v-list-item @click="downloadFile(file)">
                    <v-list-item-content>
                      <v-list-item-title>{{ file.filename }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon>mdi-download</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </div>
              </div>
              <div v-else class="font-weight-light pt-2 ml-1">
                No medical documents are currently available.
              </div>
            </v-card-text>
          </v-card>

          <DecisionFileUpload
            :uploadedFiles="uploadedFiles"
            :previouslyUploadedFiles="previouslyUploadedFiles"
            @update:uploadedFiles="handleFileUpload"
            @submitDocuments="submitAllDocuments"
            @deleteFile="deleteFile"
            @update:decisionData="handleDecisionData"
            @approveDecision="handleApprove"
            @rejectDecision="handleReject"
            :loading="loading"
            :fileUploadProgress="fileUploadProgress"
            :resetTrigger="resetFileInputTrigger"
            :refreshPendingFilesTrigger="refreshPendingFilesTrigger"
          />
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
                @update:decisionData="handleDecisionData"
                :loading="fileUploadLoading"
                :fileUploadProgress="fileUploadProgress"
                :resetTrigger="resetFileInputTrigger"
                :refreshPendingFilesTrigger="refreshPendingFilesTrigger"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="12" :md="downloads.length ? 8 : 12">
              <SecureMessages/>
            </v-col>

            <!-- Downloads Section -->
            <v-col v-if="downloads.length" cols="12" md="4">
              <v-card class="light-border elevation-10 pa-2" style="max-height: 250px">
                <v-card-title class="blue-header-1">DOWNLOADS</v-card-title>
                <v-card-text style="overflow-y: auto">
                  <div v-for="(file, index) in downloads" :key="index">
                    <v-list-item @click="downloadFile(file)">
                      <v-list-item-content>
                        <v-list-item-title>{{ file.filename }}</v-list-item-title>
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
        v-if="isUniversityUser === true"
        v-model="isSetApptDateModalOpen"
        heading="Schedule Appointment Date"
        label="Date"
        inputType="date"
        @submit="updateAppointmentDate"
      ></Dialog>
    </v-container>
  </v-app>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import Dialog from "@/components/common/Dialog.vue";
import SecureMessages from "@/components/SecureMessages.vue";
import FileUpload from "@/components/FileUpload.vue";
import {COLORS} from "@/styles/colors";
import {useAuthStore} from "@/store/authStore";
import {consoleError} from "@/utils/logger";
import {errorMessage, infoMessage, successMessage} from "@/utils/message";
import apiService from "@/services/api.service";
import {useRoute} from 'vue-router';
import router from "@/router";
import DecisionFileUpload from "@/components/DecisionFileUpload.vue";

const userStore = useAuthStore();
const isUniversityUser = computed(() => userStore.isUniversityUser());
const route = useRoute();
const caseId = ref(route.params.case_id);
const fileUploadProgress = ref([]);
const resetFileInputTrigger = ref(false);
const refreshPendingFilesTrigger = ref(false);
const previouslyUploadedFiles = ref([{name: "sampletestt.pdf"}]);

const caseDetails = ref({});
const uploadedFiles = ref([]);
const downloads = ref([]);
const medicalFiles = ref([]);
const isSetApptDateModalOpen = ref(false);
const loading = ref(false);
const fileUploadLoading = ref(false);

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

    const caseData = response.data._embedded.filterListExternalUID[0];
    caseDetails.value = caseData.Properties;

    await userStore.setBusinessWorkspaceId(caseData.BusinessWorkspace.BusinessWorkspaceId);
    await userStore.setBusinessWorkspaceObjectId(caseData.BusinessWorkspace.BusinessWorkspaceObjectId);
    await fetchFiles();
    await fetchMedicalFiles();

  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch case details.');
  } finally {
    loading.value = false;
  }
};

const decisionData = ref({
  uploadForDecision: false,
  decisionType: null,
});

const handleDecisionData = (data) => {
  decisionData.value = data;
  console.log('Decision data:', data);
};

const handleFileUpload = async (files) => {
  try {
    fileUploadLoading.value = true;
    fileUploadProgress.value = files.map(() => 0);

    for (const [index, file] of files.entries()) {
      const formData = new FormData();
      formData.append('file', file);

      const progressController = {stop: false};
      simulateFileUploadProgress(index, progressController);

      try {
        const response = await apiService.uploadFile(userStore.businessWorkspaceId, formData);
        if (response.data.status !== '200 OK') {
          throw new Error(response.data.message || 'Upload failed');
        }
        successMessage('Files uploaded successfully.');
        refreshPendingFilesTrigger.value = true;
        previouslyUploadedFiles.value.push({name: file.name});
      } finally {
        stopFileUploadProgressLoader(index);
        progressController.stop = true;
        resetFileInputTrigger.value = true;
        uploadedFiles.value = [];
        fileUploadProgress.value = [];
      }
    }
  } catch (error) {
    consoleError('Error uploading documents: ', error);
    errorMessage('Failed to upload documents');
  } finally {
    fileUploadLoading.value = false;
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
    errorMessage('Failed to submit documents.');
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

const fetchFiles = async () => {
  try {
    const response = await apiService.listDownloadableFiles(userStore.businessWorkspaceId);
    downloads.value = response.data.fileList.map(file => ({
      filename: file.fileName,
      fileId: file.fileId,
    }));
  } catch (error) {
    consoleError('Error fetching files:', error);
    errorMessage('Failed to fetch files');
  }
};

const fetchMedicalFiles = async () => {
  try {
    const response = await apiService.listMedicalFiles(userStore.businessWorkspaceId);
    medicalFiles.value = response.data.fileList.map(file => ({
      filename: file.fileName,
      fileId: file.fileId,
    }));
  } catch (error) {
    consoleError('Error fetching medical files:', error);
    errorMessage('Failed to fetch files');
  }
};

const downloadFile = async (file) => {
  try {
    const fileUrl = import.meta.env.VITE_API_BASE_URL + 'iowa/file-download?fileId=' + file.fileId;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', file.filename);
    console.log("fileUrl", fileUrl)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    infoMessage('File downloaded successfully.')
  } catch (error) {
    consoleError('Error downloading file: ', error);
    errorMessage('Failed to download file');
  }
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
    await apiService.updateCase(caseId.value, {Properties: {universityAppointmentDate: date}});
    successMessage('Appointment date is set successfully.')
  } catch (error) {
    consoleError('Error updating appointment date: ', error);
    errorMessage('Failed to update appointment date');
  } finally {
    isSetApptDateModalOpen.value = false;
    loading.value = false;
  }
};

const handleApprove = () => {
  updateDecision('Approved');
};

const handleReject = () => {
  updateDecision('Rejected');
};

const updateDecision = async (decision) => {
  try {
    loading.value = true;
    await apiService.updateCase(caseId.value, {Properties: {caseUniversityDecision: decision}});
    successMessage(`Decision set to ${decision} successfully.`);
  } catch (error) {
    consoleError('Error setting decision: ', error);
    errorMessage('Failed to set decision');
  } finally {
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

const goBackToDashboard = () => {
  router.back();
};
</script>

<style scoped>
</style>
