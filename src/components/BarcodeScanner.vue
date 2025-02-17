<script setup>
import { ref, onUnmounted, defineEmits } from "vue";
import QrScanner from "qr-scanner";

QrScanner.WORKER_PATH = "/libs/qr-scanner-worker.min.js"; // Atur path worker manual

const emit = defineEmits(["scanned"]);
const videoRef = ref(null);
let qrScanner = null;

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
        { highlightScanRegion: true, highlightCodeOutline: true }
    );

    qrScanner.start();
};

const stopScanner = () => {
    if (qrScanner) {
        qrScanner.stop();
    }
};

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
        <video ref="videoRef" class="w-full h-64 mt-2"></video>
    </div>
</template>
