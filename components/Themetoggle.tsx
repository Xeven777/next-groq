"use client";

import { useTheme } from "next-themes";
import themeIcon from "@/assets/theme.svg";
import Image from "next/image";
export default function ThemeTogglebutton() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="absolute top-1 md:top-2 md:left-8 left-2 active:rotate-12 transition-all rounded-full p-2 bg-neutral-200/20 backdrop-blur dark:bg-neutral-800/30 border shadow dark:border-neutral-600/50 hover:bg-orange-600 active:scale-105"
      title="Toggle Theme"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Image src={themeIcon} alt="" width={30} className="size-6" />
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}