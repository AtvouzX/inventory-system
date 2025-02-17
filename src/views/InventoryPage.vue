<template>
    <div>
        <!-- Header dengan informasi pengguna -->
        <div class="user-info">
            <div v-if="user">
                <h2>Selamat datang, {{ user.email }}!</h2>
            </div>
            <button @click="handleLogout" class="logout-button">Logout</button>
        </div>

        <!-- Konten inventaris -->
        <h1>Inventory System</h1>
        <AddItemForm @item-added="fetchItems" />
        <ItemList :items="items" @delete-item="deleteItem" @edit-item="editItem" />
        <EditItemForm v-if="editingItem" :item="editingItem" @update-item="updateItem" />
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getItems, deleteItem as apiDeleteItem, updateItem as apiUpdateItem } from "@/services/api";
import { supabase } from "@/services/api";
import { useRouter } from "vue-router";
import AddItemForm from "@/components/AddItemForm.vue";
import ItemList from "@/components/ItemList.vue";
import EditItemForm from "@/components/EditItemForm.vue";

export default {
    components: { AddItemForm, ItemList, EditItemForm },
    setup() {
        const router = useRouter()
        const items = ref([])
        const editingItem = ref(null)
        const user = ref(null)
        const loading = ref(true)

        // Format tanggal pendaftaran pengguna
        const formatDate = (timestamp) => {
            return new Date(timestamp).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

        // Ambil data pengguna
        const fetchUser = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser()
                user.value = currentUser
            } catch (error) {
                console.error('Gagal mengambil data pengguna:', error)
            } finally {
                loading.value = false
            }
        }

        // Ambil data inventaris
        const fetchItems = async () => {
            try {
                items.value = await getItems()
            } catch (error) {
                console.error("Gagal mengambil items:", error)
            }
        }

        const deleteItem = async (id) => {
            await apiDeleteItem(id)
            fetchItems()
        }

        const editItem = (item) => {
            editingItem.value = { ...item }
        }

        const updateItem = async (updatedItem) => {
            await apiUpdateItem(updatedItem)
            editingItem.value = null
            fetchItems()
        }

        const handleLogout = async () => {
            try {
                const { error } = await supabase.auth.signOut()
                if (error) throw error
                router.push('/login')
            } catch (err) {
                console.error('Error logging out:', err.message)
            }
        }

        onMounted(() => {
            fetchUser()
            fetchItems()
        })

        return {
            user,
            items,
            loading,
            editingItem,
            formatDate,
            fetchItems,
            deleteItem,
            editItem,
            updateItem,
            handleLogout
        }
    }
}
</script>

<style scoped>
.logout-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.logout-button:hover {
    background-color: #c0392b;
}
</style>