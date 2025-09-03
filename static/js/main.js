/**
 * VitaHires Main JavaScript File
 * Handles interactive functionality across the platform
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Modern enhancements
document.addEventListener('scroll', throttle(function() {
    handleNavbarScroll();
    handleScrollAnimations();
}, 16));

/**
 * Main initialization function
 */
function initializeApp() {
    // Initialize Bootstrap tooltips and popovers
    initializeBootstrapComponents();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize file upload handling
    initializeFileUpload();
    
    // Initialize notification system
    initializeNotifications();
    
    // Initialize dashboard features
    initializeDashboard();
    
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize modern enhancements
    initializeModernFeatures();
    
    console.log('VitaHires application initialized successfully');
}

/**
 * Initialize Bootstrap components
 */
function initializeBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(function(tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverTriggerList.forEach(function(popoverTriggerEl) {
        new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    // Custom form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        });
    });
    
    // Real-time validation for email fields
    const emailFields = document.querySelectorAll('input[type="email"]');
    emailFields.forEach(function(field) {
        field.addEventListener('blur', function() {
            validateEmail(field);
        });
    });
    
    // Password strength indicator
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(function(field) {
        if (field.name === 'password') {
            field.addEventListener('input', function() {
                updatePasswordStrength(field);
            });
        }
    });
}

/**
 * Validate email format
 */
function validateEmail(field) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(field.value);
    
    if (field.value && !isValid) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    } else if (field.value && isValid) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
    } else {
        field.classList.remove('is-valid', 'is-invalid');
    }
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(field) {
    const password = field.value;
    const strength = calculatePasswordStrength(password);
    
    // Remove existing strength indicator
    const existingIndicator = field.parentNode.querySelector('.password-strength');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add new strength indicator
    if (password.length > 0) {
        const indicator = document.createElement('div');
        indicator.className = 'password-strength mt-1';
        indicator.innerHTML = `
            <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-${strength.color}" 
                     style="width: ${strength.percentage}%"></div>
            </div>
            <small class="text-${strength.color}">${strength.text}</small>
        `;
        field.parentNode.appendChild(indicator);
    }
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths = [
        { color: 'danger', text: 'Very Weak', percentage: 20 },
        { color: 'warning', text: 'Weak', percentage: 40 },
        { color: 'info', text: 'Fair', percentage: 60 },
        { color: 'primary', text: 'Good', percentage: 80 },
        { color: 'success', text: 'Strong', percentage: 100 }
    ];
    
    return strengths[Math.min(score, 4)];
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchForm = document.querySelector('#job-search-form');
    if (searchForm) {
        // Auto-submit search form on filter change
        const filters = searchForm.querySelectorAll('select');
        filters.forEach(function(filter) {
            filter.addEventListener('change', function() {
                searchForm.submit();
            });
        });
        
        // Search suggestions (basic implementation)
        const keywordInput = searchForm.querySelector('input[name="keywords"]');
        if (keywordInput) {
            keywordInput.addEventListener('input', debounce(function() {
                // Implement search suggestions here
                // This would typically make an AJAX call to get suggestions
            }, 300));
        }
    }
    
    // Global search functionality
    const globalSearch = document.querySelector('#global-search');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `/jobs?keywords=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}

/**
 * Initialize file upload handling
 */
function initializeFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            validateFileUpload(this);
            updateFileUploadDisplay(this);
        });
        
        // Drag and drop functionality
        const dropZone = input.closest('.file-upload-zone');
        if (dropZone) {
            setupDragAndDrop(dropZone, input);
        }
    });
}

/**
 * Validate file upload
 */
function validateFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    let isValid = true;
    let errorMessage = '';
    
    if (file.size > maxSize) {
        isValid = false;
        errorMessage = 'File size must be less than 16MB.';
    } else if (!allowedTypes.includes(file.type)) {
        isValid = false;
        errorMessage = 'Please upload a PDF, DOC, or DOCX file.';
    }
    
    if (!isValid) {
        input.value = '';
        showNotification(errorMessage, 'error');
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }
    
    return isValid;
}

/**
 * Update file upload display
 */
function updateFileUploadDisplay(input) {
    const file = input.files[0];
    const displayElement = input.parentNode.querySelector('.file-upload-display');
    
    if (displayElement) {
        if (file) {
            displayElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-file-pdf text-danger me-2"></i>
                    <span>${file.name}</span>
                    <span class="text-muted ms-2">(${formatFileSize(file.size)})</span>
                </div>
            `;
        } else {
            displayElement.innerHTML = '';
        }
    }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Setup drag and drop for file upload
 */
function setupDragAndDrop(dropZone, input) {
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            validateFileUpload(input);
            updateFileUploadDisplay(input);
        }
    });
}

/**
 * Initialize notification system
 */
