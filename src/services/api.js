import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Mengambil semua item dengan kategori terkait
export const getItems = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("items")
    .select("id, name, quantity, category_id, categories(name)")
    .eq("user_id", user.id)
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existingItem, error: selectError } = await supabase
    .from("items")
    .select("*")
    .eq("name", item.name)
    .eq("category_id", item.category_id)
    .eq("user_id", user.id)
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
      .insert([
        {
          name: item.name,
          quantity: item.quantity,
          category_id: item.category_id,
          user_id: user.id,
        },
      ])
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("items").delete().match({ id, user_id: user.id });

  if (error) console.error("Error deleting item:", error);
};

// Mengupdate item berdasarkan ID
export const updateItem = async (item) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("items")
    .update({
      name: item.name,
      quantity: item.quantity,
      category_id: item.category_id,
    })
    .match({ id: item.id, user_id: user.id })
    .select();

  if (error) {
    console.error("Error updating item:", error);
    return null;
  }
  return data ? data[0] : null;
};

// Mengambil item berdasarkan UUID
export const getItemByUUID = async (uuid) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("items")
    .select("id, name, quantity, category_id, categories(name)")
    .eq("id", uuid)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching item by UUID:", error);
    return null;
  }
  return data;
};

// Log activity
export const logActivity = async (itemId, activityType, description) => {
  try {
    const {
      data: { user },
      error: authError, // Tangkap juga authError untuk logging yang lebih baik
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Error getting user for activity log:", authError.message);
      return null;
    }
    if (!user) {
      console.warn("User not logged in, cannot log activity.");
      return null;
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .insert([
        {
          item_id: itemId,
          activity_type: activityType,
          description: description,
          // user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error logging activity:", error.message || error);
      return null;
    }

    return data ? data[0] : null;
  } catch (caughtError) {
    console.error("Caught unexpected error in logActivity:", caughtError.message || caughtError);
    return null;
  }
};

// Update item with activity logging
export const updateItemWithActivity = async (item) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: updatedItem, error: updateError } = await supabase
    .from("items")
    .update({
      name: item.name,
      quantity: item.quantity,
      category_id: item.category_id,
      last_updated: new Date().toISOString(),
    })
    .match({ id: item.id, user_id: user.id })
    .select();

  if (updateError) {
    console.error("Error updating item:", updateError);
    return null;
  }

  // Log the update activity
  await logActivity(item.id, "update", `Updated ${item.name} quantity to ${item.quantity}`);

  return updatedItem ? updatedItem[0] : null;
};

// Add item with activity logging
export const addItemWithActivity = async (item) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existingItem, error: selectError } = await supabase
    .from("items")
    .select("*")
    .eq("name", item.name)
    .eq("category_id", item.category_id)
    .eq("user_id", user.id)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    console.error("Error checking item:", selectError);
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
      .from("items")
      .insert([
        {
          name: item.name,
          quantity: item.quantity,
          category_id: item.category_id,
          low_stock_threshold: item.low_stock_threshold || 10,
          last_updated: new Date().toISOString(),
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding item:", error);
      return null;
    }

    // Log the add activity
    if (data && data[0]) {
      await logActivity(
        data[0].id,
        "add",
        `Added new item ${item.name} with quantity ${item.quantity}`
      );
    }

    return data ? data[0] : null;
  }
};

// Delete item with activity logging
export const deleteItemWithActivity = async (id) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Get item details before deleting
  const { data: item, error: selectError } = await supabase
    .from("items")
    .select("name, quantity, category_id, categories(name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (selectError) {
    console.error("Error fetching item:", selectError);
    return false;
  }

  // Log the delete activity first
  await logActivity(
    id,
    "delete",
    `Deleted item: ${item.name} (${item.quantity} units) from ${
      item.categories?.name || "Uncategorized"
    }`
  );

  // Delete the item after logging
  const { error: deleteError } = await supabase
    .from("items")
    .delete()
    .match({ id, user_id: user.id });

  if (deleteError) {
    console.error("Error deleting item:", deleteError);
    return false;
  }

  return true;
};

