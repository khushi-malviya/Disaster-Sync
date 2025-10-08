import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MdClose, MdWarning, MdInfo, MdError } from 'react-icons/md';

const socket = io('http://localhost:5000');

export default function AlertNotification() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.on('emergencyAlert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      
      // Auto-remove alert after 10 seconds for non-critical alerts
      if (alert.severity !== 'high') {
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== alert.id));
        }, 10000);
      }
    });

    return () => socket.off('emergencyAlert');
  }, []);

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high': return <MdError className="text-red-500" />;
      case 'medium': return <MdWarning className="text-yellow-500" />;
      default: return <MdInfo className="text-blue-500" />;
    }
  };

  const getAlertStyles = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 p-4 rounded-lg shadow-lg ${getAlertStyles(alert.severity)} animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-xl">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {alert.severity === 'high' ? '🚨 EMERGENCY ALERT' : 
                   alert.severity === 'medium' ? '⚠️ WARNING' : 'ℹ️ NOTICE'}
                </h3>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs opacity-75 mt-2">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            >
              <MdClose />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
