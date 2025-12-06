"use client";
import { useState, useRef } from "react";
import useAuth from "@/hooks/useAuth";
// Authentication handled by NextAuth — removed legacy redux auth helpers
import {
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import IOSSwitch from "@/components/shared/IosSwitch";
import Image from "next/image";
import { ThemeRegistry } from "@/providers/ThemeRegistry";
import { RadioGroup, Radio, FormControl } from "@mui/material";
import { useRouter } from "next/navigation";

import { authAPI } from "@/utils/axiosClient";
import toast from "react-hot-toast";
import { signIn, getSession } from "next-auth/react";
import { useLocale } from "next-intl";

export default function EditProfilePage() {
  // no redux dispatch — session is managed by NextAuth
  const router = useRouter();
  const { user } = useAuth();
  const locale = useLocale();

  const [activeSection, setActiveSection] = useState("profile");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    firstName: user?.firstName || user?.fullName?.split(" ")?.[0] || "",
    lastName:
      user?.lastName || user?.fullName?.split(" ")?.slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || user?.dob || "",
    gender: user?.gender || "",
    bio: user?.bio || user?.about || "",
    desc: user?.desc || "",
    facebook: user?.social?.facebook || "",
    instagram: user?.social?.instagram || "",
    x: user?.social?.x || "",
    linkedin: user?.social?.linkedin || "",
    profilePicture: user?.profilePicture || user?.profileImage || "",
    backgroundImage: user?.backgroundImage || "",
    twoFAEnabled: user?.twoFAEnabled || user?.two_fa_enabled || false,
    loginOptions: {
      emailPassword: true,
      google: false,
      phone: false,
      otp: false,
      voice: false,
    },
    email_verified: user?.isEmailVerified || user?.email_verified || false,
    nationalId: user?.nationalId || user?.nationalID || "",
    position: user?.position || "",
    department: user?.department || "",
    employmentStatus: user?.employmentStatus || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
    },
    emergencyContact: {
      name: user?.emergencyContact?.name || "",
      phone: user?.emergencyContact?.phone || "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // support nested fields like address.street or emergencyContact.name
    if (name.includes(".")) {
      const parts = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parts[0]]: { ...prev[parts[0]], [parts[1]]: value },
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLoginOptionToggle = (option) => {
    setFormData((prev) => ({
      ...prev,
      loginOptions: {
        ...prev.loginOptions,
        [option]: !prev.loginOptions[option],
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profilePicture: imageURL }));
      // leave actual upload to the server endpoint (if available); currently preview-only
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bio: formData.bio,
        desc: formData.desc,
        profilePicture: formData.profilePicture,
        backgroundImage: formData.backgroundImage,
        twoFAEnabled: formData.twoFAEnabled,
        nationalId: formData.nationalId,
        position: formData.position,
        department: formData.department,
        employmentStatus: formData.employmentStatus,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        social: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          x: formData.x,
          linkedin: formData.linkedin,
        },
      };

      const res = await authAPI.updateProfile(payload);
      const updatedUser = res?.data?.user || res?.data;

      // Re-seed the NextAuth session with fresh user data. We pass the current
      // accessToken (if present) so the jwt callback can preserve tokens.
      try {
        const sess = await getSession();
        await signIn("credentials", {
          redirect: false,
          seedUser: JSON.stringify(updatedUser),
          accessToken: sess?.accessToken,
        });
      } catch (e) {
        // if signIn fails, not catastrophic — UI can continue to show updated values
        console.warn("session reseed failed", e);
      }

      // Update local form fields with server returned user data
      setFormData((prev) => ({
        ...prev,
        firstName: updatedUser?.firstName ?? prev.firstName,
        lastName: updatedUser?.lastName ?? prev.lastName,
        username: updatedUser?.username ?? prev.username,
        email: updatedUser?.email ?? prev.email,
        phone: updatedUser?.phone ?? prev.phone,
        dateOfBirth: updatedUser?.dateOfBirth ?? prev.dateOfBirth,
        gender: updatedUser?.gender ?? prev.gender,
        bio: updatedUser?.bio ?? prev.bio,
        profilePicture: updatedUser?.profilePicture ?? prev.profilePicture,
        address: { ...(prev.address || {}), ...(updatedUser?.address || {}) },
        emergencyContact: {
          ...(prev.emergencyContact || {}),
          ...(updatedUser?.emergencyContact || {}),
        },
      }));

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile"
      );
    }
  };

  const handleReset = () => {
    setFormData({
      username: user?.username || "",
      firstName: user?.firstName || user?.fullName?.split(" ")?.[0] || "",
      lastName:
        user?.lastName || user?.fullName?.split(" ")?.slice(1).join(" ") || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || user?.dob || "",
      gender: user?.gender || "",
      bio: user?.bio || user?.about || "",
      desc: user?.desc || "",
      facebook: user?.social?.facebook || "",
      instagram: user?.social?.instagram || "",
      x: user?.social?.x || "",
      linkedin: user?.social?.linkedin || "",
      profilePicture: user?.profilePicture || user?.profileImage || "",
      backgroundImage: user?.backgroundImage || "",
      twoFAEnabled: user?.twoFAEnabled || user?.two_fa_enabled || false,
      loginOptions: {
        emailPassword: true,
        google: false,
        phone: false,
        otp: false,
        voice: false,
      },
      email_verified: user?.isEmailVerified || user?.email_verified || false,
      nationalId: user?.nationalId || user?.nationalID || "",
      employmentStatus: user?.employmentStatus || "",
      position: user?.position || "",
      department: user?.department || "",
      address: {
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        postalCode: user?.address?.postalCode || "",
        country: user?.address?.country || "",
      },
      emergencyContact: {
        name: user?.emergencyContact?.name || "",
        phone: user?.emergencyContact?.phone || "",
      },
    });
  };

  return (
    <ThemeRegistry>
      <div className="flex flex-col md:flex-row bg-white rounded-2xl w-full p-6 font-metropolis pb-24 border border-gray-100">
        {/* Left: Form Content */}
        <div className="flex-1 p-6 rounded-2xl">
          <h5 className="font-bold text-2xl mb-10">
            {activeSection === "profile"
              ? "Edit Profile"
              : activeSection === "account"
              ? "Account Management"
              : "Security Settings"}
          </h5>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {activeSection === "profile" && (
              <>
                <div className="col-span-2 flex items-center gap-6 mb-8">
                  <div className="relative">
                    <Image
                      src={formData.profilePicture || "/images/user3.jpg"}
                      alt="Profile"
                      width={90}
                      height={90}
                      className="w-[90px] h-[90px] rounded-full border object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col">
                      <p className="font-semibold text-lg">
                        {formData.firstName || formData.username
                          ? `${formData.firstName ?? ""} ${
                              formData.lastName ?? ""
                            }`.trim()
                          : "Your Name"}
                      </p>
                      <p className="font-light text-sm text-gray-400 italic">
                        {formData.username || "Your Name"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 bg-white text-gray-800 rounded-2xl w-fit border border-gray-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
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
                />
                <TextField
                  label="Description"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  className="col-span-2"
                />
              </>
            )}

            {activeSection === "account" && (
              <>
                <p className="col-span-2 mb-2 font-semibold text-lg">
                  Personal Information
                </p>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
                {!formData.email_verified && (
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1, ml: 1, height: "40px" }}
                  >
                    Verify Email
                  </Button>
                )}
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="National ID"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl component="fieldset" className="col-span-2">
                  <p className="mb-2 font-semibold">Gender</p>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Female"
                    />
                  </RadioGroup>
                </FormControl>
                <p className="col-span-2 mt-4 mb-2 font-semibold text-lg">
                  Social Media
                </p>
                <p className="col-span-2 mt-4 mb-2 font-semibold text-lg">
                  Address
                </p>

                <TextField
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Postal Code"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  fullWidth
                />

                <p className="col-span-2 mt-4 mb-2 font-semibold text-lg">
                  Emergency Contact
                </p>
                <TextField
                  label="Contact Name"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Contact Phone"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  fullWidth
                />
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
                  label="X (Twitter)"
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
              </>
            )}

            {activeSection === "security" && (
              <div className="col-span-2 flex flex-col gap-6">
                <div>
                  <h6 className="font-bold mb-2 text-xl">
                    Two-Factor Authentication
                  </h6>
                  <p className="text-gray-600 mb-2 text-sm">
                    Add an extra layer of security to your account by enabling
                    two-factor authentication.
                  </p>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={formData.two_fa_enabled}
                        onChange={() => handleToggle("two_fa_enabled")}
                      />
                    }
                    label="Enable 2FA"
                    sx={{
                      fontFamily: "Metropolis",
                      "& .MuiFormControlLabel-label": { marginLeft: 2 },
                    }}
                  />
                </div>

                <div>
                  <h6 className="font-bold mb-2 text-xl">Login Options</h6>
                  <p className="text-gray-600 mb-3 text-sm">
                    Choose which authentication methods you can use to log in.
                  </p>
                  {Object.keys(formData.loginOptions).map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={formData.loginOptions[option]}
                          onChange={() => handleLoginOptionToggle(option)}
                        />
                      }
                      label={option.replace(/([A-Z])/g, " $1")}
                    />
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full md:w-64 border-l pl-6 mt-6 md:mt-0">
          <h6 className="font-bold mb-6 text-xl font-metropolis">Settings</h6>
          <div className="flex flex-col space-y-4">
            {["profile", "account", "security"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`text-left font-bold transition-all text-[#081422] duration-200 pb-1 border-b-4  ${
                  activeSection === section
                    ? "border-[#081422]"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                {section === "profile"
                  ? "Edit Profile"
                  : section === "account"
                  ? "Account Management"
                  : "Security"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🧭 Fixed Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-end gap-4 px-6 py-3 md:pl-[calc(256px+1.5rem)]">
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            backgroundColor: "#fff",
            color: "#111827",
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#e5e7eb",
            boxShadow: "none",
            ":hover": { backgroundColor: "#fbfbfb" },
          }}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          type="submit"
          onClick={async (e) => {
            await handleSubmit(e);
            router.push(`${locale}/account/profile`); // redirect to profile page
          }}
          sx={{
            backgroundColor: "#ff782d",
            textTransform: "none",
            fontWeight: 600,
            ":hover": { opacity: 0.9 },
          }}
        >
          Save
        </Button>
      </div>
    </ThemeRegistry>
  );
}
