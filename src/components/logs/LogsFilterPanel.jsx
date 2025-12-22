import React, { useState } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputAdornment,
    IconButton,
    Stack,
    Popover,
    Button,
    Chip,
    Typography,
    InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';

const SHOP_OPTIONS = [
    { value: 'all', label: 'All Shops' },
    { value: 'main_store', label: 'Main Store' },
    { value: 'warehouse_a', label: 'Warehouse A' },
    { value: 'online_store', label: 'Online Store' },
];

const WORKER_OPTIONS = [
    { value: 'all', label: 'All Workers' },
    { value: 'system', label: 'System' },
    { value: 'john_doe', label: 'John Doe' },
    { value: 'jane_smith', label: 'Jane Smith' },
    { value: 'manager_mike', label: 'Manager Mike' },
];

const TIME_PRESETS = [
    { value: 'current_month', label: 'Current Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range...' },
];

// Advanced Filters Config
const ADVANCED_FILTERS_CONFIG = [
    { label: 'Category', key: 'category', options: ['User & Access', 'Inventory', 'Sales', 'Payments', 'System'] },
    { label: 'Action', key: 'action', options: ['Created', 'Updated', 'Deleted', 'Logged In', 'Logged Out', 'Paid', 'Failed', 'Backup'] },
    { label: 'Status', key: 'status', options: ['SUCCESS', 'WARNING', 'FAILURE'] },
    { label: 'Advanced Actor', key: 'actor', type: 'text' },
    { label: 'Advanced Target', key: 'target', type: 'text' },
];

const LogsFilterPanel = ({ filters, onApply }) => {
    // Basic Filters State
    const [shop, setShop] = useState(filters.shop || 'all');
    const [worker, setWorker] = useState(filters.worker || 'all');
    const [timeRange, setTimeRange] = useState(filters.timeRange || 'current_month');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Advanced Filters State
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeField, setActiveField] = useState(null);
    const [tempValue, setTempValue] = useState('');

    // --- Basic Handlers ---
    const handleShopChange = (e) => {
        const val = e.target.value;
        setShop(val);
        onApply({ ...filters, shop: val });
    };

    const handleWorkerChange = (e) => {
        const val = e.target.value;
        setWorker(val);
        onApply({ ...filters, worker: val });
    };

    const handleTimeChange = (e) => {
        const val = e.target.value;
        setTimeRange(val);
        onApply({ ...filters, timeRange: val });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = () => {
        onApply({ ...filters, search: searchQuery });
    };

    const handleSearchClear = () => {
        setSearchQuery('');
        onApply({ ...filters, search: '' });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    // --- Advanced Handlers ---
    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveField(null);
        setTempValue('');
    };

    const handleSelectField = (fieldKey) => {
        setActiveField(fieldKey);
    };

    const handleApplyAdvanced = () => {
        if (activeField && tempValue) {
            onApply({ ...filters, [activeField]: tempValue });
            handleCloseMenu();
        }
    };

    const handleRemoveAdvanced = (key) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onApply(newFilters);
    };

    const renderPopoverContent = () => {
        if (!activeField) {
            return (
                <Box sx={{ p: 1, minWidth: 200 }}>
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#666' }}>Add Advanced Filter</Typography>
                    {ADVANCED_FILTERS_CONFIG.map((f) => (
                        <MenuItem
                            key={f.key}
                            onClick={() => handleSelectField(f.key)}
                            disabled={!!filters[f.key]}
                            sx={{ fontSize: '0.9rem' }}
                        >
                            {f.label}
                        </MenuItem>
                    ))}
                </Box>
            );
        }

        const config = ADVANCED_FILTERS_CONFIG.find(f => f.key === activeField);
        return (
            <Box sx={{ p: 2, minWidth: 250 }}>
                <Typography variant="subtitle2" gutterBottom>Filter by {config.label}</Typography>
                {config.options ? (
                    <FormControl fullWidth size="small" sx={{ my: 1 }}>
                        <InputLabel>Select {config.label}</InputLabel>
                        <Select
                            value={tempValue}
                            label={`Select ${config.label}`}
                            onChange={(e) => setTempValue(e.target.value)}
                        >
                            {config.options.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <TextField
                        fullWidth
                        placeholder={`Enter ${config.label}...`}
                        size="small"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        sx={{ my: 1 }}
                    />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    <Button size="small" onClick={handleCloseMenu} color="inherit">Cancel</Button>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleApplyAdvanced}
                        disabled={!tempValue}
                        sx={{ bgcolor: '#ff6600', '&:hover': { bgcolor: '#e65c00' }, ml: 1 }}
                    >
                        Apply
                    </Button>
                </Box>
            </Box>
        );
    };

    // Identify active advanced filters to display as chips
    const activeAdvancedFilters = Object.entries(filters).filter(([key]) =>
        ADVANCED_FILTERS_CONFIG.some(c => c.key === key)
    );

    return (
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
            <Stack spacing={2}>
                {/* Top Row: Basic Controls */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={shop}
                            onChange={handleShopChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Select Shop' }}
                            sx={{ backgroundColor: '#fafafa' }}
                        >
                            {SHOP_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={worker}
                            onChange={handleWorkerChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Select Worker' }}
                            sx={{ backgroundColor: '#fafafa' }}
                        >
                            {WORKER_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                            value={timeRange}
                            onChange={handleTimeChange}
                            displayEmpty
                            startAdornment={
                                <InputAdornment position="start">
                                    <CalendarTodayIcon fontSize="small" color="action" />
                                </InputAdornment>
                            }
                            sx={{ backgroundColor: '#fafafa' }}
                        >
                            {TIME_PRESETS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Smart Search */}
                    <TextField
                        placeholder={`Search activities in ${TIME_PRESETS.find(p => p.value === timeRange)?.label || 'selected range'}...`}
                        size="small"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        sx={{ flexGrow: 1, backgroundColor: '#fafafa' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleSearchClear}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {/* Advanced Filter Button */}
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={handleOpenMenu}
                        sx={{
                            textTransform: 'none',
                            borderColor: '#e5e7eb',
                            color: '#374151',
                            height: 40,
                            minWidth: 'auto',
                            px: 2
                        }}
                    >
                        Filters
                    </Button>
                </Stack>

                {/* Bottom Row: Active Advanced Chips */}
                {activeAdvancedFilters.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {activeAdvancedFilters.map(([key, value]) => {
                            const label = ADVANCED_FILTERS_CONFIG.find(c => c.key === key)?.label || key;
                            return (
                                <Chip
                                    key={key}
                                    label={<span><strong>{label}:</strong> {value}</span>}
                                    onDelete={() => handleRemoveAdvanced(key)}
                                    sx={{
                                        backgroundColor: '#fff7ed',
                                        color: '#ea580c',
                                        border: '1px solid #fed7aa',
                                        '& .MuiChip-deleteIcon': { color: '#ea580c', '&:hover': { color: '#c2410c' } }
                                    }}
                                />
                            );
                        })}
                        <Button
                            size="small"
                            onClick={() => onApply({ shop, worker, timeRange, search })} // Reset to just basics
                            sx={{ textTransform: 'none', color: '#6b7280' }}
                        >
                            Clear Advanced
                        </Button>
                    </Stack>
                )}
            </Stack>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {renderPopoverContent()}
            </Popover>
        </Box>
    );
};

export default LogsFilterPanel;
