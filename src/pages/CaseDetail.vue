<template>
  <v-app>
    <v-container fluid>
      <v-row class="py-5">
        <!-- Case Details Section -->
        <v-col cols="12" md="5" class="d-flex flex-column">
          <v-card class="flex-grow-1 d-flex flex-column justify-space-between light-border elevation-10 pa-2">
            <v-card-title class="mb-10">CASE DETAILS</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" v-for="(label, key) in caseDetailFields" :key="key">
                  <strong>{{ label }}:</strong> {{ caseDetails[key] }}
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions v-if="!userStore.user.role">
              <v-btn :color="COLORS.PRIMARY" variant="outlined" class="mr-auto no-uppercase"
                     @click="openAppointmentDialog">
                {{ caseDetails.appointmentDate ? 'Update Appointment Date' : 'Set Appointment Date' }}
              </v-btn>
              <v-btn :color="COLORS.PRIMARY" variant="flat" class="no-uppercase" :disabled="caseDetails.decision">Set
                the Decision
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-row>
            <!-- Manage Documents Section -->
            <v-col cols="12">
              <v-card class="light-border elevation-10 pa-2">
                <v-card-title>MANAGE DOCUMENTS</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6" class="d-flex flex-column">
                      <v-file-input
                        label="Upload Files"
                        :color="COLORS.PRIMARY"
                        multiple
                        chips
                        variant="outlined"
                        density="comfortable"
                        @change="handleFileChange"
                        style="max-height: 100px"
                      />
                    </v-col>
                    <v-col cols="6">
                      <strong>Uploaded Documents</strong>
                      <v-chip
                        v-for="(file, index) in uploadedFiles"
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
                  <v-btn :color="COLORS.PRIMARY" variant="flat" class="no-uppercase">Submit All Documents</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="12" :md="downloads.length ? 8 : 12">
              <SecureMessages />
            </v-col>

            <!-- Downloads Section -->
            <v-col v-if="downloads.length" cols="12" md="4">
              <v-card class="light-border elevation-10 pa-2">
                <v-card-title>DOWNLOADS</v-card-title>
                <v-card-text>
                  <div v-for="(download, index) in downloads" :key="index">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>{{ download.name }}</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-icon>
                        <v-icon>mdi-download</v-icon>
                      </v-list-item-icon>
                    </v-list-item>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <Dialog
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
import {ref, onMounted} from 'vue';
import Dialog from "@/components/common/Dialog.vue";
import SecureMessages from "@/components/SecureMessages.vue";
import {COLORS} from "@/styles/colors";
import {useAuthStore} from "@/store/authStore";
import {consoleError} from "@/utils/logger";
import {errorMessage} from "@/utils/message";
import apiService from "@/services/api.service";
import {useRoute} from 'vue-router';

const userStore = useAuthStore();
const route = useRoute();
const caseId = ref(route.params.case_id);

const mockCaseDetails = {
  caseNumber: '1',
  memberName: 'Onur',
  memberSurname: 'Sezen',
  email: 'onur@cyangate.com',
  caseStatus: 'Pending',
  appointmentDate: 'aoaks',
  decision: 'resolved',
};

const mockDocuments = [
  {name: 'doc.pdf'},
  {name: 'doc2.pdf'},
];

const mockDownloads = [];

const caseDetails = ref({});
const documents = ref([]);
const uploadedFiles = ref([]);
const downloads = ref([]);
const isSetApptDateModalOpen = ref(false);
const loading = ref(false);

const caseDetailFields = {
  caseNumber: 'Case #',
  memberName: 'Member Name',
  memberSurname: 'Member Surname',
  email: 'Email',
  caseStatus: 'Case Status',
  appointmentDate: 'Appointment Date',
  decision: 'Decision',
};

const fetchCaseDetails = async () => {
  try {
    loading.value = true;
    const response = await apiService.fetchCaseDetails(caseId.value);
    caseDetails.value = response.data;
  } catch (err) {
    consoleError(err);
    caseDetails.value = mockCaseDetails;
    errorMessage('Failed to fetch case details.');
  } finally {
    loading.value = false;
  }
};

const fetchData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        caseDetails: mockCaseDetails,
        documents: mockDocuments,
        downloads: mockDownloads
      });
    }, 1000);
  });
};

const updateAppointmentDate = async (date) => {
  try {
    loading.value = true;
    await apiService.updateCase(caseId.value, {Properties: {appointmentDate: date}});
  } catch (error) {
    consoleError('Error updating appointment date: ', error);
    errorMessage('Failed to update appointment date');
  } finally {
    isSetApptDateModalOpen.value = false;
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchCaseDetails();
  const data = await fetchData();
  documents.value = data.documents;
  downloads.value = data.downloads;
});

const removeDocument = (index) => {
  uploadedFiles.value.splice(index, 1);
};

const handleFileChange = (files) => {
  const fileArray = Array.isArray(files) ? files : Array.from(files);
  uploadedFiles.value = fileArray.map(file => ({name: file.name}));
};

const openAppointmentDialog = () => {
  isSetApptDateModalOpen.value = true;
};
</script>

<style scoped>
.upload-area {
  border: 2px dashed #003058;
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.separator {
  border-left: 2px solid lightgray;
  height: 100%;
  padding: 0;
}

.light-border {
  border: 1px solid #e0e0e0;
}
</style>
