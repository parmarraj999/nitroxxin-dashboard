import { CheckIcon } from './Icons';

export function ToastStack({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-pill">
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#16a34a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckIcon size={12} strokeWidth={2.5} />
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
