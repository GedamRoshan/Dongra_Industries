/**
 * Dongra Industries - Inquiry Form & Toast Notification Handler
 * Sends customer inquiries directly to: dongraindustries.opc@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
    const inquiryForm = document.getElementById('inquiryForm');
    const formAlert = document.getElementById('formAlert');
    const submitBtn = document.getElementById('submitBtn');

    if (!inquiryForm) return;

    // Target recipient email address
    const RECIPIENT_EMAIL = "dongraindustries.opc@gmail.com";

    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather Form Inputs
        const nameInput = document.getElementById('userName');
        const emailInput = document.getElementById('userEmail');
        const phoneInput = document.getElementById('userPhone');
        const inquiryTypeInput = document.getElementById('inquiryType');
        const messageInput = document.getElementById('userMessage');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : 'Not provided';
        const inquiryType = inquiryTypeInput && inquiryTypeInput.value ? inquiryTypeInput.value : 'General Inquiry';
        const message = messageInput ? messageInput.value.trim() : '';

        // Validation
        if (!name || !email || !message) {
            showAlert('error', 'Required Fields Missing', 'Please fill in your name, email, and message before sending.');
            showToast({
                type: 'error',
                title: 'Form Incomplete',
                message: 'Please fill in all required fields marked with *'
            });
            return;
        }

        // 2. Set UI Loading State
        setLoadingState(true);
        showAlert('loading', 'Sending Your Inquiry...', 'Connecting to server, please wait a moment.');

        // 3. Prepare FormSubmit Payload
        const payload = {
            name: name,
            email: email,
            phone: phone,
            inquiry_type: inquiryType,
            message: message,
            _subject: `New Dongra Industries Inquiry from ${name} [${inquiryType}]`,
            _replyto: email,
            _template: "table",
            _captcha: "false"
        };

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok || (data && (data.success === "true" || data.success === true))) {
                // Success Alert UI
                showAlert(
                    'success',
                    'Message Sent Successfully!',
                    `Thank you, <strong>${escapeHtml(name)}</strong>! Your inquiry has been sent to our team. We will get back to you shortly at <strong>${escapeHtml(email)}</strong>.`
                );

                // Toast Notification
                showToast({
                    type: 'success',
                    title: 'Message Sent Successfully! 🎉',
                    message: `Thank you, ${name}! Your inquiry has been sent to Dongra Industries.`,
                    duration: 6000
                });

                // Reset form
                inquiryForm.reset();
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Inquiry submission error:', error);
            const mailtoLink = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(`New Inquiry: ${inquiryType} from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nInquiry Type: ${inquiryType}\n\nMessage:\n${message}`)}`;
            
            showAlert(
                'error',
                'Could Not Send Automatically',
                `Unable to reach email service. <a href="${mailtoLink}" style="text-decoration: underline; font-weight: 700; color: inherit;">Click here to send directly via your email app</a>.`
            );

            showToast({
                type: 'error',
                title: 'Submission Error',
                message: 'Could not send message automatically. Please try the email link.',
                duration: 7000
            });
        } finally {
            setLoadingState(false);
        }
    });

    /**
     * Shows a structured inline alert message
     */
    function showAlert(type, title, desc) {
        if (!formAlert) return;

        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        else if (type === 'error') icon = '⚠️';
        else if (type === 'loading') icon = '⏳';

        formAlert.className = `form-alert ${type}`;
        formAlert.innerHTML = `
            <div class="alert-icon">${icon}</div>
            <div class="alert-body">
                <div class="alert-title">${title}</div>
                <p class="alert-desc">${desc}</p>
            </div>
        `;
        formAlert.style.display = 'flex';
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Disables/enables submit button with loading indicator
     */
    function setLoadingState(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.style.opacity = isLoading ? '0.75' : '1';
        submitBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';

        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = isLoading ? 'Sending Inquiry...' : 'Send Message';
        }
    }

    /**
     * Modern Toast Notification System
     * Options: { type: 'success'|'error'|'info', title, message, duration }
     */
    function showToast({ type = 'success', title = '', message = '', duration = 5000 }) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        let iconSymbol = '✓';
        if (type === 'error') iconSymbol = '✕';
        else if (type === 'info') iconSymbol = 'ℹ';

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${iconSymbol}</div>
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(title)}</div>
                <p class="toast-message">${escapeHtml(message)}</p>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        container.appendChild(toast);

        // Close on button click
        const closeBtn = toast.querySelector('.toast-close');
        let dismissTimeout;

        const removeToast = () => {
            clearTimeout(dismissTimeout);
            toast.classList.add('toast-hiding');
            toast.addEventListener('animationend', () => {
                toast.remove();
                if (container && container.children.length === 0) {
                    container.remove();
                }
            }, { once: true });
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', removeToast);
        }

        // Auto dismiss after duration
        dismissTimeout = setTimeout(removeToast, duration);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
