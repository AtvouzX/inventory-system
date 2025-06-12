<template>
  <div class="dashboard pa-4">
    <v-row>
      <!-- Welcome Card -->
      <v-col cols="12" md="8">
        <v-card class="welcome-card mb-4">
          <v-row no-gutters align="center">
            <v-col cols="12" sm="4" class="d-flex justify-center align-center">
              <img src="/logo.ico" alt="Mascot" class="mascot-img" />
            </v-col>
            <v-col cols="12" sm="8">
              <div class="welcome-content">
                <div class="text-h5 font-weight-bold mb-2">🎉 Selamat Datang di IWAK! 🐟</div>
                <div class="mb-2">
                  Halo dan terima kasih telah mengakses Inventory Watch And Keep (IWAK)!<br />
                  Website ini merupakan hasil tugas kelompok dari mata kuliah Rekayasa Perangkat
                  Lunak yang dirancang untuk memudahkan penyimpanan data menggunakan teknologi
                  scanner.
                </div>
                <div class="font-italic">✨ Selamat mencoba! ✨</div>
              </div>
            </v-col>
          </v-row>
        </v-card>
        <!-- Quick Access -->
        <!-- <v-card class="quick-access-card mb-4">
                    <div class="text-h6 font-weight-medium mb-2">Quick Access</div>
                    <v-row>
                        <v-col cols="3" v-for="(action, i) in quickActions" :key="i" class="d-flex justify-center">
                            <v-btn icon large color="primary" @click="handleAction(action.action)">
                                <v-icon size="36">{{ action.icon }}</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card> -->
        <!-- Recent Activity (unchanged) -->
        <v-card>
          <v-card-title>Recent Activity</v-card-title>
          <v-card-text>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="(activity, i) in recentActivities"
                :key="i"
                :dot-color="getActivityColor(activity.activity_type)"
                size="small"
              >
                <div class="d-flex justify-space-between">
                  <div>
                    <div class="text-subtitle-2">
                      {{ getActivityTitle(activity.activity_type) }}
                    </div>
                    <div class="text-caption">{{ activity.description }}</div>
                  </div>
                  <div class="text-caption">{{ formatTime(activity.created_at) }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- Stats Cards Vertical Stack -->
      <v-col cols="12" md="4">
        <v-card class="stat-card mb-4 stat-total">
          <v-card-text>
            <div class="stat-content">
              <div class="stat-title">Total Item</div>
              <div class="stat-icon-bg stat-total-bg">
                <IconBox style="width: 28px; height: 28px; color: #dba362" />
              </div>
              <div class="stat-number">{{ totalItems }}</div>
              <div class="stat-desc">Quantity in Hand</div>
            </div>
          </v-card-text>
        </v-card>
        <v-card class="stat-card mb-4 stat-instock">
          <v-card-text>
            <div class="stat-content">
              <div class="stat-title">Instock</div>
              <div class="stat-icon-bg stat-instock-bg">
                <IconList style="width: 28px; height: 28px; color: #43a047" />
              </div>
              <div class="stat-number">{{ inStockItems }}</div>
              <div class="stat-desc">Number of Categories</div>
            </div>
          </v-card-text>
        </v-card>
        <v-card class="stat-card mb-4 stat-lowstock">
          <v-card-text>
            <div class="stat-content">
              <div class="stat-title">Low Stock</div>
              <div class="stat-icon-bg stat-lowstock-bg">
                <IconList style="width: 28px; height: 28px; color: #fbc02d" />
              </div>
              <div class="stat-number">{{ lowStockItems }}</div>
              <div class="stat-desc">Number of Categories</div>
            </div>
          </v-card-text>
        </v-card>
        <v-card class="stat-card mb-4 stat-outofstock">
          <v-card-text>
            <div class="stat-content">
              <div class="stat-title">Out of Stock</div>
              <div class="stat-icon-bg stat-outofstock-bg">
                <IconList style="width: 28px; height: 28px; color: #e53935" />
              </div>
              <div class="stat-number">{{ outOfStockItems }}</div>
              <div class="stat-desc">Number of Categories</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/services/api";
import IconBox from "@/components/icons/IconBox.vue";
import IconList from "@/components/icons/IconList.vue";

const totalItems = ref(0);
const inStockItems = ref(0);
const lowStockItems = ref(0);
const outOfStockItems = ref(0);
const recentActivities = ref([]);

const quickActions = ref([
  {
    title: "Add New Item",
    icon: "mdi-plus",
    action: "add",
  },
  {
    title: "Scan Items",
    icon: "mdi-qrcode-scan",
    action: "scan",
  },
  {
    title: "Generate Report",
    icon: "mdi-file-document",
    action: "report",
  },
]);

const fetchDashboardData = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("User not logged in");

    const { data: userItems, error: itemsError } = await supabase
      .from("items")
      .select("id, quantity, low_stock_threshold")
      .eq("user_id", user.id);

    if (itemsError) throw itemsError;

    if (!userItems || userItems.length === 0) {
      totalItems.value = 0;
      inStockItems.value = 0;
      lowStockItems.value = 0;
      outOfStockItems.value = 0;
      recentActivities.value = [];
      return;
    }

    totalItems.value = userItems.length;
    inStockItems.value = userItems.filter((item) => item.quantity > 0).length;
    lowStockItems.value = userItems.filter(
      (item) => item.quantity > 0 && item.quantity <= item.low_stock_threshold
    ).length;
    outOfStockItems.value = userItems.filter((item) => item.quantity === 0).length;

    const userItemIds = userItems.map((item) => item.id);

    const { data: activities, error: activitiesError } = await supabase
      .from("activity_logs")
      .select("*")
      .in("item_id", userItemIds)
      .order("created_at", { ascending: false })
      .limit(5);

    if (activitiesError) throw activitiesError;
    recentActivities.value = activities || [];
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message || error);
  }
};

