"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-md">
            <Image
              src="/illustrations/404 error lost in space-bro.svg"
              alt="Error 404"
              width={400}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/en"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Go Home
          </Link>
        </div>

        {/* Brand Footer */}
        <div className="mt-12">
          <span className="text-2xl font-bold text-gray-900">
            INVEX<span className="text-orange-500 font-extrabold">iS</span>
          </span>
        </div>
      </div>
    </div>
  );
}
