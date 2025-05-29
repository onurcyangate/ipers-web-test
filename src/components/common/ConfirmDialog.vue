<template>
  <v-dialog v-model="dialog" max-width="450px">
    <v-card class="flex-row-center pa-5">
      <v-card-title class="mb-5">
        <span class="headline">{{ heading }}</span>
      </v-card-title>
      <v-card-text style="width: 80%">
        <p class="text-body-1 mb-3">{{ message }}</p>
        <p v-if="subMessage" class="text-body-2 text-medium-emphasis">{{ subMessage }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="no-uppercase mr-2"
          color="#003058"
          variant="outlined"
          @click="cancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          class="no-uppercase"
          variant="flat"
          @click="confirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { COLORS } from "@/styles/colors";

const props = defineProps({
  modelValue: Boolean,
  heading: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  subMessage: {
    type: String,
    default: null
  },
  confirmText: {
    type: String,
    default: 'Delete'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmColor: {
    type: String,
    default: 'error'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const dialog = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
});

watch(dialog, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false);
  }
});

const confirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>
