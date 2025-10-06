"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  };

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Leaderboard", link: "/leaderboard" },
    { name: "New Submission", link: "/submission/new" },
  ];

  return (
    <Navbar className="top-2">
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          {user ? (
            <NavbarButton onClick={handleLogout} className="cursor-pointer">Logout</NavbarButton>
          ) : (
            <Link href={`/login?next=${pathname}`}>
              <NavbarButton>Login</NavbarButton>
            </Link>
          )}
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, idx) => (
            <Link href={item.link} key={idx} className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
              {item.name}
            </Link>
          ))}
           <div className="flex items-center gap-2 mt-4">
            {user ? (
              <NavbarButton onClick={handleLogout} className="cursor-pointer">Logout</NavbarButton>
            ) : (
              <Link href={`/login?next=${pathname}`}>
                <NavbarButton>Login</NavbarButton>
              </Link>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
