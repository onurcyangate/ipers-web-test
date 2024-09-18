<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title>MANAGE DOCUMENTS</v-card-title>
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
          />
        </v-col>
        <v-col cols="6">
          <strong>Uploaded Documents:</strong>
          <v-chip
            v-for="(file, index) in previouslyUploadedFiles"
            :key="index"
            class="ma-2"
          >
            {{ file.name }}
          </v-chip>
          <div v-if="previouslyUploadedFiles.length === 0" class="font-weight-light pt-2">
            No files have been uploaded.
          </div>
        </v-col>
      </v-row>

      <!-- File Uploading Bars -->
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
             :loading="props.loading" :disabled="localUploadedFiles.length === 0">
        Submit All Documents
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import {ref, watch} from 'vue';
import {COLORS} from '@/styles/colors';

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
});

const localUploadedFiles = ref([]);
const previouslyUploadedFiles = ref([]);
const emit = defineEmits(['update:uploadedFiles', 'submitDocuments', 'update:resetTrigger']);

const handleFileChange = () => {
  emit('update:uploadedFiles', localUploadedFiles.value);
};

const removeDocument = (index) => {
  localUploadedFiles.value.splice(index, 1);
  emit('update:uploadedFiles', localUploadedFiles.value);
};

const submitDocuments = () => {
  emit('submitDocuments', localUploadedFiles.value);
};

const resetFileInput = () => {
  localUploadedFiles.value = [];
};

watch(
  () => props.resetTrigger,
  (newVal) => {
    if (newVal) {
      resetFileInput();
      // Reset the trigger back to false
      emit('update:resetTrigger', false);
    }
  }
);
</script>

<style scoped>
</style>
