<template>
  <!-- Modal Overlay -->
  <div
    v-if="item"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Item</h2>

      <!-- Form edit item -->
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-900 dark:text-white"
            >Name</label
          >
          <input
            type="text"
            v-model="editedItem.name"
            id="name"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-100 dark:bg-gray-700 text-[#1a1a1a]"
            required
          />
        </div>

        <div class="mb-4">
          <label for="category" class="block text-sm font-medium text-gray-900 dark:text-white"
            >Category</label
          >
          <input
            type="text"
            v-model="editedItem.category"
            id="category"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-black"
            required
          />
        </div>

        <div class="mb-4">
          <label for="quantity" class="block text-sm font-medium text-gray-900 dark:text-white"
            >Quantity</label
          >
          <input
            type="number"
            v-model="editedItem.quantity"
            id="quantity"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-black"
            required
          />
        </div>

        <div class="flex justify-between">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
          <button
            @click.prevent="closeModal"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: Object,
  },
  data() {
    return {
      editedItem: { ...this.item }, // Membuat salinan dari item yang akan diedit
    };
  },
  methods: {
    handleSubmit() {
      this.$emit("update-item", this.editedItem); // Emit perubahan ke parent
    },
    closeModal() {
      this.$emit("close-modal"); // Emit untuk menutup modal
    },
  },
};
</script>

<style scoped>
/* Styling untuk modal overlay */
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.w-96 {
  width: 24rem;
}

.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button {
  transition: background-color 0.2s ease;
}

/* Custom Style untuk Background */
.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-700 {
  background-color: #374151;
}

.bg-gray-800 {
  background-color: #1f2937;
}

/* Dark Mode custom */
.dark .bg-gray-700 {
  background-color: #4b5563;
}
</style>
