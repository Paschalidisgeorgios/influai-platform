import "./globals.css";

import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "INFLUA AI | CineAI Studio",
  description:
    "Cinematic AI image generation with persistent characters, prompt intelligence, and private gallery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="en">

      <body className="bg-black text-white">

        <Toaster
          position="top-right"

          toastOptions={{

            style: {
              background: "#080808",
              color: "#ffffff",
              border:
                "1px solid #1a1a1a",
            },

            success: {
              iconTheme: {
                primary:
                  "#c7a36a",
                secondary:
                  "#000000",
              },
            },

            error: {
              iconTheme: {
                primary:
                  "#ef4444",
                secondary:
                  "#ffffff",
              },
            },
          }}
        />

        {children}

      </body>

    </html>
  );
}