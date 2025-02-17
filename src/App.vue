// App.vue
<template>
  <div>
    <h1>Inventory System</h1>
    <AddItemForm @item-added="fetchItems" /> <!-- AddItemForm component with event listener -->
    <ItemList :items="items" @delete-item="deleteItem" @edit-item="editItem" /> <!-- ItemList component with props and event listeners -->
    <EditItemForm v-if="editingItem" :item="editingItem" @update-item="updateItem" /> <!-- EditItemForm component with conditional rendering -->
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getItems, deleteItem as apiDeleteItem, updateItem as apiUpdateItem } from "@/services/api";
import AddItemForm from "@/components/AddItemForm.vue";
import ItemList from "@/components/ItemList.vue";
import EditItemForm from "@/components/EditItemForm.vue";

export default {
  components: { AddItemForm, ItemList, EditItemForm }, // Registers components
  setup() {
    const items = ref([]); // Reactive state for items list
    const editingItem = ref(null); // Reactive state for the item being edited

    const fetchItems = async () => {
  try {
    items.value = await getItems();
  } catch (error) {
    console.error("Gagal mengambil items:", error);
  }
};

    const deleteItem = async (id) => {
      await apiDeleteItem(id); // Calls API to delete the item
      fetchItems(); // Refreshes the items list
    };

    const editItem = (item) => {
      editingItem.value = { ...item }; // Sets the item to be edited
    };

    const updateItem = async (updatedItem) => {
      await apiUpdateItem(updatedItem); // Calls API to update the item
      editingItem.value = null; // Resets the editing state
      fetchItems(); // Refreshes the items list
    };

    onMounted(fetchItems); // Fetches items when the component is mounted

    return { items, fetchItems, deleteItem, editItem, updateItem, editingItem };
  },
};
</script>
