"use client";

import { useEffect, useState } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDebug, setShowDebug] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.error("Page error:", error?.message, error?.stack, error?.digest);
  }, [error]);

  useEffect(() => {
    if (retryCount > 0 && retryCount <= 2) {
      reset();
    }
  }, [retryCount, reset]);

  const handleRetry = () => {
    if (retryCount >= 2) {
      window.location.reload();
      return;
    }
    setRetryCount((c) => c + 1);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-white">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Please try refreshing the page.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
          >
            Reload Page
          </button>
        </div>
        {/* Debug info — tap to toggle */}
        <button
          onClick={() => setShowDebug((v) => !v)}
          className="mt-8 text-[10px] text-gray-300"
        >
          tap for details
        </button>
        {showDebug && (
          <pre className="mt-2 text-left text-[10px] text-red-400 bg-gray-50 p-3 rounded-lg overflow-auto max-h-40 break-all whitespace-pre-wrap">
            {error?.message || "Unknown error"}
            {"\n"}
            {error?.digest || ""}
            {"\n"}
            {error?.stack?.slice(0, 500) || ""}
          </pre>
        )}
      </div>
    </div>
  );
}
