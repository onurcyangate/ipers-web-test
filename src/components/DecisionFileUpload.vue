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
                  :items="['Approved', 'Denied', 'Approved with Condition']"
                  label="Decision"
                  :color="COLORS.PRIMARY"
                  variant="outlined"
                  density="compact"
                  :disabled="isDecisionSetPreviously || uploading"
                  class="mt-2"
                />

              </v-col>
              <v-col cols="12" md="7" lg="8">
                <v-file-input
                  v-if="decisionType"
                  v-model="localUploadedFiles"
                  label="Upload Decision Document"
                  :color="COLORS.PRIMARY"
                  multiple
                  chips
                  variant="outlined"
                  @change="handleFileChange"
                  style="max-height: 100px"
                  :disabled="isDecisionSetPreviously || uploading"
                  accept=".doc,.docx,.pdf"
                  :rules="[fileSizeRule]"
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
        @click="setDecision"
        :disabled="isDecisionSetPreviously || !decisionType || localUploadedFiles.length === 0"
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
import {fileSizeRule} from "@/utils/common";

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
  existingDecision: {
    type: String,
    default: null,
  },
});

const userStore = useAuthStore();
const localUploadedFiles = ref([]);
const pendingFiles = ref([]);
const uploading = ref(false);
const decisionType = ref(null);
const isExpanded = ref(true);
const isDecisionSetPreviously = ref(false);

const emit = defineEmits([
  'submitDocuments',
  'update:resetTrigger',
  'setDecisionWithFile'
]);

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

const submitDecision = () => {
  emit('setDecision', decisionType.value);
  // if (decisionType.value === 'Approve') {
  //   emit('approveDecision');
  // } else if (decisionType.value === 'Deny') {
  //   emit('rejectDecision');
  // } else if (decisionType.value === 'Cancel') {
  //   emit('cancelDecision');
  // } else if (decisionType.value === 'Archive') {
  //   emit('archiveDecision');
  // }
};

const setDecision = () => {
  uploading.value = true;
  emit('setDecisionWithFile', {
    files: localUploadedFiles.value,
    decisionType: decisionType.value
  });
  uploading.value = false;
};

const resetFileInput = () => {
  localUploadedFiles.value = [];
  props.resetTrigger = false;
};

onMounted(async () => {
  // await fetchPendingFiles();
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
      // await fetchPendingFiles();
    }
  }
);

watch(
  () => props.existingDecision,
  (newDecision) => {
    if (newDecision) {
      decisionType.value = newDecision;
      isDecisionSetPreviously.value = true;
    }
  },
  {immediate: true}
);

</script>

<style scoped>
</style>
