<template>
  <v-card class="light-border elevation-10 pa-2 mt-4">
    <v-card-title class="blue-header-1 d-flex justify-space-between">
      <span>UNIVERSITY DECISION</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        variant="text"
        @click="isExpanded = !isExpanded"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
      >
        <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-expand-transition>
      <v-card-text v-if="isExpanded">
        <v-row>
          <v-col cols="12" class="d-flex flex-column">
            <v-row>
              <v-col cols="12" md="5" lg="4">
                <v-select
                  v-model="decisionType"
                  :items="['Approve', 'Deny', 'Archive', 'Cancel']"
                  label="Decision"
                  :color="COLORS.PRIMARY"
                  variant="outlined"
                  density="compact"
                  :disabled="uploading"
                  class="mt-2"
                />

              </v-col>
              <v-col cols="12" md="7" lg="8">
                <v-file-input
                  v-if="decisionType"
                  v-model="localUploadedFiles"
                  label="Upload File (Optional)"
                  :color="COLORS.PRIMARY"
                  multiple
                  chips
                  variant="outlined"
                  @change="handleFileChange"
                  style="max-height: 100px"
                  :disabled="uploading"
                  accept=".doc,.docx,.pdf"
                />
              </v-col>
            </v-row>

            <v-row class="mt-2">
              <v-col cols="12">
                <v-textarea
                  v-model="decisionLetter"
                  label="Decision Letter"
                  rows="4"
                  :color="COLORS.PRIMARY"
                  variant="outlined"
                  auto-grow
                />
              </v-col>
            </v-row>

          </v-col>

          <v-col v-if="false" cols="6">
            <strong>Pending Documents:</strong>
            <v-card-text class="pl-0" style="margin-left: -20px; overflow-y: auto; max-height: 150px">
              <div v-if="pendingFiles.length > 0">
                <v-list-item
                  v-for="(file, index) in pendingFiles"
                  :key="index"
                  class="py-0"
                  style="padding-left: 0"
                >
                  <v-list-item-title>
                    <v-btn icon
                           @click="removePreviouslyUploadedFile(index)"
                           variant="text"
                           small
                           color="red"
                           style="margin-left: 8px">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    {{ file.name }}
                  </v-list-item-title>
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
    </v-expand-transition>

    <v-card-actions v-if="isExpanded">
      <v-spacer></v-spacer>
      <v-btn
        :color="COLORS.PRIMARY"
        variant="flat"
        class="no-uppercase"
        @click="submitDecision"
        :loading="props.loading"
        :disabled="!decisionType || !decisionLetter"
      >
        Set Decision
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

const userStore = useAuthStore();
const localUploadedFiles = ref([]);
const pendingFiles = ref([]);
const uploading = ref(false);
const decisionType = ref(null);
const isExpanded = ref(true);
const decisionLetter = ref('');

const emit = defineEmits([
  'update:uploadedFiles',
  'submitDocuments',
  'update:resetTrigger',
  'deleteFile',
  'update:decisionData',
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
    const response = await apiService.listTempFiles(userStore.businessWorkspaceId);
    pendingFiles.value = response.data.fileList.map((file) => ({
      name: file.fileName,
      fileId: file.fileId,
    }));
  } catch (error) {
    consoleError('Error fetching pending files:', error);
    errorMessage('Failed to fetch pending files.');
  }
};

const removePreviouslyUploadedFile = (index) => {
  const fileToRemove = pendingFiles.value[index];
  emit('deleteFile', fileToRemove);
};

const submitDecision = () => {
  if (decisionType.value === 'Approve') {
    emit('approveDecision');
  } else if (decisionType.value === 'Deny') {
    emit('rejectDecision');
  } else if (decisionType.value === 'Cancel') {
    emit('cancelDecision');
  } else if (decisionType.value === 'Archive') {
    emit('archiveDecision');
  }
};

const submitDocuments = () => {
  emit('submitDocuments', {
    files: localUploadedFiles.value,
    decisionType: decisionType.value,
    decisionLetter: decisionLetter.value,
  });
};

const resetFileInput = () => {
  localUploadedFiles.value = [];
};

watch([decisionType], () => {
  emit('update:decisionData', {
    decisionType: decisionType.value,
  });
});

onMounted(async () => {
  await fetchPendingFiles();
});

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
    if (newVal) {
      await fetchPendingFiles();
    }
  }
);
</script>

<style scoped>
</style>
