<template>
  <v-card class="light-border elevation-10 pa-2">
    <v-card-title>SECURE MESSAGES</v-card-title>
    <v-card-text class="scrollable-messages mx-1" ref="messageContainer" style="border-bottom: 1px solid lightgray;">
      <v-expansion-panels accordion>
        <v-expansion-panel
          v-for="(message, index) in topLevelMessages"
          :key="index"
          elevation="0"
        >
          <v-expansion-panel-title class="py-2 px-2 pr-2" :hide-actions="!hasReplies(message.Identity.Id1)"
                                   :readonly="!hasReplies(message.Identity.Id1)">
            <!-- Parent Message -->
            <div class="message">
              <div class="message-content" style="display: flex; flex-direction: column; gap: 4px">
                <strong class="pb-1">{{ message.Discussion.TopicName || 'No Topic' }}</strong>
                <p class="mt-1">{{ message.Discussion.Body }}</p>
                <span class="pt-1">{{ formatDate(message.Discussion.PostedDateTime) }}</span>
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
                  @click.stop="deleteMessage(message.Identity.Id1)"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </div>
          </v-expansion-panel-title>
          <!-- Replies -->
          <v-expansion-panel-text v-if="hasReplies(message.Identity.Id1)">
            <v-row class="replies">
              <v-col
                cols="12"
                v-for="(reply, idx) in getReplies(message.Identity.Id1)"
                :key="idx"
                class="reply-message"
              >
                <div class="message">
                  <div class="message-content">
                    <p>{{ reply.Discussion.Body }}</p>
                    <span>{{ formatDate(reply.Discussion.PostedDateTime) }}</span>
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
                      @click.stop="deleteMessage(reply.Identity.Id1)"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <!-- Reply Input -->
    <v-card-actions v-if="replyTo">
      <v-row class="w-100">
        <v-col cols="12">
          <div class="reply-preview">
            <v-btn icon size="small" class="position-absolute" style="right: 15px" @click="cancelReply">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <p class="pt-2">Replying to:</p>
            <div class="reply-preview-message">
              <strong>{{ replyTo.Discussion.TopicName || 'No Topic' }}</strong>
              <p>{{ replyTo.Discussion.Body }}</p>
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
            :disabled="!newReplyMessage || !newReplyTopic"
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
    <v-card-actions v-else class="px-5 pt-5">
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
const currentUserEmail = ref('cyangateuser1@Appworks.Users');

const targetEntityId = ref('12A62609423FA1EF920A1EEAC692847A');
const containerVersionId = ref('56c3c2d807c036d884c120bb40ef5c17');

const topLevelMessages = computed(() =>
  discussionsList.value.filter((d) => !d.Identity.ParentId)
);
const hasReplies = (id) =>
  discussionsList.value.some((d) => d.Identity.ParentId === id);
const getReplies = (parentId) =>
  discussionsList.value.filter((d) => d.Identity.ParentId === parentId);

const parseDiscussions = (response) => {
  if (response && response.item && response.item.Discussions) {
    discussionsList.value = response.item.Discussions.map((discussion) => ({
      Identity: {
        Id1: discussion.Identity.Id,
        ParentId: discussion.Identity.ParentId || null,
      },
      Discussion: {
        ...discussion.Discussion,
        AuthorEmail: extractEmail(discussion.Discussion.Author),
      },
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
  newReplyTopic.value = message.Discussion.TopicName
    ? message.Discussion.TopicName
    : '';
};

const cancelReply = () => {
  replyTo.value = null;
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

  const payload = [
    {
      operationType: 'Create',
      parentItemId: parentItemId,
      relationName: 'Discussions',
      template: null,
      item: {
        Discussion: {
          DiscussionType: message.Discussion.DiscussionType,
          TopicName: message.Discussion.TopicName,
          Body: message.Discussion.Body,
        },
      },
      targetEntityId: targetEntityId.value,
      targetEntityContainerVersionId: containerVersionId.value,
    },
  ];

  try {
    loading.value = true;
    const response = await apiService.saveMessage(payload);
    if (response.status === 200) {
      successMessage(
        isReply ? 'Reply sent successfully.' : 'Message sent successfully.'
      );
    } else {
      errorMessage(
        isReply ? 'Failed to send the reply.' : 'Failed to send the message.'
      );
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
    const newDiscussion = {
      Identity: {
        Id1: Date.now().toString(),
      },
      Discussion: {
        DiscussionType: 0,
        TopicName: newTopic.value,
        Body: newMessage.value,
        Author: `${currentUserEmail.value},:userIdValue:${currentUserEmail.value}`,
        AuthorEmail: currentUserEmail.value,
        PostedDateTime: new Date().toISOString(),
      },
    };

    discussionsList.value.push(newDiscussion);
    await saveMessage(newDiscussion);

    newMessage.value = '';
    newTopic.value = '';
  }
};

const sendReply = async () => {
  if (
    newReplyMessage.value.trim() !== '' &&
    newReplyTopic.value.trim() !== ''
  ) {
    const newDiscussion = {
      Identity: {
        Id1: Date.now().toString(),
        ParentId: replyTo.value.Identity.Id1,
      },
      Discussion: {
        DiscussionType: 1,
        TopicName: newReplyTopic.value,
        Body: newReplyMessage.value,
        Author: `${currentUserEmail.value},:userIdValue:${currentUserEmail.value}`,
        AuthorEmail: currentUserEmail.value,
        PostedDateTime: new Date().toISOString(),
      },
    };

    discussionsList.value.push(newDiscussion);
    await saveMessage(newDiscussion, true, replyTo.value.Identity.Id1);

    newReplyMessage.value = '';
    newReplyTopic.value = '';
    replyTo.value = null;
  }
};

const deleteMessage = async (messageId) => {
  const payload = [
    {
      parentItemId: `${targetEntityId.value}.${props.caseId}.${messageId}`,
    },
  ];

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

const fallbackDiscussions = {
  item: {
    Discussions: [
      {
        Identity: {
          Id: '196609',
        },
        Discussion: {
          DiscussionType: 0,
          TopicName: 'First Message',
          Body: 'This is the first message.',
          Author:
            'cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users',
          PostedDateTime: '2024-08-07T07:47:09Z',
        },
      },
      {
        Identity: {
          Id: '196610',
        },
        Discussion: {
          DiscussionType: 0,
          TopicName: 'Second Message',
          Body: 'This is the second message.',
          Author:
            'anotheruser@Appworks.Users,:userIdValue:anotheruser@Appworks.Users',
          PostedDateTime: '2024-08-07T07:50:34Z',
        },
      },
      {
        Identity: {
          Id: '196611',
          ParentId: '196610',
        },
        Discussion: {
          DiscussionType: 1,
          TopicName: 'Re: Second Message',
          Body: 'This is a reply to the second message.',
          Author:
            'cyangateuser1@Appworks.Users,:userIdValue:cyangateuser1@Appworks.Users',
          PostedDateTime: '2024-08-07T07:51:21Z',
        },
      },
    ],
  },
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
  max-height: 500px;
  overflow-y: auto;
}

.light-border {
  border: 1px solid #e0e0e0;
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
