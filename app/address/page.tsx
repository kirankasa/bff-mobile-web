"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../lib/api';

type Address = {
    id: number;
    street: string;
    city: string;
    zip_code: string;
};

export default function AddressPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingNew, setAddingNew] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', zip_code: '' });

    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode'); // 'select' or undefined

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (user) {
            fetchAddresses();
        }
    }, [user, isAuthenticated]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/${user?.id}/addresses`);
            const data = await res.json();
            if (res.ok) {
                // Map server fields to UI fields if needed, or just use server fields
                const mapped = data.data.map((addr: any) => ({
                    id: addr.id,
                    street: addr.address_line1,
                    city: addr.city,
                    zip_code: addr.zip
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

        try {
            const res = await fetch(`${API_URL}/api/users/${user.id}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address_line1: newAddress.street,
                    city: newAddress.city,
                    zip: newAddress.zip_code
                }),
            });

            if (res.ok) {
                showToast('Address added successfully!', 'success');
                setAddingNew(false);
                setNewAddress({ street: '', city: '', zip_code: '' });
                fetchAddresses();
            } else {
                showToast('Failed to add address', 'error');
            }
        } catch (error) {
            console.error('Error adding address', error);
            showToast('Error adding address', 'error');
        }
    };

    const handleSelect = (address: Address) => {
        if (mode === 'select') {
            const addressText = `${address.street}, ${address.city} ${address.zip_code}`;
            // Pass selected address back to cart via query params
            router.push(`/cart?addressId=${address.id}&addressText=${encodeURIComponent(addressText)}`);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading addresses...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl pt-20 md:pt-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mode === 'select' ? 'Select Delivery Address' : 'My Addresses'}
                </h1>
                <button
                    onClick={() => setAddingNew(!addingNew)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                >
                    {addingNew ? 'Cancel' : '+ Add New'}
                </button>
            </div>

            {addingNew && (
                <form onSubmit={handleAddAddress} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                            <input
                                type="text"
                                required
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.zip_code}
                                    onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 border"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No addresses found. Add one above!</p>
                ) : (
                    addresses.map((addr) => (
                        <div
                            key={addr.id}
                            onClick={() => handleSelect(addr)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${mode === 'select'
                                ? 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <p className="font-medium text-gray-900 dark:text-white">{addr.street}</p>
                            <p className="text-gray-500 dark:text-gray-400">{addr.city}, {addr.zip_code}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
