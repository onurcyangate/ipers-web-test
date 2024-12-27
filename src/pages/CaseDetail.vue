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
                  <strong style="color: #003058">{{ label }}:</strong>
                  <span v-if="key === 'appointmentDate'">
            {{ caseDetails.formattedUniversityAppointmentDate || '' }}
          </span>
                  <span v-else>
            {{ caseDetails[key] }}
          </span>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions v-if="isUniversityUser === true">
              <v-btn
                :color="COLORS.PRIMARY"
                variant="flat"
                class="ml-auto no-uppercase"
                @click="openAppointmentDialog"
              >
                {{
                  caseDetails.formattedUniversityAppointmentDate ? 'Update Appointment Date' : 'Set Appointment Date'
                }}
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
              <span v-if="medicalFilesLoading" class="loader"></span>
              <div v-else>
                <div v-if="medicalFiles.length > 0">
                  <div v-for="(file, index) in medicalFiles" :key="index">
                    <v-list-item @click="downloadFile(file)">
                      <v-row align="center" no-gutters>
                        <v-col cols="auto mr-2">
                          <v-icon size="large">mdi-download</v-icon>
                        </v-col>
                        <v-col>
                          <span class="text-wrap" style="font-size: 1rem">{{ file.filename }}</span>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </div>
                </div>
                <div v-else class="font-weight-light pt-2 ml-1">
                  No medical documents are currently available.
                </div>
              </div>
            </v-card-text>
          </v-card>

          <DecisionFileUpload
            v-if="isUniversityUser === true"
            @setDecisionWithFile="handleDecisionFileUpload"
            :loading="decisionFileUploadLoading"
            :resetTrigger="resetDecisionFileInputTrigger"
            :refreshPendingFilesTrigger="refreshPendingDecisionFilesTrigger"
            :existingDecision="universityDecision"
          />
        </v-col>
        <v-col cols="12" md="7">
          <v-row>
            <!-- File Upload Section -->
            <v-col cols="12" v-if="caseDetails.caseIdStr">
              <FileUpload
                :uploadedFiles="uploadedFiles"
                :previouslyUploadedFiles="previouslyUploadedFiles"
                @update:uploadedFiles="handleFileUpload"
                @updatePendingFiles="handlePendingFilesUpdate"
                @submitDocuments="submitAllDocuments"
                @deleteFile="deleteFile"
                :loading="fileUploadLoading"
                :fileUploadProgress="fileUploadProgress"
                :resetTrigger="resetFileInputTrigger"
                :refreshPendingFilesTrigger="refreshPendingFilesTrigger"
                @update:refreshPendingFilesTrigger="updateRefreshPendingFilesTrigger"
                :ready="isReady"
                :caseId="caseDetails.value.caseIdStr"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="12" :md="downloads.length ? 8 : 12" v-if="caseDetails.caseIdStr">
              <SecureMessages :ready="isReady"/>
            </v-col>

            <!-- Downloads Section -->
            <v-col v-if="downloads.length" cols="12" md="4">
              <v-card class="light-border elevation-10 pa-2" style="max-height: 250px">
                <v-card-title class="blue-header-1">DOWNLOADS</v-card-title>
                <span v-if="downloadableFilesLoading" class="loader"></span>
                <v-card-text style="overflow-y: auto">
                  <div v-for="(file, index) in downloads" :key="index">
                    <v-list-item @click="downloadFile(file)">
                      <v-row align="center" no-gutters>
                        <v-col cols="auto mr-2">
                          <v-icon size="large">mdi-download</v-icon>
                        </v-col>
                        <v-col>
                          <span class="text-wrap" style="font-size: 1rem">{{ file.filename }}</span>
                        </v-col>
                      </v-row>
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
import {ref, onMounted, computed, nextTick} from 'vue';
import Dialog from "@/components/common/Dialog.vue";
import SecureMessages from "@/components/SecureMessages.vue";
import FileUpload from "@/components/FileUpload.vue";
import {COLORS} from "@/styles/colors";
import {useAuthStore} from "@/store/authStore";
import {consoleError} from "@/utils/logger";
import {errorMessage, infoMessage, successMessage, warningMessage} from "@/utils/message";
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
const resetDecisionFileInputTrigger = ref(false);
const refreshPendingFilesTrigger = ref(false);
const refreshPendingDecisionFilesTrigger = ref(false);
const previouslyUploadedFiles = ref([{name: "sampletestt.pdf"}]);
const isReady = ref(false); // Control when Message and File upload components can start loading

const caseDetails = ref({});
const uploadedFiles = ref([]);
const uploadedDecisionFiles = ref([]);
const downloads = ref([]);
const medicalFiles = ref([]);
const isSetApptDateModalOpen = ref(false);
const loading = ref(false);
const fileUploadLoading = ref(false);
const downloadableFilesLoading = ref(false);
const decisionFileUploadLoading = ref(false);
const medicalFilesLoading = ref(false);
const pendingFilesFromChild = ref([]);
const universityDecision = ref(null);
import {format} from 'date-fns';

const caseDetailFields = computed(() => ({
  caseIdStr: 'Case #',
  memberFirstName: 'Member Name',
  memberLastName: 'Member Last Name',
  ...(isUniversityUser.value && {appointmentDate: 'Appointment Date'}),
}));

const fetchCaseDetails = async () => {
  try {
    loading.value = true;
    const response = await apiService.fetchCaseDetails(caseId.value);
    const caseData = response.data;
    const properties = caseData.Properties;
    if (properties.universityAppointmentDate) {
      properties.formattedUniversityAppointmentDate = format(new Date(properties.universityAppointmentDate), "MMM d, yyyy, hh:mm a");
    }
    caseDetails.value = caseData.Properties;
    universityDecision.value = caseData.Properties.caseUniversityDecision || null;

    await userStore.setBusinessWorkspaceId(caseData.BusinessWorkspace.BusinessWorkspaceId);
    await userStore.setBusinessWorkspaceObjectId(caseData.BusinessWorkspace.BusinessWorkspaceObjectId);
    await userStore.setCaseIdentityId(caseData.Identity.Id);
    await nextTick();

    isReady.value = true;
    await fetchFiles();
    await fetchMedicalFiles();

  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch case details.');
  } finally {
    loading.value = false;
  }
};

const handlePendingFilesUpdate = (files) => {
  pendingFilesFromChild.value = files;
  console.log('Pending files from child:', pendingFilesFromChild.value);
};

const updateRefreshPendingFilesTrigger = (newVal) => {
  refreshPendingFilesTrigger.value = newVal;
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
        const response = await apiService.uploadFile(caseDetails.value.caseIdStr, formData);
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

const handleDecisionFileUpload = async (args) => {
  try {
    decisionFileUploadLoading.value = true;
    await updateDecision(args.decisionType)
    for (const [index, file] of args.files.entries()) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await apiService.uploadFile(caseDetails.value.caseIdStr, formData);
        if (response.data.status !== '200 OK') {
          throw new Error(response.data.message || 'Upload failed');
        }
        successMessage('Files uploaded successfully.');
        refreshPendingDecisionFilesTrigger.value = true;
      } finally {
        resetDecisionFileInputTrigger.value = true;
        uploadedDecisionFiles.value = [];
      }
    }
    await fetchCaseDetails()
  } catch (error) {
    consoleError('Error uploading documents: ', error);
    errorMessage('Failed to upload documents');
  } finally {
    decisionFileUploadLoading.value = false;
    resetDecisionFileInputTrigger.value = true;
    uploadedDecisionFiles.value = [];
  }
};

const submitAllDocuments = async () => {
  try {
    fileUploadLoading.value = true;
    for (const file of pendingFilesFromChild.value) {
      const {fileId, name} = file
      await apiService.moveFile(fileId, name, caseDetails.value.caseIdStr);
      console.log(`File ${fileId}: ${name} moved`);
    }
    await apiService.newDocumentArrives(caseDetails.value.caseIdStr)
    resetFileInputTrigger.value = true;
    refreshPendingFilesTrigger.value = true;
    successMessage('Files submitted successfully.');
    uploadedFiles.value = [];
    fileUploadProgress.value = [];
  } catch (error) {
    consoleError('Error submitting documents: ', error);
    errorMessage('Failed to submit documents.');
  } finally {
    fileUploadLoading.value = false;
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
    downloadableFilesLoading.value = true;
    const response = await apiService.listDownloadableFiles(caseDetails.value.caseIdStr);
    downloads.value = response.data.fileList.map(file => ({
      filename: file.fileName,
      fileId: file.fileId,
    }));
  } catch (error) {
    consoleError('Error fetching files:', error);
    errorMessage('Failed to fetch files');
  } finally {
    downloadableFilesLoading.value = false;
  }
};

const fetchMedicalFiles = async () => {
  try {
    medicalFilesLoading.value = true;
    const response = await apiService.listMedicalFiles(caseDetails.value.caseIdStr);
    medicalFiles.value = response.data.fileList.map(file => ({
      filename: file.fileName,
      fileId: file.fileId,
    }));
  } catch (error) {
    consoleError('Error fetching medical files:', error);
    errorMessage('Failed to fetch files');
  } finally {
    medicalFilesLoading.value = false;
  }
};

const downloadFile = async (file) => {
  try {
    const fileUrl = import.meta.env.VITE_API_BASE_URL + 'iowa/file-download?fileId=' + file.fileId;
    const isPDF = file.mimeType === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.location.href = fileUrl;
      } else {
        window.location.href = fileUrl;
        warningMessage('Please allow popups to open PDF in new tab');
      }
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    infoMessage('File downloaded successfully.');
  } catch (error) {
    consoleError('Error downloading file: ', error);
    errorMessage('Failed to download file');
  }
};

const deleteFile = async (file) => {
  try {
    loading.value = true;
    await apiService.deleteFile(file.fileId);
    refreshPendingFilesTrigger.value = true;
    successMessage('File deleted successfully.');
  } catch (error) {
    consoleError('Error deleting file: ', error);
    errorMessage('Failed to delete file');
  } finally {
    loading.value = false;
    setTimeout(() => {
      refreshPendingFilesTrigger.value = false;
    }, 0);
  }
};

const updateAppointmentDate = async (date) => {
  try {
    loading.value = true;

    const now = new Date();
    const selectedDate = new Date(date);
    selectedDate.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    // Format date with current time to YYYY-MM-DDTHH:mm:ssZ
    const formattedDateTime = selectedDate.toISOString().replace(/\.\d{3}Z$/, "Z");

    await apiService.updateCase(userStore.caseIdentityId, {
      Properties: {
        universityAppointmentDate: formattedDateTime
      }
    });

    successMessage('Appointment date is set successfully.');
    await fetchCaseDetails();
  } catch (error) {
    consoleError('Error updating appointment date:', error);
    errorMessage('Failed to update appointment date.');
  } finally {
    isSetApptDateModalOpen.value = false;
    loading.value = false;
  }
};

const updateDecision = async (decision) => {
  try {
    loading.value = true;
    await apiService.updateCase(userStore.caseIdentityId, {Properties: {caseUniversityDecision: decision}});
    successMessage(`Decision set to ${decision} successfully.`);
    await fetchCaseDetails();
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
