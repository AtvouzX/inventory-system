import { createClient } from "@supabase/supabase-js"; // Import Supabase client

// Inisialisasi Supabase client dengan URL dan key dari environment variables (Vite)
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

// Fungsi untuk mengambil semua item dari tabel "items"
export const getItems = async () => {
    const { data, error } = await supabase.from("items").select("*"); // Query untuk mengambil semua data
    if (error) console.error("Error fetching items:", error); // Log error jika terjadi
    return data || []; // Return data atau array kosong jika tidak ada data
};

export const getCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Error fetching categories:", error);
    return data || [];
};

export const addCategory = async (categoryName) => {
    const { data, error } = await supabase.from("categories").insert([{ name: categoryName }]).select();
    if (error) console.error("Error adding category:", error);
    return data ? data[0] : null;
};

// Fungsi untuk menambahkan item baru ke tabel "items"
export const addItem = async (item) => {
    const { data, error } = await supabase.from("items").insert([item]).select(); // Query untuk insert data
    if (error) console.error("Error adding item:", error); // Log error jika terjadi
    return data ? data[0] : null; // Return data yang baru ditambahkan atau null jika error
};

// Fungsi untuk menghapus item dari tabel "items" berdasarkan ID
export const deleteItem = async (id) => {
    const { error } = await supabase.from("items").delete().match({ id }); // Query untuk delete data
    if (error) console.error("Error deleting item:", error); // Log error jika terjadi
};

// Fungsi untuk mengupdate item di tabel "items" berdasarkan ID
export const updateItem = async (item) => {
    const { error } = await supabase.from("items").update(item).match({ id: item.id }); // Query untuk update data
    if (error) console.error("Error updating item:", error); // Log error jika terjadi
};