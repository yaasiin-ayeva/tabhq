import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
    useGetProvidersQuery,
    useSetProviderConfigMutation,
    useUpdateProviderConfigMutation,
    useDeactivateProviderMutation
} from "@/store/providersApi";

interface LocationState {
    appName?: string;
    environment?: string;
}

interface FormErrors {
    [key: string]: string;
}

const providerDisplayNames: Record<string, string> = {
    stripe: "Stripe",
    flutterwave: "Flutterwave",
    mobilemoney: "Mobile Money"
};

const providerDescriptions: Record<string, string> = {
    stripe: "Accept payments via credit cards and other payment methods worldwide",
    flutterwave: "Accept payments across Africa with local payment methods",
    mobilemoney: "Accept mobile money payments (MTN, Orange, etc.)"
};

const providerIcons: Record<string, string> = {
    stripe: "bx bx-credit-card",
    flutterwave: "bx bx-globe",
    mobilemoney: "bx bx-mobile-alt"
};

const availableProviders = [
    {
        id: "stripe",
        name: "Stripe",
        description: "Accept payments via credit cards and other payment methods worldwide",
        icon: "bx bx-credit-card",
        status: "available"
    },
    {
        id: "flutterwave",
        name: "Flutterwave",
        description: "Accept payments across Africa with local payment methods",
        icon: "bx bx-globe",
        status: "available"
    },
    {
        id: "mobilemoney",
        name: "Mobile Money",
        description: "Accept mobile money payments (MTN, Orange, etc.)",
        icon: "bx bx-mobile-alt",
        status: "available"
    }
];

// Validation functions
const validateCredentials = (provider: string, formData: any): FormErrors => {
    const errors: FormErrors = {};

    switch (provider) {
        case "stripe":
            if (!formData.secretKey?.trim()) {
                errors.secretKey = "Secret key is required";
            } else if (!formData.secretKey.startsWith("sk_")) {
                errors.secretKey = "Secret key must start with 'sk_'";
            }
            break;

        case "flutterwave":
            if (!formData.publicKey?.trim()) {
                errors.publicKey = "Public key is required";
            } else if (!formData.publicKey.startsWith("FLWPUBK_")) {
                errors.publicKey = "Public key must start with 'FLWPUBK_'";
            }

            if (!formData.secretKey?.trim()) {
                errors.secretKey = "Secret key is required";
            } else if (!formData.secretKey.startsWith("FLWSECK_")) {
                errors.secretKey = "Secret key must start with 'FLWSECK_'";
            }

            if (!formData.secretHash?.trim()) {
                errors.secretHash = "Secret hash is required";
            }

            if (formData.callbackUrl && !isValidUrl(formData.callbackUrl)) {
                errors.callbackUrl = "Please enter a valid URL";
            }
            break;

        case "mobilemoney":
            if (!formData.apiUser?.trim()) {
                errors.apiUser = "API User is required";
            }

            if (!formData.apiKey?.trim()) {
                errors.apiKey = "API Key is required";
            }
            break;
    }

    return errors;
};

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 11 }}>
            <div className={`alert ${bgColor} text-white alert-dismissible fade show`} role="alert">
                <i className={`bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-error-circle' : 'bx-info-circle'} me-2`}></i>
                {message}
                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
        </div>
    );
};

