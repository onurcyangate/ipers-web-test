<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title class="blue-header-1">MANAGE DOCUMENTS</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6" class="d-flex flex-column">
          <v-file-input
            v-model="localUploadedFiles"
            label="Select or Drop Your Files Here"
            :color="COLORS.PRIMARY"
            multiple
            chips
            variant="outlined"
            @change="handleFileChange"
            style="max-height: 100px"
            :disabled="uploading || props.loading"
            accept=".doc,.docx,.pdf"
            persistent-hint="Maximum file size limit is 10MB."
          />
        </v-col>

        <v-col cols="6">
          <strong>Pending Documents:</strong>
          <v-card-text class="pl-0 pt-1" style="margin-left: -20px; overflow-y: auto; max-height: 150px">
            <span v-if="pendingFilesLoading" class="loader"></span>
            <div v-else-if="pendingFiles.length > 0">
              <v-list-item
                v-for="(file, index) in pendingFiles"
                :key="`${file.fileId}-${index}`"
                class="py-1 file-list-item"
                density="compact"
              >
                <div class="d-flex align-center" style="width: 100%">
                  <v-btn
                    icon
                    @click="removePreviouslyUploadedFile(index)"
                    variant="text"
                    size="small"
                    color="red"
                    class="mt-1 flex-shrink-0"
                    style="margin-right: 8px;"
                    :disabled="pendingFilesLoading"
                  >
                    <v-icon size="small">mdi-close</v-icon>
                  </v-btn>
                  <span class="file-name">{{ file.name }}</span>
                </div>
              </v-list-item>
            </div>
            <div v-else class="font-weight-light pt-2 ml-5">
              No files have been uploaded.
            </div>
          </v-card-text>
        </v-col>
      </v-row>

      <v-row v-if="fileUploadProgress.length > 0">
        <v-col cols="12" v-for="(file, index) in localUploadedFiles" :key="`progress-${index}`">
          <div>{{ file.name }}</div>
          <v-progress-linear
            :model-value="fileUploadProgress[index]"
            :buffer-value="fileUploadProgress[index] + 10"
            color="blue"
            class="mb-3"
            stream
          ></v-progress-linear>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        :color="COLORS.PRIMARY"
        variant="flat"
        class="no-uppercase"
        @click="submitDocuments"
        :loading="props.loading"
        :disabled="pendingFiles.length === 0 || pendingFilesLoading"
      >
        Submit All Documents
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import {ref, watch, nextTick} from 'vue';
import {COLORS} from '@/styles/colors';
import { getApiService } from '@/services/api.service'
const apiService = getApiService()
import {consoleError} from "@/utils/logger";
import {errorMessage} from "@/utils/message";
import {useAuthStore} from "@/store/authStore";

const props = defineProps({
  ready: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fileUploadProgress: {
    type: Array,
    default: () => [],
  },
  resetTrigger: {
    type: Boolean,
    default: false,
  },
  refreshPendingFilesTrigger: {
    type: Boolean,
    default: false,
  },
  caseId: {
    type: String,
    default: null,
  },
});

const loading = ref(false)
const userStore = useAuthStore();
const localUploadedFiles = ref([]);
const pendingFiles = ref([]);
const uploading = ref(false);
const uploadForDecision = ref(false);
const pendingFilesLoading = ref(false);

const emit = defineEmits([
  'update:uploadedFiles',
  'submitDocuments',
  'update:resetTrigger',
  'deleteFile',
  'updatePendingFiles',
  'update:refreshPendingFilesTrigger'
]);

