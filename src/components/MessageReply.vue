<template>
  <div class="message-reply" :style="{ marginLeft: '10px' }">
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
          @click.stop="initReply(reply)"
          style="margin-right: -10px"
        >
          <v-icon>mdi-reply</v-icon>
        </v-btn>
        <v-btn
          v-if="!hasReplies(reply.Id)"
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

    <v-row v-if="hasReplies(reply.Id)" class="nested-replies">
      <v-col cols="12">
        <MessageReply
          v-for="(nestedReply, nestedIdx) in getReplies(reply.Id)"
          :key="nestedIdx"
          :reply="nestedReply"
          @initReply="initReply"
          @deleteMessage="deleteMessage"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import {formatDate} from '../utils/common';

const props = defineProps({
  reply: Object,
});

const emit = defineEmits(['initReply', 'deleteMessage']);

const hasReplies = (id) => {
  return props.reply.HasChildren;
};

const getReplies = (parentId) => {
  return props.reply.Children || [];
};

</script>

<style scoped>
.message-reply {
  margin-left: 10px;
}
</style>