function initializeNotifications() {
    // Check for new notifications (would typically be AJAX)
    // This is a placeholder for future notification functionality
    
    // Mark notifications as read when clicked
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(function(item) {
        item.addEventListener('click', function() {
            this.classList.add('read');
            // Would typically make AJAX call to mark as read
        });
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(function() {
        if (notification.parentNode) {
            const bsAlert = new bootstrap.Alert(notification);
            bsAlert.close();
        }
    }, duration);
}

/**
 * Initialize dashboard features
 */
function initializeDashboard() {
    // Profile completion tracking
    updateProfileCompletion();
    
    // Dashboard statistics animation
    animateCounters();
    
    // Real-time updates (placeholder for WebSocket implementation)
    // setupRealTimeUpdates();
}

/**
 * Update profile completion percentage
 */
function updateProfileCompletion() {
    const completionBar = document.querySelector('.profile-completion .progress-bar');
    if (completionBar) {
        const percentage = parseInt(completionBar.style.width);
        animateProgress(completionBar, 0, percentage);
    }
}

/**
 * Animate progress bars
 */
function animateProgress(element, start, end) {
    const duration = 1000;
    const startTime = performance.now();
    
    function updateProgress(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        
        element.style.width = current + '%';
        element.setAttribute('aria-valuenow', current);
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        }
    }
    
    requestAnimationFrame(updateProgress);
}

/**
 * Animate dashboard counters
 */
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(function(counter) {
        const target = parseInt(counter.textContent);
        const duration = 2000;
        
        animateCounter(counter, 0, target, duration);
    });
}

/**
 * Animate individual counter
 */
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }
    
    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        // Escape key to close modals/dropdowns
        if (e.key === 'Escape') {
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            openDropdowns.forEach(function(dropdown) {
                bootstrap.Dropdown.getInstance(dropdown.previousElementSibling).hide();
            });
        }
    });
    
    // Focus management for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const firstError = form.querySelector('.is-invalid');
            if (firstError) {
                firstError.focus();
            }
        });
    });
}

/**
 * Utility function: Debounce
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

/**
 * Utility function: Throttle
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function() {
            showNotification('Copied to clipboard!', 'success');
        }).catch(function() {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * Fallback copy to clipboard for older browsers
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Format date for display
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
function timeAgo(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Smooth scroll to element
 */
function scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Lazy load images
 */
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        images.forEach(function(img) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

/**
 * Initialize modern features and enhancements
 */
function initializeModernFeatures() {
    // Initialize intersection observer for animations
    initializeScrollAnimations();
    
    // Initialize parallax effects
    initializeParallaxEffects();
    
    // Initialize smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Initialize loading states
    initializeLoadingStates();
    
    // Initialize interactive cards
    initializeInteractiveCards();
    
    // Initialize lazy loading
    initializeLazyLoading();
}

/**
 * Handle navbar scroll effects
 */
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

/**
 * Handle scroll-triggered animations
 */
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.slide-up');
    elements.forEach(function(element) {
        if (isInViewport(element) && !element.classList.contains('visible')) {
            element.classList.add('visible');
        }
    });
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollAnimations() {
    // Add slide-up class to elements that should animate on scroll
    const animatableElements = document.querySelectorAll('.fade-in-up:not(.slide-up)');
    animatableElements.forEach(function(element) {
        element.classList.add('slide-up');
    });
    
    // Trigger initial check
    handleScrollAnimations();
}

/**
 * Initialize parallax effects
 */
function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', throttle(function() {
            parallaxElements.forEach(function(element) {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(window.scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16));
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                scrollToElement(href, 80); // Account for fixed navbar
            }
        });
    });
}

/**
 * Initialize loading states for buttons
 */
function initializeLoadingStates() {
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.classList.contains('loading')) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Remove loading state after form submission completes or fails
                setTimeout(function() {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
}

/**
 * Initialize interactive card effects
 */
function initializeInteractiveCards() {
    const cards = document.querySelectorAll('.card, .job-card');
    cards.forEach(function(card) {
        if (!card.classList.contains('interactive-card')) {
            card.classList.add('interactive-card');
        }
        
        // Add click handler for cards with links
        const cardLink = card.querySelector('a[href]:not(.btn)');
        if (cardLink) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.btn') && !e.target.closest('button')) {
                    cardLink.click();
                }
            });
        }
    });
}

/**
 * Enhanced notification with better positioning and animations
 */
function showEnhancedNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.enhanced-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `enhanced-notification alert alert-${type} shadow-lg fade-in-up`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 320px;
        max-width: 400px;
        border: none;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${icon} me-3"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(function() {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('#global-search, input[name="keywords"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close modals and notifications
        if (e.key === 'Escape') {
            const notifications = document.querySelectorAll('.enhanced-notification');
            notifications.forEach(notification => notification.remove());
        }
    });
}

/**
 * Performance monitoring
 */
function initializePerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                
                console.log('Page Performance:', {
                    'Total Load Time': pageLoadTime + 'ms',
                    'DOM Ready Time': domReadyTime + 'ms'
                });
                
                // Report slow loading (optional analytics integration point)
                if (pageLoadTime > 3000) {
                    console.warn('Slow page load detected:', pageLoadTime + 'ms');
                }
            }, 0);
        });
    }
}

// Add CSS animations for notifications
if (!document.querySelector('#enhanced-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'enhanced-notification-styles';
    style.textContent = `
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .enhanced-notification {
            animation: fadeInUp 0.4s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize keyboard shortcuts
initializeKeyboardShortcuts();

// Export functions for testing or external use
window.VitaHires = {
    showNotification,
    showEnhancedNotification,
    copyToClipboard,
    formatDate,
    timeAgo,
    scrollToElement,
    isInViewport,
    debounce,
    throttle
};
