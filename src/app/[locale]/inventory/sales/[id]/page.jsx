"use client";
import { useState, useEffect } from "react";
import ProductDes from "./productdes";
import { useRouter, useParams } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslations } from "next-intl";
import { getSingleSale } from "@/services/salesService";
import { CircularProgress, Typography } from "@mui/material";

const OrderDetails = () => {
  const t = useTranslations("sales");
  const navigate = useRouter();
  const params = useParams();
  const saleId = params.id;

  const [saleData, setSaleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!saleId) return;

      setLoading(true);
      const data = await getSingleSale(saleId);

      if (data) {
        // Transform API data to match ProductDes component expectations
        const transformedData = {
          id: data.saleId,
          discount: data.discountTotal || 0,
          name: data.items && data.items.length > 0 ? data.items[0].productName : "Unknown Product",
          soldDate: new Date(data.createdAt).toLocaleString(),
          returned: "false", // You can add logic to check returns array
          quantity: data.items && data.items.length > 0 ? data.items[0].quantity : 0,
          category: "N/A", // Not available in API response
          price: data.totalAmount,
          unitPrice: data.items && data.items.length > 0 ? data.items[0].unitPrice : 0,
          buyer: data.knownUser ? data.knownUser.customerName : "Unknown",
          buyerPhone: data.knownUser ? data.knownUser.customerPhone : "N/A",
          buyerEmail: data.knownUser ? data.knownUser.customerEmail : "N/A",
          warranty: "N/A", // Not available in API response
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          invoiceNumber: data.invoice ? data.invoice.invoiceNumber : "N/A",
          invoicePdfUrl: data.invoice ? data.invoice.pdfUrl : null,
          description: `Sale ID: ${data.saleId} - ${data.saleType}`,
          productimage: "https://i.pinimg.com/1200x/81/d0/62/81d0626ebf5f866987d4f613e09fe780.jpg", // Placeholder
        };
        setSaleData(transformedData);
      }
      setLoading(false);
    };

    fetchSaleDetails();
  }, [saleId]);

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading sale details...</Typography>
      </section>
    );
  }

  if (!saleData) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <Typography variant="h6">Sale not found</Typography>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-10">
        <div className="">
          <button
            className="flex cursor-pointer items-center text-xl space-x-3"
            onClick={() => { navigate.back() }}
          >
            <ArrowBackIcon />
            <span>{t('back')}</span>
          </button>
        </div>

        <div className="flex">
          <ProductDes productDescription={saleData} />
        </div>
      </section>
    </>
  );
};

export default OrderDetails;
