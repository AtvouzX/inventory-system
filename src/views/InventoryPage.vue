<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-6">Inventory Management</h1>
            </v-col>

            <v-col>
                <ItemList :items="items" :categories="categories" @item-deleted="fetchItems"
                    @item-updated="fetchItems" @item-added="fetchItems"/>
            </v-col>

        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getItems, getCategories } from '@/services/api';
import ItemList from '@/components/ItemList.vue';

const items = ref([]);
const categories = ref([]);

const fetchData = async () => {
    try {
        items.value = await getItems();
        categories.value = await getCategories();
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const fetchItems = async () => {
    try {
        items.value = await getItems(); // Memuat ulang items
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

onMounted(fetchData);


</script>