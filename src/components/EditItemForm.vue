// EditItemForm.vue
<template>
    <div>
        <h2>Edit Item</h2>
        <form @submit.prevent="submitForm">
            <label>
                Name:
                <input v-model="updatedItem.name" required /> <!-- Input for item name -->
            </label>
            <label>
                Category:
                <input v-model="updatedItem.category" required /> <!-- Input for item category -->
            </label>
            <label>
                Quantity:
                <input type="number" v-model="updatedItem.quantity" required /> <!-- Input for item quantity -->
            </label>
            <button type="submit">Update Item</button> <!-- Button to submit the form -->
            <button type="button" @click="$emit('update-item', null)">Cancel</button> <!-- Button to cancel editing -->
        </form>
    </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
    props: ["item"], // Receives the item to be edited as a prop
    setup(props, { emit }) {
        const updatedItem = ref({ ...props.item }); // Creates a reactive copy of the item

        watch(
            () => props.item,
            (newItem) => {
                updatedItem.value = { ...newItem }; // Watches for changes in the item prop and updates the local state
            }
        );

        const submitForm = () => {
            emit("update-item", updatedItem.value); // Emits the updated item to the parent component
        };

        return { updatedItem, submitForm };
    },
};
</script>
