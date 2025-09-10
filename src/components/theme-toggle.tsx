"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Avoid SSR/CSR mismatch by not rendering dynamic label until mounted
    return null;
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Light mode" : "Dark mode";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button variant="secondary" size="sm" onClick={toggle} title={label}>
      {label}
    </Button>
  );
}
