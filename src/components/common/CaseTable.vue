<template>
  <v-container fluid class="px-10">
    <v-card class="pa-4 light-border elevation-10">
      <v-row class="d-flex align-center mb-4">
        <v-col cols="3" class="d-flex align-center">
          <v-text-field
            v-model="search"
            label="Search"
            clearable
            variant="outlined"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="3" class="d-flex align-center justify-end">
          <v-btn @click="addNewCase" class="ml-2" color="#003058">Add New Case</v-btn>
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="filteredCases"
        item-value="caseId"
        :items-per-page="5"
      >
        <template v-slot:item="{ item, index }">
          <tr
            :style="{ backgroundColor: index % 2 === 0 ? 'white' : '#f3f3f3' }"
            class="custom-row clickable"
            @click="rowClicked(item)"
          >
            <td class="text-left">{{ item.caseId }}</td>
            <td class="text-left">{{ item.memberFirstName }}</td>
            <td class="text-left">{{ item.memberLastName }}</td>
            <td class="text-left">{{ item.memberDOB }}</td>
            <td class="text-left">
              <v-chip :color="statusColorMap[item.caseStatus]" dark>{{ item.caseStatus }}</v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          <div>
            You do not have any case to work on.
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import axios from 'axios';

const cases = ref([]);
const search = ref('');

const headers = [
  {title: 'Case ID', value: 'caseId'},
  {title: 'Member First Name', value: 'memberFirstName'},
  {title: 'Member Last Name', value: 'memberLastName'},
  {title: 'Member Date of Birth', value: 'memberDOB'},
  {title: 'Case Status', value: 'caseStatus'},
];

const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const options = {year: 'numeric', month: 'long', day: 'numeric'};

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const fetchCases = async () => {
  try {
    const data = {
      "_embedded": {
        "filterListExternalUID": [
          {
            "Properties": {
              "externalUserUID": "mkara@cyangate.com",
              "memberFirstName": "Ulku",
              "memberLastName": "Kara",
              "caseID": 0,
              "caseStatus": "created",
              "AppealTime": "P60D",
              "documentReady": "Yes",
              "lifeCycleStatus": "string",
              "memberDOB": "2024-07-11T11:15:34Z",
              "memberID": "98568745"
            }
          }
        ]
      }
    };

    cases.value = data._embedded.filterListExternalUID.map(item => ({
      caseId: item.Properties.caseID,
      memberFirstName: item.Properties.memberFirstName,
      memberLastName: item.Properties.memberLastName,
      memberDOB: formatDate(item.Properties.memberDOB),
      caseStatus: item.Properties.caseStatus,
    }));
  } catch (error) {
    console.error('Error fetching cases:', error);
  }
};

const filteredCases = computed(() => {
  return cases.value.filter(
    (c) =>
      c.memberFirstName.toLowerCase().includes(search.value.toLowerCase()) ||
      c.memberLastName.toLowerCase().includes(search.value.toLowerCase()) ||
      c.caseStatus.toLowerCase().includes(search.value.toLowerCase())
  );
});

const statusColorMap = {
  complete: 'green',
  'in progress': 'orange',
  created: 'blue',
  rejected: 'red',
};

const addNewCase = () => {
  console.log('Add new case');
};

const rowClicked = (item) => {
  console.log('Row clicked', item);
};

onMounted(() => {
  fetchCases();
});
</script>

<style scoped>
.clickable {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clickable:hover {
  background-color: #e0e0e0 !important;
}

.text-left {
  text-align: left;
}
</style>
