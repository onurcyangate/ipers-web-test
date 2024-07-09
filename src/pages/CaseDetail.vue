<template>
  <v-app>
    <v-container>
      <v-row>
        <!-- Case Details Section -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              CASE DETAILS
              <v-spacer></v-spacer>
              <v-btn color="red">SET APPOINTMENT DATE</v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <strong>Case #:</strong> {{ caseDetails.caseNumber }}
                </v-col>
                <v-col cols="12">
                  <strong>Name:</strong> {{ caseDetails.name }}
                </v-col>
                <v-col cols="12">
                  <strong>Date of Birth:</strong> {{ caseDetails.dob }}
                </v-col>
                <v-col cols="12">
                  <strong>Email:</strong> {{ caseDetails.email }}
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary">SET THE DECISION</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Manage Documents Section -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>MANAGE DOCUMENTS</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <div class="upload-area">
                    Drag your files into this area to upload
                    <v-icon large>mdi-upload</v-icon>
                  </div>
                </v-col>
                <v-col cols="12">
                  <strong>Uploaded Documents</strong>
                  <div v-for="(document, index) in documents" :key="index">
                      {{ document.name }}
                      <v-icon color="red" @click="removeDocument(index)">mdi-close</v-icon>
                    </div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary">SUBMIT ALL DOCUMENTS</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Secure Messages Section -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>SECURE MESSAGES</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" v-for="(message, index) in messages" :key="index">
                  <div class="message">
                    <strong>{{ message.sender }}</strong>
                    <span>{{ message.timestamp }}</span>
                    <p>{{ message.content }}</p>
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="newMessage" placeholder="Enter your message"></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-btn color="primary" @click="sendMessage">SEND</v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Downloads Section -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Downloads</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" v-for="(download, index) in downloads" :key="index">
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ download.name }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon>mdi-download</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import {ref, onMounted} from 'vue';

// Mock data
const mockCaseDetails = {
  caseNumber: '1',
  name: 'Onur Sezen',
  dob: '01/01/1900',
  email: 'onur@cyangate.com',
};

const mockDocuments = [
  {name: 'doc.pdf'},
  {name: 'doc2.pdf'},
];

const mockMessages = [
  {sender: 'Onur', timestamp: '01/01/2024 0:00 pm', content: 'All the documents are submitted.'},
  {sender: 'IPERS', timestamp: '01/01/2024 0:00 pm', content: 'Please re-upload 3 important documents.'}
];

const mockDownloads = [
  {name: 'doc.pdf'}
];

// State
const caseDetails = ref({});
const documents = ref([]);
const messages = ref([]);
const downloads = ref([]);
const newMessage = ref('');

// Mock function to simulate fetching data from backend
const fetchData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        caseDetails: mockCaseDetails,
        documents: mockDocuments,
        messages: mockMessages,
        downloads: mockDownloads
      });
    }, 1000);
  });
};

// Fetch data on component mount
onMounted(async () => {
  const data = await fetchData();
  caseDetails.value = data.caseDetails;
  documents.value = data.documents;
  messages.value = data.messages;
  downloads.value = data.downloads;
});

// Methods
const removeDocument = (index) => {
  documents.value.splice(index, 1);
};

const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    messages.value.push({
      sender: 'You',
      timestamp: new Date().toLocaleString(),
      content: newMessage.value
    });
    newMessage.value = '';
  }
};
</script>

<style scoped>
.upload-area {
  border: 2px dashed #003058;
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.message {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.message strong {
  display: block;
}

.message span {
  font-size: 0.8em;
  color: gray;
}
</style>
