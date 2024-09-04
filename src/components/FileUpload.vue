<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title>MANAGE DOCUMENTS</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6" class="d-flex flex-column">
          <v-file-input
            v-model=localUploadedFiles
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
          <strong>Uploaded Documents</strong>
          <v-chip
            v-for="(file, index) in localUploadedFiles"
            :key="index"
            class="ma-2"
            close
            @click:close="removeDocument(index)"
          >
            {{ file.name }}
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn :color="COLORS.PRIMARY" variant="flat" class="no-uppercase" @click="submitDocuments" :loading="props.loading">Submit All Documents
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import {ref} from 'vue';
import {COLORS} from '@/styles/colors';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const localUploadedFiles = ref([]);
const emit = defineEmits(['update:uploadedFiles', 'submitDocuments']);

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
</script>

<style scoped>
.light-border {
  border: 1px solid #e0e0e0;
}
</style>
