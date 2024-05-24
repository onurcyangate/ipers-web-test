import {defineStore} from 'pinia';

export const useSnackBarStore = defineStore({
  id: 'snackbar',
  state: () => ({
    snackbar: {active: false, color: null, message: '', timer: 4000}
  }),
  actions: {
    show({message, color, timer}) {
      this.snackbar = {
        active: true,
        color: color || 'error',
        message: message,
        timer: timer || 4000
      };
    }
  }
});
