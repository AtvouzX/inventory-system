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
      inactivityTimer: null,
      INACTIVITY_TIMEOUT: 2 * 60 * 1000, // 2 minutes
    };
  },
  methods: {
    handleLogin() {
      this.isLoggedIn = true;
      this.resetInactivityTimer();
    },
    handleLogout() {
      this.isLoggedIn = false;
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }
      supabase.auth.signOut();
    },
    async checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if session is expired
          const expiresAt = new Date(session.expires_at * 1000);
          if (expiresAt < new Date()) {
            // Session expired
            await supabase.auth.signOut();
            this.isLoggedIn = false;
            return;
          }
          
          this.isLoggedIn = true;
          this.resetInactivityTimer();
        } else {
          this.isLoggedIn = false;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        this.isLoggedIn = false;
      }
    },
    resetInactivityTimer() {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }
      this.inactivityTimer = setTimeout(() => {
        this.handleLogout();
      }, this.INACTIVITY_TIMEOUT);
    }
  },
  async created() {
    await this.checkAuth();
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        this.isLoggedIn = true;
        this.resetInactivityTimer();
      } else if (event === 'SIGNED_OUT') {
        this.isLoggedIn = false;
        if (this.inactivityTimer) {
          clearTimeout(this.inactivityTimer);
        }
      }
    });
  },
  mounted() {
    // Add event listeners for user activity
    window.addEventListener('mousemove', this.resetInactivityTimer);
    window.addEventListener('keypress', this.resetInactivityTimer);
    window.addEventListener('click', this.resetInactivityTimer);
    window.addEventListener('scroll', this.resetInactivityTimer);
    
    // Initial timer setup
    this.resetInactivityTimer();
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('mousemove', this.resetInactivityTimer);
    window.removeEventListener('keypress', this.resetInactivityTimer);
    window.removeEventListener('click', this.resetInactivityTimer);
    window.removeEventListener('scroll', this.resetInactivityTimer);
    
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  },
  components: {
    LoginPage,
    ContainerPage,
  },
};
</script>