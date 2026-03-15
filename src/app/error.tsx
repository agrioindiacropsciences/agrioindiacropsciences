"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
