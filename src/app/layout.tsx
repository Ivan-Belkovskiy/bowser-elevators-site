import ProfileButton from '@/components/ProfileButton/ProfileButton';
import './globals.css';
import './page.css';

import { ReactNode } from 'react';
import ProfileDropdown from '@/components/ProfileDropdown/ProfileDropdown';

export const metadata = {
  title: "Bowser Elevators",
  description: "Сайт компании Bowser Elevators",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='ru'>
      <body>
        <header className="site-header">
          <a href='/' className="site-header__main-button">
            <img src="/images/logo.png" alt="Bowser Elevators Logo" className="nav-logo" />
          </a>
          <div className="site-navigation">
            <div className="site-navigation__left">
              <a className='site-navigation__item' href="/mylift">Bowser Elevators MyLift</a>
              <a className='site-navigation__item' href="/elevator-video-player">Elevator Video Player</a>
            </div>
            <div className="site-navigation__right">
              <ProfileDropdown />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">© Bowser Elevators</footer>

      </body>
    </html>
  );
}