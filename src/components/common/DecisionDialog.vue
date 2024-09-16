<template>
  <v-dialog v-model="dialog" max-width="450px">
    <v-card class="flex-row-center pa-5">
      <v-card-title class="mb-5">
        <span class="headline">{{ heading }}</span>
      </v-card-title>
      <v-card-text style="width: 80%">
        <p>{{ label }}</p>
      </v-card-text>
      <v-card-actions style="scale: 1.1">
        <v-spacer></v-spacer>
        <v-btn :color="COLORS.SUCCESS" class="no-uppercase" variant="flat" @click="approve">Approve</v-btn>
        <v-btn color="error" class="no-uppercase" variant="flat" @click="reject">Reject</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script setup>
import { ref, watch } from 'vue';
import { COLORS } from "@/styles/colors";

const props = defineProps({
  modelValue: Boolean,
  heading: String,
  label: String
});

const emit = defineEmits(['update:modelValue', 'approve', 'reject']);

const dialog = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
});

watch(dialog, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false);
  }
});

const approve = () => {
  emit('approve');
  emit('update:modelValue', false);
};

const reject = () => {
  emit('reject');
  emit('update:modelValue', false);
};
</script>

