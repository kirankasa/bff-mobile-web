"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../lib/api';
import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../ui/MapPicker'), { ssr: false });

type Address = {
    id: number;
    street: string; // mapped from address_line1
    city: string;
    zip_code: string; // mapped from zip
    phone_number?: string;
    latitude?: number;
    longitude?: number;
};

type AddressListProps = {
    onSelect?: (address: Address) => void;
    selectable?: boolean;
};

export default function AddressList({ onSelect, selectable = false }: AddressListProps) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingNew, setAddingNew] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', zip_code: '', phone_number: '' });
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/${user?.id}/addresses`);
            const data = await res.json();
            if (res.ok) {
                const mapped = data.data.map((addr: any) => ({
                    id: addr.id,
                    street: addr.address_line1,
                    city: addr.city,
                    zip_code: addr.zip,
                    phone_number: addr.phone_number
                }));
                setAddresses(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!coords) {
            showToast('Please select a location on the map', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/users/${user.id}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address_line1: newAddress.street,
                    city: newAddress.city,
                    zip: newAddress.zip_code,
                    phone_number: newAddress.phone_number,
                    latitude: coords.lat,
                    longitude: coords.lng
                }),
            });

            if (res.ok) {
                showToast('Address added successfully!', 'success');
                setAddingNew(false);
                setNewAddress({ street: '', city: '', zip_code: '', phone_number: '' });
                setCoords(null);
                fetchAddresses();
            } else {
                showToast('Failed to add address', 'error');
            }
        } catch (error) {
            showToast('Error adding address', 'error');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const res = await fetch(`${API_URL}/api/users/${user?.id}/addresses/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Address deleted', 'success');
                fetchAddresses();
            } else {
                showToast('Failed to delete address', 'error');
            }
        } catch (error) {
            showToast('Error deleting address', 'error');
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-500">Loading addresses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Addresses</h2>
                <button
                    onClick={() => setAddingNew(!addingNew)}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                    {addingNew ? 'Cancel' : '+ Add New'}
                </button>
            </div>

            {addingNew && (
                <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="City"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            onBlur={() => {
                                if (newAddress.city && newAddress.zip_code.length >= 5) {
                                    // Trigger geocode
                                    const q = `${newAddress.city} ${newAddress.zip_code}`;
                                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
                                        .then(res => res.json())
                                        .then(data => {
                                            if (data && data.length > 0) {
                                                setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                                            }
                                        })
                                        .catch(err => console.error(err));
                                }
                            }}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Zip Code"
                            required
                            value={newAddress.zip_code}
                            onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                            onBlur={() => {
                                if (newAddress.zip_code.length >= 5) {
                                    // Trigger geocode with priority to Zip
                                    const q = `${newAddress.zip_code}, Hyderabad, India`; // Context helps
                                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
                                        .then(res => res.json())
                                        .then(data => {
                                            if (data && data.length > 0) {
                                                setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                                            }
                                        })
                                        .catch(err => console.error(err));
                                }
                            }}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Street Address (e.g. Flat 402, Sunshine Apts)"
                            required
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm"
                        />
                    </div>
                    <div>
                        <input
                            type="tel"
                            placeholder="Contact Number (Optional)"
                            value={newAddress.phone_number}
                            onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm Location on Map {coords && <span className="text-green-600 font-normal text-xs ml-2">(Location updated from address)</span>}
                        </label>
                        <MapPicker position={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
                        <p className="text-xs text-gray-500 mt-1">Please drag the map to point to your exact building entrance.</p>
                    </div>

                    <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 text-sm font-medium">
                        Save Address
                    </button>
                </form>
            )}

            <div className="grid gap-4">
                {addresses.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No addresses saved yet.</p>
                ) : (
                    addresses.map((addr) => (
                        <div
                            key={addr.id}
                            onClick={() => selectable && onSelect && onSelect(addr)}
                            className={`relative p-4 border rounded-lg bg-white dark:bg-gray-900 transition-all ${selectable ? 'cursor-pointer hover:border-orange-500 hover:shadow-md' : ''} border-gray-200 dark:border-gray-700`}
                        >
                            <div className="pr-8">
                                <p className="font-medium text-gray-900 dark:text-white">{addr.street}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.city}, {addr.zip_code}</p>
                                {addr.phone_number && <p className="text-xs text-gray-400 mt-1">📞 {addr.phone_number}</p>}
                            </div>
                            <button
                                onClick={(e) => handleDelete(e, addr.id)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Address"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
