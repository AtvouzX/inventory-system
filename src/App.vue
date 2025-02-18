<template>
  <div>
    <MainNavbar @change-page="setPage" />

    <div v-if="currentPage === 'home'" class="mt-4">
      <h1 class="text-2xl font-bold">Welcome to Inventory System</h1>
      <p>Choose an option from the navigation bar to get started.</p>
    </div>

    <div v-if="currentPage === 'add-item'" class="mt-4">
      <!-- fetch agar items terperbarui, kalo belom cek lagi AddItemForm.vue ny -->
      <AddItemForm @item-added="fetchItems" />
    </div>

    <div v-if="currentPage === 'item-list'" class="mt-4">
      <ItemList :items="items" @delete-item="deleteItem" @edit-item="editItem" />
    </div>

    <!-- Edit Item Form -->
    <EditItemForm v-if="editingItem" :item="editingItem" @update-item="updateItem" @close-modal="editingItem = null" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import MainNavbar from "@/components/MainNavbar.vue";
import AddItemForm from "@/components/AddItemForm.vue";
import ItemList from "@/components/ItemList.vue";
import EditItemForm from "@/components/EditItemForm.vue";
import { getItems, deleteItem as apiDeleteItem, updateItem as apiUpdateItem } from "@/services/api";

export default {
  components: { MainNavbar, AddItemForm, ItemList, EditItemForm },
  setup() {
    const items = ref([]); // State untuk items
    const editingItem = ref(null); // State untuk item yang sedang diedit
    const currentPage = ref("home"); // State untuk halaman yang sedang aktif

    // Fungsi untuk mengambil data items dari API
    const fetchItems = async () => {
      // console.log("Fetching items....");
      try {
        items.value = await getItems(); // Ambil data items dari API
        // console.log("Fetched items:", items.value);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    // Fungsi untuk menghapus item
    const deleteItem = async (id) => {
      await apiDeleteItem(id);
      fetchItems(); // Update data setelah menghapus item
    };

    // Fungsi untuk memulai edit item
    const editItem = (item) => {
      editingItem.value = { ...item }; // Simpan item yang sedang diedit ke dalam editingItem
    };

    // Fungsi untuk memperbarui item setelah diedit
    const updateItem = async (updatedItem) => {
      await apiUpdateItem(updatedItem);
      editingItem.value = null; // Reset editingItem setelah update
      fetchItems(); // Mengambil ulang data setelah update
    };

    // Fungsi untuk mengubah halaman yang ditampilkan
    const setPage = (page) => {
      currentPage.value = page;
    };

    // Ambil data items saat komponen dimount
    onMounted(fetchItems);

    // Pastikan fetchItems juga dikembalikan agar bisa dipakai di template
    return { items, deleteItem, editItem, updateItem, currentPage, setPage, editingItem, fetchItems };
  },
};
</script>
