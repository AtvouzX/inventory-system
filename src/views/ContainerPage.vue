<template>
    <v-app>
        <v-row no-gutters class="fill-height">
            <v-col cols="auto">
                <v-navigation-drawer class="bg-white" permanent>
                    <div class="d-flex align-center pa-4">
                        <img src="/logo.ico" alt="Logo" class="logo-icon" />
                        <span class="ml-2 text-4xl">I.W.A.K</span>
                    </div>
                    <v-divider></v-divider>
                    <v-list>
                        <v-list-item
                            prepend-icon="mdi-view-dashboard"
                            title="Dashboard"
                            value="dashboard"
                            @click="currentPage = 'dashboard'"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-package-variant"
                            title="Inventory"
                            value="inventory"
                            @click="currentPage = 'inventory'"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-qrcode-scan"
                            title="Scan Items"
                            value="scan"
                            @click="currentPage = 'scan'"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-chart-bar"
                            title="Reports"
                            value="reports"
                            @click="currentPage = 'reports'"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-cog"
                            title="Settings"
                            value="settings"
                            @click="currentPage = 'settings'"
                        ></v-list-item>
                    </v-list>
                </v-navigation-drawer>
            </v-col>

            <v-col>
                <v-app-bar color="white">
                    <v-text-field
                        v-model="searchQuery"
                        prepend-inner-icon="mdi-magnify"
                        placeholder="Search..."
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mx-4"
                        @input="handleSearch"
                        @keyup.enter="performSearch"
                    ></v-text-field>

                    <template v-slot:append>
                        <v-btn icon="mdi-bell-outline" variant="text"></v-btn>
                        <v-btn icon="mdi-account-circle" variant="text"></v-btn>
                        <v-btn icon="mdi-logout" variant="text" @click="$emit('logout')"></v-btn>
                    </template>
                </v-app-bar>

                <v-main>
                    <v-container fluid>
                        <DashboardPage v-if="currentPage === 'dashboard'" />
                        <InventoryPage v-else-if="currentPage === 'inventory'" />
                        <ScanPage v-else-if="currentPage === 'scan'" />
                        <ReportsPage v-else-if="currentPage === 'reports'" />
                        <SettingsPage v-else-if="currentPage === 'settings'" />
                    </v-container>
                </v-main>
            </v-col>
        </v-row>
    </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import DashboardPage from './DashboardPage.vue';
import InventoryPage from './InventoryPage.vue';
import ScanPage from '@/views/ScanPage.vue';
import ReportsPage from '@/views/ReportsPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';

const currentPage = ref('dashboard');
const searchQuery = ref('');

const handleSearch = () => {
    // Debounce search if needed
    if (searchQuery.value.length >= 3) {
        performSearch();
    }
};

const performSearch = () => {
    // Emit search event to child components
    const event = new CustomEvent('search', { 
        detail: { query: searchQuery.value },
        bubbles: true
    });
    document.dispatchEvent(event);
};
</script>

<style scoped>
.v-app-bar {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.v-navigation-drawer {
    background-color: #f5f5f5;
}

.v-text-field {
    max-width: 300px;
}

.logo-icon {
    height: 32px;
    width: auto;
    display: inline-block;
}

.search-field {
    margin-left: 16px;
}
</style>