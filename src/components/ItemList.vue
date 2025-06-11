<template>
  <v-card class="elevation-2">
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <div class="d-flex align-center">
        <v-icon start color="primary">mdi-format-list-bulleted</v-icon>
        <span class="text-h6">Item List</span>
      </div>
      <div class="d-flex align-center">
        <v-btn
          v-if="selectedItems.length > 0"
          color="error"
          variant="flat"
          class="mr-2"
          @click="confirmMassDelete"
        >
          <v-icon start>mdi-delete</v-icon>
          Delete Selected ({{ selectedItems.length }})
        </v-btn>
        <AddItem :categories="categories" @item-added="fetchItems" />
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-table density="comfortable" hover>
      <thead>
        <tr>
          <th class="text-left">
            <v-checkbox
              v-model="selectAll"
              density="compact"
              hide-details
              @click="toggleSelectAll"
            ></v-checkbox>
          </th>
          <th class="text-left font-weight-bold sortable" @click="sortBy('name')">
            Name
            <v-icon
              v-if="sortKey === 'name'"
              :icon="sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
              size="small"
            ></v-icon>
          </th>
          <th class="text-left font-weight-bold sortable" @click="sortBy('category')">
            Category
            <v-icon
              v-if="sortKey === 'category'"
              :icon="sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
              size="small"
            ></v-icon>
          </th>
          <th class="text-left font-weight-bold sortable" @click="sortBy('quantity')">
            Quantity
            <v-icon
              v-if="sortKey === 'quantity'"
              :icon="sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
              size="small"
            ></v-icon>
          </th>
          <th class="text-right font-weight-bold">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in paginateditems" :key="item.id" class="hover-row">
          <td>
            <v-checkbox
              v-model="selectedItems"
              :value="item.id"
              density="compact"
              hide-details
            ></v-checkbox>
          </td>
          <td class="text-left">{{ item.name }}</td>
          <td class="text-left">
            <v-chip :color="item.categories ? 'primary' : 'grey'" variant="outlined" size="small">
              {{ item.categories ? item.categories.name : "Uncategorized" }}
            </v-chip>
          </td>
          <td class="text-left">
            <v-chip :color="item.quantity <= 5 ? 'error' : 'success'" variant="flat" size="small">
              {{ item.quantity }}
            </v-chip>
          </td>
          <td class="text-right">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  color="grey"
                  size="small"
                  v-bind="props"
                />
              </template>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="openEditDialog(item)" />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete"
                  @click="confirmDelete(item.id)"
                />
                <v-list-item
                  prepend-icon="mdi-qrcode"
                  title="Generate QR"
                  @click="openQRDialog(item.id)"
                />
              </v-list>
            </v-menu>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-divider class="mt-4"></v-divider>

    <v-card-actions class="d-flex justify-center pa-4">
      <v-pagination
        v-model="currentPage"
        :length="totalPage"
        :total-visible="5"
        density="comfortable"
        color="primary"
      ></v-pagination>
    </v-card-actions>

    <!-- Dialog untuk Edit Item -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">Edit Item</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="editedItem.name"
            label="Name"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />
          <v-select
            v-model="editedItem.category_id"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Category"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />
          <v-text-field
            v-model="editedItem.quantity"
            label="Quantity"
            type="number"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveItem">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog untuk Konfirmasi Delete -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon start color="error">mdi-alert</v-icon>
          Confirm Deletion
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <div v-if="selectedItems.length > 0">
            Are you sure you want to delete {{ selectedItems.length }} selected item(s)? This action
            cannot be undone.
          </div>
          <div v-else>Are you sure you want to delete this item? This action cannot be undone.</div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="handleDelete" :loading="deleteLoading">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Komponen QR Generator -->
    <QRGenerator ref="qrGenerator" v-if="qrGeneratorReady" />
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { deleteItemWithActivity, updateItemWithActivity } from "@/services/api";
import AddItem from "./AddItem.vue";
import QRGenerator from "./QRGenerator.vue";

const props = defineProps({
  items: Array,
  categories: Array,
});

const emit = defineEmits(["item-deleted", "item-updated", "item-added"]);

const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortKey = ref("name");
const sortOrder = ref("asc");

const itemsWithCategory = computed(() =>
  props.items.map((item) => ({
    ...item,
    category: props.categories.find((c) => c.id === item.category_id),
  }))
);

const sortedItems = computed(() => {
  const items = [...itemsWithCategory.value];
  return items.sort((a, b) => {
    let aValue, bValue;

    switch (sortKey.value) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "category":
        aValue = (a.categories?.name || "Uncategorized").toLowerCase();
        bValue = (b.categories?.name || "Uncategorized").toLowerCase();
        break;
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        return 0;
    }

    if (sortOrder.value === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
});

const paginateditems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedItems.value.slice(start, end);
});

const totalPage = computed(() => Math.ceil(props.items.length / itemsPerPage.value));

const editDialog = ref(false);
const editedItem = ref({});

const qrGenerator = ref(null);
const qrGeneratorReady = ref(false);

// State untuk seleksi item
const selectedItems = ref([]);
const selectAll = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const itemToDelete = ref(null);

onMounted(() => {
  qrGeneratorReady.value = true;
});

const openEditDialog = (item) => {
  editedItem.value = { ...item };
  editDialog.value = true;
};

const openQRDialog = (uuid) => {
  if (qrGenerator.value) {
    qrGenerator.value.openDialog(uuid);
  } else {
    console.error("QR Generator is not ready");
  }
};

// Toggle select all items
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginateditems.value.map((item) => item.id);
  } else {
    selectedItems.value = [];
  }
};

// Watch for changes in selected items
watch(selectedItems, (newValue) => {
  selectAll.value = newValue.length === paginateditems.value.length;
});

// Confirm single item deletion
const confirmDelete = (id) => {
  itemToDelete.value = id;
  selectedItems.value = [id];
  deleteDialog.value = true;
};

// Confirm mass deletion
const confirmMassDelete = () => {
  itemToDelete.value = null;
  deleteDialog.value = true;
};

// Handle deletion (single or mass)
const handleDelete = async () => {
  deleteLoading.value = true;
  try {
    const itemsToDelete = itemToDelete.value ? [itemToDelete.value] : selectedItems.value;
    let success = true;

    for (const id of itemsToDelete) {
      const result = await deleteItemWithActivity(id);
      if (!result) {
        success = false;
        break;
      }
    }

    if (success) {
      emit("item-deleted");
      selectedItems.value = [];
      selectAll.value = false;
    } else {
      console.error("Failed to delete items");
    }
  } catch (error) {
    console.error("Error deleting items:", error);
    alert("Failed to delete items. Please try again.");
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const saveItem = async () => {
  try {
    const result = await updateItemWithActivity(editedItem.value);
    if (result) {
      emit("item-updated", result);
      editDialog.value = false;
    }
  } catch (error) {
    console.error("Error updating item:", error);
  }
};

const fetchItems = () => {
  emit("item-added");
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};
</script>

<style scoped>
.hover-row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-table {
  border-radius: 4px;
}

.v-card {
  border-radius: 8px;
}

.v-chip {
  font-weight: 500;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
