<template>
    <div>
        <h2>Inventory Items</h2>
        <ul>
            <li v-for="item in items" :key="item.id">
                {{ item.name }} - {{ item.category }} ({{ item.quantity }})
                <button @click="openEditModal(item)">Edit</button>
                <button @click="$emit('delete-item', item.id)">Delete</button>
            </li>
        </ul>

        <!-- Edit Item Modal -->
        <div v-if="isEditModalOpen" class="modal">
            <div class="modal-content">
                <EditItemForm 
                    :item="selectedItem" 
                    @update-item="handleUpdateItem" 
                    @cancel="closeEditModal"
                />
            </div>
        </div>
    </div>
</template>

<script>
import EditItemForm from './EditItemForm.vue';

export default {
    components: {
        EditItemForm
    },
    props: ["items"],
    data() {
        return {
            isEditModalOpen: false,
            selectedItem: null
        };
    },
    methods: {
        openEditModal(item) {
            this.selectedItem = { ...item };
            this.isEditModalOpen = true;
        },
        closeEditModal() {
            this.isEditModalOpen = false;
        },
        handleUpdateItem(updatedItem) {
            // Check if the updated name and category already exist
            const isDuplicate = this.items.some(item => 
                item.name === updatedItem.name && 
                item.category === updatedItem.category &&
                item.id !== updatedItem.id
            );

            if (isDuplicate) {
                alert("Item with the same name and category already exists.");
                return;
            }

            this.$emit('update-item', updatedItem);
            this.closeEditModal();
        }
    }
};
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: gray;
    padding: 20px;
    border-radius: 5px;
}
</style>