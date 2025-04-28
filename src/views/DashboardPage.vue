<template>
    <div fluid class="dashboard pa-4">
        <v-row>
            <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card" color="primary">
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="40" class="mr-3">mdi-package-variant</v-icon>
                            <div>
                                <div class="text-h6">Total Items</div>
                                <div class="text-h4">{{ totalItems }}</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card" color="success">
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="40" class="mr-3">mdi-check-circle</v-icon>
                            <div>
                                <div class="text-h6">In Stock</div>
                                <div class="text-h4">{{ inStockItems }}</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card" color="warning">
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="40" class="mr-3">mdi-alert</v-icon>
                            <div>
                                <div class="text-h6">Low Stock</div>
                                <div class="text-h4">{{ lowStockItems }}</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card" color="error">
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="40" class="mr-3">mdi-close-circle</v-icon>
                            <div>
                                <div class="text-h6">Out of Stock</div>
                                <div class="text-h4">{{ outOfStockItems }}</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4">
            <v-col cols="12" md="8">
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
                                        <div class="text-subtitle-2">{{ getActivityTitle(activity.activity_type) }}</div>
                                        <div class="text-caption">{{ activity.description }}</div>
                                    </div>
                                    <div class="text-caption">{{ formatTime(activity.created_at) }}</div>
                                </div>
                            </v-timeline-item>
                        </v-timeline>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card>
                    <v-card-title>Quick Actions</v-card-title>
                    <v-card-text>
                        <v-list>
                            <v-list-item
                                v-for="(action, i) in quickActions"
                                :key="i"
                                :prepend-icon="action.icon"
                                :title="action.title"
                                @click="handleAction(action.action)"
                            ></v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/services/api';

const totalItems = ref(0);
const inStockItems = ref(0);
const lowStockItems = ref(0);
const outOfStockItems = ref(0);
const recentActivities = ref([]);

const quickActions = ref([
    {
        title: 'Add New Item',
        icon: 'mdi-plus',
        action: 'add'
    },
    {
        title: 'Scan Items',
        icon: 'mdi-qrcode-scan',
        action: 'scan'
    },
    {
        title: 'Generate Report',
        icon: 'mdi-file-document',
        action: 'report'
    }
]);

const fetchDashboardData = async () => {
    try {
        // Fetch total items count
        const { count: totalCount } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true });

        // Fetch items with their quantities
        const { data: items } = await supabase
            .from('items')
            .select('quantity, low_stock_threshold');

        // Calculate statistics
        totalItems.value = totalCount;
        inStockItems.value = items.filter(item => item.quantity > 0).length;
        lowStockItems.value = items.filter(item => item.quantity > 0 && item.quantity <= item.low_stock_threshold).length;
        outOfStockItems.value = items.filter(item => item.quantity === 0).length;

        // Fetch recent activities
        const { data: activities } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        recentActivities.value = activities || [];
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
};

const getActivityColor = (activityType) => {
    const colors = {
        'add': 'primary',
        'update': 'info',
        'delete': 'error',
        'low_stock': 'warning',
        'out_of_stock': 'error'
    };
    return colors[activityType] || 'primary';
};

const getActivityTitle = (activityType) => {
    const titles = {
        'add': 'New Item Added',
        'update': 'Item Updated',
        'delete': 'Item Deleted',
        'low_stock': 'Low Stock Alert',
        'out_of_stock': 'Out of Stock Alert'
    };
    return titles[activityType] || 'Activity';
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
};

const handleAction = (action) => {
    // Handle quick actions here
    console.log('Action:', action);
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.dashboard {
    padding: 20px 0;
}

.stat-card {
    height: 100%;
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-5px);
}

.v-card {
    border-radius: 8px;
}
</style> 