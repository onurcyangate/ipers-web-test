<template>
  <div class="reply-container">
    <div class="reply-message">
      <div class="reply-indicator">
        <v-icon size="x-small" color="grey" class="mr-1">mdi-reply</v-icon>
      </div>
      <div class="message">
        <div class="message-content">
          <p class="reply-body">{{ reply.Body }}</p>
          <div class="message-info">
            <span class="author-name">
              {{ (reply.Author !== 'null' && reply.Author) || 'Case Officer' }}
            </span>
            <span class="dot-separator">•</span>
            <span class="timestamp">{{ formatDate(reply.PostedDateTime) }}</span>
          </div>
        </div>
        <div class="message-actions">
          <v-btn
            icon
            small
            variant="text"
            @click.stop="$emit('reply', reply)"
            class="action-btn"
          >
            <v-icon size="small">mdi-reply</v-icon>
          </v-btn>
          <v-btn
            v-if="!hasReplies(reply.Id) && canDeleteReply(reply)"
            icon
            variant="text"
            small
            color="red"
            @click.stop="$emit('delete', reply.TargetItemId)"
            class="action-btn"
          >
            <v-icon size="small">mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Recursive nested replies with depth check -->
    <div
      v-if="hasReplies(reply.Id) && depth < maxDepth"
      class="nested-replies"
      :style="{ marginLeft: `${Math.min(depth + 1, 4) * 12}px` }"
    >
      <div
        v-for="(nestedReply, index) in getReplies(reply.Id)"
        :key="nestedReply.Id"
        class="nested-reply-item"
        :class="{ 'nested-separator': index > 0 }"
      >
        <message-reply
          :reply="nestedReply"
          :get-replies="getReplies"
          :has-replies="hasReplies"
          :format-date="formatDate"
          :depth="depth + 1"
          :max-depth="maxDepth"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "@/utils/common";

defineProps({
  reply: {
    type: Object,
    required: true
  },
  getReplies: {
    type: Function,
    required: true
  },
  hasReplies: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  maxDepth: {
    type: Number,
    default: 5
  }
});

defineEmits(['reply', 'delete']);

const canDeleteReply = (reply) => {
  if (!reply.Author || reply.Author === 'null' || reply.Author.trim() === '') {
    return false;
  }
  return true;
};
</script>

<style scoped>
.reply-container {
  position: relative;
}

.reply-message {
  display: flex;
  align-items: flex-start;
  background-color: rgba(0, 0, 0, 0.01);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  border-left: 2px solid rgba(0, 48, 88, 0.15);
}

.reply-indicator {
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 2px;
}

.message {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-grow: 1;
  min-width: 0;
}

.message-content {
  flex-grow: 1;
  min-width: 0;
}

.reply-body {
  margin: 0 0 8px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  color: #333;
  font-size: 0.95rem;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
  flex-shrink: 0;
}

.action-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
}

.nested-replies {
  margin-top: 8px;
  position: relative;
}

.nested-replies::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(0, 48, 88, 0.1);
}

.nested-reply-item {
  margin: 4px 0;
}

.nested-separator {
  margin-top: 12px !important;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #666;
}

.author-name {
  font-weight: 500;
  color: #003058;
}

.dot-separator {
  font-size: 0.65rem;
  color: #999;
}

.timestamp {
  color: #666;
}
</style>
