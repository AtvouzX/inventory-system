<template>
  <div>
    <v-btn color="primary" @click="dialog = true">
      <v-icon start>mdi-plus</v-icon>
      Add Item
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon start>mdi-plus</v-icon>
          Add New Item
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="newItem.name"
              label="Name"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Name is required']"
              required
              :disabled="!!newItem.uuid"
              class="mb-4"
            />

            <v-select
              v-model="newItem.category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Category"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Category is required']"
              :disabled="!!newItem.uuid"
              class="mb-4"
            />

            <v-text-field
              v-model.number="newItem.quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[v => v >= 0 || 'Minimum 0']"
              required
              class="mb-4"
            />

            <v-btn
              color="secondary"
              @click="scannerDialog = true"
              variant="outlined"
              block
              class="mb-4"
            >
              <v-icon start>mdi-qrcode-scan</v-icon>
              Scan QR Code
            </v-btn>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="dialog = false, loading = false">Cancel</v-btn>
          <v-btn
            :loading="loading"
            color="primary"
            variant="flat"
            @click="handleSubmit"
          >
            Add Item
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog untuk Scanner -->
    <v-dialog v-model="scannerDialog" max-width="500">
      <v-card>
        
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <BarcodeScanner @scanned="handleScanned" />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="scannerDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { addItemWithActivity, getItemByUUID } from '@/services/api';
import BarcodeScanner from './BarcodeScanner.vue';

// Props untuk menerima daftar kategori dari parent
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  categories: Array,
});

// Emit event ke parent saat item berhasil ditambahkan
const emit = defineEmits(['item-added']);

// State untuk mengontrol dialog form, scanner, dan loading
const dialog = ref(false);
const scannerDialog = ref(false);
const loading = ref(false);

// Data untuk item baru
const newItem = ref({
  uuid: null,
  name: '',
  category_id: null,
  quantity: 0,
});

// Fungsi untuk memvalidasi UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
};

// Fungsi untuk menangani hasil scan QR code
const handleScanned = async (result) => {
  try {
    // Validasi hasil scan
    if (!isValidUUID(result)) {
      alert('Format UUID tidak valid. Pastikan QR Code berisi UUID yang benar.');
      return;
    }

    // Cari item berdasarkan UUID
    const item = await getItemByUUID(result);

    if (item) {
      newItem.value = {
        uuid: result,
        name: item.name,
        category_id: item.category_id,
        quantity: 0, // Reset quantity
      };
    } else {
      alert('Item tidak ditemukan');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan saat memproses UUID. Silakan coba lagi.');
  } finally {
    scannerDialog.value = false;
  }
};

// Fungsi untuk menangani submit form
const handleSubmit = async () => {
  loading.value = true;
  try {
    const result = await addItemWithActivity({
      name: newItem.value.name,
      category_id: newItem.value.category_id,
      quantity: newItem.value.quantity,
      low_stock_threshold: 10 // Default threshold
    });

    if (result) {
      emit('item-added', result);
      dialog.value = false;
      resetForm();
    }
  } catch (error) {
    console.error('Error adding item:', error);
  } finally {
    loading.value = false;
  }
};

// Fungsi untuk mereset form setelah submit
const resetForm = () => {
  newItem.value = {
    uuid: null,
    name: '',
    category_id: null,
    quantity: 0,
  };
};
</script>