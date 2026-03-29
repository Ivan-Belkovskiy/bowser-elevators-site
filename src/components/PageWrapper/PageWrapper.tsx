"use client";
const unavailablePages: string[] = [
  // "/mylift",
  // "/elevator-video-player"
];

import { usePathname } from "next/navigation";
import ProfileDropdown from "@/components/ProfileDropdown/ProfileDropdown";
import { ReactNode } from "react";

export default function PageWrapper({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  if (unavailablePages.some(url => pathname.startsWith(url))) return (
    <div className="service-unavailable-notification">
      <h1 className="service-unavailable-notification__title">Bowser Elevators Company</h1>
      <hr />
      <span className="service-unavailable-notification__message">На данный момент сервис "Bowser Elevators MyLift" временно недоступен! Вы можете открыть другие страницы сайта, пока ведутся работы на сервере!</span>
      <a href="/" className="service-unavailable-notification__button">На главную страницу</a>
    </div>
  );
  const hideMenu =
    pathname.startsWith("/mylift/editor") || pathname.startsWith("/mylift/elevator");

  if (hideMenu) return children;

  return (
    <>
      <header className="site-header">
        <a href="/" className="site-header__main-button">
          <img src="/images/logo.png" alt="Bowser Elevators Logo" className="nav-logo" />
        </a>
        <div className="site-navigation">
          <div className="site-navigation__left">
            <a className="site-navigation__item" href="/about">
              О компании
            </a>
            <a className="site-navigation__item" href="/elevators">
              Продукция
            </a>
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


