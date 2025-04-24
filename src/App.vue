<template>
  <div>
    <LoginPage v-if="!isLoggedIn" @login="handleLogin" />
    <ContainerPage v-else @logout="handleLogout" />
  </div>
</template>

<script>
import LoginPage from './views/LoginPage.vue';
import ContainerPage from './views/ContainerPage.vue';
import { supabase } from '@/services/api.js';

export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  methods: {
    handleLogin() {
      this.isLoggedIn = true;
      localStorage.setItem('isLoggedIn', 'true');
    },
    handleLogout() {
      this.isLoggedIn = false;
      localStorage.removeItem('isLoggedIn');
      supabase.auth.signOut();
    },
    async checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          this.isLoggedIn = true;
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          this.isLoggedIn = false;
          localStorage.removeItem('isLoggedIn');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        this.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
      }
    }
  },
  async created() {
    await this.checkAuth();
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
      } else if (event === 'SIGNED_OUT') {
        this.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
      }
    });
  },
  components: {
    LoginPage,
    ContainerPage,
  },
};
</script>