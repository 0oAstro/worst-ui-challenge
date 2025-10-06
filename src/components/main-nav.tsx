"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { IconHome, IconTrophy, IconPlus, IconLogout, IconLogin } from "@tabler/icons-react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export function MainNav({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const navItems = [
    { name: "Home", link: "/", icon: IconHome },
    { name: "Leaderboard", link: "/leaderboard", icon: IconTrophy },
    { name: "Submit", link: "/submission/new", icon: IconPlus },
  ];


  return (
    <Navbar className="top-2">
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-3">
          {user ? (
            <NavbarButton
              onClick={handleLogout}
              as="button"
              className="cursor-pointer flex items-center gap-2"
            >
              <IconLogout className="w-4 h-4" />
              Logout
            </NavbarButton>
          ) : (
            <NavbarButton href={`/login?next=${pathname}`} className="flex items-center gap-2">
              <IconLogin className="w-4 h-4" />
              Login
            </NavbarButton>
          )}
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, _idx) => {
            const IconComponent = item.icon;
            return (
              <Link
                href={item.link}
                key={item.link}
                className="w-full flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                <IconComponent className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
            {user ? (
              <NavbarButton
                onClick={handleLogout}
                as="button"
                className="w-full cursor-pointer flex items-center justify-center gap-2"
              >
                <IconLogout className="w-4 h-4" />
                Logout
              </NavbarButton>
            ) : (
              <NavbarButton href={`/login?next=${pathname}`} className="w-full flex items-center justify-center gap-2">
                <IconLogin className="w-4 h-4" />
                Login
              </NavbarButton>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
