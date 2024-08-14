<template>
  <v-dialog v-model="dialog" max-width="450px">
    <v-card class="flex-row-center pa-5">
      <v-card-title class="mb-5">
        <span class="headline">{{ heading }}</span>
      </v-card-title>
      <v-card-text style="width: 80%">
        <v-form ref="form">
          <v-text-field
            v-if="inputType === 'text'"
            v-model="inputValue"
            :label="label"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'This field is required']"
          ></v-text-field>
          <v-textarea
            v-else-if="inputType === 'textarea'"
            v-model="inputValue"
            :label="label"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || 'This field is required']"
          ></v-textarea>
          <DatePicker
            v-else-if="inputType === 'date'"
            :label="label"
            v-model="inputValue"
            :color="COLORS.PRIMARY"
            :rules="[v => !!v || 'This field is required']"
          ></DatePicker>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="COLORS.PRIMARY" class="no-uppercase" variant="flat" @click="submit" :disabled="inputValue.length === 0">Submit</v-btn>
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
  label: String,
  inputType: {
    type: String,
    default: 'text'
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const dialog = ref(props.modelValue);
const inputValue = ref('');

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
  if (newVal) {
    inputValue.value = ''; // Reset input value when the dialog is opened
  }
});

watch(dialog, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false);
  }
});

const submit = () => {
  emit('submit', inputValue.value);
  emit('update:modelValue', false);
};
</script>
