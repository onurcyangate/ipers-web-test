<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title class="blue-header-1 d-flex justify-space-between">
      <span>SECURE MESSAGES</span>
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
      <v-card-text v-if="isExpanded" class="scrollable-messages mx-1" ref="messageContainer"
                   style="border-bottom: 1px solid lightgray;">
        <v-expansion-panels accordion>
          <v-expansion-panel
            v-for="(message, index) in topLevelMessages"
            :key="index"
            elevation="0"
          >
            <v-expansion-panel-title class="py-2 px-2 pr-2" :hide-actions="!hasReplies(message.Id)"
                                     :readonly="!hasReplies(message.Id)">
              <!-- Parent Message -->
              <div class="message">
                <div class="message-content" style="display: flex; flex-direction: column; gap: 4px">
                  <strong class="pb-1">{{ message.TopicName || 'No Topic' }}</strong>
                  <p class="mt-1">{{ message.Body }}</p>
                  <span class="pt-1">{{ formatDate(message.PostedDateTime) }}</span>
                </div>
                <!-- Message Actions -->
                <div class="message-actions">
                  <v-btn
                    icon
                    small
                    variant="text"
                    @click.stop="initReply(message)"
                    style="margin-right: -10px"
                  >
                    <v-icon>mdi-reply</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    small
                    color="red"
                    @click.stop="deleteMessage(message.TargetItemId)"
                  >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-title>
            <!-- Replies -->
            <v-expansion-panel-text v-if="hasReplies(message.Id)">
              <v-row class="replies">
                <v-col
                  cols="12"
                  v-for="(reply, idx) in getReplies(message.Id)"
                  :key="idx"
                  class="reply-message"
                >
                  <div class="message">
                    <div class="message-content">
                      <p>{{ reply.Body }}</p>
                      <span>{{ formatDate(reply.PostedDateTime) }}</span>
                    </div>
                    <!-- Message Actions -->
                    <div class="message-actions">
                      <v-btn
                        icon
                        small
                        variant="text"
                        @click.stop="initReply(reply)"
                        style="margin-right: -10px"
                      >
                        <v-icon>mdi-reply</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        small
                        color="red"
                        @click.stop="deleteMessage(reply.Id)"
                      >
                        <v-icon>mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <!-- Nested replies -->
                  <v-row class="nested-replies" v-if="hasReplies(reply.Id)">
                    <v-col
                      cols="12"
                      v-for="(subReply, subIdx) in getReplies(reply.Id)"
                      :key="subIdx"
                      class="reply-message"
                    >
                      <div class="message">
                        <div class="message-content">
                          <p>{{ subReply.Body }}</p>
                          <span>{{ formatDate(subReply.PostedDateTime) }}</span>
                        </div>
                        <div class="message-actions">
                          <v-btn
                            icon
                            small
                            variant="text"
                            @click.stop="initReply(subReply)"
                            style="margin-right: -10px"
                          >
                            <v-icon>mdi-reply</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            small
                            color="red"
                            @click.stop="deleteMessage(subReply.Id)"
                          >
                            <v-icon>mdi-trash-can-outline</v-icon>
                          </v-btn>
                        </div>
                      </div>
                      <v-row class="nested-replies" v-if="hasReplies(subReply.Id)">
                        <v-col
                          cols="12"
                          v-for="(subSubReply, subSubIdx) in getReplies(subReply.Id)"
                          :key="subSubIdx"
                          class="reply-message"
                        >
                          <div class="message">
                            <div class="message-content">
                              <p>{{ subSubReply.Body }}</p>
                              <span>{{ formatDate(subSubReply.PostedDateTime) }}</span>
                            </div>
                            <div class="message-actions">
                              <v-btn
                                icon
                                small
                                variant="text"
                                @click.stop="initReply(subSubReply)"
                                style="margin-right: -10px"
                              >
                                <v-icon>mdi-reply</v-icon>
                              </v-btn>
                              <v-btn
                                icon
                                variant="text"
                                small
                                color="red"
                                @click.stop="deleteMessage(subSubReply.Id)"
                              >
                                <v-icon>mdi-trash-can-outline</v-icon>
                              </v-btn>
                            </div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-expand-transition>

    <!-- Reply Input -->
    <v-card-actions v-if="replyTo && isExpanded">
      <v-row class="w-100">
        <v-col cols="12">
          <div class="reply-preview">
            <v-btn icon size="small" class="position-absolute" style="right: 15px" @click="cancelReply">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <p class="pt-2">Replying to:</p>
            <div class="reply-preview-message">
              <strong>{{ replyTo.TopicName || 'No Topic' }}</strong>
              <p>{{ replyTo.Body }}</p>
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="newReplyMessage"
            label="Reply Message"
            variant="outlined"
            row-height="15"
            rows="2"
            class="mt-1"
            :style="{ width: '100%' }"
          ></v-textarea>
        </v-col>
        <v-col cols="12" class="text-right">
          <v-btn
            :color="COLORS.PRIMARY"
            @click="sendReply"
            variant="flat"
            class="no-uppercase"
            :disabled="!newReplyMessage"
          >
            Send Reply
          </v-btn>
          <v-btn variant="text" @click="cancelReply">
            Cancel
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>

    <!-- New Message Input -->
    <v-card-actions v-else-if="isExpanded" class="px-5 pt-5">
      <v-row class="w-100">
        <v-col cols="12">
          <v-text-field
            v-model="newTopic"
            label="Subject"
            variant="outlined"
            density="compact"
            class="mt-1"
            style="width: 100%; margin-bottom: -10px"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="newMessage"
            label="Message"
            variant="outlined"
            rows="3"
            style="width: 100%;"
          ></v-textarea>
        </v-col>
        <v-col cols="12" class="text-right">
          <v-btn
            :color="COLORS.PRIMARY"
            @click="sendMessage"
            variant="flat"
            class="no-uppercase"
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
import {COLORS} from '@/styles/colors';
import apiService from '@/services/api.service';
import {errorMessage, successMessage} from '@/utils/message';
import {formatDate} from '../utils/common';
import {consoleError} from '@/utils/logger';
import {useAuthStore} from "@/store/authStore";

