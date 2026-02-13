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
import Skeleton from "@/components/shared/Skeleton";
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

  // Handle PDF download
  const handleDownloadPDF = async (pdfUrl, fileName) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'invoice.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <section className="space-y-6 p-2 sm:p-4 w-full max-w-7xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Sale Header Skeleton */}
        <div className="p-3 rounded-lg ring-1 ring-gray-200">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-32" />
            </Box>
            <Box className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </Box>
          </Box>
        </div>

        {/* Items Section Skeleton */}
        <div className="p-3 rounded-lg ring-1 ring-gray-200">
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[...Array(6)].map((_, i) => (
                    <TableCell key={i}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box className="w-full sm:w-64 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Divider sx={{ my: 1 }} />
              <Skeleton className="h-8 w-full" />
            </Box>
          </Box>
        </div>

        {/* Customer Information Skeleton */}
        <div className="p-3 rounded-lg ring-1 ring-gray-200">
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </Box>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information Skeleton */}
        <div className="p-3 rounded-lg ring-1 ring-gray-200">
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </Box>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
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
    <section className="space-y-6 p-2 sm:p-4 w-full max-w-7xl mx-auto">
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
        <Box sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" sx={{
              fontWeight: "bold",
              color: "#FF6D00",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }
            }}>
              Sale #{saleData.saleId}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              {new Date(saleData.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{
            textAlign: { xs: "left", sm: "right" },
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            gap: 1,
            flexWrap: "wrap",
            ml: { xs: 0, sm: "auto" }
          }}>
            <Chip
              label={saleData.status.toUpperCase()}
              color={saleData.status === 'completed' ? 'success' : 'warning'}
              sx={{ mb: { xs: 0, sm: 1 } }}
              size="small"
            />
            <Chip
              label={saleData.paymentStatus.toUpperCase()}
              color={saleData.paymentStatus === 'paid' ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Box>
      </div>

      {/* Items Section */}
      <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ShoppingCartIcon sx={{ color: "#FF6D00", mr: 1 }} />
          <Typography variant="h6" sx={{
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.25rem" }
          }}>
            Items ({items.length})
          </Typography>
        </Box>

        <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
          <Table sx={{ minWidth: { xs: 800, sm: "100%" } }}>
            <TableHead sx={{ bgcolor: "#fff" }}>
              <TableRow >
                <TableCell sx={{
                  fontWeight: "bold",
                  color: "#000000",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap"
                }}>Product</TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  color: "#000000",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap"
                }} align="right">Unit Price</TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  color: "#000000",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap"
                }} align="right">Quantity</TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  color: "#000000",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap"
                }} align="right">Discount</TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  color: "#000000",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap"
                }} align="right">Tax</TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  color: "#000000",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap"
                }} align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.saleItemId || index} hover>
                  <TableCell sx={{ minWidth: { xs: 150, sm: "auto" } }}>
                    <Typography variant="body1" sx={{
                      fontWeight: "500",
                      fontSize: { xs: "0.875rem", sm: "1rem" }
                    }}>
                      {item.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      fontSize: { xs: "0.65rem", sm: "0.75rem" }
                    }}>
                      ID: {item.productId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    whiteSpace: "nowrap"
                  }}>
                    {parseFloat(item.unitPrice).toLocaleString()} FRW
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={item.quantity} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    whiteSpace: "nowrap"
                  }}>
                    {parseFloat(item.discount || 0).toLocaleString()} FRW
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    whiteSpace: "nowrap"
                  }}>
                    {parseFloat(item.tax || 0).toLocaleString()} FRW
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontWeight: "bold",
                    color: "#FF6D00",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    whiteSpace: "nowrap"
                  }}>
                    {parseFloat(item.total).toLocaleString()} FRW
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* Sale Totals */}
        <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
          <Box sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { sm: 300 },
            maxWidth: { sm: 400 }
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>Subtotal:</Typography>
              <Typography variant="body2" sx={{
                fontWeight: "500",
                fontSize: { xs: "0.8rem", sm: "0.875rem" }
              }}>
                {parseFloat(saleData.subTotal).toLocaleString()} FRW
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>Discount Total:</Typography>
              <Typography variant="body2" sx={{
                fontWeight: "500",
                color: "green",
                fontSize: { xs: "0.8rem", sm: "0.875rem" }
              }}>
                {parseFloat(saleData.discountTotal || 0).toLocaleString()} FRW
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>Tax Total:</Typography>
              <Typography variant="body2" sx={{
                fontWeight: "500",
                fontSize: { xs: "0.8rem", sm: "0.875rem" }
              }}>
                {parseFloat(saleData.taxTotal || 0).toLocaleString()} FRW
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.25rem" }
              }}>Total Amount:</Typography>
              <Typography variant="h6" sx={{
                fontWeight: "bold",
                color: "#FF6D00",
                fontSize: { xs: "1rem", sm: "1.25rem" }
              }}>
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
          <Typography variant="h6" sx={{
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.25rem" }
          }}>
            Customer Information
          </Typography>
        </Box>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Name</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {knownUser.customerName || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Phone</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {knownUser.customerPhone || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Email</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {knownUser.customerEmail || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Customer ID</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {saleData.knownUserId || "N/A"}
            </Typography>
          </Box>
        </Box>
      </div>

      {/* Payment Information */}
      <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PaymentIcon sx={{ color: "#FF6D00", mr: 1 }} />
          <Typography variant="h6" sx={{
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.25rem" }
          }}>
            Payment Information
          </Typography>
        </Box>

        <Box sx={{
          paddingLeft: { xs: 0, sm: 2 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Payment Method</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              textTransform: "capitalize",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {saleData.paymentMethod?.replace('_', ' ') || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Payment Status</Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={saleData.paymentStatus?.toUpperCase() || "N/A"}
                color={saleData.paymentStatus === 'paid' ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Payment ID</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {saleData.paymentId || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Sale Type</Typography>
            <Typography variant="body1" sx={{
              fontWeight: "500",
              textTransform: "capitalize",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              wordBreak: "break-word"
            }}>
              {saleData.saleType?.replace('_', ' ') || "N/A"}
            </Typography>
          </Box>
        </Box>
      </div>

      {/* Invoice Information (if available) */}
      {saleData.invoice && (
        <div className="p-3 rounded-2 ring-1 ring-gray-200  rounded-lg "  >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ReceiptIcon sx={{ color: "#FF6D00", mr: 1 }} />
            <Typography variant="h6" sx={{
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.25rem" }
            }}>
              Invoice Information
            </Typography>
          </Box>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Invoice Number</Typography>
              <Typography variant="body1" sx={{
                fontWeight: "500",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                wordBreak: "break-word"
              }}>
                {saleData.invoice.invoiceNumber || "N/A"}
              </Typography>
            </Box>
            {saleData.invoice.pdfUrl && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Download</Typography>
                <br />
                <button
                  onClick={() => handleDownloadPDF(
                    saleData.invoice.pdfUrl,
                    `${saleData.invoice.invoiceNumber}.pdf`
                  )}
                  className="text-orange-500 cursor-pointer hover:text-orange-600 underline bg-transparent border-none p-0"
                  style={{ fontSize: window.innerWidth < 600 ? '0.875rem' : '1rem' }}
                >
                  Download PDF
                </button>
              </Box>
            )}
          </Box>
        </div>
      )}
    </section>
  );
};

export default OrderDetails;