const handleFileChange = async () => {
  console.log('[FileUpload] File change detected:', {
    fileCount: localUploadedFiles.value.length,
    files: localUploadedFiles.value.map(f => ({ name: f.name, size: f.size })),
    timestamp: new Date().toISOString()
  });

  if (localUploadedFiles.value.length > 0) {
    try {
      uploading.value = true;

      // Emit files for upload
      await emit('update:uploadedFiles', localUploadedFiles.value);

      // Wait a bit for the upload to complete before refreshing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh pending files
      await fetchPendingFiles();

    } catch (error) {
      consoleError('[FileUpload] Error in handleFileChange:', error);
      errorMessage('Error processing file upload');
    } finally {
      uploading.value = false;
    }
  }
};

const fetchPendingFiles = async () => {
  if (!props.caseId) {
    console.warn('[FileUpload] No caseId provided for fetchPendingFiles');
    return;
  }

  console.log('[FileUpload] Fetching pending files for case:', props.caseId);

  try {
    pendingFilesLoading.value = true;
    const response = await apiService.listTempFiles(props.caseId);

    console.log('[FileUpload] Pending files response:', {
      status: response.status,
      dataLength: response.data?.fileList?.length || 0,
      files: response.data?.fileList?.map(f => ({ name: f.fileName, id: f.fileId })) || []
    });

    const newFiles = response.data?.fileList?.map(file => ({
      name: file.fileName,
      fileId: file.fileId,
    })) || [];

    pendingFiles.value = newFiles;
    emit('updatePendingFiles', pendingFiles.value);

    console.log('[FileUpload] Updated pending files:', pendingFiles.value.length);

  } catch (error) {
    consoleError('[FileUpload] Error fetching pending files:', error);
    console.error('[FileUpload] Fetch error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      caseId: props.caseId
    });
    errorMessage('Failed to fetch pending files.');
  } finally {
    pendingFilesLoading.value = false;
  }
};

const removePreviouslyUploadedFile = async (index) => {
  const fileToRemove = pendingFiles.value[index];
  console.log('[FileUpload] Removing file:', {
    index,
    fileId: fileToRemove.fileId,
    fileName: fileToRemove.name
  });

  emit('deleteFile', fileToRemove);

  // Wait a bit then refresh the list
  setTimeout(async () => {
    await fetchPendingFiles();
  }, 500);
};

const submitDocuments = () => {
  console.log('[FileUpload] Submitting documents:', {
    pendingFilesCount: pendingFiles.value.length,
    localFilesCount: localUploadedFiles.value.length
  });

  emit('submitDocuments', {
    files: localUploadedFiles.value,
    uploadForDecision: uploadForDecision.value,
  });

  // Reset after submission
  resetFileInput();
};

const resetFileInput = () => {
  console.log('[FileUpload] Resetting file input');
  localUploadedFiles.value = [];
};

// Watch for reset trigger
watch(
  () => props.resetTrigger,
  (newVal) => {
    console.log('[FileUpload] Reset trigger changed:', newVal);
    if (newVal) {
      resetFileInput();
      emit('update:resetTrigger', false);
    }
  }
);

// Watch for refresh pending files trigger
watch(
  () => props.refreshPendingFilesTrigger,
  async (newVal) => {
    console.log('[FileUpload] Refresh pending files trigger changed:', newVal);
    if (newVal) {
      await nextTick(); // Wait for DOM updates
      await fetchPendingFiles();
      emit('update:refreshPendingFilesTrigger', false);
    }
  }
);

// Watch for ready state
watch(
  () => props.ready,
  async (isReady) => {
    console.log('[FileUpload] Ready state changed:', isReady);
    if (isReady && props.caseId) {
      await nextTick(); // Wait for DOM updates
      await fetchPendingFiles();
    }
  }
);

// Watch for caseId changes
watch(
  () => props.caseId,
  async (newCaseId) => {
    console.log('[FileUpload] CaseId changed:', newCaseId);
    if (newCaseId && props.ready) {
      await fetchPendingFiles();
    }
  }
);
</script>

<style scoped>
.file-list-item {
  padding-left: 16px !important;
  min-height: 32px;
}

.file-name {
  word-break: break-word;
  line-height: 1.2;
  padding-top: 4px;
}
</style>
