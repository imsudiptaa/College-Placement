import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const AdminProfile = () => {
  const token = sessionStorage.getItem("authToken");
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const profileEndpoint = `http://localhost:3001/admin/profile`;
  const avatarEndpoint = `http://localhost:3001/admin/upload-avatar`;

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", "admin"],
    queryFn: async () => {
      const res = await axios.get(profileEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    enabled: !!token,
  });

  const { register, reset, handleSubmit } = useForm();

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await axios.put(profileEndpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries(["profile", "admin"]);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      await axios.post(avatarEndpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Avatar uploaded successfully!");
      queryClient.invalidateQueries(["profile", "admin"]);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to upload avatar. Please try again."
      );
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl text-red-600 mb-4">Error: {error.message}</h2>
        <button
          onClick={() => queryClient.invalidateQueries(["profile", "admin"])}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Header user={profileData} />
        <div className="content-container px-3 py-4 w-full mx-auto max-w-full">
          <div className="bg-white rounded-xl shadow-sm px-6 py-6 w-full">
            {/* Profile header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar avatar={profileData.avatar} />
                <h1 className="text-xl font-semibold text-gray-800">My Profile</h1>
              </div>
              {!isEditing ? (
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <button
                  className="px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => {
                    reset(profileData);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Upload avatar */}
            <div className="flex justify-center mb-6">
              <label
                htmlFor="avatarUpload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
              >
                {uploadAvatarMutation.isLoading ? "Uploading..." : "Upload Avatar"}
              </label>
              <input
                type="file"
                id="avatarUpload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Form */}
            <form
              className="flex flex-col gap-4 max-w-md mx-auto"
              onSubmit={handleSubmit(onSubmit)}
            >
              <InputField
                label="Name"
                register={register("name")}
                disabled={!isEditing}
              />
              <InputField
                label="Email"
                register={register("email")}
                disabled={!isEditing}
              />
              {profileData?.phone && (
                <InputField
                  label="Phone"
                  register={register("phone")}
                  disabled={!isEditing}
                />
              )}

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminProfile;

const Avatar = ({ avatar }) => (
  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
    <img
      src={
        avatar
          ? `http://localhost:3001${avatar}`
          : "https://via.placeholder.com/150"
      }
      alt="Avatar"
      className="w-full h-full object-cover"
    />
  </div>
);

const InputField = ({ label, register, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      {...register}
      disabled={disabled}
      className={`w-full border px-3 py-2 rounded ${
        disabled ? "bg-gray-100" : "bg-white"
      }`}
    />
  </div>
);
