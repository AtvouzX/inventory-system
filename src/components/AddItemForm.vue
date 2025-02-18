<template>
    <div>
        <h2 class="text-lg font-bold mb-2">Tambah Item</h2>

        <!-- Input untuk nama item atau barcode -->
        <input v-model="name" placeholder="Nama Item / Barcode" class="border p-2 w-full mb-2" />

        <!-- Komponen Barcode Scanner -->
        <BarcodeScanner @scanned="onBarcodeScanned" />

        <!-- Dropdown dengan opsi tambah kategori -->
        <div class="relative mb-2">
            <select v-model="selectedCategory" @change="handleCategorySelect" class="border p-2 w-full">
                <option disabled value="">Pilih Kategori</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                    {{ cat.name }}
                </option>
                <option value="__ADD_CATEGORY__">+ Tambah Kategori Baru</option>
            </select>

            <!-- Input untuk kategori baru -->
            <div v-if="showCategoryInput" class="mt-2">
                <input v-model="newCategory" placeholder="Nama Kategori Baru" class="border p-2 w-full mb-2" />
                <button @click="handleAddCategory" class="bg-blue-500 text-white p-2 w-full">
                    Tambah
                </button>
            </div>
        </div>

        <!-- Input untuk jumlah -->
        <input v-model.number="quantity" type="number" placeholder="Jumlah" class="border p-2 w-full mb-2" />

        <!-- Tombol untuk menambahkan item -->
        <button @click="handleAddItem" class="bg-green-500 text-white p-2 w-full">
            Tambah Item
        </button>
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
const emit = defineEmits(["itemAdded"]);


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
        name.value = "";
        selectedCategory.value = "";
        quantity.value = 1;

        // Emit event untuk memberi tahu parent bahwa item baru telah ditambahkan
        emit("itemAdded");
    } catch (error) {
        console.error("Gagal menambahkan item:", error);
    }
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