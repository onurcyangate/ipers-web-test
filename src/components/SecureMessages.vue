<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title>SECURE MESSAGES</v-card-title>
    <v-card-text class="scrollable-messages">
      <v-row>
        <v-col cols="12" v-for="(discussion, index) in discussionsList" :key="index">
          <div class="message">
            <strong>{{ discussion.Discussion.TopicName || 'No Topic' }}</strong>
            <span>{{ formatDate(discussion.Discussion.PostedDateTime) }}</span>
            <p>{{ discussion.Discussion.Body }}</p>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-row class="w-100">
        <v-col cols="12" class="py-0">
          <span class="font-weight-bold">Topic: </span>
          <v-text-field
            v-model="newTopic"
            placeholder="Enter message topic"
            variant="outlined"
            density="compact"
            :disabled="loading"
            class="mt-1"
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="py-0">
          <span class="font-weight-bold">Body: </span>
          <v-textarea
            v-model="newMessage"
            placeholder="Enter your message"
            variant="outlined"
            row-height="15"
            rows="2"
            :disabled="loading"
            class="mt-1"
          ></v-textarea>
        </v-col>
        <v-col cols="12" class="text-right">
          <v-btn
            :color="COLORS.PRIMARY"
            @click="sendMessage"
            variant="flat"
            class="no-uppercase"
            :loading="loading"
            :disabled="!newMessage || !newTopic"
          >
            Send
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import {ref} from 'vue';
import {COLORS} from "@/styles/colors";
import apiService from '@/services/api.service';
import {errorMessage, successMessage} from "@/utils/message";
import {formatDate} from "../utils/common";

const props = defineProps({
  caseId: {
    type: Number,
    // required: true,
    default: 196609
  }
});

const loading = ref(false);
const discussionsList = ref([]);
const newTopic = ref('');
const newMessage = ref('');

const targetEntityId = ref("12A62609423FA1EF920A1EEAC692847A");
const containerVersionId = ref("56c3c2d807c036d884c120bb40ef5c17");

const parseDiscussions = (response) => {
  if (response && response.item && response.item.Discussions) {
    discussionsList.value = response.item.Discussions.map(discussion => ({
      Identity: discussion.Identity,
      Discussion: discussion.Discussion
    }));
  } else {
    discussionsList.value = [];
  }
};

// Mocking API data fetch (Replace with actual API call)
const fetchDiscussions = async () => {
  // Replace this with actual API call
  const jsonResponse = {
    "item": {
      "Discussions": [
        {
          "Identity": {
            "Id": "196609"
          },
          "Discussion": {
            "DiscussionType": 0,
            "TopicName": "test",
            "Body": "test 2",
            "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
            "PostedDateTime": "2024-08-07T07:47:09Z"
          }
        },
        {
          "Identity": {
            "Id": "196609"
          },
          "Discussion": {
            "DiscussionType": 0,
            "TopicName": "Test 3",
            "Body": "Test 3",
            "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
            "PostedDateTime": "2024-08-07T07:50:34Z"
          }
        },
        {
          "Identity": {
            "Id": "196609"
          },
          "Discussion": {
            "DiscussionType": 1,
            "TopicName": null,
            "Body": "Test 3 Response",
            "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
            "PostedDateTime": "2024-08-07T07:51:21Z"
          }
        }
      ]
    }
  };

  parseDiscussions(jsonResponse);
};

// Call the fetch function on component mount
fetchDiscussions();

const sendMessage = async () => {
  if (newMessage.value.trim() !== '' && newTopic.value.trim() !== '') {
    const newDiscussion = {
      Discussion: {
        TopicName: newTopic.value,
        Body: newMessage.value,
      }
    };

    discussionsList.value.push(newDiscussion);

    const payload = [{
      operationType: "Create",
      parentItemId: targetEntityId.value + "." + props.caseId,
      relationName: "Discussions",
      template: null,
      item: newDiscussion,
      targetEntityId: targetEntityId.value,
      targetEntityContainerVersionId: containerVersionId.value,
    }];

    await saveMessage(payload);
  }
};

const saveMessage = async (payload) => {
  try {
    loading.value = true;
    await apiService.saveMessage(payload);
    successMessage('Your message has been sent.');
  } catch (error) {
    errorMessage('Failed to save message.');
    console.error('Error saving message:', error);
  } finally {
    loading.value = false;
    newTopic.value = '';
    newMessage.value = '';
  }
};
</script>

<style scoped>
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

.scrollable-messages {
  max-height: 300px;
  overflow-y: auto;
}

.light-border {
  border: 1px solid #e0e0e0;
}
</style>
