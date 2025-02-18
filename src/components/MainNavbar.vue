<template>
  <nav
    class="sticky top-0 z-50 bg-gray-900 p-4 text-white shadow-md flex justify-between items-center"
  >
    <ul class="flex space-x-4">
      <li>
        <a href="#" @click.prevent="changePage('home')" class="hover:bg-gray-700 p-2 rounded"
          >Home</a
        >
      </li>
      <li>
        <a href="#" @click.prevent="changePage('add-item')" class="hover:bg-gray-700 p-2 rounded"
          >Add Item</a
        >
      </li>
      <li>
        <a href="#" @click.prevent="changePage('item-list')" class="hover:bg-gray-700 p-2 rounded"
          >Item List</a
        >
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  emits: ["change-page"],
  setup(_, { emit }) {
    const changePage = (page) => {
      emit("change-page", page);
    };

    return { changePage };
  },
};
</script>
