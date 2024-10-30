import {defineStore} from 'pinia';

export const useAuthStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('user')) || {username: null},
    isLoggedIn: JSON.parse(sessionStorage.getItem('isLoggedIn')) || false,
    username: sessionStorage.getItem('username') || null,
    isExternal: JSON.parse(sessionStorage.getItem('isExternal')) || false,
    caseIdentityId: sessionStorage.getItem('caseIdentityId') || null,
    businessWorkspaceId: sessionStorage.getItem('businessWorkspaceId') || null,
    businessWorkspaceObjectId: sessionStorage.getItem('businessWorkspaceObjectId') || null,
    targetEntityId: sessionStorage.getItem('targetEntityId') || null,
    containerVersionId: sessionStorage.getItem('containerVersionId') || null,
  }),
  actions: {
    login(loginResponse) {
      console.log('login response on state:', loginResponse);
      if (loginResponse.user) {
        this.user = {
          id: loginResponse.user.id,
          name: loginResponse.user.name,
          email: loginResponse.user.email,
          external: loginResponse.user.external,
          enabled: loginResponse.user.enabled,
        };
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
      this.isExternal = Boolean(isExternal);
      sessionStorage.setItem('isExternal', JSON.stringify(this.isExternal));
    },
    setCaseIdentityId(id) {
      return new Promise((resolve) => {
        this.caseIdentityId = id;
        sessionStorage.setItem('caseIdentityId', id);
        resolve();
      });
    },
    setBusinessWorkspaceId(id) {
      return new Promise((resolve) => {
        this.businessWorkspaceId = id;
        sessionStorage.setItem('businessWorkspaceId', id);
        resolve();
      });
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
      return new Promise((resolve) => {
        this.businessWorkspaceObjectId = id;
        sessionStorage.setItem('businessWorkspaceObjectId', id);
        resolve();
      });
    },
    isUniversityUser() {
      // University vs External
      return !this.isExternal;
    },
    logout() {
      this.user = {username: null, role: null};
      this.isLoggedIn = false;
      this.username = null;
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('businessWorkspaceId');
      sessionStorage.removeItem('caseIdentityId');
      sessionStorage.removeItem('businessWorkspaceObjectId');
      sessionStorage.removeItem('targetEntityId');
      sessionStorage.removeItem('containerVersionId');
    }
  }
});
