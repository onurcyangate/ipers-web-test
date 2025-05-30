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
            <v-col cols="12" v-if="caseId">
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
                :caseId="caseId"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="12" :md="downloads.length ? 8 : 12" v-if="caseDetails.caseIdStr">
              <SecureMessages :ready="isReady"/>
            </v-col>

            <v-col v-if="downloads.length" cols="12" md="4">
              <v-card class="light-border elevation-10 pa-2 d-flex flex-column" style="max-height: 350px;">
                <v-card-title class="blue-header-1 d-flex align-center flex-shrink-0 pb-2">
                  DOWNLOADS
                </v-card-title>

                <span v-if="downloadableFilesLoading" class="loader flex-shrink-0"></span>

                <v-card-text
                  v-else
                  class="flex-grow-1 overflow-y-auto pa-0"
                  style="padding: 8px 16px !important;"
                >
                  <v-list dense class="pa-0">
                    <v-list-item
                      v-for="(file, index) in downloads"
                      :key="`download-${file.fileId}-${index}`"
                      @click="downloadFile(file)"
                      class="download-item px-3 py-3 rounded mb-1"
                      style="cursor: pointer; min-height: 60px;"
                    >
                      <v-list-item-content class="pa-0">
                        <div
                          class="filename-title"
                          :style="`font-size: 0.875rem; color: ${COLORS.PRIMARY}; font-weight: 500; text-decoration: underline; text-decoration-color: rgba(25, 118, 210, 0.3);`"
                          :title="file.filename"
                        >
                          {{ file.filename }}
                        </div>
                      </v-list-item-content>

                      <template v-slot:append>
                        <v-icon
                          size="18"
                          :color="COLORS.PRIMARY"
                          style="opacity: 0.6;"
                        >
                          mdi-download-outline
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
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
import { getApiService } from '@/services/api.service'
const apiService = getApiService()
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
import {useConfigStore} from "@/store/configStore";
const configStore = useConfigStore();

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
  console.log('[CaseDetail] Starting file upload:', {
    fileCount: files.length,
    files: files.map(f => ({ name: f.name, size: f.size })),
    caseId: caseDetails.value.caseIdStr,
    timestamp: new Date().toISOString()
  });

  try {
    fileUploadLoading.value = true;
    fileUploadProgress.value = files.map(() => 0);

    let hasErrors = false;
    const uploadResults = [];

    for (const [index, file] of files.entries()) {
      console.log(`[CaseDetail] Uploading file ${index + 1}/${files.length}: ${file.name}`);

      const formData = new FormData();
      formData.append('file', file);

      const progressController = {stop: false};
      simulateFileUploadProgress(index, progressController);

      try {
        const response = await apiService.uploadFile(caseDetails.value.caseIdStr, formData);

        console.log(`[CaseDetail] Upload response for ${file.name}:`, {
          status: response.status,
          dataStatus: response.data?.status,
          message: response.data?.message,
          timestamp: new Date().toISOString()
        });

        if (response.data.status === '200 OK' || response.data.status === 200) {
          uploadResults.push({ success: true, file: file.name });
          console.log(`[CaseDetail] Successfully uploaded: ${file.name}`);
        } else {
          hasErrors = true;
          uploadResults.push({
            success: false,
            file: file.name,
            error: response.data.message || 'Upload failed'
          });
          console.error(`[CaseDetail] Upload failed for ${file.name}:`, response.data.message);
        }
      } catch (uploadError) {
        hasErrors = true;
        uploadResults.push({
          success: false,
          file: file.name,
          error: uploadError.message || 'Network error'
        });
        console.error(`[CaseDetail] Upload error for ${file.name}:`, {
          message: uploadError.message,
          response: uploadError.response?.data,
          status: uploadError.response?.status
        });
      } finally {
        progressController.stop = true;
        fileUploadProgress.value[index] = 100;
      }
    }

    // Show appropriate messages based on results
    const successCount = uploadResults.filter(r => r.success).length;
    const failureCount = uploadResults.filter(r => !r.success).length;

    console.log('[CaseDetail] Upload results:', {
      successCount,
      failureCount,
      totalFiles: files.length
    });

    if (successCount > 0 && failureCount === 0) {
      successMessage(`All ${successCount} file(s) uploaded successfully.`);
      // Wait a moment before triggering refresh to ensure backend processing is complete
      setTimeout(() => {
        refreshPendingFilesTrigger.value = true;
      }, 1000);
    } else if (successCount > 0 && failureCount > 0) {
      warningMessage(`${successCount} file(s) uploaded successfully, ${failureCount} failed.`);
      setTimeout(() => {
        refreshPendingFilesTrigger.value = true;
      }, 1000);

      // Log specific errors
      uploadResults
        .filter(r => !r.success)
        .forEach(r => consoleError(`Failed to upload ${r.file}: ${r.error}`));
    } else if (failureCount > 0 && successCount === 0) {
      errorMessage('Failed to upload all files.');

      // Log specific errors
      uploadResults
        .filter(r => !r.success)
        .forEach(r => consoleError(`Failed to upload ${r.file}: ${r.error}`));
    }

  } catch (error) {
    consoleError('[CaseDetail] Error in upload process: ', error);
    errorMessage('Failed to start upload process');
  } finally {
    fileUploadLoading.value = false;
    resetFileInputTrigger.value = true;
    uploadedFiles.value = [];
    fileUploadProgress.value = [];

    console.log('[CaseDetail] Upload process completed');
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
        const response = await apiService.uploadDecisionFile(caseDetails.value.caseIdStr, formData);
        if (response.data.status === '200 OK' || response.data.status === 200) {
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
    const fileUrl = configStore.apiBaseUrl + '/file-download?fileId=' + file.fileId;
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
  console.log('[CaseDetail] Deleting file:', {
    fileId: file.fileId,
    fileName: file.name,
    caseId: caseId.value,
    timestamp: new Date().toISOString()
  });

  try {
    loading.value = true;
    const response = await apiService.deleteFile(file.fileId, file.name, caseId.value);

    console.log('[CaseDetail] Delete response:', {
      status: response.status,
      data: response.data,
      fileName: file.name,
      timestamp: new Date().toISOString()
    });

    refreshPendingFilesTrigger.value = true;
    successMessage('File deleted successfully.');
  } catch (error) {
    consoleError('Error deleting file: ', error);
    console.error('[CaseDetail] Delete failed:', {
      fileId: file.fileId,
      fileName: file.name,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
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

    await apiService.updateCase(caseId.value, {
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
    await apiService.updateCase(caseId.value, {Properties: {caseUniversityDecision: decision}});
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
.filename-title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 2.8em; /* Fixed height for exactly 2 lines */
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.v-list-item-content {
  padding: 0 !important;
  margin: 0 !important;
}

.download-item {
  transition: all 0.2s ease-in-out;
}

.download-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.download-item:hover .filename-title {
  text-decoration-color: rgba(25, 118, 210, 0.8) !important;
}

.v-list {
  background: transparent !important;
}

.v-list-item {
  border-radius: 8px !important;
}

.v-avatar {
  flex-shrink: 0;
}

.filename-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: auto; /* Changed from fixed height */
  max-height: 2.8em; /* Maximum height for 2 lines */
  word-break: break-word;
}

.v-list-item-content {
  padding: 0 !important;
  margin: 0 !important;
}

.download-item {
  transition: all 0.2s ease-in-out;
  border-radius: 8px !important;
}

.download-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.download-item:hover .filename-title {
  text-decoration-color: rgba(25, 118, 210, 0.8) !important;
}

.v-list {
  background: transparent !important;
}

.v-list-item {
  border-radius: 8px !important;
}

/* Ensure proper scrolling */
.overflow-y-auto {
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* Fix for webkit scrollbar styling (optional) */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
