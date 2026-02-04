'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Stack,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';

// ==================== Action Menu Component ====================
const PaymentActionMenu = ({ payment, onView, onDownload }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    handleClose();
    if (typeof onView === 'function') {
      onView(payment);
    }
  };

  const handleDownload = () => {
    handleClose();
    if (typeof onDownload === 'function') {
      onDownload(payment);
    }
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={open ? 'payment-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
        sx={{
          color: open ? 'primary.main' : 'text.secondary',
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="payment-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            color: '#333',
            minWidth: 160,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: '#333' }} />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        {payment?.invoice_url && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <CloudDownloadRoundedIcon fontSize="small" sx={{ color: '#333' }} />
            </ListItemIcon>
            <ListItemText primary="Download Invoice" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

// ==================== Status Chip Component ====================
const StatusChip = ({ status }) => {
  const statusConfig = {
    succeeded: { bg: '#d1fae5', color: '#065f46', label: 'Succeeded' },
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    failed: { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
    cancelled: { bg: '#e5e7eb', color: '#374151', label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: '6px',
        height: '28px',
      }}
    />
  );
};

// ==================== Payment Method Badge ====================
const PaymentMethodBadge = ({ method }) => {
  const methodConfig = {
    card: { bg: '#f0f9ff', color: '#003366', icon: '💳' },
    mobile_money: { bg: '#fef3c7', color: '#b45309', icon: '📱' },
    bank_transfer: { bg: '#ede9fe', color: '#5b21b6', icon: '🏦' },
    cash: { bg: '#f0fdf4', color: '#15803d', icon: '💵' },
    manual: { bg: '#f3f4f6', color: '#4b5563', icon: '✋' },
  };

  const config = methodConfig[method?.toLowerCase()] || {
    bg: '#f3f4f6',
    color: '#4b5563',
    icon: '💸',
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      <span>{config.icon}</span>
      {method}
    </Box>
  );
};

// ==================== Main Payment Table Component ====================
const CompanyPaymentsTable = ({ data = [], isLoading = false, onPaymentView }) => {
  const t = useTranslations('paymentsTable');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const payments = Array.isArray(data) ? data : [];

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (payment.id?.toString().includes(searchLower)) ||
        (payment.payment_id?.toLowerCase().includes(searchLower)) ||
        (payment.customer?.name?.toLowerCase().includes(searchLower)) ||
        (payment.customer?.phone?.includes(searchLower)) ||
        (payment.reference_id?.toLowerCase().includes(searchLower)) ||
        (payment.description?.toLowerCase().includes(searchLower))
      );
    });
  }, [payments, searchTerm]);

  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePaymentView = (payment) => {
    if (typeof onPaymentView === 'function') {
      onPaymentView(payment);
    }
  };

  const handleDownloadInvoice = (payment) => {
    if (payment?.invoice_url) {
      window.open(payment.invoice_url, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'RWF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Toolbar with Search */}
      <Toolbar
        sx={{
          pl: 2,
          pr: 1,
          mb: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          placeholder="Search payments..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{
            flex: 1,
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {filteredPayments.length} payments
        </Typography>
      </Toolbar>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Payment ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Customer
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'right',
                }}
              >
                Amount
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Method
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Date
              </TableCell>
              <TableCell align="right" sx={{ width: 50 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((payment) => (
                <TableRow
                  key={payment.id || payment.payment_id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                    },
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <TableCell sx={{ fontSize: '13px', fontWeight: 500 }}>
                    <Box sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {payment.id || payment.payment_id}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {payment.customer?.name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.customer?.phone || payment.customer?.email || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={payment.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={payment.method} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>
                    <Chip
                      label={payment.type || 'SALE'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '12px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>
                    {formatDate(payment.created_at)}
                  </TableCell>
                  <TableCell align="right">
                    <PaymentActionMenu
                      payment={payment}
                      onView={handlePaymentView}
                      onDownload={handleDownloadInvoice}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

export default CompanyPaymentsTable;
