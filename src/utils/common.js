import {getAccessToken, getRefreshToken} from './token'
import {useAuthStore} from "@/store/authStore";

/**
 * Filters out properties with null values from an object.
 *
 * @param obj - The ref object to filter.
 * @returns {object} - A new object with non-null values.
 */
export const filterNullValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value !== null)
  );
};

// Date used for demonstration purpose on datatable
export const formatDate = (dateString) => {
  if (dateString) return new Date(dateString).toLocaleDateString('en-GB');
};

// Date used for api payload: returns like 2024-03-10T22:50:00
export const formatDateToIsoString = (dateString) => {
  if (dateString) return dateString.toISOString().slice(0, 19);
};


export const onBeforeRouteEnter = async (to) => {
  const isPublic = to?.meta?.public;

  if (!isPublic && !getAccessToken() && !getRefreshToken()) {
    return { name: 'login' };
  }

  const externalRoute = to?.meta?.external;

  if (externalRoute) {
    const authStore = useAuthStore();

    if (authStore.user.role !== 'university') {
      return false;
    }
  }

  return true; // Allow the navigation
};

export const refreshPage = () => {
  window.location.reload();
};
