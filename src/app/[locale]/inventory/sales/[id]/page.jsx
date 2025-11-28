"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getSingleSale } from "@/services/salesService";
import { CircularProgress, Typography, Paper, Box, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Link from "next/link"; 

const OrderDetails = () => {
  const t = useTranslations("sales");
  const navigate = useRouter();
  const locale = useLocale();
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
        setSaleData(data);
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

  const items = saleData.items || [];
  const knownUser = saleData.knownUser || {};
  const hasMultipleItems = items.length > 1;

  return (
    <section className="space-y-6 p-4">
      {/* Back Button */}
      <button
        className="flex cursor-pointer items-center text-xl space-x-3 hover:text-orange-500 transition"
        onClick={() => navigate.back()}
      >
        <ArrowBackIcon />
        <span>{t('back')}</span>
      </button>

      {/* Sale Header */}
      <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#FF6D00" }}>
              Sale #{saleData.saleId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(saleData.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Chip
              label={saleData.status.toUpperCase()}
              color={saleData.status === 'completed' ? 'success' : 'warning'}
              sx={{ mb: 1 }}
            />
            <br />
            <Chip
              label={saleData.paymentStatus.toUpperCase()}
              color={saleData.paymentStatus === 'paid' ? 'success' : 'error'}
            />
          </Box>
        </Box>
      </div>

      {/* Items Section */}
      <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ShoppingCartIcon sx={{ color: "#FF6D00", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Items ({items.length})
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FFF3E0" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Unit Price</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Quantity</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Discount</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Tax</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.saleItemId || index} hover>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: "500" }}>
                      {item.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {item.productId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.unitPrice).toLocaleString()} FRW
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={item.quantity} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.discount || 0).toLocaleString()} FRW
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(item.tax || 0).toLocaleString()} FRW
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "#FF6D00" }}>
                    {parseFloat(item.total).toLocaleString()} FRW
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* Sale Totals */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ minWidth: 300 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" sx={{ fontWeight: "500" }}>
                {parseFloat(saleData.subTotal).toLocaleString()} FRW
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Discount Total:</Typography>
              <Typography variant="body2" sx={{ fontWeight: "500", color: "green" }}>
                {parseFloat(saleData.discountTotal || 0).toLocaleString()} FRW
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Tax Total:</Typography>
              <Typography variant="body2" sx={{ fontWeight: "500" }}>
                {parseFloat(saleData.taxTotal || 0).toLocaleString()} FRW
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total Amount:</Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FF6D00" }}>
                {parseFloat(saleData.totalAmount).toLocaleString()} FRW
              </Typography>
            </Box>
          </Box>
        </Box>
      </div>

      {/* Customer Information */}
      <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PersonIcon sx={{ color: "#FF6D00", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Customer Information
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500" }}>
              {knownUser.customerName || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500" }}>
              {knownUser.customerPhone || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500" }}>
              {knownUser.customerEmail || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Customer ID</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500" }}>
              {saleData.knownUserId || "N/A"}
            </Typography>
          </Box>
        </Box>
      </div>

      {/* Payment Information */}
      <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PaymentIcon sx={{ color: "#FF6D00", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Payment Information
          </Typography>
        </Box>

        <Box sx={{ paddingLeft: 2, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Payment Method</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500", textTransform: "capitalize" }}>
              {saleData.paymentMethod?.replace('_', ' ') || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Payment Status</Typography>
            <Chip
              label={saleData.paymentStatus?.toUpperCase() || "N/A"}
              color={saleData.paymentStatus === 'paid' ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Payment ID</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500" }}>
              {saleData.paymentId || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Sale Type</Typography>
            <Typography variant="body1" sx={{ fontWeight: "500", textTransform: "capitalize" }}>
              {saleData.saleType?.replace('_', ' ') || "N/A"}
            </Typography>
          </Box>
        </Box>
      </div>

      {/* Invoice Information (if available) */}
      {saleData.invoice && (
        <div  className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ReceiptIcon sx={{ color: "#FF6D00", mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Invoice Information
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Invoice Number</Typography>
              <Typography variant="body1" sx={{ fontWeight: "500" }}>
                {saleData.invoice.invoiceNumber || "N/A"}
              </Typography>
            </Box>
            {saleData.invoice.pdfUrl && (
              <Box>
                <Typography variant="caption" color="text.secondary">Download</Typography>
                <br />
                <Link
                  href={saleData.invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  Download PDF
                </Link>
              </Box>
            )}
          </Box>
        </div>
      )}
    </section>
  );
};

export default OrderDetails;