const props = defineProps({
  caseId: {
    type: Number,
    default: 196609,
  },
});

const loading = ref(false);
const discussionsList = ref([]);
const replyTo = ref(null);
const newTopic = ref('');
const newMessage = ref('');
const newReplyTopic = ref('');
const newReplyMessage = ref('');
const userStore = useAuthStore();
const isExpanded = ref(true);

const topLevelMessages = computed(() =>
  discussionsList.value.filter((d) => !d.ParentId)
);
const hasReplies = (id) =>
  discussionsList.value.some((d) => d.ParentId === id);
const getReplies = (parentId) =>
  discussionsList.value.filter((d) => d.ParentId === parentId);

const parseDiscussions = (response) => {
  if (response && response.MessageList) {
    discussionsList.value = response.MessageList.map((message) => ({
      Id: message.Id,
      ParentId: message.ParentId !== 'null' ? message.ParentId : null,
      DiscussionType: message.DiscussionType,
      TopicName: message.TopicName !== 'null' ? message.TopicName : 'No Topic',
      Body: message.Body,
      AuthorEmail: extractEmail(message.Author),
      PostedDateTime: message.PostedDateTime,
      HasChildren: message.HasChildren === 'true',
      TargetItemId: message.TargetItemId,
    }));
  } else {
    discussionsList.value = [];
  }
};

const extractEmail = (authorField) => {
  return authorField.split(',')[0];
};

const initReply = (message) => {
  replyTo.value = message;
  newReplyTopic.value = message.Discussion?.TopicName
    ? message.Discussion.TopicName
    : '';
};

const cancelReply = () => {
  replyTo.value = null;
  newReplyTopic.value = '';
  newReplyMessage.value = '';
};

const saveMessage = async (body, topicName = null, isReply = false, parentId = null) => {
  const payload = {
    operationType: 'Create',
    parentItemId: userStore.businessWorkspaceObjectId,
    relationName: 'Discussions',
    template: null,
    item: {
      Discussion: {
        Body: body,
        ...(topicName ? {TopicName: topicName} : {}),
      },
      ...(isReply ? {DisplayOrganization: {ParentId: parentId}} : {}),
    },
    targetEntityId: userStore.targetEntityId,
    targetEntityContainerVersionId: userStore.containerVersionId,
  };

  try {
    loading.value = true;

    const response = isReply
      ? await apiService.replyMessage(payload)
      : await apiService.createMessage(payload);

    if (response.status === 200) {
      successMessage(isReply ? 'Reply sent successfully.' : 'Message sent successfully.');
      await fetchDiscussions();
    } else {
      errorMessage(isReply ? 'Failed to send the reply.' : 'Failed to send the message.');
    }
  } catch (err) {
    consoleError(err);
    errorMessage(isReply ? 'Failed to send reply.' : 'Failed to send message.');
  } finally {
    loading.value = false;
  }
};

