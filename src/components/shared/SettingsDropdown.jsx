"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  MenuItem,
  Select,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { HiLanguage } from "react-icons/hi2";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useRouter, usePathname  } from "next/navigation";
import { useLocale } from "next-intl";
import { toggleTheme, setLocale } from "@/features/settings/settingsSlice";
import { selectTheme, selectLocale } from "@/features/settings/settingsSlice";

const languages = {
  en: "English",
  fr: "Français",
  sw: "Kiswahili",
  rw: "Kinyarwanda",
};

export default function SettingsDropdown({ anchor, open, onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  
  // Get theme and locale from Redux
  const theme = useSelector(selectTheme);
  const reduxLocale = useSelector(selectLocale);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    onClose();
  };

  const handleLanguageChange = (newLocale) => {
    // Update Redux state
    dispatch(setLocale(newLocale));
    
    // Navigate to new locale
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");
    router.push(`/${newLocale}${pathWithoutLocale || ""}`);
    
    onClose();
  };

  return (
    <Menu
      anchorEl={anchor}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
          mt: 1.5,
          width: 200,
          "& .MuiMenuItem-root": {
            px: 2,
            py: 1.5,
          },
        },
      }}
    >
      {/* Theme Toggle */}
      <MenuItem onClick={handleThemeToggle}>
        <ListItemIcon>
          {theme === "dark" ? (
            <MdLightMode className="text-xl" />
          ) : (
            <MdDarkMode className="text-xl" />
          )}
        </ListItemIcon>
        <ListItemText>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </ListItemText>
      </MenuItem>

      <Divider />

      {/* Language Selector */}
      <MenuItem>
        <ListItemIcon>
          <HiLanguage className="text-xl" />
        </ListItemIcon>
        <Select
          value={currentLocale || "en"}
          onChange={(e) => handleLanguageChange(e.target.value)}
          variant="standard"
          sx={{
            width: "100%",
            "& .MuiSelect-select": {
              py: 0,
            },
          }}
        >
          {Object.entries(languages).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </MenuItem>
    </Menu>
  );
}