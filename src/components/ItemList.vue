// ItemList.vue
<template>
    <div>
        <h2>Inventory Items</h2>
        <ul>
            <li v-for="item in items" :key="item.id">
                {{ item.name }} - {{ item.category }} ({{ item.quantity }}) <!-- Displays item details -->
                <button @click="$emit('edit-item', item)">Edit</button> <!-- Button to edit the item -->
                <button @click="$emit('delete-item', item.id)">Delete</button> <!-- Button to delete the item -->
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: ["items"], // Receives the list of items as a prop
};
</script>