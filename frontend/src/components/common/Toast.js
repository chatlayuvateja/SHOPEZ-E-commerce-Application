import React, { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        {toasts.map(t => (
          <div key={t.id} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{
            padding: '12px 20px', borderRadius: 8,
            background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#f59e0b',
            color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease'
          }}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
