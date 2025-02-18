<template>
  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-4">Item List</h2>

    <!-- Checkbox untuk menampilkan/menyembunyikan kolom -->
    <div class="mb-4 flex flex-wrap gap-2">
      <label v-for="(label, key) in columnLabels" :key="key" class="flex items-center space-x-2">
        <input type="checkbox" v-model="visibleColumns[key]" class="form-checkbox text-blue-500" />
        <span>{{ label }}</span>
      </label>
    </div>

    <!-- Tabel -->
    <div v-if="items.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse border border-gray-700">
        <thead>
          <tr class="bg-gray-700 text-left">
            <th v-if="visibleColumns.id" class="p-3 border border-gray-600">ID</th>
            <th v-if="visibleColumns.name" class="p-3 border border-gray-600">Name</th>
            <th v-if="visibleColumns.category" class="p-3 border border-gray-600">Category</th>
            <th v-if="visibleColumns.quantity" class="p-3 border border-gray-600">Stock</th>
            <th v-if="visibleColumns.actions" class="p-3 border border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-600 transition">
            <td v-if="visibleColumns.id" class="p-3 border border-gray-600">{{ item.id }}</td>
            <td v-if="visibleColumns.name" class="p-3 border border-gray-600">{{ item.name }}</td>
            <td v-if="visibleColumns.category" class="p-3 border border-gray-600">
              {{ item.category }}
            </td>
            <td v-if="visibleColumns.quantity" class="p-3 border border-gray-600">{{ item.quantity }}</td>
            <td v-if="visibleColumns.actions" class="p-3 border border-gray-600 flex space-x-2">
              <button
                @click="editItem(item)"
                class="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(item.id)"
                class="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-center text-gray-400">No items available.</p>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    items: Array,
  },
  methods: {
    confirmDelete(id){//konfirmasi hapus dulu biar aman
      const isConfirmed = window.confirm("Are you sure you want to delete this item?");
      if (isConfirmed) {
        this.$emit("delete-item", id); // Emit ke parent buat menghapus item
      }
    }
  },
  setup(_, { emit }) {
    //state visibel awal
    const visibleColumns = ref({
      id: false,
      name: true,
      category: true,
      quantity: true,
      actions: false,
    });

    // Label untuk tiap kolom
    const columnLabels = {
      id: "ID",
      name: "Name",
      category: "Category",
      quantity: "Stock",
      actions: "Actions",
    };

    // Function untuk mengedit item
    const editItem = (item) => {
      emit("edit-item", item);
    };

    return { visibleColumns, columnLabels, editItem };
  },
};
</script>
