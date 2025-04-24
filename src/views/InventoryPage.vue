<template>
    <v-container fluid class="pa-4">
        <v-row>
            <v-col cols="12">
                <InventorySummary />
            </v-col>

            <v-col cols="12">
                <ItemList 
                    :items="filteredItems" 
                    :categories="categories" 
                    @item-deleted="fetchItems"
                    @item-updated="fetchItems" 
                    @item-added="fetchItems"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getItems, getCategories, checkLowStockAlerts } from '@/services/api';
import ItemList from '@/components/ItemList.vue';
import InventorySummary from '@/components/InventorySummary.vue';

const items = ref([]);
const categories = ref([]);
const searchQuery = ref('');

const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    
    const query = searchQuery.value.toLowerCase();
    return items.value.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query)
    );
});

const fetchData = async () => {
    try {
        items.value = await getItems();
        categories.value = await getCategories();
        await checkLowStockAlerts();
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const fetchItems = async () => {
    try {
        items.value = await getItems();
        await checkLowStockAlerts();
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

// Listen for search events
onMounted(() => {
    fetchData();
    document.addEventListener('search', (event) => {
        searchQuery.value = event.detail.query;
    });
});
</script>