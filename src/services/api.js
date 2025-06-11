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
    const { data: existingItem, error: selectError } = await supabase
        .from("items")
        .select("*")
        .eq("name", item.name)
        .eq("category_id", item.category_id)
        .single();

    if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking item:", selectError);
        return null;
    }

    if (existingItem) {
        return await updateItem({
            id: existingItem.id,
            name: existingItem.name,
            category_id: existingItem.category_id,
            quantity: existingItem.quantity + item.quantity,
        });
    } else {
        const { data, error } = await supabase
            .from("items")
            .insert([{ name: item.name, quantity: item.quantity, category_id: item.category_id }])
            .select();

        if (error) {
            console.error("Error adding item:", error);
            return null;
        }
        return data ? data[0] : null;
    }
};


// Menghapus item berdasarkan ID
export const deleteItem = async (id) => {
    const { error } = await supabase.from("items").delete().match({ id });

    if (error) console.error("Error deleting item:", error);
};

// Mengupdate item berdasarkan ID
export const updateItem = async (item) => {
    const { data, error } = await supabase
        .from("items")
        .update({ name: item.name, quantity: item.quantity, category_id: item.category_id })
        .match({ id: item.id })
        .select();

    if (error) {
        console.error("Error updating item:", error);
        return null;
    }
    return data ? data[0] : null;
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

// Log activity
export const logActivity = async (itemId, activityType, description) => {
    const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
            item_id: itemId,
            activity_type: activityType,
            description: description
        }])
        .select();

    if (error) console.error('Error logging activity:', error);
    return data ? data[0] : null;
};

// Update item with activity logging
export const updateItemWithActivity = async (item) => {
    const { data: updatedItem, error: updateError } = await supabase
        .from('items')
        .update({
            name: item.name,
            quantity: item.quantity,
            category_id: item.category_id,
            last_updated: new Date().toISOString()
        })
        .match({ id: item.id })
        .select();

    if (updateError) {
        console.error('Error updating item:', updateError);
        return null;
    }

    // Log the update activity
    await logActivity(
        item.id,
        'update',
        `Updated ${item.name} quantity to ${item.quantity}`
    );

    return updatedItem ? updatedItem[0] : null;
};

// Add item with activity logging
export const addItemWithActivity = async (item) => {
    const { data: existingItem, error: selectError } = await supabase
        .from('items')
        .select('*')
        .eq('name', item.name)
        .eq('category_id', item.category_id)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking item:', selectError);
        return null;
    }

    if (existingItem) {
        return await updateItemWithActivity({
            id: existingItem.id,
            name: existingItem.name,
            category_id: existingItem.category_id,
            quantity: existingItem.quantity + item.quantity,
        });
    } else {
        const { data, error } = await supabase
            .from('items')
            .insert([{
                name: item.name,
                quantity: item.quantity,
                category_id: item.category_id,
                low_stock_threshold: item.low_stock_threshold || 10,
                last_updated: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error adding item:', error);
            return null;
        }

        // Log the add activity
        if (data && data[0]) {
            await logActivity(
                data[0].id,
                'add',
                `Added new item ${item.name} with quantity ${item.quantity}`
            );
        }

        return data ? data[0] : null;
    }
};

// Delete item with activity logging
export const deleteItemWithActivity = async (id) => {
    // Get item details before deleting
    const { data: item, error: selectError } = await supabase
        .from('items')
        .select('name, quantity, category_id, categories(name)')
        .eq('id', id)
        .single();

    if (selectError) {
        console.error('Error fetching item:', selectError);
        return false;
    }

    // Log the delete activity first
    await logActivity(
        id,
        'delete',
        `Deleted item: ${item.name} (${item.quantity} units) from ${item.categories?.name || 'Uncategorized'}`
    );

    // Delete the item after logging
    const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .match({ id });

    if (deleteError) {
        console.error('Error deleting item:', deleteError);
        return false;
    }

    return true;
};

// Check and log low stock alerts
export const checkLowStockAlerts = async () => {
    const { data: items, error } = await supabase
        .from('items')
        .select('*');

    if (error) {
        console.error('Error checking low stock:', error);
        return;
    }

    // Get the most recent activity for each item
    const { data: recentActivities, error: activityError } = await supabase
        .from('activity_logs')
        .select('item_id, activity_type, created_at')
        .in('activity_type', ['low_stock', 'out_of_stock'])
        .order('created_at', { ascending: false });

    if (activityError) {
        console.error('Error fetching recent activities:', activityError);
        return;
    }

    // Create a map of the most recent alert for each item
    const lastAlerts = new Map();
    recentActivities?.forEach(activity => {
        if (!lastAlerts.has(activity.item_id)) {
            lastAlerts.set(activity.item_id, activity);
        }
    });

    // Check each item and log new alerts only if needed
    for (const item of items) {
        const lastAlert = lastAlerts.get(item.id);
        const isLowStock = item.quantity > 0 && item.quantity <= item.low_stock_threshold;
        const isOutOfStock = item.quantity === 0;
        
        // Only log if:
        // 1. There's no previous alert for this item, or
        // 2. The previous alert was for a different condition (low stock vs out of stock), or
        // 3. The previous alert is more than 24 hours old
        const shouldLogAlert = !lastAlert || 
            (lastAlert.activity_type === 'low_stock' && isOutOfStock) ||
            (lastAlert.activity_type === 'out_of_stock' && isLowStock) ||
            (new Date() - new Date(lastAlert.created_at) > 24 * 60 * 60 * 1000);

        if ((isLowStock || isOutOfStock) && shouldLogAlert) {
            await logActivity(
                item.id,
                isOutOfStock ? 'out_of_stock' : 'low_stock',
                `${item.name} is ${isOutOfStock ? 'out of stock' : 'running low'} (${item.quantity} remaining)`
            );
        }
    }
};

// Get inventory summary statistics
export const getInventorySummary = async () => {
    try {
        // Get all necessary data in a single query using a join
        const { data, error } = await supabase
            .from('items')
            .select(`
                id,
                quantity,
                low_stock_threshold,
                categories!inner (
                    id
                )
            `);

        if (error) {
            console.error('Error fetching inventory summary:', error);
            return null;
        }

        // Calculate counts using the fetched data
        const uniqueCategories = new Set(data.map(item => item.categories.id));
        const totalCategories = uniqueCategories.size;
        const totalProducts = data.length;
        const totalQuantities = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const lowStockCount = data.filter(item => 
            item.quantity > 0 && 
            item.quantity <= (item.low_stock_threshold || 10)
        ).length;
        const outOfStockCount = data.filter(item => item.quantity === 0).length;

        return {
            totalCategories,
            totalProducts,
            totalQuantities,
            lowStockCount,
            outOfStockCount
        };
    } catch (error) {
        console.error('Error in getInventorySummary:', error);
        return null;
    }
};

// Get current user profile from Supabase Auth
export const getCurrentUserProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    if (!data || !data.user) return null;
    const { id, email, user_metadata } = data.user;
    return {
        id,
        email,
        name: user_metadata?.name || '',
        bio: user_metadata?.bio || '',
        avatar_url: user_metadata?.avatar_url || '',
    };
};