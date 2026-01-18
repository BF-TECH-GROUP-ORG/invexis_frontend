import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

const ReportKPI = ({
    title,
    value,
    fullValue, // Full unabbreviated value
    icon: Icon,
    color = "#FF6D00",
    index = 0
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const displayValue = isExpanded && fullValue ? fullValue : value;
    const hasStretchFeature = !!fullValue;

    // Check if value is long text (for product names) - don't allow stretching for text
    const isLongText = typeof value === 'string' && value.length > 25;
    const canStretch = hasStretchFeature && !isLongText;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => canStretch && setIsExpanded(!isExpanded)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #e5e7eb',
                cursor: canStretch ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                minHeight: '120px',
                position: 'relative'
            }}
            whileHover={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                y: -2
            }}
        >
            {/* Stretch Indicator Icon - Only for stretchable cards */}
            {canStretch && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    opacity: 0.4,
                    transition: 'opacity 0.2s'
                }}>
                    {isExpanded ? (
                        <Minimize2 size={14} color="#6b7280" />
                    ) : (
                        <Maximize2 size={14} color="#6b7280" />
                    )}
                </div>
            )}

            {/* Header: Title and Icon */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
            }}>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    flex: 1,
                    paddingRight: '8px'
                }}>
                    {title}
                </span>

                {Icon && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {typeof Icon === 'function' ? (
                            <Icon size={24} style={{ color: color }} />
                        ) : (
                            <Icon sx={{ fontSize: '24px', color: color }} />
                        )}
                    </div>
                )}
            </div>

            {/* Value with Animation - Fixed size, no expansion for long text */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                minHeight: '32px',
                position: 'relative'
            }}>
                {/* For long text (product names), show truncated with tooltip */}
                {isLongText ? (
                    <>
                        <div
                            style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#111827',
                                lineHeight: '1.2',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {value}
                        </div>

                        {/* Tooltip on hover */}
                        {isHovered && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '0',
                                backgroundColor: '#111827',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                whiteSpace: 'nowrap',
                                zIndex: 1000,
                                marginBottom: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {value}
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '20px',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderTop: '6px solid #111827'
                                }} />
                            </div>
                        )}
                    </>
                ) : (
                    /* For numbers with stretch feature */
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isExpanded ? 'expanded' : 'collapsed'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            style={{
                                fontSize: isExpanded ? '18px' : '20px',
                                fontWeight: '700',
                                color: '#111827',
                                lineHeight: '1.2',
                                transition: 'font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                wordBreak: 'break-word',
                                width: '100%'
                            }}
                        >
                            {displayValue}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};

export default ReportKPI;
