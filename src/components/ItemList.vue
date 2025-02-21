<template>
    <v-card>
        <v-card-title>Products</v-card-title>
        <v-data-table :headers="headers" :items="items" :loading="isLoading" loading-text="Loading... Please wait">
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon @click="editItem(item)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="handleDelete(item.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import { getItems, deleteItem, getCategories } from '@/services/api'; // Sesuaikan path import

export default {
    data() {
        return {
            isLoading: true,
            items: [],
            headers: [
                { title: 'Name', key: 'name' },
                { title: 'Category', key: 'categoryName' }, // Ubah key ke categoryName
                { title: 'Quantity', key: 'quantity' },
                { title: 'Actions', key: 'actions', sortable: false },
            ],
        };
    },
    async created() {
        await this.fetchCategories(); // Ambil kategori
        await this.fetchItems(); // Ambil item
    },
    methods: {
        async fetchCategories() {
            try {
                this.categories = await getCategories();
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },

        async fetchItems() {
            this.isLoading = true;
            try {
                const items = await getItems();
                // Gabungkan data item dengan nama kategori
                this.items = items.map(item => {
                    const category = this.categories.find(cat => cat.id === item.category);
                    return {
                        ...item,
                        categoryName: category ? category.name : 'Unknown', // Tambahkan nama kategori
                    };
                });
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                this.isLoading = false;
            }
        },
        editItem(item) {
            // Logika untuk edit item
            console.log('Edit item:', item);
        },
        async handleDelete(id) {
            try {
                await deleteItem(id); // Panggil API delete
                this.items = this.items.filter(item => item.id !== id); // Perbarui daftar items
                console.log('Item deleted successfully');
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        },
    },
};
</script>

<style scoped>
/* Tambahkan gaya kustom jika diperlukan */
</style>