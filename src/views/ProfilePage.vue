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
              <v-list v-if="!isEditing">
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

              <v-form v-else ref="form" @submit.prevent="handleSave" class="mt-4">
                <v-text-field
                  v-model="editedProfile.display_name"
                  label="Username"
                  :rules="[(v) => !!v || 'Username is required']"
                  variant="outlined"
                  prepend-inner-icon="mdi-account"
                  class="mb-4"
                ></v-text-field>

                <v-text-field
                  v-model="editedProfile.email"
                  label="Email"
                  disabled
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  class="mb-4"
                ></v-text-field>

                <v-text-field
                  v-model="editedProfile.bio"
                  label="Bio"
                  variant="outlined"
                  prepend-inner-icon="mdi-information"
                  class="mb-4"
                ></v-text-field>

                <div class="d-flex justify-center gap-4">
                  <v-btn
                    color="error"
                    variant="outlined"
                    class="px-8 py-2 text-body-2"
                    rounded
                    @click="handleDiscard"
                  >
                    Discard
                  </v-btn>
                  <v-btn
                    color="primary"
                    class="px-8 py-2 text-body-2"
                    rounded
                    type="submit"
                    :loading="loading"
                  >
                    Save
                  </v-btn>
                </div>
              </v-form>
            </v-col>
          </v-row>
          <div v-if="!isEditing" class="d-flex justify-center gap-4 mt-8">
            <v-btn color="primary" class="px-8 py-2 text-body-2" rounded @click="startEditing">
              Edit Profile
            </v-btn>
            <v-btn
              color="secondary"
              class="px-8 py-2 text-body-2"
              rounded
              @click="startPasswordChange"
            >
              Change Password
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Password Change Dialog -->
    <v-dialog v-model="showPasswordDialog" max-width="500px">
      <v-card class="pa-6">
        <v-card-title class="text-h5 mb-4">Change Password</v-card-title>
        <v-form ref="passwordForm" @submit.prevent="handlePasswordChange">
          <v-text-field
            v-model="passwordData.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            label="Current Password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
            :rules="[(v) => !!v || 'Current password is required']"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="passwordData.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            label="New Password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showNewPassword = !showNewPassword"
            :rules="[
              (v) => !!v || 'New password is required',
              (v) => v.length >= 6 || 'Password must be at least 6 characters',
            ]"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="passwordData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm New Password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            :rules="[
              (v) => !!v || 'Please confirm your password',
              (v) => v === passwordData.newPassword || 'Passwords must match',
            ]"
            class="mb-4"
          ></v-text-field>

          <div class="d-flex justify-end gap-4">
            <v-btn
              color="error"
              variant="outlined"
              class="px-8 py-2 text-body-2"
              rounded
              @click="closePasswordDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              class="px-8 py-2 text-body-2"
              rounded
              type="submit"
              :loading="passwordLoading"
            >
              Update Password
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

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
import { supabase, updateUserProfile, updateUserPassword } from "@/services/api";
import defaultAvatar from "@/assets/logo.png";

const profile = ref({
  display_name: "",
  email: "",
  bio: "",
  avatar_url: "",
});

const editedProfile = ref({
  display_name: "",
  email: "",
  bio: "",
  avatar_url: "",
});

const passwordData = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isEditing = ref(false);
const loading = ref(false);
const form = ref(null);
const passwordForm = ref(null);
const showPasswordDialog = ref(false);
const passwordLoading = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

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
      editedProfile.value = { ...profileData };
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
});

const startEditing = () => {
  editedProfile.value = { ...profile.value };
  isEditing.value = true;
};

const handleDiscard = () => {
  editedProfile.value = { ...profile.value };
  isEditing.value = false;
};

const handleSave = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  try {
    loading.value = true;
    const updatedProfile = await updateUserProfile({
      display_name: editedProfile.value.display_name,
      bio: editedProfile.value.bio,
    });

    if (updatedProfile) {
      profile.value = updatedProfile;
      isEditing.value = false;
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    alert(error.message || "Error saving profile");
  } finally {
    loading.value = false;
  }
};

const startPasswordChange = () => {
  passwordData.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  showPasswordDialog.value = true;
};

const closePasswordDialog = () => {
  showPasswordDialog.value = false;
  if (passwordForm.value) {
    passwordForm.value.reset();
  }
};

const handlePasswordChange = async () => {
  if (!passwordForm.value) return;

  const { valid } = await passwordForm.value.validate();
  if (!valid) return;

  try {
    passwordLoading.value = true;

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.value.email,
      password: passwordData.value.currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    // Update to new password
    await updateUserPassword(passwordData.value.newPassword);

    // Close dialog and show success message
    closePasswordDialog();
    alert("Password updated successfully");
  } catch (error) {
    console.error("Error changing password:", error);
    alert(error.message || "Error changing password");
  } finally {
    passwordLoading.value = false;
  }
};
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
.gap-4 {
  gap: 1rem;
}
</style>
