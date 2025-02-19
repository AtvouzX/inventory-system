<template>
  <div>
    <LoginPage v-if="!isLoggedIn" @login="handleLogin" />
    <InventoryPage v-else @logout="handleLogout" />
  </div>
</template>

<script>
import LoginPage from './views/LoginPage.vue';
import InventoryPage from './views/InventoryPage.vue';

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
    InventoryPage,
  },
};
</script>