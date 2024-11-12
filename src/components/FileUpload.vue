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
            :disabled="uploading"
            accept=".doc,.docx,.pdf"
            persistent-hint="Maximum file size limit is 10MB."
          />
        </v-col>

        <v-col cols="6">
          <strong>Pending Documents:</strong>
          <v-card-text class="pl-0" style="margin-left: -20px; overflow-y: auto; max-height: 150px">
            <span v-if="pendingFilesLoading" class="loader"></span>
            <div v-if="pendingFiles.length > 0">
              <v-list-item
                v-for="(file, index) in pendingFiles"
                :key="index"
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
        <v-col cols="12" v-for="(file, index) in localUploadedFiles" :key="index">
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
      <v-btn :color="COLORS.PRIMARY" variant="flat" class="no-uppercase" @click="submitDocuments"
             :loading="props.loading" :disabled="pendingFiles.length === 0">
        Submit All Documents
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';
import {COLORS} from '@/styles/colors';
import apiService from "@/services/api.service";
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
  if (localUploadedFiles.value.length > 0) {
    uploading.value = true;
    await emit('update:uploadedFiles', localUploadedFiles.value);
    uploading.value = false;
    fetchPendingFiles();
  }
};

const fetchPendingFiles = async () => {
  try {
    pendingFilesLoading.value = true;
    const response = await apiService.listTempFiles(userStore.businessWorkspaceId);
    pendingFiles.value = response.data.fileList.map(file => ({
      name: file.fileName,
      fileId: file.fileId,
    }));
    emit('updatePendingFiles', pendingFiles.value);
    props.refreshPendingFilesTrigger = false;
    props.resetTrigger = false;
    resetFileInput();
  } catch (error) {
    consoleError('Error fetching pending files:', error);
    errorMessage('Failed to fetch pending files.');
  } finally {
    pendingFilesLoading.value = false;
  }
};

const removePreviouslyUploadedFile = (index) => {
  const fileToRemove = pendingFiles.value[index];
  emit('deleteFile', fileToRemove);
};

const submitDocuments = () => {
  emit('submitDocuments', {
    files: localUploadedFiles.value,
    uploadForDecision: uploadForDecision.value,
  });
  props.refreshPendingFilesTrigger = false;
  props.resetTrigger = false;
  resetFileInput();
};

const resetFileInput = () => {
  localUploadedFiles.value = [];
};

watch(
  () => props.resetTrigger,
  (newVal) => {
    if (newVal) {
      resetFileInput();
      emit('update:resetTrigger', false);
    }
  }
);

watch(
  () => props.refreshPendingFilesTrigger,
  async (newVal) => {
    // TODO, can set this to true always?
    if (newVal) {
      await fetchPendingFiles();
      emit('update:refreshPendingFilesTrigger', false)
    }
  }
);

watch(
  () => props.ready,
  async (isReady) => {
    if (isReady) {
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
