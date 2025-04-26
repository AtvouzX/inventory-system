<template>
  <v-card class="mb-6 pa-4" outlined>
    <v-card-title class="text-h5 font-weight-medium mb-4">
      Overall Inventory
    </v-card-title>
    <v-row>
      <v-col cols="12" sm="4" md="4">
        <div class="text-center">
          <div class="text-subtitle-1 font-weight-bold blue--text text--darken-2">Categories</div>
          <div class="text-h4 font-weight-bold my-2">{{ summary.totalCategories }}</div>
          <div class="text-caption grey--text">Total categories</div>
        </div>
      </v-col>

      <v-divider vertical class="hidden-sm-and-down"></v-divider>

      <v-col cols="12" sm="4" md="4">
        <div class="text-center">
            <div class="text-subtitle-1 font-weight-bold orange--text text--darken-2">Total Products</div>
            <v-row no-gutters align="center" justify="center" class="my-2">
              <v-col>
                <div class="text-h4 font-weight-bold">{{ summary.totalProducts }}</div>
                <div class="text-caption grey--text">Total product</div>
              </v-col>
              <v-col>
                 <div class="text-h4 font-weight-bold">{{ summary.totalQuantities }}</div> 
                 <div class="text-caption grey--text">Total quantities</div>
              </v-col>
            </v-row>
        </div>
      </v-col>

       <v-divider vertical class="hidden-sm-and-down"></v-divider>

      <v-col cols="12" sm="4" md="4">
        <div class="text-center">
          <div class="text-subtitle-1 font-weight-bold red--text text--lighten-1">Low Stocks</div>
          <v-row no-gutters align="center" justify="center" class="my-2">
             <v-col>
                <div class="text-h4 font-weight-bold">{{ summary.lowStockCount }}</div>
                <div class="text-caption grey--text">Low stock</div>
             </v-col>
              <v-col>
                <div class="text-h4 font-weight-bold">{{ summary.outOfStockCount }}</div>
                <div class="text-caption grey--text">Out of stock</div>
             </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getInventorySummary } from '@/services/api';

const summary = ref({
  totalCategories: 0,
  totalProducts: 0,
  totalQuantities: 0,
  lowStockCount: 0,
  outOfStockCount: 0
});

const fetchSummary = async () => {
  const data = await getInventorySummary();
  if (data) {
    summary.value = data;
  }
};

onMounted(() => {
  fetchSummary();
});
</script>

<style scoped>
/* Add any specific styles if needed */
.v-divider--vertical {
    margin-left: -1px; /* Adjust divider position if needed */
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    height: auto; /* Allow divider to take full height of the column */
}
.text-center {
    text-align: center;
}
.blue--text.text--darken-2 { color: #1976D2 !important; }
.orange--text.text--darken-2 { color: #F57C00 !important; }
/* .purple--text.text--darken-1 { color: #8E24AA !important; }  Removed as Top Selling is gone */
.red--text.text--lighten-1 { color: #EF5350 !important; }
.grey--text { color: #757575 !important; } /* Vuetify 3 uses different color names, added fallback */
</style> 