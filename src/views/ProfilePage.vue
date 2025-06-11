<template>
  <v-container class="profile-container" fluid>
    <v-row justify="center" class="mt-8">
      <v-col cols="12">
        <v-card class="pa-12 profile-card">
          <v-row align="center">
            <v-col cols="12" md="3" class="d-flex justify-center align-center">
              <v-avatar size="220">
                <img :src="profile.avatar_url || defaultAvatar" alt="Profile Picture" />
              </v-avatar>
            </v-col>
            <v-col cols="12" md="9">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon size="28">mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-subtitle-1">Username</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">{{
                    profile.display_name || "Kelompok 11"
                  }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item>
                  <template #prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon size="28">mdi-email</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-subtitle-1">Email</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">{{
                    profile.email
                  }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item>
                  <template #prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon size="28">mdi-information</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-subtitle-1">Bio</v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">{{
                    profile.bio || "Iwak Sigma"
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <div class="d-flex justify-center mt-8">
            <v-btn color="primary" class="px-8 py-2 text-body-2" rounded>Edit</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center" class="mt-8">
      <v-col cols="12">
        <v-card class="pa-6 text-center">
          <v-row>
            <v-col cols="4">About us</v-col>
            <v-col cols="4">Privacy Policy</v-col>
            <v-col cols="4">Terms of Use</v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/services/api";
import defaultAvatar from "@/assets/logo.png";

const profile = ref({
  display_name: "",
  email: "",
  bio: "",
  avatar_url: "",
});

onMounted(async () => {
  try {
    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch profile data from public.profile table
    const { data: profileData, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    if (profileData) {
      profile.value = profileData;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
});
</script>

<style scoped>
.profile-container {
  min-height: 80vh;
}
.profile-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(44, 62, 80, 0.12);
}
</style>
