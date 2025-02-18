<template>
    <!-- Popup Overlay -->
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="emitClose">
        <!-- Popup Content -->
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <!-- Header dengan tombol tutup -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold">Tambah Item</h2>
                <button @click="emitClose" class="text-gray-500 hover:text-gray-700 text-xl">
                    &times;
                </button>
            </div>

            <!-- Konten Form -->
            <input v-model="name" placeholder="Nama Item / Barcode" class="border p-2 w-full mb-2" />
            <BarcodeScanner @scanned="onBarcodeScanned" />
            
            <div class="relative mb-2">
                <select v-model="selectedCategory" @change="handleCategorySelect" class="border p-2 w-full">
                    <option disabled value="">Pilih Kategori</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                        {{ cat.name }}
                    </option>
                    <option value="__ADD_CATEGORY__">+ Tambah Kategori</option>
                </select>

                <div v-if="showCategoryInput" class="mt-2">
                    <input v-model="newCategory" placeholder="Nama Kategori Baru" class="border p-2 w-full mb-2" />
                    <button @click="handleAddCategory" class="bg-blue-500 text-white p-2 w-full">
                        Tambah
                    </button>
                </div>
            </div>

            <input v-model.number="quantity" type="number" placeholder="Jumlah" class="border p-2 w-full mb-4" />
            
            <button @click="handleAddItem" class="bg-green-500 text-white p-2 w-full">
                Tambah Item
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCategories, addCategory, addItem } from "../services/api";
import BarcodeScanner from "./BarcodeScanner.vue";

// State untuk form
const name = ref("");
const selectedCategory = ref("");
const quantity = ref(1);
const categories = ref([]);
const newCategory = ref("");
const showCategoryInput = ref(false);

// eslint-disable-next-line no-unused-vars
const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(["itemAdded", "close"]);


// Fetch daftar kategori saat komponen dimount
const fetchCategories = async () => {
    try {
        categories.value = await getCategories();
    } catch (error) {
        console.error("Gagal mengambil kategori:", error);
    }
};

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
            quantity: quantity.value
        });
        emit("itemAdded");
        emit("close"); // Tutup popup setelah berhasil tambah item
    } catch (error) {
        console.error("Gagal menambahkan item:", error);
    }
};

const emitClose = () => {
    emit("close");
};

// Menambahkan kategori baru
const handleAddCategory = async () => {
    if (!newCategory.value.trim()) {
        alert("Nama kategori tidak boleh kosong!");
        return;
    }

    try {
        await addCategory(newCategory.value);
        await fetchCategories();
        selectedCategory.value = newCategory.value;
        newCategory.value = "";
        showCategoryInput.value = false;
    } catch (error) {
        console.error("Gagal menambahkan kategori:", error);
    }
};

// Menangani pemilihan kategori dari dropdown
const handleCategorySelect = (event) => {
    if (event.target.value === "__ADD_CATEGORY__") {
        showCategoryInput.value = true;
    } else {
        selectedCategory.value = event.target.value;
    }
};


// Menangani hasil scan barcode
const onBarcodeScanned = (result) => {
    console.log("Hasil Scan:", result);

    try {
        // Ambil nilai dari result.data dan hilangkan spasi di awal/akhir
        const cleanedBarcode = result.data.trim();

        // Pisahkan data berdasarkan koma
        const [nameValue, categoryValue, quantityValue] = cleanedBarcode.split(',');

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


// Fetch kategori saat komponen dimount
onMounted(fetchCategories);
</script>

