<script setup>
import { ref, onUnmounted, defineEmits, onMounted } from "vue";
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
        console.error("Gagal mendapatkan daftar kamera:", error);
    }
};

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
            preferredCamera: selectedCamera.value, // Gunakan kamera yang dipilih
            workerSrc: "/libs/qr-scanner-worker.min.js" // Atur path worker di sini
        }
    );

    qrScanner.start();
};

const stopScanner = () => {
    if (qrScanner) {
        qrScanner.stop();
    }
};

const changeCamera = (cameraId) => {
    if (qrScanner) {
        qrScanner.setCamera(cameraId);
    }
};

onMounted(getCameras);

onUnmounted(() => {
    if (qrScanner) {
        qrScanner.destroy();
    }
});
</script>

<template>
    <div>
        <button @click="startScanner" class="bg-blue-500 text-white p-2 w-full">Mulai Scan</button>
        <button @click="stopScanner" class="bg-red-500 text-white p-2 w-full mt-2">Hentikan Scan</button>
        
        <!-- Dropdown untuk memilih kamera -->
        <select v-model="selectedCamera" @change="changeCamera(selectedCamera)" class="border p-2 w-full mt-2">
            <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
                {{ camera.label }}
            </option>
        </select>

        <video ref="videoRef" class="w-full h-64 mt-2"></video>
    </div>
</template>