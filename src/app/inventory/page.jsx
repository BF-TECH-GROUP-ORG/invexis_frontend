import Image from "next/image";
import { Button } from "@/components/shared/button";
import TopNavBar from "@/components/layouts/NavBar";
import SideBar from "@/components/layouts/SideBar";
import Layout from "@/components/layouts/layout";
import AnalyticsDashboard from "@/components/Landing/Dashboard";

export default function Home() {
  return (
    <>
      <Layout>
        <AnalyticsDashboard />
      </Layout>
    </>
  );
}
