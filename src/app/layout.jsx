
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon and other critical head tags can also go here if needed, 
            though metadata export handles most of them. */}
      </head>
      <body className="font-metropolis antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
