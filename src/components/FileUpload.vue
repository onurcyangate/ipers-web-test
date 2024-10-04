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
            :disabled="uploading"
          />
        </v-col>
        <v-col cols="6">
          <strong>Pending Documents:</strong>
          <v-card-text>
            <div v-if="pendingFiles.length > 0">
              <div v-for="(file, index) in pendingFiles" :key="index">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ file.name }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-icon>
                    <v-btn icon @click="removePreviouslyUploadedFile(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-icon>
                </v-list-item>
              </div>
            </div>
            <div v-else class="font-weight-light pt-2">
              No files have been uploaded.
            </div>
          </v-card-text>
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
});

const userStore = useAuthStore();
const localUploadedFiles = ref([]);
const pendingFiles = ref([]);
const uploading = ref(false);

const emit = defineEmits(['update:uploadedFiles', 'submitDocuments', 'update:resetTrigger', 'deleteFile']);

const handleFileChange = async () => {
  if (localUploadedFiles.value.length > 0) {
    uploading.value = true;
    await emit('update:uploadedFiles', localUploadedFiles.value);
    uploading.value = false;
    fetchPendingFiles()
  }
};

const fetchPendingFiles = async () => {
  try {
    const response = await apiService.listFiles(userStore.businessWorkspaceId);
    pendingFiles.value = Object.keys(response.data).map(filename => ({
      name: filename,
      fileId: response.data[filename],
    }));
  } catch (error) {
    consoleError('Error fetching files: ', error);
    errorMessage('Failed to fetch files');
  }
};


const removePreviouslyUploadedFile = (index) => {
  const fileToRemove = pendingFiles.value[index];
  emit('deleteFile', fileToRemove);
  pendingFiles.value.splice(index, 1);
};

const submitDocuments = () => {
  emit('submitDocuments', localUploadedFiles.value);
};

const resetFileInput = () => {
  localUploadedFiles.value = [];
};

onMounted(async () => {
  await fetchPendingFiles()
})

watch(
  () => props.resetTrigger,
  (newVal) => {
    if (newVal) {
      resetFileInput();
      emit('update:resetTrigger', false);
    }
  }
);
</script>

<style scoped>
</style>