const getActivityColor = (activityType) => {
  const colors = {
    add: "primary",
    update: "info",
    delete: "error",
    low_stock: "warning",
    out_of_stock: "error",
  };
  return colors[activityType] || "primary";
};

const getActivityTitle = (activityType) => {
  const titles = {
    add: "New Item Added",
    update: "Item Updated",
    delete: "Item Deleted",
    low_stock: "Low Stock Alert",
    out_of_stock: "Out of Stock Alert",
  };
  return titles[activityType] || "Activity";
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
};

const handleAction = (action) => {
  // Handle quick actions here
  console.log("Action:", action);
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
}

.welcome-card {
  margin-bottom: 24px;
  padding: 24px 16px;
}
.mascot-img {
  max-width: 120px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
}
.welcome-content {
  padding: 8px 16px;
}
.quick-access-card {
  margin-bottom: 24px;
  padding: 16px;
}
.stat-card {
  /* height: 100%; */
  min-height: 50px;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  transition: transform 0.2s;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.stat-card:hover {
  transform: translateY(-5px);
}
.stat-total {
  /* border-left: 6px solid #ffb300; */
}
.stat-instock {
  /* border-left: 6px solid #43a047; */
}
.stat-lowstock {
  /* border-left: 6px solid #fbc02d; */
}
.stat-outofstock {
  /* border-left: 6px solid #e53935; */
}
.v-card {
  border-radius: 8px;
}
.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  padding: 8px 0;
}
.stat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #444b54;
}
.stat-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 4px;
  margin: 0 auto;
  /* margin-bottom: 2px; */
  background: #f5f7fa;
}
.stat-total-bg {
  background: #fff8e1;
}
.stat-instock-bg {
  background: #e8f5e9;
}
.stat-lowstock-bg {
  background: #fffde7;
}
.stat-outofstock-bg {
  background: #ffebee;
}
.stat-number {
  font-size: 1.3rem;
  font-weight: 700;
  color: #444b54;
  margin: 0;
}
.stat-desc {
  font-size: 0.95rem;
  color: #666;
  margin-top: -2px;
}
</style>