const sendMessage = async () => {
  if (newMessage.value.trim() !== '' && newTopic.value.trim() !== '') {
    await saveMessage(newMessage.value, newTopic.value);

    newMessage.value = '';
    newTopic.value = '';
  }
};

const sendReply = async () => {
  if (newReplyMessage.value.trim() !== '') {
    await saveMessage(newReplyMessage.value, null, true, replyTo.value.Id);

    newReplyMessage.value = '';
    newReplyTopic.value = '';
    replyTo.value = null;
  }
};

const deleteMessage = async (targetItemId) => {

  const payload = [{
    deleteTarget: true,
    itemId: userStore.businessWorkspaceObjectId,
    operationType: 'delete',
    relationName: 'Discussions',
    targetItemId: targetItemId,
  }];

  try {
    loading.value = true;
    await apiService.deleteMessage(payload);
    successMessage('Message deleted successfully.');
    await fetchDiscussions();
  } catch (err) {
    consoleError('Error deleting message: ', err);
    errorMessage('Failed to delete message.');
  } finally {
    loading.value = false;
  }
};


const fetchDiscussions = async () => {
  try {
    loading.value = true;
    const response = await apiService.fetchCaseMessages(userStore.businessWorkspaceObjectId);
    const responseBody = response.data
    parseDiscussions(responseBody);
    userStore.setTargetEntityId(responseBody.TargetEntityId)
    userStore.setContainerVersionId(responseBody.ContainerVerisonId)
    // parseDiscussions(fallbackDiscussions);
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch discussions.');
  } finally {
    loading.value = false;
  }
};

const fallbackDiscussions = {
  "Status": 200,
  "Message": "Messages listed.",
  "TargetEntityId": "12A62609423FA1EF920A1EEAC692847A",
  "ContainerVerisonId": "56c3c2d807c036d884c120bb40ef5c17",
  "MessageList": [
    {
      "Id": "131077",
      "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
      "PostedDateTime": "2024-09-19T13:04:19Z",
      "DiscussionType": 0,
      "TopicName": "1st",
      "Body": "1st",
      "HasChildren": "true",
      "ParentId": "null"
    },
    {
      "Id": "131078",
      "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
      "PostedDateTime": "2024-09-19T13:04:30Z",
      "DiscussionType": 1,
      "TopicName": "null",
      "Body": "1st 1st response",
      "HasChildren": "true",
      "ParentId": "131077"
    },
    {
      "Id": "131079",
      "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
      "PostedDateTime": "2024-09-19T13:04:47Z",
      "DiscussionType": 1,
      "TopicName": "null",
      "Body": "1st 1st 1st response",
      "HasChildren": "true",
      "ParentId": "131078"
    },
    {
      "Id": "131080",
      "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
      "PostedDateTime": "2024-09-19T13:05:01Z",
      "DiscussionType": 1,
      "TopicName": "null",
      "Body": "1st 2nd response",
      "HasChildren": "false",
      "ParentId": "131077"
    },
    {
      "Id": "147465",
      "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
      "PostedDateTime": "2024-09-26T06:42:55Z",
      "DiscussionType": 1,
      "TopicName": "null",
      "Body": "test 4563",
      "HasChildren": "true",
      "ParentId": "131079"
    },
    {
      "Id": "147469",
      "Author": "cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users",
      "PostedDateTime": "2024-09-30T06:29:04Z",
      "DiscussionType": 1,
      "TopicName": "null",
      "Body": "test123",
      "HasChildren": "false",
      "ParentId": "147465"
    }
  ]
};

onMounted(() => {
  fetchDiscussions();
});
</script>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px 0;
  flex-grow: 1;
}

.message-content {
  flex-grow: 1;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-top: 5px;
  padding-right: 5px;
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

.reply-preview {
  background-color: #f0f0f0;
  padding: 3px 10px 10px;
  border-left: 3px solid #ccc;
}

.reply-preview-message {
  margin-left: 10px;
}

.replies {
  padding-left: 20px;
}

.v-expansion-panel-title {
  padding: 0;
}

.v-expansion-panel-text {
  padding: 0 0 0 16px;
}

.reply-message .message {
  border-bottom: none;
}
</style>
