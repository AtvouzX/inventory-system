import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
);

// Mengambil semua item dengan kategori terkait
export const getItems = async () => {
    const { data, error } = await supabase
        .from("items")
        .select("id, name, quantity, category_id, categories(name)")
        .order("name", { ascending: true });

    if (error) console.error("Error fetching items:", error);
    return data || [];
};

// Mengambil semua kategori
export const getCategories = async () => {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    if (error) console.error("Error fetching categories:", error);
    return data || [];
};

// Menambahkan kategori baru
export const addCategory = async (categoryName) => {
    const { data, error } = await supabase
        .from("categories")
        .insert([{ name: categoryName }])
        .select();

    if (error) console.error("Error adding category:", error);
    return data ? data[0] : null;
};

// Menambahkan item baru dengan category_id
export const addItem = async (item) => {
    const { data, error } = await supabase
        .from("items")
        .insert([{ name: item.name, quantity: item.quantity, category_id: item.category_id }])
        .select();

    if (error) console.error("Error adding item:", error);
    return data ? data[0] : null;
};

// Menghapus item berdasarkan ID
export const deleteItem = async (id) => {
    const { error } = await supabase.from("items").delete().match({ id });

    if (error) console.error("Error deleting item:", error);
};

// Mengupdate item berdasarkan ID
export const updateItem = async (item) => {
    const { error } = await supabase
        .from("items")
        .update({ name: item.name, quantity: item.quantity, category_id: item.category_id })
        .match({ id: item.id });

    if (error) console.error("Error updating item:", error);
};

// Mengambil item berdasarkan UUID
export const getItemByUUID = async (uuid) => {
    const { data, error } = await supabase
        .from("items")
        .select("id, name, quantity, category_id, categories(name)")
        .eq("id", uuid) // Cari berdasarkan kolom 'uuid'
        .single();

    if (error) {
        console.error("Error fetching item by UUID:", error);
        return null;
    }
    return data;
};