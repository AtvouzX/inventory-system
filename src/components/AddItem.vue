<template>
  <div>
    <v-btn color="primary" @click="dialog = true">
      <v-icon start>mdi-plus</v-icon>
      Add Item
    </v-btn>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-plus</v-icon>
          Add New Item
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <!-- Input Nama Item -->
            <v-text-field
              v-model="newItem.name"
              label="Item Name"
              :rules="[v => !!v || 'Name is required']"
              required
            />

            <!-- Dropdown Kategori -->
            <v-select
              v-model="newItem.category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Category"
              :rules="[v => !!v || 'Category is required']"
              clearable
              required
            />

            <!-- Input Quantity -->
            <v-text-field
              v-model.number="newItem.quantity"
              label="Quantity"
              type="number"
              :rules="[v => v >= 0 || 'Minimum 0']"
              required
            />

            <!-- Tombol Scanner -->
            <v-btn
              color="secondary"
              @click="scannerDialog = true"
              class="mt-2"
              block
            >
              <v-icon start>mdi-qrcode-scan</v-icon>
              Scan QR Code
            </v-btn>

            <!-- Tombol Submit dan Cancel -->
            <v-card-actions class="mt-4">
              <v-spacer></v-spacer>
              <v-btn @click="dialog = false">Cancel</v-btn>
              <v-btn type="submit" color="primary">Add Item</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog untuk Scanner -->
    <v-dialog v-model="scannerDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-qrcode-scan</v-icon>
          Scan QR Code
        </v-card-title>
        <v-card-text>
          <BarcodeScanner @scanned="handleScanned" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="scannerDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { addItem } from '@/services/api';
import BarcodeScanner from './BarcodeScanner.vue'; // Import komponen BarcodeScanner

// Props untuk menerima daftar kategori dari parent
const props = defineProps({
  categories: Array,
});

// Emit event ke parent saat item berhasil ditambahkan
const emit = defineEmits(['item-added']);

// State untuk mengontrol dialog form dan scanner
const dialog = ref(false);
const scannerDialog = ref(false);

// Data untuk item baru
const newItem = ref({
  name: '',
  category_id: null,
  quantity: 0,
});

// Fungsi untuk menangani hasil scan QR code
const handleScanned = (result) => {
  newItem.value.name = result; // Isi nama item dengan hasil scan
  scannerDialog.value = false; // Tutup dialog scanner
};

// Fungsi untuk menangani submit form
const handleSubmit = async () => {
  try {
    const itemToAdd = {
      name: newItem.value.name,
      category_id: newItem.value.category_id,
      quantity: parseInt(newItem.value.quantity, 10) || 0,
    };

    const addedItem = await addItem(itemToAdd);
    if (addedItem) {
      emit('item-added');
      resetForm();
      dialog.value = false;
    }
  } catch (error) {
    console.error('Error adding item:', error);
  }
};

// Fungsi untuk mereset form setelah submit
const resetForm = () => {
  newItem.value = {
    name: '',
    category_id: null,
    quantity: 0,
  };
};
</script>