"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';

type ServiceabilityCheckProps = {
    address: { latitude?: number; longitude?: number } | null;
    onCheckComplete?: (serviceable: boolean) => void;
};

export default function ServiceabilityCheck({ address, onCheckComplete }: ServiceabilityCheckProps) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'serviceable' | 'unserviceable' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!address || !address.latitude || !address.longitude) {
            setStatus('idle');
            return;
        }

        checkServiceability(address.latitude, address.longitude);
    }, [address]);

    const checkServiceability = async (lat: number, lng: number) => {
        setStatus('checking');
        try {
            const res = await fetch(`${API_URL}/api/check-serviceability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng }),
            });
            const data = await res.json();

            if (res.ok) {
                if (data.serviceable) {
                    setStatus('serviceable');
                    setMessage(`Great! We deliver to your location (${data.distanceKm}km away).`);
                    onCheckComplete?.(true);
                } else {
                    setStatus('unserviceable');
                    setMessage(`Sorry, we currently only deliver within ${data.radiusKm}km. You are ${data.distanceKm}km away.`);
                    onCheckComplete?.(false);
                }
            } else {
                setStatus('error');
                setMessage('Could not check serviceability.');
                // onCheckComplete?.(false); // Optional: block or allow if check fails? Better to block or warn.
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error checking serviceability.');
        }
    };

    if (status === 'idle') return null;

    return (
        <div className={`mt-4 p-3 rounded-md text-sm ${status === 'serviceable' ? 'bg-green-50 text-green-700 border border-green-200' :
                status === 'unserviceable' ? 'bg-red-50 text-red-700 border border-red-200' :
                    status === 'checking' ? 'bg-gray-50 text-gray-600' :
                        'bg-orange-50 text-orange-700'
            }`}>
            {status === 'checking' && 'Checking delivery availability...'}
            {status !== 'checking' && message}
        </div>
    );
}
