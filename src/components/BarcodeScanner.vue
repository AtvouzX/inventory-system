<template>
    <v-card>
        <v-card-title>
            <v-icon start>mdi-qrcode-scan</v-icon>
            Barcode Scanner
        </v-card-title>

        <v-card-text>
            <!-- Tombol Mulai dan Hentikan Scan -->
            <v-btn color="primary" @click="startScanner" block class="mb-2">
                <v-icon start>mdi-play</v-icon>
                Start Scan
            </v-btn>

            <v-btn color="error" @click="stopScanner" block class="mb-2">
                <v-icon start>mdi-stop</v-icon>
                Stop Scan
            </v-btn>

            <!-- Dropdown untuk memilih kamera -->
            <v-select v-model="selectedCamera" :items="cameras" item-title="label" item-value="id" label="Select Camera"
                @update:modelValue="changeCamera" class="mb-4"></v-select>

            <!-- Video untuk menampilkan kamera -->
            <video ref="videoRef" class="w-full h-64" style="border: 1px solid #ccc;"></video>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from "vue";
import QrScanner from "qr-scanner";

const emit = defineEmits(["scanned"]);

const videoRef = ref(null);
const cameras = ref([]);
const selectedCamera = ref(null);
let qrScanner = null;

// Fungsi untuk mendapatkan daftar kamera
const getCameras = async () => {
    try {
        const camerasList = await QrScanner.listCameras(true);
        cameras.value = camerasList;
        if (camerasList.length > 0) {
            selectedCamera.value = camerasList[0].id; // Set kamera default
        }
    } catch (error) {
        console.error("Failed to get camera list:", error);
    }
};

// Fungsi untuk memulai scanner
const startScanner = async () => {
    if (qrScanner) {
        qrScanner.start();
        return;
    }

    qrScanner = new QrScanner(
        videoRef.value,
        (result) => {
            emit("scanned", result);
            stopScanner();
        },
        {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: selectedCamera.value,
            workerSrc: "/libs/qr-scanner-worker.min.js", // Sesuaikan path worker
        }
    );

    qrScanner.start();
};

// Fungsi untuk menghentikan scanner
const stopScanner = () => {
    if (qrScanner) {
        qrScanner.stop();
    }
};

// Fungsi untuk mengganti kamera
const changeCamera = (cameraId) => {
    if (qrScanner) {
        qrScanner.setCamera(cameraId);
    }
};

// Lifecycle hooks
onMounted(getCameras);
onUnmounted(() => {
    if (qrScanner) {
        qrScanner.destroy();
    }
});
</script>

<style scoped>
.w-full {
    width: 100%;
}

.h-64 {
    height: 256px;
    /* Sesuaikan tinggi video */
}
</style>