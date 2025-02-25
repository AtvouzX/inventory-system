<template>
    <v-app>
        <v-app-bar title="App bar"></v-app-bar>
        <v-navigation-drawer>
            <v-list>
                <v-list-item title="Navigation drawer"></v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <v-container>
                <InventoryPage />
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import InventoryPage from './InventoryPage.vue';


</script>

<style></style>