const ProviderCard = ({
    config,
    onConfigure,
    onDeactivate,
    isUpdating
}: {
    config: any;
    onConfigure: (provider: string, credentials: any) => void;
    onDeactivate: (provider: string) => void;
    isUpdating: boolean;
}) => {
    const [showCredentials, setShowCredentials] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

    useEffect(() => {
        if (config.credentials) {
            setFormData(config.credentials);
        }
    }, [config.credentials]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const errors = validateCredentials(config.provider, formData);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            onConfigure(config.provider, formData);
            setShowForm(false);
            setFormErrors({});
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: '' });
        }
    };

    const handleDeactivate = () => {
        onDeactivate(config.provider);
        setShowDeactivateConfirm(false);
    };

    const renderCredentialFields = () => {
        switch (config.provider) {
            case "stripe":
                return (
                    <div className="mb-3">
                        <label className="form-label">
                            Secret Key <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bx bx-key"></i>
                            </span>
                            <input
                                type="password"
                                className={`form-control ${formErrors.secretKey ? 'is-invalid' : ''}`}
                                value={formData.secretKey || ""}
                                onChange={(e) => handleInputChange('secretKey', e.target.value)}
                                placeholder="sk_test_..."
                                required
                            />
                        </div>
                        {formErrors.secretKey && (
                            <div className="invalid-feedback d-block">
                                {formErrors.secretKey}
                            </div>
                        )}
                        <small className="form-text text-muted">
                            Find your secret key in your Stripe Dashboard
                        </small>
                    </div>
                );

            case "flutterwave":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">
                                Public Key <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-key"></i>
                                </span>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.publicKey ? 'is-invalid' : ''}`}
                                    value={formData.publicKey || ""}
                                    onChange={(e) => handleInputChange('publicKey', e.target.value)}
                                    placeholder="FLWPUBK_TEST-..."
                                    required
                                />
                            </div>
                            {formErrors.publicKey && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.publicKey}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Secret Key <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${formErrors.secretKey ? 'is-invalid' : ''}`}
                                    value={formData.secretKey || ""}
                                    onChange={(e) => handleInputChange('secretKey', e.target.value)}
                                    placeholder="FLWSECK_TEST-..."
                                    required
                                />
                            </div>
                            {formErrors.secretKey && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.secretKey}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Secret Hash <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-shield"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${formErrors.secretHash ? 'is-invalid' : ''}`}
                                    value={formData.secretHash || ""}
                                    onChange={(e) => handleInputChange('secretHash', e.target.value)}
                                    placeholder="Your encryption hash"
                                    required
                                />
                            </div>
                            {formErrors.secretHash && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.secretHash}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Callback URL <span className="text-muted">(Optional)</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-link"></i>
                                </span>
                                <input
                                    type="url"
                                    className={`form-control ${formErrors.callbackUrl ? 'is-invalid' : ''}`}
                                    value={formData.callbackUrl || ""}
                                    onChange={(e) => handleInputChange('callbackUrl', e.target.value)}
                                    placeholder="https://yourdomain.com/callback"
                                />
                            </div>
                            {formErrors.callbackUrl && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.callbackUrl}
                                </div>
                            )}
                            <small className="form-text text-muted">
                                URL to receive payment notifications
                            </small>
                        </div>
                    </>
                );

            case "mobilemoney":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">
                                API User <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-user"></i>
                                </span>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.apiUser ? 'is-invalid' : ''}`}
                                    value={formData.apiUser || ""}
                                    onChange={(e) => handleInputChange('apiUser', e.target.value)}
                                    placeholder="API username"
                                    required
                                />
                            </div>
                            {formErrors.apiUser && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.apiUser}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                API Key <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-key"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${formErrors.apiKey ? 'is-invalid' : ''}`}
                                    value={formData.apiKey || ""}
                                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                                    placeholder="API key"
                                    required
                                />
                            </div>
                            {formErrors.apiKey && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.apiKey}
                                </div>
                            )}
                            <small className="form-text text-muted">
                                Obtain from your mobile money provider dashboard
                            </small>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const maskCredential = (value: string, visibleChars: number = 4): string => {
        if (!value || value.length <= visibleChars) return value;
        return '•'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
    };

    const renderMaskedCredentials = () => {
        if (!config.credentials) return null;

        return (
            <div className="mt-2 p-3 bg-light rounded">
                {Object.entries(config.credentials).map(([key, value]) => (
                    <div key={key} className="d-flex justify-content-between align-items-center mb-2 small">
                        <span className="text-muted text-capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-monospace">{maskCredential(String(value))}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className={`card h-100 ${config.active ? 'border-success' : 'border-light'} shadow-sm`}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="grow">
                            <h5 className="card-title mb-1">
                                <i className={`${providerIcons[config.provider]} me-2 text-primary`}></i>
                                {providerDisplayNames[config.provider] || config.provider}
                            </h5>
                            <p className="text-muted small mb-0">
                                {providerDescriptions[config.provider]}
                            </p>
                        </div>
                        <span className={`badge ${config.active ? 'bg-success' : 'bg-secondary'}`}>
                            {config.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="mb-3 border-top pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted">
                                <i className="bx bx-check-circle me-1"></i>
                                Status:
                            </span>
                            <span className={`badge ${config.hasCredentials ? 'bg-label-success' : 'bg-label-warning'}`}>
                                {config.hasCredentials ? 'Configured' : 'Not Configured'}
                            </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">
                                <i className="bx bx-calendar me-1"></i>
                                Added:
                            </span>
                            <span className="small">{new Date(config.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {config.hasCredentials && (
                        <div className="mb-3">
                            <button
                                className="btn btn-sm btn-outline-secondary w-100"
                                onClick={() => setShowCredentials(!showCredentials)}
                            >
                                <i className={`bx ${showCredentials ? 'bx-hide' : 'bx-show'} me-1`}></i>
                                {showCredentials ? 'Hide' : 'Show'} Credentials
                            </button>

                            {showCredentials && renderMaskedCredentials()}
                        </div>
                    )}

                    <div className="d-grid gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(true)}
                            disabled={isUpdating}
                        >
                            <i className={`bx ${config.hasCredentials ? 'bx-edit' : 'bx-cog'} me-1`}></i>
                            {config.hasCredentials ? 'Update Configuration' : 'Configure Provider'}
                        </button>

                        {config.active && config.hasCredentials && (
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => setShowDeactivateConfirm(true)}
                                disabled={isUpdating}
                            >
                                <i className="bx bx-x-circle me-1"></i>
                                Deactivate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Configuration Modal */}
            {showForm && (
                <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className={`${providerIcons[config.provider]} me-2`}></i>
                                    Configure {providerDisplayNames[config.provider]}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormErrors({});
                                    }}
                                    disabled={isUpdating}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="alert alert-info mb-3">
                                        <i className="bx bx-info-circle me-2"></i>
                                        <small>All credentials are securely encrypted and stored.</small>
                                    </div>
                                    {renderCredentialFields()}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setShowForm(false);
                                            setFormErrors({});
                                        }}
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bx bx-save me-1"></i>
                                                Save Configuration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivate Confirmation Modal */}
            {showDeactivateConfirm && (
                <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deactivation</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeactivateConfirm(false)}
                                    disabled={isUpdating}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-warning">
                                    <i className="bx bx-error-circle me-2"></i>
                                    <strong>Warning:</strong> This will deactivate the {providerDisplayNames[config.provider]} payment provider.
                                </div>
                                <p>Are you sure you want to deactivate this provider? You can reactivate it later by updating the configuration.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowDeactivateConfirm(false)}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeactivate}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Deactivating...
                                        </>
                                    ) : (
                                        'Deactivate Provider'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddProviderModal = ({
    show,
    onClose,
    onAddProvider,
    existingProviders
}: {
    show: boolean;
    onClose: () => void;
    onAddProvider: (providerId: string) => void;
    existingProviders: any[];
}) => {
    const existingProviderIds = existingProviders.map(p => p.provider);

    const availableProvidersList = availableProviders.filter(
        provider => !existingProviderIds.includes(provider.id)
    );

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bx bx-plus-circle me-2"></i>
                            Add Payment Provider
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {availableProvidersList.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bx bx-check-circle display-4 text-success mb-3 d-block"></i>
                                <h5 className="mb-2">All Providers Configured</h5>
                                <p className="text-muted mb-0">You've already added all available payment providers.</p>
                                <small className="text-muted">Manage your existing providers from the main page.</small>
                            </div>
                        ) : (
                            <>
                                <p className="text-muted mb-4">
                                    Choose a payment provider to integrate with your application. You can configure multiple providers.
                                </p>
                                <div className="row g-3">
                                    {availableProvidersList.map((provider) => (
                                        <div key={provider.id} className="col-12 col-md-6">
                                            <div
                                                className="card h-100 cursor-pointer border hover-shadow"
                                                onClick={() => onAddProvider(provider.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div className="card-body text-center p-4">
                                                    <div className="mb-3">
                                                        <i className={`${provider.icon} display-4 text-primary`}></i>
                                                    </div>
                                                    <h6 className="card-title mb-2">{provider.name}</h6>
                                                    <p className="card-text small text-muted mb-3">
                                                        {provider.description}
                                                    </p>
                                                    <span className="badge bg-primary">
                                                        <i className="bx bx-plus me-1"></i>
                                                        Click to Add
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProvidersPage = () => {
    const { appId } = useParams<{ appId: string }>();
    const location = useLocation();
    const locationState = location.state as LocationState;

    const {
        data: providers = [],
        isLoading,
        error,
        refetch
    } = useGetProvidersQuery({ appId: appId! }, { skip: !appId });

    const [setProviderConfig, { isLoading: isSetting }] = useSetProviderConfigMutation();
    const [updateProviderConfig, { isLoading: isUpdating }] = useUpdateProviderConfigMutation();
    const [deactivateProvider, { isLoading: isDeactivating }] = useDeactivateProviderMutation();

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [showConfigForm, setShowConfigForm] = useState(false);
    const [newProviderFormData, setNewProviderFormData] = useState<any>({});
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const isUpdatingAny = isSetting || isUpdating || isDeactivating;

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
    };

    const handleAddProvider = (providerId: string) => {
        setSelectedProvider(providerId);
        setShowAddModal(false);
        setShowConfigForm(true);
        setNewProviderFormData({});
        setFormErrors({});
    };

    const handleInputChange = (field: string, value: string) => {
        setNewProviderFormData({ ...newProviderFormData, [field]: value });
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: '' });
        }
    };

    const handleConfigureNewProvider = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appId || !selectedProvider) return;

        // Validate form
        const errors = validateCredentials(selectedProvider, newProviderFormData);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        try {
            await setProviderConfig({
                appId,
                provider: selectedProvider,
                credentials: newProviderFormData
            }).unwrap();

            setShowConfigForm(false);
            setSelectedProvider(null);
            setNewProviderFormData({});
            setFormErrors({});
            refetch();
            showToast(`${providerDisplayNames[selectedProvider]} configured successfully!`, 'success');
        } catch (error: any) {
            console.error('Failed to add provider:', error);
            showToast(error?.data?.error || 'Failed to configure provider', 'error');
        }
    };

    const handleConfigureProvider = async (provider: string, credentials: any) => {
        if (!appId) return;

        try {
            const existingConfig = providers.find((p: any) => p.provider === provider && p.hasCredentials);

            if (existingConfig) {
                await updateProviderConfig({
                    appId,
                    provider,
                    credentials
                }).unwrap();
                showToast(`${providerDisplayNames[provider]} updated successfully!`, 'success');
            } else {
                await setProviderConfig({
                    appId,
                    provider,
                    credentials
                }).unwrap();
                showToast(`${providerDisplayNames[provider]} configured successfully!`, 'success');
            }

            refetch();
        } catch (error: any) {
            console.error('Failed to configure provider:', error);
            showToast(error?.data?.error || 'Failed to save configuration', 'error');
        }
    };

    const handleDeactivateProvider = async (provider: string) => {
        if (!appId) return;

        try {
            await deactivateProvider({
                appId,
                provider
            }).unwrap();

            refetch();
            showToast(`${providerDisplayNames[provider]} deactivated successfully`, 'info');
        } catch (error: any) {
            console.error('Failed to deactivate provider:', error);
            showToast(error?.data?.error || 'Failed to deactivate provider', 'error');
        }
    };

    const renderNewProviderForm = () => {
        if (!selectedProvider) return null;

        switch (selectedProvider) {
            case "stripe":
                return (
                    <div className="mb-3">
                        <label className="form-label">
                            Secret Key <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bx bx-key"></i>
                            </span>
                            <input
                                type="password"
                                className={`form-control ${formErrors.secretKey ? 'is-invalid' : ''}`}
                                value={newProviderFormData.secretKey || ""}
                                onChange={(e) => handleInputChange('secretKey', e.target.value)}
                                placeholder="sk_test_..."
                                required
                            />
                        </div>
                        {formErrors.secretKey && (
                            <div className="invalid-feedback d-block">
                                {formErrors.secretKey}
                            </div>
                        )}
                        <small className="form-text text-muted">
                            Find your secret key in your Stripe Dashboard
                        </small>
                    </div>
                );

            case "flutterwave":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">
                                Public Key <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-key"></i>
                                </span>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.publicKey ? 'is-invalid' : ''}`}
                                    value={newProviderFormData.publicKey || ""}
                                    onChange={(e) => handleInputChange('publicKey', e.target.value)}
                                    placeholder="FLWPUBK_TEST-..."
                                    required
                                />
                            </div>
                            {formErrors.publicKey && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.publicKey}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Secret Key <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${formErrors.secretKey ? 'is-invalid' : ''}`}
                                    value={newProviderFormData.secretKey || ""}
                                    onChange={(e) => handleInputChange('secretKey', e.target.value)}
                                    placeholder="FLWSECK_TEST-..."
                                    required
                                />
                            </div>
                            {formErrors.secretKey && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.secretKey}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Secret Hash <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-shield"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${formErrors.secretHash ? 'is-invalid' : ''}`}
                                    value={newProviderFormData.secretHash || ""}
                                    onChange={(e) => handleInputChange('secretHash', e.target.value)}
                                    placeholder="Your encryption hash"
                                    required
                                />
                            </div>
                            {formErrors.secretHash && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.secretHash}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Callback URL <span className="text-muted">(Optional)</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-link"></i>
                                </span>
                                <input
                                    type="url"
                                    className={`form-control ${formErrors.callbackUrl ? 'is-invalid' : ''}`}
                                    value={newProviderFormData.callbackUrl || ""}
                                    onChange={(e) => handleInputChange('callbackUrl', e.target.value)}
                                    placeholder="https://yourdomain.com/callback"
                                />
                            </div>
                            {formErrors.callbackUrl && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.callbackUrl}
                                </div>
                            )}
                            <small className="form-text text-muted">
                                URL to receive payment notifications
                            </small>
                        </div>
                    </>
                );

            case "mobilemoney":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">
                                API User <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-user"></i>
                                </span>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.apiUser ? 'is-invalid' : ''}`}
                                    value={newProviderFormData.apiUser || ""}
                                    onChange={(e) => handleInputChange('apiUser', e.target.value)}
                                    placeholder="API username"
                                    required
                                />
                            </div>
                            {formErrors.apiUser && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.apiUser}
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                API Key <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bx bx-key"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${formErrors.apiKey ? 'is-invalid' : ''}`}
                                    value={newProviderFormData.apiKey || ""}
                                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                                    placeholder="API key"
                                    required
                                />
                            </div>
                            {formErrors.apiKey && (
                                <div className="invalid-feedback d-block">
                                    {formErrors.apiKey}
                                </div>
                            )}
                            <small className="form-text text-muted">
                                Obtain from your mobile money provider dashboard
                            </small>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    if (!appId) {
        return (
            <div className="container-xxl grow container-p-y">
                <div className="alert alert-danger">
                    <i className="bx bx-error-circle me-2"></i>
                    App ID is missing
                </div>
            </div>
        );
    }

    return (
        <div className="container-xxl grow container-p-y">
            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Breadcrumb */}
            <div className="mb-4">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/"><i className="bx bx-home-alt me-1"></i>Home</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/apps">Apps</Link>
                        </li>
                        <li className="breadcrumb-item active">
                            Payment Providers
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Header */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="grow">
                            <h4 className="mb-2">
                                <i className="bx bx-credit-card me-2"></i>
                                Payment Providers
                            </h4>
                            <p className="text-muted mb-2">
                                Configure and manage payment provider integrations for <strong>{locationState?.appName || 'your app'}</strong>
                            </p>
                            {locationState?.environment && (
                                <span className="badge bg-label-info">
                                    <i className="bx bx-server me-1"></i>
                                    {locationState.environment}
                                </span>
                            )}
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                            disabled={isUpdatingAny}
                        >
                            <i className="bx bx-plus me-2"></i>
                            Add Provider
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="text-muted">Loading payment providers...</div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bx bx-error-circle me-2 fs-4"></i>
                    <div>
                        <strong>Error:</strong> Failed to load provider configurations. Please try again.
                    </div>
                </div>
            )}

            {/* Providers Grid */}
            {!isLoading && !error && (
                <div className="row g-4">
                    {providers.length === 0 ? (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <div className="mb-4">
                                        <i className="bx bx-credit-card-front display-1 text-muted"></i>
                                    </div>
                                    <h5 className="mb-2">No Payment Providers Yet</h5>
                                    <p className="text-muted mb-4">
                                        Get started by configuring your first payment provider to accept payments.
                                    </p>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        <i className="bx bx-plus me-2"></i>
                                        Add Your First Provider
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        providers.map((provider: any) => (
                            <ProviderCard
                                key={provider.id}
                                config={provider}
                                onConfigure={handleConfigureProvider}
                                onDeactivate={handleDeactivateProvider}
                                isUpdating={isUpdatingAny}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Add Provider Modal */}
            <AddProviderModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddProvider={handleAddProvider}
                existingProviders={providers}
            />

            {/* Configuration Form for New Provider */}
            {showConfigForm && selectedProvider && (
                <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className={`${providerIcons[selectedProvider]} me-2`}></i>
                                    Configure {providerDisplayNames[selectedProvider]}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowConfigForm(false);
                                        setSelectedProvider(null);
                                        setNewProviderFormData({});
                                        setFormErrors({});
                                    }}
                                    disabled={isSetting}
                                ></button>
                            </div>
                            <form onSubmit={handleConfigureNewProvider}>
                                <div className="modal-body">
                                    <div className="alert alert-info mb-3">
                                        <i className="bx bx-info-circle me-2"></i>
                                        <small>All credentials are securely encrypted and stored.</small>
                                    </div>
                                    {renderNewProviderForm()}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setShowConfigForm(false);
                                            setSelectedProvider(null);
                                            setNewProviderFormData({});
                                            setFormErrors({});
                                        }}
                                        disabled={isSetting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSetting}
                                    >
                                        {isSetting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bx bx-check me-1"></i>
                                                Add Provider
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProvidersPage;