<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title class="blue-header-1 d-flex justify-space-between">
      <span>SECURE MESSAGES</span>
      <span v-if="messagesLoading" class="loader"></span>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!messagesLoading"
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
                   style="border-bottom: 1px solid lightgray; overflow-x: hidden;">
        <v-expansion-panels accordion :model-value="expandedPanels">
          <v-expansion-panel
            v-for="(message, index) in topLevelMessages"
            :key="index"
            elevation="0"
          >
            <!-- Parent Message -->
            <v-expansion-panel-title class="py-2 px-2 pr-2" :hide-actions="!hasReplies(message.Id)"
                                     :readonly="!hasReplies(message.Id)">
              <div class="message">
                <div class="message-content" style="display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1;">
                  <strong class="pb-1" style="word-wrap: break-word; overflow-wrap: break-word;">{{ message.TopicName || 'No Topic' }}</strong>
                  <p class="mt-1" style="word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">{{ message.Body }}</p>
                  <div class="message-info">
                    <span class="author-name">
                      {{ (message.Author !== 'null' && message.Author) || 'Case Officer' }}
                    </span>
                    <span class="dot-separator">•</span>
                    <span class="timestamp">{{ formatDate(message.PostedDateTime) }}</span>
                  </div>
                </div>
                <!-- Message Actions -->
                <div class="message-actions" style="flex-shrink: 0;">
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
                    v-if="!hasReplies(message.Id) && canDeleteMessage(message)"
                    icon
                    variant="text"
                    small
                    color="red"
                    @click.stop="showDeleteConfirm(message.TargetItemId)"
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
                  :style="{ marginLeft: '10px' }"
                >
                  <MessageReply
                    :reply="reply"
                    :get-replies="getReplies"
                    :has-replies="hasReplies"
                    :format-date="formatDate"
                    :depth="0"
                    @reply="initReply"
                    @delete="showDeleteConfirm"
                  />
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
          <v-btn class="no-uppercase" variant="outlined" @click="cancelReply">
            Cancel
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>

    <!-- New Message Input -->
    <v-card-actions v-else-if="isExpanded" class="px-5 pt-5">
      <v-row class="w-100">
        <v-col v-if="!showNewMessageForm" cols="12" class="text-right">
          <v-btn
            :color="COLORS.PRIMARY"
            @click="showNewMessageForm = true"
            variant="flat"
            class="no-uppercase"
          >
            Create Message
          </v-btn>
        </v-col>

        <!-- New Message Form -->
        <template v-if="showNewMessageForm">
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
            <v-btn
              class="ml-2 no-uppercase"
              color="#003058"
              variant="outlined"
              @click="cancelNewMessage"
            >
              Cancel
            </v-btn>
          </v-col>
        </template>
      </v-row>
    </v-card-actions>

    <ConfirmDialog
      v-model="confirmMessageDeleteDialog"
      heading="Delete Message"
      message="Are you sure you want to delete this message?"
      sub-message="This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-color="error"
      @confirm="handleDeleteConfirm"
    />
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { COLORS } from '@/styles/colors';
import { getApiService } from '@/services/api.service'
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";

const apiService = getApiService()
import { errorMessage, successMessage } from '@/utils/message';
import { formatDate } from '../utils/common';
import { consoleError } from '@/utils/logger';
import { useAuthStore } from "@/store/authStore";
import MessageReply from "@/components/MessageReply.vue";

const props = defineProps({
  caseId: {
    type: Number,
    default: 196609,
  },
  ready: {
    type: Boolean,
    default: false,
  },
});

const loading = ref(false);
const messagesLoading = ref(false);
const discussionsList = ref([]);
const replyTo = ref(null);
const newTopic = ref('');
const newMessage = ref('');
const newReplyTopic = ref('');
const newReplyMessage = ref('');
const userStore = useAuthStore();
const isExpanded = ref(true);
const showNewMessageForm = ref(false);
const expandedPanels = ref([]);
const confirmMessageDeleteDialog = ref(false);
const messageToDelete = ref(null);

const canFetchMessages = computed(() => {
  return props.ready && userStore.businessWorkspaceObjectId;
});

const topLevelMessages = computed(() =>
  discussionsList.value.filter((d) => !d.ParentId)
);

const hasReplies = (id) => {
  if (!id) return false;
  return discussionsList.value.some((d) => d.ParentId === id);
};

const getReplies = (parentId) => {
  if (!parentId) return [];
  // Add a check to prevent replies appearing in their own thread
  return discussionsList.value.filter((d) => {
    if (d.ParentId !== parentId) return false;

    let currentId = parentId;
    let visited = new Set([d.Id]);

    while (currentId) {
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      currentId = discussionsList.value.find(m => m.Id === currentId)?.ParentId;
    }

    return true;
  });
};

const parseDiscussions = (response) => {
  if (response && response.MessageList) {
    discussionsList.value = response.MessageList.map((message) => ({
      Id: message.Id,
      ParentId: message.ParentId !== 'null' ? message.ParentId : null,
      DiscussionType: message.DiscussionType,
      TopicName: message.TopicName !== 'null' ? message.TopicName : 'No Topic',
      Body: message.Body,
      AuthorEmail: extractEmail(message.Author),
      Author: message.Author,
      PostedDateTime: message.PostedDateTime,
      HasChildren: message.HasChildren === 'true',
      TargetItemId: message.TargetItemId,
    }));

    // Auto-expand panels that have replies
    expandedPanels.value = discussionsList.value
      .filter(msg => !msg.ParentId && hasReplies(msg.Id))
      .map((msg, index) => index);
  } else {
    discussionsList.value = [];
    expandedPanels.value = [];
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
  showNewMessageForm.value = true;
};

const cancelReply = () => {
  replyTo.value = null;
  newReplyTopic.value = '';
  newReplyMessage.value = '';
  showNewMessageForm.value = false;
};

const cancelNewMessage = () => {
  showNewMessageForm.value = false;
  newMessage.value = '';
  newTopic.value = '';
};

const showDeleteConfirm = (targetItemId) => {
  messageToDelete.value = targetItemId;
  confirmMessageDeleteDialog.value = true;
};

const canDeleteMessage = (message) => {
  if (!message.Author || message.Author === 'null' || message.Author.trim() === '') {
    return false;
  }
  return true;
};

const handleDeleteConfirm = async () => {
  if (messageToDelete.value) {
    await performMessageDelete(messageToDelete.value);
    messageToDelete.value = null;
  }
};

const performMessageDelete = async (targetItemId) => {
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

const saveMessage = async (body, topicName = null, isReply = false, parentId = null) => {
  const payload = {
    operationType: 'Create',
    parentItemId: userStore.businessWorkspaceObjectId,
    relationName: 'Discussions',
    template: null,
    item: {
      Discussion: {
        Body: body,
        ...(topicName ? { TopicName: topicName } : {}),
      },
      ...(isReply ? { DisplayOrganization: { ParentId: parentId } } : {}),
    },
    targetEntityId: userStore.targetEntityId,
    targetEntityContainerVersionId: userStore.containerVersionId,
  };

  // Log the request payload
  console.log('[SecureMessages] Sending message/reply:', {
    isReply,
    parentId,
    payload,
    timestamp: new Date().toISOString()
  });

  try {
    loading.value = true;

    const response = isReply
      ? await apiService.replyMessage(payload)
      : await apiService.createMessage(payload);

    // Log the full response
    console.log('[SecureMessages] Response received:', {
      isReply,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      timestamp: new Date().toISOString()
    });

    const itemId = isReply
      ? response.data.ReplyResponse.items[0].itemId
      : response.data.CreationResponse.items[0].itemId;

    if (response.status === 200) {
      const senderPayload = [{
        containerVersionId: userStore.containerVersionId,
        itemId: itemId,
        operationType: "Update",
        item: {
          Properties: {
            externalUser: userStore.username
          }
        },
        originalItem: {
          Properties: {
            externalUser: null
          }
        },
        rulesRunOnClient: ""
      }];

      // Log the sender update payload
      console.log('[SecureMessages] Updating message sender:', {
        senderPayload,
        timestamp: new Date().toISOString()
      });

      try {
        const senderResponse = await apiService.addMessageSender(senderPayload);
        console.log('[SecureMessages] Sender update response:', {
          status: senderResponse.status,
          data: senderResponse.data,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('[SecureMessages] Error updating message sender:', {
          error: err,
          message: err.message,
          response: err.response,
          timestamp: new Date().toISOString()
        });
      }

      successMessage(isReply ? 'Reply sent successfully.' : 'Message sent successfully.');

      console.log('[SecureMessages] Fetching updated discussions');
      await fetchDiscussions();
    } else {
      console.error('[SecureMessages] Message send failed - unexpected status:', {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      errorMessage(isReply ? 'Failed to send the reply.' : 'Failed to send the message.');
    }
  } catch (err) {
    console.error('[SecureMessages] Exception caught in saveMessage:', {
      error: err,
      message: err.message,
      stack: err.stack,
      response: err.response?.data,
      status: err.response?.status,
      isReply,
      timestamp: new Date().toISOString()
    });

    errorMessage(isReply ? 'Failed to send reply.' : 'Failed to send message.');
  } finally {
    loading.value = false;
    console.log('[SecureMessages] Save message completed:', {
      isReply,
      timestamp: new Date().toISOString()
    });
  }
};

const sendMessage = async () => {
  if (newMessage.value.trim() !== '' && newTopic.value.trim() !== '') {
    await saveMessage(newMessage.value, newTopic.value);
    newMessage.value = '';
    newTopic.value = '';
    showNewMessageForm.value = false;
  }
};

const sendReply = async () => {
  if (newReplyMessage.value.trim() !== '') {
    await saveMessage(newReplyMessage.value, null, true, replyTo.value.Id);
    newReplyMessage.value = '';
    newReplyTopic.value = '';
    replyTo.value = null;
    showNewMessageForm.value = false;
  }
};

const fetchDiscussions = async () => {
  try {
    messagesLoading.value = true;
    const response = await apiService.fetchCaseMessages(userStore.businessWorkspaceObjectId);
    const responseBody = response.data;
    parseDiscussions(responseBody);
    userStore.setTargetEntityId(responseBody.TargetEntityId);
    userStore.setContainerVersionId(responseBody.ContainerVerisonId);
  } catch (err) {
    consoleError(err);
    errorMessage('Failed to fetch discussions.');
  } finally {
    messagesLoading.value = false;
  }
};

// Initialize component state
onMounted(() => {
  discussionsList.value = [];
  replyTo.value = null;
  newTopic.value = '';
  newMessage.value = '';
  newReplyTopic.value = '';
  newReplyMessage.value = '';
  showNewMessageForm.value = false;
});

watch(
  canFetchMessages,
  async (canFetch) => {
    if (canFetch) {
      await fetchDiscussions();
    }
  },
  { immediate: true }
);
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
  color: gray;
}

.scrollable-messages {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.reply-preview {
  background-color: #f0f0f0;
  padding: 3px 10px 10px;
  border-left: 3px solid #ccc;
  position: relative;
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

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

.author-name {
  font-weight: 500;
  color: #003058;
}

.dot-separator {
  font-size: 0.7rem;
  color: #999;
}

.timestamp {
  color: #666;
}
</style>
