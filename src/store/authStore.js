import {defineStore} from 'pinia';
import {setAccessToken} from '@/utils/token';

export const useAuthStore = defineStore('user', {
  state: () => ({
    user: {username: null, isTokenActive: false, role: null},
    isLoggedIn: false,
    username: null
  }),
  actions: {
    login(loginResponse) {
      console.log('login response on state:', loginResponse)
      if (loginResponse.user) {
        this.user.username = loginResponse.user.full_name;
        this.user.role = loginResponse.user.user_group;
        setAccessToken(loginResponse.access);
        this.user.isTokenActive = true;
        this.isLoggedIn = true;
      }
    },
    setUsername(username) {
      this.username = username;
    }
  }
});
