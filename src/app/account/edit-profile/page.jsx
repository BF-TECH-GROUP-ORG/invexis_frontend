"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings } from "@/store/authActions";
import { TextField, Button, FormControlLabel, Typography } from "@mui/material";
import IOSSwitch from "@/components/shared/IosSwitch";
import Image from "next/image";
import { ThemeRegistry } from "@/providers/ThemeRegistry";

export default function EditProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    facebook: user?.social?.facebook || "",
    instagram: user?.social?.instagram || "",
    x: user?.social?.x || "",
    linkedin: user?.social?.linkedin || "",
    profileImage: user?.profileImage || "",
    backgroundImage: user?.backgroundImage || "",
    two_fa_enabled: user?.two_fa_enabled || false,
    ai_voice_login_enabled: user?.ai_voice_login_enabled || false,
    email_verified: user?.email_verified || false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateUserSettings(formData));
  };

  return (
    <ThemeRegistry>
      <div className="max-w-3xl mx-auto p-6">
        <Typography variant="h5" className="mb-6 font-bold">
          Edit Profile
        </Typography>

        {/* Profile & Background Images */}
        <div className="flex gap-8 mb-6">
          <div className="flex flex-col gap-8">
            <Typography variant="body2">Profile Image</Typography>
            <Image
              src={formData.profileImage || "/images/user3.jpg"}
              alt="Profile"
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-full border"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Profile Image URL"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
            />
          </div>
          <div>
            <Typography variant="body2">Background Image</Typography>
            <Image
              src={formData.backgroundImage || "/images/bg-placeholder.jpg"}
              alt="Background"
              width={160}
              height={80}
              className="rounded border"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Background Image URL"
              name="backgroundImage"
              value={formData.backgroundImage}
              onChange={handleChange}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Basic Info */}
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            className="col-span-2"
          />

          {/* Social Links */}
          <TextField
            label="Facebook"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Twitter (X)"
            name="x"
            value={formData.x}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="LinkedIn"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            fullWidth
          />

          {/* Toggles */}
          <div className="col-span-2 flex flex-col gap-2 mt-4">
            <FormControlLabel
              control={
                <IOSSwitch
                  checked={formData.two_fa_enabled}
                  onChange={() => handleToggle("two_fa_enabled")}
                />
              }
              label="Enable Two-Factor Authentication"
            />
            <FormControlLabel
              control={
                <IOSSwitch
                  checked={formData.ai_voice_login_enabled}
                  onChange={() => handleToggle("ai_voice_login_enabled")}
                />
              }
              label="Enable AI Voice Login"
            />
            <FormControlLabel
              control={
                <IOSSwitch
                  checked={formData.email_verified}
                  onChange={() => handleToggle("email_verified")}
                />
              }
              label="Email Verified"
            />
          </div>

          {/* Save Button */}
          <div className="col-span-2 flex justify-end mt-6">
            <Button
              variant="contained"
              type="submit"
              sx={{ backgroundColor: "#ff782d", ":hover": { opacity: 0.9 } }}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </ThemeRegistry>
  );
}
