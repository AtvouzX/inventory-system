<template>
    <div>
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
        <p v-if="error" style="color: red;">{{ error }}</p>
    </div>
</template>

<script>
import { ref } from "vue";
import { supabase } from "@/services/api.js";
import { useRouter } from "vue-router";

export default {
    setup() {
        const email = ref("");
        const password = ref("");
        const error = ref("");
        const router = useRouter();

        const handleLogin = async () => {
            try {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: email.value,
                    password: password.value,
                });

                if (authError) throw authError;

                // Redirect ke halaman inventaris setelah login berhasil
                router.push("/inventory");
            } catch (err) {
                error.value = err.message;
            }
        };

        return {
            email,
            password,
            error,
            handleLogin,
        };
    },
};
</script>