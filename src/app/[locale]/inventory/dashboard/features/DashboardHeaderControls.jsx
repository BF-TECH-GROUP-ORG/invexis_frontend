"use client";

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function DashboardHeaderControls({ timeRange = '7d', selectedDate }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleUpdateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const setTimeRange = (newRange) => {
    if (newRange) {
      handleUpdateParam('timeRange', newRange);
    }
  };

  const setDate = (newDate) => {
    handleUpdateParam('date', newDate ? dayjs(newDate).format('YYYY-MM-DD') : '');
  };

  return (
    <Box sx={{
      display: "flex",
      gap: 2,
      width: { xs: "100%", sm: "auto" },
      flexWrap: "wrap",
      alignItems: "center"
    }}>
      <Box sx={{ maxWidth: '100vw', overflowX: 'auto', pb: { xs: 1, md: 0 } }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(event, newRange) => setTimeRange(newRange)}
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
              px: 2.5,
              py: 0.75,
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              color: '#6B7280',
              '&.Mui-selected': {
                bgcolor: '#FF6D00',
                color: 'white',
                borderColor: '#FF6D00',
                '&:hover': {
                  bgcolor: '#E55D00'
                }
              },
              '&:hover': {
                bgcolor: '#f3f4f6'
              }
            }
          }}
        >
          <ToggleButton value="24h">Daily</ToggleButton>
          <ToggleButton value="7d">Weekly</ToggleButton>
          <ToggleButton value="30d">Monthly</ToggleButton>
          <ToggleButton value="1y">Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={selectedDate ? dayjs(selectedDate) : dayjs()}
          onChange={(newValue) => setDate(newValue)}
          slotProps={{
            textField: {
              size: 'small',
              sx: {
                width: 170,
                bgcolor: 'white',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
