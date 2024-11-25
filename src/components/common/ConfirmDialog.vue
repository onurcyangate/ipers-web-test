<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <v-card>
      <v-card-title class="headline text-center">{{ title }}</v-card-title>
      <v-card-text class="text-subtitle-1 text-center">{{ message }}</v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="red darken-1" text @click="cancel">Cancel</v-btn>
        <v-btn color="green darken-1" text @click="confirm">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {ref, watchEffect, watch} from 'vue';

const props = defineProps({
  title: String,
  message: String,
  onConfirm: Function,
  onCancel: Function,
});

const dialog = ref(false);

const confirm = () => {
  dialog.value = false;
  props.onConfirm();
  emit('update:modelValue', dialog.value);
};

const cancel = () => {
  dialog.value = false;
  if (props.onCancel) {
    props.onCancel();
  }
  emit('update:modelValue', dialog.value);
};

watchEffect(() => {
  dialog.value = props.modelValue;
});

const emit = defineEmits(['update:modelValue']);

watch(
  () => dialog.value,
  (newValue) => {
    emit('update:modelValue', newValue);
  }
);
</script>

<style scoped>
.headline {
  color: #222222;
}

.text-subtitle-1 {
  color: #757575;
}
</style>
