import {createRouter, createWebHistory} from 'vue-router';
import {onBeforeRouteEnter} from "@/utils/common";
import Dashboard from "@/pages/Dashboard.vue";
import Login from "@/pages/auth/Login.vue";
import NotFound from "@/pages/misc/NotFound.vue";
import Register from "@/pages/auth/Register.vue";
import ResetPassword from "@/pages/auth/ResetPassword.vue";
import EmailVerification from "@/pages/auth/EmailVerification.vue";
import VerificationLinkHandler from "@/pages/auth/VerificationLinkHandler.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import CaseDetail from "@/pages/CaseDetail.vue";
import ResetPasswordLinkHandler from "@/pages/auth/ResetPasswordLinkHandler.vue";

const mainRoute = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      external: false,
    }
  },
  {
    path: '/case-detail/:case_id?',
    name: 'case-detail',
    component: CaseDetail,
    meta: {
      external: false,
    },
    props: true,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'main',
      component: MainLayout,
      children: mainRoute,
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
      path: '/reset-password-link',
      name: 'reset-password-link',
      component: ResetPasswordLinkHandler,
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
    {path: '/:pathMatch(.*)*', component: NotFound, name: 'not-found',}
  ]
});

router.beforeEach((to, from, next) => {
  onBeforeRouteEnter(to).then((result) => {
    if (result === true) {
      next();
    } else if (result === false) {
      next(false);
    } else {
      next(result);
    }
  });
});

export default router;
