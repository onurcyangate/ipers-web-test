<template>
  <v-row class="flex-col-center align-center fill-height mt-10">
    <CaseTable :cases="cases" :loading="loading"></CaseTable>
  </v-row>
</template>
<script setup>
import {ref, onMounted} from 'vue';
import apiService from "@/services/api.service";
import {errorMessage} from "@/utils/message";
import {consoleError} from "@/utils/logger";
import CaseTable from "@/components/common/CaseTable.vue";
import {useAuthStore} from "@/store/authStore";

const authStore = useAuthStore();
const loading = ref(false);
const cases = ref([]);

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time || 1000);
  });
}

;

const fetchUserCases = async () => {
  try {
    loading.value = true;
    // const response = await apiService.fetchUserCases(authStore.user.username);
    await sleep(1000)
    const response = {
      "page": {
        "skip": 0,
        "top": 0,
        "count": 2
      },
      "_links": {
        "self": {
          "href": "/CyanGateIOWAProject/entities/Case/lists/filterListExternalUID?Properties.externalUserUID=mkara@cyangate.com"
        },
        "first": {
          "href": "/CyanGateIOWAProject/entities/Case/lists/filterListExternalUID?Properties.externalUserUID=mkara@cyangate.com"
        }
      },
      "_embedded": {
        "filterListExternalUID": [
          {
            "_links": {
              "item": {
                "href": "/CyanGateIOWAProject/entities/Case/items/114693"
              }
            },
            "Properties": {
              "externalUserUID": "mkara@cyangate.com",
              "memberFirstName": "Ulku",
              "memberLastName": "Kara",
              "caseID": 0,
              "caseStatus": "complete",
              "AppealTime": "P60D",
              "documentReady": "Yes",
              "lifeCycleStatus": "string",
              "memberDOB": "2024-07-11T11:15:34Z",
              "memberID": "98568745"
            },
            "Identity": {
              "Id": "114693",
              "ItemId": "12A62609423FA1EF83AA811453C8447A.114693",
              "BusinessId": "IPERS_000051"
            }
          },
          {
            "_links": {
              "item": {
                "href": "/CyanGateIOWAProject/entities/Case/items/114694"
              }
            },
            "Properties": {
              "externalUserUID": "mkara@cyangate.com",
              "memberFirstName": "Ulku",
              "memberLastName": "Kara",
              "caseID": 0,
              "caseStatus": "complete",
              "AppealTime": "P60D",
              "documentReady": "Yes",
              "lifeCycleStatus": "string",
              "memberDOB": "2024-07-11T11:15:34Z",
              "memberID": "98568745"
            },
            "Identity": {
              "Id": "114694",
              "ItemId": "12A62609423FA1EF83AA811453C8447A.114694",
              "BusinessId": "IPERS_000052"
            }
          }
        ]
      }
    }

    const userCases = response._embedded.filterListExternalUID.map(item => item.Properties);
    return userCases;
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch cases.');
    return [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  cases.value = await fetchUserCases();
});
</script>


<style scoped>
.flex-col-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
  text-align: center;
}
</style>
