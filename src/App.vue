<template>
  <div>
    <LoginPage v-if="!isLoggedIn" @login="handleLogin" />
    <ContainerPage v-else @logout="handleLogout" />
  </div>
</template>

<script>
import LoginPage from './views/LoginPage.vue';
import ContainerPage from './views/ContainerPage.vue';

export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  methods: {
    handleLogin() {
      this.isLoggedIn = true;
    },
    handleLogout() {
      this.isLoggedIn = false;
    },
  },
  components: {
    LoginPage,
    ContainerPage,
  },
};
</script>