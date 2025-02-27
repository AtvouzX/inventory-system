<template>
    <v-card>
        <v-card-title class="d-flex justify-space-between mb-6">
            <div>
                <v-icon start>mdi-format-list-bulleted</v-icon>
                Item List
            </div>
            <AddItem :categories="categories" @item-added="fetchItems" />
        </v-card-title>

        <v-table density="compact">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="item in paginateditems" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.categories ? item.categories.name : 'Uncategorized' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>
                        <!-- Tombol Edit -->
                        <v-btn icon="mdi-pencil" variant="text" color="primary" @click="openEditDialog(item)" />

                        <!-- Tombol Hapus -->
                        <v-btn icon="mdi-delete" variant="text" color="error" @click="handleDeleteItem(item.id)" />

                        <!-- Tombol QR Generator -->
                        <v-btn icon="mdi-qrcode" variant="text" color="secondary" @click="openQRDialog(item.id)" />
                    </td>
                </tr>
            </tbody>
        </v-table>

        <v-pagination
            v-model="currentPage"
            :length="totalPage"
            :total-visible="5"
            density="comfortable"
            class="mt-4"></v-pagination>

        <!-- Dialog untuk Edit Item -->
        <v-dialog v-model="editDialog" max-width="500">
            <v-card>
                <v-card-title>Edit Item</v-card-title>
                <v-card-text>
                    <v-text-field v-model="editedItem.name" label="Name" />
                    <v-select v-model="editedItem.category_id" :items="categories" item-title="name" item-value="id"
                        label="Category" />
                    <v-text-field v-model="editedItem.quantity" label="Quantity" type="number" />
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="editDialog = false">Cancel</v-btn>
                    <v-btn color="primary" @click="saveItem">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Komponen QR Generator -->
        <QRGenerator ref="qrGenerator" v-if="qrGeneratorReady" />

    </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { deleteItem, updateItem } from '@/services/api';
import AddItem from './AddItem.vue';
import QRGenerator from './QRGenerator.vue'; // Import komponen QRGenerator

const props = defineProps({
    items: Array,
    categories: Array,
});

const emit = defineEmits(['item-deleted', 'item-updated', 'item-added']);

const currentPage = ref(1);
const itemsPerPage = ref(10);

const itemsWithCategory = computed(() =>
    props.items.map(item => ({
        ...item,
        category: props.categories.find(c => c.id === item.category_id),
    }))
);

const paginateditems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return itemsWithCategory.value.slice(start, end);
});

const totalPage = computed(() => Math.ceil(props.items.length / itemsPerPage.value));

const editDialog = ref(false);
const editedItem = ref({});

const qrGenerator = ref(null); // Ref untuk komponen QRGenerator
const qrGeneratorReady = ref(false);

// Buka dialog edit
const openEditDialog = (item) => {
    editedItem.value = { ...item };
    editDialog.value = true;
};

onMounted(() => {
    qrGeneratorReady.value = true;
});

// Buka dialog QR code
const openQRDialog = (uuid) => {
    if (qrGenerator.value) {
        qrGenerator.value.openDialog(uuid);
    } else {
        console.error('QR Generator is not ready');
    }
};

// Fungsi untuk menghapus item
const handleDeleteItem = async (id) => {
    try {
        await deleteItem(id);
        emit('item-deleted');
    } catch (error) {
        console.error('Error deleting item:', error);
    }
};

// Fungsi untuk menyimpan perubahan item
const saveItem = async () => {
    try {
        await updateItem(editedItem.value);
        emit('item-updated');
        editDialog.value = false;
    } catch (error) {
        console.error('Error updating item:', error);
    }
};

const fetchItems = () => {
    emit('item-added'); // Teruskan event ke parent
};
</script>