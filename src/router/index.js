import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/LoginPage.vue";
import Inventory from "@/views/InventoryPage.vue";
import { supabase } from "@/services/api"; // Import Supabase dari services/api.js

const routes = [
    {
        path: "/",
        redirect: "/login", // Redirect ke halaman login secara default
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/inventory",
        name: "Inventory",
        component: Inventory,
        meta: { requiresAuth: true }, // Hanya bisa diakses jika pengguna sudah login
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard untuk memeriksa autentikasi
router.beforeEach(async (to, from, next) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (to.meta.requiresAuth && !user) {
        // Jika route memerlukan autentikasi dan pengguna belum login, redirect ke halaman login
        next("/login");
    } else if (to.path === "/login" && user) {
        // Jika pengguna sudah login dan mencoba mengakses halaman login, redirect ke halaman inventaris
        next("/inventory");
    } else {
        next();
    }
});

export default router;