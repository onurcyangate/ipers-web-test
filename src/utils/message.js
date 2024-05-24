import { useSnackBarStore } from '@/store/snackBarStore.js';


export const successMessage = (message) => {
  const snackBarStore = useSnackBarStore();
  snackBarStore.show({ message: message, color: 'success' });
}

export const errorMessage = (message) => {
  const snackBarStore = useSnackBarStore();
  snackBarStore.show({ message: message, color: 'error' });
}

export const warningMessage = (message) => {
  const snackBarStore = useSnackBarStore();
  snackBarStore.show({ message: message, color: 'warning' });
}

export const infoMessage = (message) => {
  const snackBarStore = useSnackBarStore();
  snackBarStore.show({ message: message, color: 'info' });
}
