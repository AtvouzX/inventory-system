<template>
  <v-app>
    <v-container fluid class="fill-height pa-0" style="background-color: #ffffff">
      <v-row no-gutters class="fill-height" style="background-color: #ffffff">
        <v-col
          cols="12"
          md="6"
          class="d-flex flex-column justify-center align-center position-relative"
        >
          <img
            :src="logo"
            alt="logo"
            style="max-width: 400px; width: 100%; height: auto"
            class="mb-4"
          />
          <h1 class="text-4xl font-bold text-center">INVENTORY WATCH AND KEEP</h1>
        </v-col>
        <v-col cols="12" md="6" class="d-flex align-center justify-center">
          <v-container class="pa-12 pb-8" max-width="448">
            <div class="d-flex justify-center mb-4">
              <img :src="logo" alt="logo" style="max-width: 100px; width: 100%; height: auto" />
            </div>
            <div class="text-center text-2xl font-bold mb-2">
              {{ isLogin ? "Log In to your account" : "Create an account" }}
            </div>
            <div class="text-center mb-4">
              {{
                isLogin
                  ? "Welcome back! Please enter your details."
                  : "Please fill in your details to create an account."
              }}
            </div>

            <!-- Login Form -->
            <form v-if="isLogin" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                type="email"
                label="Account"
                placeholder="Email address"
                :rules="[
                  (v) => !!v || 'Email is required',
                  (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                ]"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="password"
                :type="visible ? 'text' : 'password'"
                label="Password"
                placeholder="Enter your password"
                :rules="[(v) => !!v || 'Password is required']"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                prepend-inner-icon="mdi-lock-outline"
                @click:append-inner="visible = !visible"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-btn :loading="loading" type="submit" color="primary" block @click="load">
                Login
              </v-btn>
              <div class="text-center mt-4">
                <span class="text-body-2">Don't have an account? </span>
                <a href="#" @click.prevent="toggleForm" class="text-primary text-decoration-none"
                  >Sign up</a
                >
              </div>
            </form>

            <!-- Signup Form -->
            <form v-else @submit.prevent="handleSignup">
              <v-text-field
                v-model="signupData.fullName"
                label="Full Name"
                placeholder="Enter your full name"
                :rules="[(v) => !!v || 'Full name is required']"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="signupData.email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                :rules="[
                  (v) => !!v || 'Email is required',
                  (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                ]"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="signupData.password"
                :type="signupVisible ? 'text' : 'password'"
                label="Password"
                placeholder="Create a password"
                :rules="[(v) => !!v || 'Password is required']"
                :append-inner-icon="signupVisible ? 'mdi-eye-off' : 'mdi-eye'"
                prepend-inner-icon="mdi-lock-outline"
                @click:append-inner="signupVisible = !signupVisible"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-btn :loading="signupLoading" type="submit" color="primary" block> Sign Up </v-btn>
              <div class="text-center mt-4">
                <span class="text-body-2">Already have an account? </span>
                <a href="#" @click.prevent="toggleForm" class="text-primary text-decoration-none"
                  >Login</a
                >
              </div>
            </form>
            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { ref } from "vue";
import { supabase } from "@/services/api.js";
import logo from "@/assets/logo.png";

export default {
  setup(props, { emit }) {
    // Login form state
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const visible = ref(false);
    const loading = ref(false);
    const isLogin = ref(true);

    // Signup form state
    const signupData = ref({
      fullName: "",
      email: "",
      password: "",
    });
    const signupVisible = ref(false);
    const signupLoading = ref(false);

    const handleLogin = async () => {
      try {
        loading.value = true;
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

        if (authError) throw authError;

        // Emit event login ke parent component
        emit("login");
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const handleSignup = async () => {
      try {
        signupLoading.value = true;
        error.value = "";

        // Register user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: signupData.value.email,
          password: signupData.value.password,
        });

        if (authError) throw authError;

        // Create profile in public.profile table
        const { error: profileError } = await supabase.from("profile").insert([
          {
            id: authData.user.id,
            display_name: signupData.value.fullName,
            email: signupData.value.email,
            bio: "",
            avatar_url: "",
          },
        ]);

        if (profileError) throw profileError;

        // Switch back to login form after successful signup
        isLogin.value = true;
        signupData.value = {
          fullName: "",
          email: "",
          password: "",
        };
      } catch (err) {
        error.value = err.message;
      } finally {
        signupLoading.value = false;
      }
    };

    const toggleForm = () => {
      isLogin.value = !isLogin.value;
      error.value = "";
    };

    const load = () => {
      loading.value = true;
      setTimeout(() => (loading.value = false), 30000);
    };

    return {
      email,
      password,
      error,
      handleLogin,
      visible,
      loading,
      load,
      logo,
      isLogin,
      signupData,
      signupVisible,
      signupLoading,
      handleSignup,
      toggleForm,
    };
  },
};
</script>
