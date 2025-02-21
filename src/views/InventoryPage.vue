// InventoryPage.vue
<template>
    <div>
        <AddItemForm @item-added="fetchItems" />
        <ItemList :items="items" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AddItemForm from '@/components/AddItemForm.vue';
import ItemList from '@/components/ItemList.vue';
import { getItems } from '@/services/api';

export default {
    components: { AddItemForm, ItemList },
    setup() {
        const items = ref([]);

        const fetchItems = async () => {
            const { data, error } = await getItems();
            if (!error) {
                items.value = data;
            }
        };

        onMounted(fetchItems);

        return {
            items,
            fetchItems,
        };
    },
};
</script>