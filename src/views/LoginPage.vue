<template>
    <v-app>
        <v-container fluid class="fill-height pa-0" style="background-color: #ffffff;">
            <v-row no-gutters class="fill-height" style="background-color: #ffffff;">
                <v-col cols="12" md="6" class="d-flex flex-column justify-center align-center position-relative">
                    <img :src="logo" alt="logo" style="max-width: 400px; width: 100%; height: auto;" class="mb-4">
                    <h1 class="text-4xl font-bold text-center">INVENTORY WATCH AND KEEP</h1>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center justify-center">
                    <v-container class="pa-12 pb-8" max-width="448">
                        <div class="d-flex justify-center mb-4">
                            <img :src="logo" alt="logo" style="max-width: 100px; width: 100%; height: auto;">
                        </div>
                        <div class="text-center text-2xl font-bold mb-2">
                            Log In to your account
                        </div>
                        <div class="text-center mb-4">Welcome back! Please enter your details.</div>
                        <form @submit.prevent="handleLogin">
                            <v-text-field v-model="email" type="email" label="Account" placeholder="Email address" required
                                variant="outlined" prepend-inner-icon="mdi-email-outline" class="mb-4"></v-text-field>
                            <v-text-field v-model="password" :type="visible ? 'text' : 'password'" label="Password"
                                placeholder="Enter your password" :rules="required"
                                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                                prepend-inner-icon="mdi-lock-outline" @click:append-inner="visible = !visible"
                                variant="outlined" class="mb-4"></v-text-field>
                            <v-btn :loading="loading" type="submit" color="primary" block @click="load">
                                Login
                            </v-btn>
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
        const email = ref("");
        const password = ref("");
        const error = ref("");
        const visible = ref(false);
        const loading = ref(false);

        const handleLogin = async () => {
            try {
                loading.value = true;
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: email.value,
                    password: password.value,
                });

                if (authError) throw authError;

                // Emit event login ke parent component
                emit('login');
            } catch (err) {
                error.value = err.message;
            } finally {
                loading.value = false;
            }
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
        };
    },
};
</script>