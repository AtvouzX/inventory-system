<template>
    <v-app>
        <v-container class="flex justify-center items-center h-screen">
            <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
                <v-card-title class="text-center text-2xl font-bold">
                    Log In to your account
                </v-card-title>
                <v-card-subtitle class="text-center mb-4">Welcome back! Please enter your details.</v-card-subtitle>
                <v-card-text>
                    <form @submit.prevent="handleLogin">
                        <v-text-field v-model="email" type="email" label="Account" placeholder="Email address" required
                            variant="outlined" prepend-inner-icon="mdi-email-outline" class="mb-4"></v-text-field>
                        <v-text-field v-model="password" :type="visible ? 'text' : 'password'" label="Password"
                            placeholder="Enter your password" :rules="required"
                            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                            prepend-inner-icon="mdi-lock-outline" @click:append-inner="visible = !visible"
                            variant="outlined" class="mb-4"></v-text-field>
                        <v-btn type="submit" color="primary" block>
                            Login
                        </v-btn>
                    </form>
                    <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
                </v-card-text>
            </v-card>
        </v-container>
    </v-app>
</template>

<script>
import { ref } from "vue";
import { supabase } from "@/services/api.js";

export default {
    setup(props, { emit }) {
        const email = ref("");
        const password = ref("");
        const error = ref("");
        const visible = ref(false);

        const handleLogin = async () => {
            try {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: email.value,
                    password: password.value,
                });

                if (authError) throw authError;

                // Emit event login ke parent component
                emit('login');
            } catch (err) {
                error.value = err.message;
            }
        };

        return {
            email,
            password,
            error,
            handleLogin,
            visible,
        };
    },
};
</script>