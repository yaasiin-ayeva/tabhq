type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export const showToast = (message: string, variant: ToastVariant = 'info', timeoutMs: number = 2500) => {
    const existing = document.getElementById('toast-root');
    const root = existing ?? Object.assign(document.createElement('div'), { id: 'toast-root' });
    if (!existing) {
        root.style.position = 'fixed';
        root.style.right = '16px';
        root.style.bottom = '16px';
        root.style.zIndex = '1080';
        document.body.appendChild(root);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'toast align-items-center text-bg-' + (variant === 'info' ? 'primary' : variant) + ' border-0 show mb-2';
    wrapper.setAttribute('role', 'alert');
    wrapper.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
        </div>
    `;
    const closeBtn = wrapper.querySelector('button');
    closeBtn?.addEventListener('click', () => root.removeChild(wrapper));
    root.appendChild(wrapper);
    window.setTimeout(() => {
        if (wrapper.isConnected) root.removeChild(wrapper);
    }, timeoutMs);
};

// Export toast as an alias for showToast for backward compatibility
export const toast = {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'danger'),
    warning: (message: string) => showToast(message, 'warning'),
    info: (message: string) => showToast(message, 'info'),
};



