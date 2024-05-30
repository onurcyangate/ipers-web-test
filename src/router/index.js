import {createRouter, createWebHistory} from 'vue-router'
import {onBeforeRouteEnter} from "@/utils/common";
import Dashboard from "@/pages/Dashboard.vue";
import Login from "@/pages/auth/Login.vue";
import NotFound from "@/pages/misc/NotFound.vue";
import Admin from "@/layouts/Admin.vue";
import Register from "@/pages/auth/Register.vue";
import ResetPassword from "@/pages/auth/ResetPassword.vue";
import EmailVerification from "@/pages/auth/EmailVerification.vue";
import VerificationLinkHandler from "@/pages/auth/VerificationLinkHandler.vue";

const adminRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'admin',
      component: Admin,
      children: adminRoutes,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        public: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        public: true
      }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      meta: {
        public: true
      }
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: EmailVerification,
      meta: {
        public: true
      }
    },
    {
      path: '/verification-handler',
      name: 'verification-handler',
      component: VerificationLinkHandler,
      meta: {
        public: true
      }
    },
    {path: '/:pathMatch(.*)*', component: NotFound}
  ]
})

router.beforeEach(onBeforeRouteEnter);

export default router
