<template>
    <div>
        <h2>Edit Item</h2>
        <form @submit.prevent="submitForm">
            <label>
                Name:
                <input v-model="updatedItem.name" required />
            </label>
            <label>
                Category:
                <input v-model="updatedItem.category" required />
            </label>
            <label>
                Quantity:
                <input type="number" v-model="updatedItem.quantity" required />
            </label>
            <button type="submit">Update Item</button>
            <button type="button" @click="cancel">Cancel</button>
        </form>
    </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
    props: ["item"],
    setup(props, { emit }) {
        const updatedItem = ref({ ...props.item });

        watch(
            () => props.item,
            (newItem) => {
                updatedItem.value = { ...newItem };
            }
        );

        const submitForm = () => {
            emit("update-item", updatedItem.value);
        };

        const cancel = () => {
            emit("cancel");
        };

        return { updatedItem, submitForm, cancel };
    },
};
</script>