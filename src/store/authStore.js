import {defineStore} from 'pinia';

export const useAuthStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('user')) || {username: null},
    isLoggedIn: JSON.parse(sessionStorage.getItem('isLoggedIn')) || false,
    username: sessionStorage.getItem('username') || null,
    isExternal: sessionStorage.getItem('isExternal') || null,
    businessWorkspaceId: sessionStorage.getItem('businessWorkspaceId') || null,
    businessWorkspaceObjectId: sessionStorage.getItem('businessWorkspaceObjectId') || null,
    targetEntityId: sessionStorage.getItem('targetEntityId') || null,
    containerVersionId: sessionStorage.getItem('containerVersionId') || null,
  }),
  actions: {
    login(loginResponse) {
      console.log('login response on state:', loginResponse);
      if (loginResponse.user) {
        this.user.name = loginResponse.user.full_name;
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
    setUserRole(isExternal) {
      this.isExternal = isExternal;
      sessionStorage.setItem('isExternal', isExternal);
    },
    setBusinessWorkspaceId(id) {
      this.businessWorkspaceId = id;
      sessionStorage.setItem('businessWorkspaceId', id);
    },
    setTargetEntityId(id) {
      this.targetEntityId = id;
      sessionStorage.setItem('targetEntityId', id);
    },
    setContainerVersionId(id) {
      this.containerVersionId = id;
      sessionStorage.setItem('containerVersionId', id);
    },
    setBusinessWorkspaceObjectId(id) {
      this.businessWorkspaceObjectId = id;
      sessionStorage.setItem('businessWorkspaceObjectId', id);
    },
    isUniversityUser() {
      // return this.user.role === 'University';
      // University vs External
      console.log("isUni", !this.isExternal)
      return !this.isExternal;
      // return true;
    },
    logout() {
      this.user = {username: null, role: null};
      this.isLoggedIn = false;
      this.username = null;
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isExternal');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('businessWorkspaceId');
      sessionStorage.removeItem('businessWorkspaceObjectId');
      sessionStorage.removeItem('targetEntityId');
      sessionStorage.removeItem('containerVersionId');
    }
  }
});
