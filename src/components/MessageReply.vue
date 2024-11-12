<template>
  <div class="message">
    <div class="message-content">
      <p>{{ reply.Body }}</p>
      <span>{{ formatDate(reply.PostedDateTime) }}</span>
    </div>
    <div class="message-actions">
      <v-btn
        icon
        small
        variant="text"
        @click.stop="$emit('reply', reply)"
        style="margin-right: -10px"
      >
        <v-icon>mdi-reply</v-icon>
      </v-btn>
      <v-btn
        v-if="reply.HasChildren === 'false'"
        icon
        variant="text"
        small
        color="red"
        @click.stop="$emit('delete', reply.TargetItemId)"
      >
        <v-icon>mdi-trash-can-outline</v-icon>
      </v-btn>
    </div>
  </div>

  <!-- Recursive nested replies with depth check -->
  <v-row
    class="nested-replies"
    v-if="hasReplies(reply.Id) && depth < maxDepth"
    :style="{ marginLeft: '10px' }"
  >
    <v-col
      cols="12"
      v-for="nestedReply in getReplies(reply.Id)"
      :key="nestedReply.Id"
      class="reply-message"
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
    </v-col>
  </v-row>
</template>

<script setup>

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
    default: 10
  }
});

defineEmits(['reply', 'delete']);
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

.nested-replies {
  margin-left: 20px;
}
</style>
