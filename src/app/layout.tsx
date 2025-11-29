import PageWrapper from "@/components/PageWrapper/PageWrapper";
import "./globals.css";
import "./page.css";

export const metadata = {
  title: "Bowser Elevators",
  description: "Сайт компании Bowser Elevators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <PageWrapper>
          <main>{children}</main>
        </PageWrapper>
      </body>
    </html>
  );
}
