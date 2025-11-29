"use client";
import { usePathname } from "next/navigation";
import ProfileDropdown from "@/components/ProfileDropdown/ProfileDropdown";
import { ReactNode } from "react";

export default function PageWrapper({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const hideMenu =
    pathname.startsWith("/mylift/editor") || pathname.startsWith("/mylift/view");

  if (hideMenu) return children;

  return (
    <>
      <header className="site-header">
        <a href="/" className="site-header__main-button">
          <img src="/images/logo.png" alt="Bowser Elevators Logo" className="nav-logo" />
        </a>
        <div className="site-navigation">
          <div className="site-navigation__left">
            <a className="site-navigation__item" href="/mylift">
              Bowser Elevators MyLift
            </a>
            <a className="site-navigation__item" href="/elevator-video-player">
              Elevator Video Player
            </a>
          </div>
          <div className="site-navigation__right">
            <ProfileDropdown />
          </div>
        </div>
      </header>
      {children}
      <footer className="site-footer">© Bowser Elevators</footer>
    </>
  );
}
