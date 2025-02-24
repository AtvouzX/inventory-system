<template>
    <v-dialog v-model="dialog" max-width="350">
        <v-card class="pa-4">
            <v-card-title class="text-h6 text-center">QR Code</v-card-title>
            <v-divider></v-divider>
            <v-card-text class="d-flex flex-column align-center">
                <qrcode-vue :value="value" :size="200" level="H" class="my-4" />
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="justify-end">
                <v-btn color="primary" @click="printQR">Print</v-btn>
                <v-btn color="success" @click="saveQR">Save</v-btn>
                <v-btn color="error" @click="dialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';

const dialog = ref(false);
const value = ref('');

const openDialog = (uuid) => {
    value.value = uuid;
    dialog.value = true;
};

defineExpose({ openDialog });

const printQR = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<img src="${document.querySelector('canvas').toDataURL()}" style="width:200px; display:block; margin:auto;"/>`);
    printWindow.document.close();
    printWindow.print();
};

const saveQR = () => {
    const link = document.createElement('a');
    link.href = document.querySelector('canvas').toDataURL();
    link.download = 'qr_code.png';
    link.click();
};
</script>

<style scoped>
.text-center {
    text-align: center;
}
</style>
