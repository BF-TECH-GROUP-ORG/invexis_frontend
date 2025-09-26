import "../styles/globals.css";
import ClientProviders from "./ClientProviders";

export const metadata = {
  title: "Invexis",
  description: "An Inventory Management System",
};

export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
