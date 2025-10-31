import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetAppsQuery, useRotateKeyMutation, useCreateAppMutation } from "@/store/appsApi";


type AppEnvironment = "development" | "staging" | "production";

const environmentBadgeClass: Record<AppEnvironment, string> = {
    development: "bg-label-warning",
    staging: "bg-label-info",
    production: "bg-label-success",
};

const AppCard = ({ app, onRotate, rotating, onCopy }: { app: any; onRotate: (id: string) => void; rotating: boolean; onCopy: (value: string) => void }) => {
    const envClass = environmentBadgeClass[app.environment as AppEnvironment] ?? "bg-label-secondary";
    return (
        <div className="col-12 col-sm-6 col-lg-4">
            <div className="card h-100">
                <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0 text-truncate" title={app.name}>{app.name}</h5>
                        <span className={"badge " + envClass}>{app.environment}</span>
                    </div>
                    {app.description && (
                        <p className="card-text text-muted grow">{app.description}</p>
                    )}
                    <div className="mt-auto">
                        {app.apiKey?.key && (
                            <div className="small text-muted mb-2 d-flex align-items-center gap-2">
                                <span className="text-truncate" title={app.apiKey.key}>API Key: {app.apiKey.key}</span>
                                <button className="btn btn-xs btn-outline-secondary" onClick={() => onCopy(app.apiKey.key)}>Copy</button>
                            </div>
                        )}
                        {/* {app.webhookUrl && (
                            <div className="small text-muted mb-2 text-truncate" title={app.webhookUrl}>
                                Webhook: {app.webhookUrl}
                            </div>
                        )} */}
                        <div className="d-flex gap-2">
                            <Link
                                to={`/apps/${app.id}/providers`}
                                state={{ appName: app.name, environment: app.environment }}
                                className="btn btn-sm btn-primary"
                            >
                                Manage Providers
                            </Link>
                            <button className="btn btn-sm btn-outline-secondary" disabled={rotating} onClick={() => onRotate(app.id)}>
                                {rotating ? 'Rotating...' : 'Rotate Key'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreateAppModal = ({ show, onClose, onCreate }: { show: boolean; onClose: () => void; onCreate: (payload: any) => void }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    // const [webhookUrl, setWebhookUrl] = useState("");
    const [environment, setEnvironment] = useState<AppEnvironment>("development");

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create App</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        {/* <div className="mb-3">
                            <label className="form-label">Webhook URL</label>
                            <input className="form-control" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                        </div> */}
                        <div className="mb-3">
                            <label className="form-label">Environment</label>
                            <select className="form-select" value={environment} onChange={(e) => setEnvironment(e.target.value as AppEnvironment)}>
                                <option value="development">development</option>
                                <option value="staging">staging</option>
                                <option value="production">production</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={() => onCreate({ name, description, environment })}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AppsPage = () => {
    const { data: apps = [], isLoading: loading, error } = useGetAppsQuery();
    const [rotateKey, { isLoading: rotating }] = useRotateKeyMutation();
    const [showCreate, setShowCreate] = useState(false);
    const [createApp] = useCreateAppMutation();
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(value);
            setTimeout(() => setCopied(null), 1500);
        } catch (_) {
            // eslint-disable-next-line no-alert
            alert('Failed to copy');
        }
    };

    return (
        <div className="container-xxl grow container-p-y">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Apps</h4>
                    <div className="text-muted">Your applications and environments</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    + New App
                </button>
            </div>

            {loading && (
                <div className="text-center py-5">Loading apps...</div>
            )}
            {error && !loading && (
                <div className="alert alert-danger" role="alert">Failed to load apps</div>
            )}

            {!loading && !error && (
                <div className="row g-4">
                    <div className="col-12">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Apps</li>
                            </ol>
                        </nav>
                    </div>
                    {apps.length === 0 && (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center text-muted">
                                    No apps yet. Get started by creating your first app.
                                </div>
                            </div>
                        </div>
                    )}
                    {apps.map((app: any) => (
                        <AppCard key={app.id} app={app} rotating={rotating} onRotate={async (id: string) => {
                            try {
                                await rotateKey({ appId: id }).unwrap();
                            } catch (e) {
                                // ignore
                            }
                        }} onCopy={handleCopy} />
                    ))}
                </div>
            )}

            {copied && (
                <div className="toast align-items-center text-bg-success border-0 show position-fixed" role="alert" style={{ right: 16, bottom: 16 }}>
                    <div className="d-flex">
                        <div className="toast-body">Copied to clipboard</div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setCopied(null)}></button>
                    </div>
                </div>
            )}

            <CreateAppModal show={showCreate} onClose={() => setShowCreate(false)} onCreate={async (payload: any) => {
                try {
                    await createApp(payload).unwrap();
                    setShowCreate(false);
                } catch (e) {
                    // eslint-disable-next-line no-alert
                    alert('Failed to create app');
                }
            }} />
        </div>
    );
};

export default AppsPage;


