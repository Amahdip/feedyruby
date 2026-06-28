"use client";

import { Toaster } from "react-hot-toast";

export const ToasterClient = () => {
  return (
    <Toaster
      toastOptions={{
        success: { className: "feedyruby__toast__success" },
        error: {
          className: "feedyruby__toast__error",
        },
      }}
    />
  );
};
