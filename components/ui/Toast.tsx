"use client";

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
    message: string;
    type: ToastType;
    onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white shadow-lg transition-all duration-300 z-50 flex items-center gap-2 ${bgColors[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            <span className="font-medium">{message}</span>
            <button onClick={() => setVisible(false)} className="ml-2 opacity-75 hover:opacity-100">
                ✕
            </button>
        </div>
    );
}
