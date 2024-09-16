<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title>SECURE MESSAGES</v-card-title>
    <v-card-text class="scrollable-messages">
      <v-row>
        <v-col cols="12" v-for="(discussion, index) in topLevelMessages" :key="index">
          <div class="message d-flex justify-space-between">
            <div>
              <strong>{{ discussion.Discussion.TopicName || 'No Topic' }}</strong>
              <span>{{ formatDate(discussion.Discussion.PostedDateTime) }}</span>
              <p>{{ discussion.Discussion.Body }}</p>
            </div>
            <div class="message-actions">
              <v-btn icon small variant="text" @click="initReply(discussion.Identity.Id1)" style="margin-right: -10px">
                <v-icon>mdi-reply</v-icon>
              </v-btn>
              <v-btn icon variant="text" small color="red" @click="deleteMessage(discussion.Identity.Id1)">
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-btn>
            </div>
          </div>

          <div v-if="hasReplies(discussion.Identity.Id1)" class="replies">
            <v-col cols="12" v-for="(reply, idx) in getReplies(discussion.Identity.Id1)" :key="idx"
                   class="reply-message d-flex justify-space-between">
              <div>
                <strong>{{ reply.Discussion.TopicName || 'No Topic' }}</strong>
                <span>{{ formatDate(reply.Discussion.PostedDateTime) }}</span>
                <p>{{ reply.Discussion.Body }}</p>
              </div>
              <div class="message-actions">
                <v-btn variant="text" icon small color="red" @click="deleteMessage(reply.Identity.Id1)">
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </v-col>
          </div>

          <v-row v-if="replyTo === discussion.Identity.Id1">
            <v-col cols="12">
              <v-text-field
                v-model="newReplyTopic"
                label="Reply Topic"
                variant="outlined"
                density="compact"
                class="mt-1"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="newReplyMessage"
                label="Reply Body"
                variant="outlined"
                row-height="15"
                rows="2"
                class="mt-1"
              ></v-textarea>
            </v-col>
            <v-col cols="12" class="text-right">
              <v-btn
                :color="COLORS.PRIMARY"
                @click="sendReply(discussion.Identity.Id1)"
                variant="flat"
                class="no-uppercase"
                :disabled="!newReplyMessage || !newReplyTopic"
              >
                Send Reply
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions v-if="!replyTo">
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
import {ref, computed, onMounted} from 'vue';
import {COLORS} from "@/styles/colors";
import apiService from '@/services/api.service';
import {errorMessage, successMessage} from "@/utils/message";
import {formatDate} from "../utils/common";
import {consoleError} from "@/utils/logger";

const props = defineProps({
  caseId: {
    type: Number,
    default: 196609
  }
});

const loading = ref(false);
const discussionsList = ref([]);
const replyTo = ref(null);
const newTopic = ref('');
const newMessage = ref('');
const newReplyTopic = ref('');
const newReplyMessage = ref('');

const targetEntityId = ref("12A62609423FA1EF920A1EEAC692847A");
const containerVersionId = ref("56c3c2d807c036d884c120bb40ef5c17");

const topLevelMessages = computed(() => discussionsList.value.filter(d => !d.Identity.ParentId));
const hasReplies = (id) => discussionsList.value.some(d => d.Identity.ParentId === id);
const getReplies = (parentId) => discussionsList.value.filter(d => d.Identity.ParentId === parentId);

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

const fallbackDiscussions = {
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
}

const fetchDiscussions = async () => {
  try {
    loading.value = true;
    // const response = await apiService.fetchDiscussions(targetEntityId.value, props.caseId);
    parseDiscussions(fallbackDiscussions);
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch discussions, showing fallback data.');
    parseDiscussions(fallbackDiscussions);
  } finally {
    loading.value = false;
  }
};

const initReply = (messageId) => {
  replyTo.value = messageId;
  newReplyTopic.value = '';
  newReplyMessage.value = '';
};

const saveMessage = async (message, isReply = false, parentId = null) => {
  let parentItemId;

  if (isReply && parentId) {
    parentItemId = `${targetEntityId.value}.${props.caseId}.${parentId}`;
  } else {
    parentItemId = `${targetEntityId.value}.${props.caseId}`;
  }

  const payload = [{
    operationType: "Create",
    parentItemId: parentItemId,
    relationName: "Discussions",
    template: null,
    item: message,
    targetEntityId: targetEntityId.value,
    targetEntityContainerVersionId: containerVersionId.value,
  }];

  try {
    loading.value = true;
    const response = await apiService.saveMessage(payload);
    if (response.status === 200) {
      successMessage(isReply ? 'Reply sent successfully.' : 'Message sent successfully.');
    } else {
      errorMessage(isReply ? 'Failed to send the reply.' : 'Failed to send the message.');
    }
  } catch (err) {
    consoleError(err);
    errorMessage(isReply ? 'Failed to send reply.' : 'Failed to send message.');
  } finally {
    loading.value = false;
    newTopic.value = '';
    newMessage.value = '';
    replyTo.value = null;
    newReplyTopic.value = '';
    newReplyMessage.value = '';
  }
};

const sendMessage = async () => {
  if (newMessage.value.trim() !== '' && newTopic.value.trim() !== '') {
    const newDiscussion = {
      Discussion: {
        TopicName: newTopic.value,
        Body: newMessage.value,
      }
    };

    discussionsList.value.push(newDiscussion);
    await saveMessage(newDiscussion);
  }
};

const sendReply = async (parentId) => {
  if (newReplyMessage.value.trim() !== '' && newReplyTopic.value.trim() !== '') {
    const newReply = {
      Identity: {ParentId: parentId},
      Discussion: {
        TopicName: newReplyTopic.value,
        Body: newReplyMessage.value,
      }
    };

    discussionsList.value.push(newReply);
    await saveMessage(newReply, true, parentId);
  }
};

const deleteMessage = async (messageId) => {
  discussionsList.value = discussionsList.value.filter(d => d.Identity.Id1 !== messageId);

  const payload = [{
    parentItemId: `${targetEntityId.value}.${props.caseId}.${messageId}`,
  }];

  try {
    loading.value = true;
    const response = await apiService.deleteMessage(payload);
    if (response.status === 200) {
      successMessage('Message deleted successfully.');
    } else {
      errorMessage('Failed to delete the message.');
    }
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to delete message.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDiscussions();
});
</script>

<style scoped>
.message {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reply-message {
  padding-left: 20px;
  margin-left: 20px;
  border-left: 1px solid #ccc;
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
