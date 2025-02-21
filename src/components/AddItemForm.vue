<template>
    <div>
        <!-- Tombol untuk membuka popup -->
        <v-btn @click="openPopup">Tambah Item</v-btn>

        <!-- Popup -->
        <v-dialog v-model="isPopupVisible" max-width="500" persistent>
            <v-card class="bg-gray-800">
                <!-- Header dengan tombol tutup -->
                <v-card-title class="d-flex justify-space-between align-center">
                    <span class="text-h6">Tambah Item</span>
                    <v-btn icon @click="closePopup">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <!-- Konten Form -->
                <v-card-text>
                    <v-text-field v-model="name" placeholder="Nama Item / Barcode" outlined class="mb-4"></v-text-field>
                    <BarcodeScanner @scanned="onBarcodeScanned" />

                    <!-- Input untuk kategori -->
                    <v-select
                        v-model="selectedCategory"
                        :items="categories"
                        item-title="name"
                        item-value="id"
                        label="Pilih Kategori"
                        outlined
                        class="mb-4"
                    ></v-select>

                    <v-text-field v-model.number="quantity" type="number" placeholder="Jumlah" outlined
                        class="mb-4"></v-text-field>

                    <v-btn @click="handleAddItem" color="success" block>
                        Tambah Item
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { addItem, getCategories } from "../services/api";
import BarcodeScanner from "./BarcodeScanner.vue";

// State untuk form
const name = ref("");
const selectedCategory = ref("");
const quantity = ref(1);
const isPopupVisible = ref(false); // State internal untuk popup
const categories = ref([]); // State untuk menyimpan daftar kategori
const emit = defineEmits(["itemAdded", "close"]);

// Mengambil daftar kategori saat komponen dimuat
onMounted(async () => {
    try {
        const fetchedCategories = await getCategories();
        categories.value = fetchedCategories;
    } catch (error) {
        console.error("Gagal mengambil kategori:", error);
    }
});

// Menambahkan item baru
const handleAddItem = async () => {
    if (!name.value || !selectedCategory.value || quantity.value < 1) {
        alert("Harap lengkapi semua field!");
        return;
    }

    try {
        await addItem({
            name: name.value,
            category: selectedCategory.value,
            quantity: quantity.value,
        });
        emit("itemAdded"); // Emit event untuk refresh data di parent
        closePopup(); // Tutup popup setelah berhasil tambah item
    } catch (error) {
        console.error("Gagal menambahkan item:", error);
    }
};

// Membuka popup
const openPopup = () => {
    isPopupVisible.value = true;
};

// Menutup popup
const closePopup = () => {
    isPopupVisible.value = false;
};

// Menangani hasil scan barcode
const onBarcodeScanned = (result) => {
    console.log("Hasil Scan:", result);

    try {
        // Ambil nilai dari result.data dan hilangkan spasi di awal/akhir
        const cleanedBarcode = result.data.trim();

        // Pisahkan data berdasarkan koma
        const [nameValue, categoryValue, quantityValue] = cleanedBarcode.split(",");

        // Pastikan semua nilai ada dan valid
        if (nameValue && categoryValue && quantityValue) {
            name.value = nameValue.trim();
            selectedCategory.value = categoryValue.trim();
            quantity.value = parseInt(quantityValue.trim(), 10); // Konversi ke number
        } else {
            console.error("Data barcode tidak lengkap:", cleanedBarcode);
        }
    } catch (error) {
        console.error("Format barcode salah:", result.data, error);
    }
};
</script>

<style scoped>
/* Tambahkan gaya kustom jika diperlukan */
</style>