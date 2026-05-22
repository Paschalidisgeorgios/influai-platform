"use client";

import { useState } from "react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  LayoutDashboard,
  Users,
  ImageIcon,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname =
    usePathname();

  const [mobileMenu,
    setMobileMenu] =
    useState(false);

  async function handleLogout() {

    await supabase.auth.signOut();

    window.location.href =
      "/login";
  }

  function isActiveLink(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  const links = [

    {
      href: "/dashboard",
      label: "Dashboard",
      icon:
        LayoutDashboard,
    },

    {
      href:
        "/dashboard/characters",
      label: "Characters",
      icon: Users,
    },

    {
      href:
        "/dashboard/gallery",
      label: "Gallery",
      icon: ImageIcon,
    },

    {
      href:
        "/dashboard/image-generator",
      label:
        "Image Generator",
      icon: Sparkles,
    },
  ];

  return (

    <div className="min-h-screen bg-black text-white flex">

      {/* MOBILE TOPBAR */}

      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-[#050505] border-b border-[#1a1a1a] px-5 py-4 flex items-center justify-between">

        <div>

          <h1 className="font-bold text-lg">
            InfluAI
          </h1>

        </div>

        <button
          onClick={() =>
            setMobileMenu(
              !mobileMenu
            )
          }
        >

          {mobileMenu ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}

        </button>

      </div>

      {/* MOBILE OVERLAY */}

      {mobileMenu && (

        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />

      )}

      {/* SIDEBAR */}

      <aside className={`
        fixed lg:relative z-50 top-0 left-0 h-screen w-[280px]
        border-r border-[#1a1a1a]
        bg-[#050505]
        flex flex-col justify-between
        p-6
        transition-transform duration-300

        ${mobileMenu
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
        }
      `}>

        <div>

          {/* DESKTOP LOGO */}

          <div className="mb-12 hidden lg:block">

            <h1 className="text-3xl font-bold">
              InfluAI
            </h1>

          </div>

          {/* MOBILE SPACER */}

          <div className="h-16 lg:hidden" />

          {/* NAVIGATION */}

          <nav className="space-y-2">

            {links.map((link) => {

              const Icon =
                link.icon;

              const active =
                isActiveLink(link.href);

              return (

                <Link
                  key={link.href}
                  href={link.href}

                  onClick={() =>
                    setMobileMenu(
                      false
                    )
                  }

                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
                    active
                      ? "bg-[#c7a36a] text-black font-semibold"
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >

                  <Icon
                    size={20}
                  />

                  {link.label}

                </Link>
              );
            })}

          </nav>

        </div>

        {/* LOGOUT */}

        <button
          onClick={handleLogout}

          className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-600 hover:bg-red-700 transition"
        >

          <LogOut size={20} />

          Logout

        </button>

      </aside>

      {/* CONTENT */}

      <main className="flex-1 overflow-y-auto pt-[90px] lg:pt-0">

        {children}

      </main>

    </div>
  );
}