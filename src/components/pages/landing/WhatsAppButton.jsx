"use client";

import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = ({ phoneNumber = '250789321535' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSend = () => {
        if (message.trim()) {
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
            setMessage('');
            setIsOpen(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSend();
        }
    };

    const styles = {
        container: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            fontFamily: "'Space Mono', monospace",
        },
        chatBox: {
            position: 'absolute',
            bottom: '80px',
            right: '0',
            width: '300px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
            padding: '16px',
            display: isOpen ? 'block' : 'none',
            animation: isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out',
        },
        header: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000',
            marginBottom: '12px',
            textAlign: 'center',
        },
        textarea: {
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: "'Space Mono', monospace",
            resize: 'vertical',
            marginBottom: '12px',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.3s',
        },
        textareaFocus: {
            borderColor: '#25d366',
        },
        sendButton: {
            width: '100%',
            padding: '10px 16px',
            backgroundColor: '#25d366',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s, transform 0.2s',
            fontFamily: "'Space Mono', monospace",
        },
        sendButtonHover: {
            backgroundColor: '#1fa855',
        },
        floatingButton: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#25d366',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.3s ease',
            position: 'relative',
        },
        floatingButtonHover: {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.6)',
        },
        whatsappIcon: {
            fontSize: '32px',
            color: '#fff',
        },
        closeBtn: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#999',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    };

    const [isHovered, setIsHovered] = useState(false);
    const [textareaFocused, setTextareaFocused] = useState(false);

    return (
        <>
            <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>

            <div style={styles.container} ref={containerRef}>
                {/* Chat Box */}
                <div style={styles.chatBox}>
                    <button
                        style={styles.closeBtn}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                    >
                        ✕
                    </button>
                    <div style={styles.header}>Hello! 👋</div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setTextareaFocused(true)}
                        onBlur={() => setTextareaFocused(false)}
                        placeholder="Type your message here... (Ctrl+Enter to send)"
                        style={{
                            ...styles.textarea,
                            ...(textareaFocused ? styles.textareaFocus : {}),
                        }}
                    />
                    <button
                        style={styles.sendButton}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1fa855';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#25d366';
                            e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={handleSend}
                    >
                        Send Message
                    </button>
                </div>

                {/* Floating Button */}
                <button
                    style={{
                        ...styles.floatingButton,
                        ...(isHovered ? styles.floatingButtonHover : {}),
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open WhatsApp chat"
                >
                    <FaWhatsapp style={styles.whatsappIcon} />
                </button>
            </div>
        </>
    );
};

export default WhatsAppButton;