// Check and log low stock alerts
export const checkLowStockAlerts = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) {
      console.warn("User not logged in, cannot check low stock alerts.");
      return;
    }

    // Step 1: Fetch all items for the current user
    // We need 'id', 'quantity', 'low_stock_threshold', and 'name' for logging
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("id, name, quantity, low_stock_threshold")
      .eq("user_id", user.id);

    if (itemsError) {
      console.error("Error fetching user items for low stock check:", itemsError);
      return;
    }

    if (!items || items.length === 0) {
      console.log("No items found for this user, no low stock alerts to check.");
      return;
    }

    const userItemIds = items.map((item) => item.id);

    // Step 2: Get the most recent relevant activity for each of the user's items
    // Filter activity_logs using the user's item_ids
    const { data: recentActivities, error: activityError } = await supabase
      .from("activity_logs")
      .select("item_id, activity_type, created_at")
      .in("activity_type", ["low_stock", "out_of_stock"])
      .in("item_id", userItemIds) // <-- KUNCI PERBAIKAN DI SINI!
      .order("created_at", { ascending: false });

    if (activityError) {
      console.error("Error fetching recent activities for alerts:", activityError);
      return;
    }

    // Create a map of the most recent alert for each item
    const lastAlerts = new Map();
    recentActivities?.forEach((activity) => {
      // Only set if we haven't seen this item_id yet (because it's ordered by created_at DESC)
      if (!lastAlerts.has(activity.item_id)) {
        lastAlerts.set(activity.item_id, activity);
      }
    });

    // Check each item and log new alerts only if needed
    for (const item of items) {
      const lastAlert = lastAlerts.get(item.id);
      const isLowStock = item.quantity > 0 && item.quantity <= item.low_stock_threshold;
      const isOutOfStock = item.quantity === 0;

      const shouldLogAlert =
        !lastAlert ||
        (lastAlert.activity_type === "low_stock" && isOutOfStock) || // was low, now out
        (lastAlert.activity_type === "out_of_stock" && isLowStock) || // was out, now low (e.g., restocked but still low)
        new Date() - new Date(lastAlert.created_at) > 24 * 60 * 60 * 1000; // alert is older than 24h

      // Log a new alert only if conditions met
      if ((isLowStock || isOutOfStock) && shouldLogAlert) {
        // Assuming logActivity is correctly defined elsewhere and works
        await logActivity(
          item.id,
          isOutOfStock ? "out_of_stock" : "low_stock",
          `${item.name} is ${isOutOfStock ? "out of stock" : "running low"} (${
            item.quantity
          } remaining)`
        );
      }
    }
  } catch (error) {
    console.error("Caught error in checkLowStockAlerts:", error.message || error);
  }
};

// Get inventory summary statistics
export const getInventorySummary = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Get all necessary data in a single query using a join
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        id,
        quantity,
        low_stock_threshold,
        categories!inner (
          id
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching inventory summary:", error);
      return null;
    }

    // Calculate counts using the fetched data
    const uniqueCategories = new Set(data.map((item) => item.categories.id));
    const totalCategories = uniqueCategories.size;
    const totalProducts = data.length;
    const totalQuantities = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const lowStockCount = data.filter(
      (item) => item.quantity > 0 && item.quantity <= (item.low_stock_threshold || 10)
    ).length;
    const outOfStockCount = data.filter((item) => item.quantity === 0).length;

    return {
      totalCategories,
      totalProducts,
      totalQuantities,
      lowStockCount,
      outOfStockCount,
    };
  } catch (error) {
    console.error("Error in getInventorySummary:", error);
    return null;
  }
};

// Get current user profile from Supabase Auth
export const getCurrentUserProfile = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  if (!data || !data.user) return null;
  const { id, email, dataUser } = data.user;
  return {
    id,
    email,
    name: dataUser.user_metadata.display_name || "",
    bio: dataUser.user_metadata?.bio || "",
    avatar_url: dataUser.user_metadata?.avatar_url || "",
  };
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("User not logged in");

    // Update user metadata in Supabase Auth
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        display_name: updates.display_name,
        bio: updates.bio,
      },
    });

    if (updateAuthError) throw updateAuthError;

    // Update profile in public.profile table
    const { data, error: updateProfileError } = await supabase
      .from("profile")
      .update({
        display_name: updates.display_name,
        bio: updates.bio,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateProfileError) throw updateProfileError;

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};
