import {defineStore} from 'pinia';

export const useAuthStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('user')) || {username: null, role: null},
    isLoggedIn: JSON.parse(sessionStorage.getItem('isLoggedIn')) || false,
    username: sessionStorage.getItem('username') || null
  }),
  actions: {
    login(loginResponse) {
      console.log('login response on state:', loginResponse);
      if (loginResponse.user) {
        this.user.name = loginResponse.user.full_name;
        this.user.role = loginResponse.user.user_group;
        this.user.isTokenActive = true;
        sessionStorage.setItem('user', JSON.stringify(this.user));
      }
      this.isLoggedIn = true;
      sessionStorage.setItem('isLoggedIn', JSON.stringify(this.isLoggedIn));
    },
    setUsername(username) {
      this.username = username;
      sessionStorage.setItem('username', username);
    },
    logout() {
      this.user = {username: null, role: null};
      this.isLoggedIn = false;
      this.username = null;
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('username');
    }
  }
});
