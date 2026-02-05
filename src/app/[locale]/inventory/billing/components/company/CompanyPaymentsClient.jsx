'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Box, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CompanyPaymentCards from './cards';
import CompanyPaymentsTable from './table';
import { getCompanyPayments } from '@/services/paymentService';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CompanyPaymentsClient = ({ companyId }) => {
  const { data: session } = useSession();
  const t = useTranslations('payments');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const options = session?.accessToken ? {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
  } : {};

  // Fetch company payments
  const { data: paymentsData, isLoading, isError, error } = useQuery({
    queryKey: ['companyPayments', companyId],
    queryFn: () => getCompanyPayments(companyId, options),
    enabled: !!companyId && !!session?.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const payments = paymentsData?.data || [];

  const handlePaymentView = (payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
  };

  const formatCurrency = (amount, currency = 'RWF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f9fafb', p: 3 }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Link href="/inventory/payments">
          <Button
            startIcon={<ArrowLeft size={20} />}
            variant="text"
            sx={{
              textTransform: 'none',
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.08)' },
            }}
          >
            Back to Payments
          </Button>
        </Link>
        <Box>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
            Company Payments
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            {companyId}
          </p>
        </Box>
      </Box>

      {/* Error Alert */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'Failed to load payments. Please try again.'}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <CompanyPaymentCards payments={payments} isLoading={isLoading} />
      </Box>

      {/* Payments Table */}
      <Box sx={{ backgroundColor: '#ffffff', borderRadius: '12px', p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>
            All Payments
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            {payments.length} total payments
          </p>
        </Box>
        <CompanyPaymentsTable
          data={payments}
          isLoading={isLoading}
          onPaymentView={handlePaymentView}
        />
      </Box>

      {/* Payment Details Modal */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '18px' }}>
          Payment Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPayment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Payment ID
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
                  {selectedPayment.id}
                </p>
              </Box>

              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
                  {selectedPayment.customer?.name || '-'}
                </p>
                {selectedPayment.customer?.email && (
                  <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                    {selectedPayment.customer.email}
                  </p>
                )}
                {selectedPayment.customer?.phone && (
                  <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                    {selectedPayment.customer.phone}
                  </p>
                )}
              </Box>

              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Amount
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#10b981' }}>
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </p>
              </Box>

              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Status
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>
                  {selectedPayment.status}
                </p>
              </Box>

              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Payment Method
                </p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>
                  {selectedPayment.method}
                </p>
              </Box>

              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Description
                </p>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>
                  {selectedPayment.description || '-'}
                </p>
              </Box>

              <Box>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                  Date
                </p>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>
                  {formatDate(selectedPayment.created_at)}
                </p>
              </Box>

              {selectedPayment.line_items && selectedPayment.line_items.length > 0 && (
                <Box>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px' }}>
                    Items
                  </p>
                  {selectedPayment.line_items.map((item, idx) => (
                    <Box key={idx} sx={{ fontSize: '13px', mb: 1 }}>
                      <p style={{ margin: '0 0 2px 0', fontWeight: 500 }}>
                        {item.name} (x{item.qty})
                      </p>
                      <p style={{ margin: 0, color: '#6b7280' }}>
                        {formatCurrency(item.price, selectedPayment.currency)}
                      </p>
                    </Box>
                  ))}
                </Box>
              )}

              {selectedPayment.invoice_url && (
                <Button
                  variant="outlined"
                  fullWidth
                  href={selectedPayment.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Invoice
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyPaymentsClient;
