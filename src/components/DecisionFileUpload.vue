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
                  style="max-height: 100px"
                  accept=".doc,.docx,.pdf"
                  :rules="[fileSizeRule]"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col v-if="false" cols="6">
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
        :disabled="!decisionType || localUploadedFiles.length === 0"
      >
        {{ existingDecision ? 'Update Decision' : 'Set Decision' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import {ref, watch} from 'vue';
import {COLORS} from '@/styles/colors';
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

const localUploadedFiles = ref([]);
const uploading = ref(false);
const decisionType = ref(null);
const isExpanded = ref(true);

const emit = defineEmits([
  'submitDocuments',
  'update:resetTrigger',
  'setDecisionWithFile'
]);

const setDecision = () => {
  uploading.value = true;
  emit('setDecisionWithFile', {
    files: localUploadedFiles.value,
    decisionType: decisionType.value
  });
  resetFileInput()
  uploading.value = false;
};

const resetFileInput = () => {
  localUploadedFiles.value = [];
  props.resetTrigger = false;
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
    }
  },
  {immediate: true}
);
</script>
