import OnBoardingScreens from "@/components/layouts/OnBoardingScreens"

export const metadata = {
    title: "Welcome"
}

const steps = [
  {
    title: "Welcome to Invexis",
    description: "Manage products, stock, and sales all in one platform.",
    image: "/images/1.png",
  },
  {
    title: "Smart Inventory & Sales",
    description: "Track stock in/out, generate invoices, and monitor reports.",
    image: "/images/2.png",
  },
  {
    title: "Roles & Collaboration",
    description: "Super Admin, Company Admin, and Workers — everyone has their role.",
    image: "/images/3.png",
  },
  {
    title: "Grow Your Business",
    description: "Unlock ecommerce, AI insights, and marketing tools as you scale.",
    image: "/images/4.png",
  },
];

const Welcome = () => {
  return (
      <section className="min-h-screen flex items-center justify-center text-sm">
          <OnBoardingScreens steps={steps} />;
    </section>
  )
}

export default Welcome
