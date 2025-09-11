"use client";

import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { HiArrowRight } from "react-icons/hi";
import { FaGoogle, FaApple } from "react-icons/fa";
import Link from "next/link";

export default function FormWrapper({
  title,
  desc,
  fields = [],
  onSubmit,
  submitLabel = "Submit",
  submitIcon = <HiArrowRight />,
  oauthOptions = [],
  extraLinks = [],
  showDivider = true,
}) {
  return (
    <div className="w-full max-w-md p-8 rounded-lg">
      {title && (
        <h2 className="text-3xl font-extrabold text-center mb-6">{title}</h2>
      )}
      {desc && <p className="text-xs text-center text-gray-400 mb-6">{desc}</p>}

      {/* Dynamic Form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col gap-5">
            <p>{field.before && field.before}</p>
            <TextField
              label={field.label}
              variant="outlined"
              type={field.type}
              value={field.value}
              onChange={field.onChange}
              required={field.required}
              placeholder={field.placeholder}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontFamily: "Metropolis, sans-serif",
                  fontSize: "12px",
                  textAlign: "center",
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "Metropolis, sans-serif",
                  fontSize: "12px",
                },
              }}
              InputProps={field.InputProps}
            />
          </div>
        ))}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="flex items-center justify-center mt-2"
          endIcon={submitIcon}
          sx={{
            borderRadius: "12px",
            height: "50px",
            fontFamily: "Metropolis, sans-serif",
            fontSize: "12px",
            textTransform: "none",
          }}
        >
          {submitLabel}
        </Button>
      </form>

      {/* Divider */}
      {showDivider && (
        <div className="flex items-center my-6">
          <Divider className="flex-grow" />
          <span className="px-4 text-gray-500 font-medium">or</span>
          <Divider className="flex-grow" />
        </div>
      )}

      {/* OAuth Options */}
      {oauthOptions.length > 0 && (
        <div className="flex justify-center space-x-4 gap-4">
          {oauthOptions.includes("google") && (
            <IconButton
              sx={{
                borderRadius: "50%",
                border: "1px solid #e0e0e0",
                width: "50px",
                height: "50px",
              }}
            >
              <FaGoogle className="text-xl text-red-500" />
            </IconButton>
          )}
          {oauthOptions.includes("apple") && (
            <IconButton
              sx={{
                borderRadius: "50%",
                border: "1px solid #e0e0e0",
                width: "50px",
                height: "50px",
              }}
            >
              <FaApple className="text-2xl text-black" />
            </IconButton>
          )}
        </div>
      )}

      {/* Extra Links (e.g., Forgot password, Sign up) */}
      {extraLinks.length > 0 && (
        <div className="flex flex-col items-center mt-4 space-y-2">
          {extraLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="text-xs flex items-center justify-center text-blue-600 gap-2 hover:underline font-metropolis"
            >
              <span className="text-2xl">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
