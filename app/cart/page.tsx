"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import { API_URL } from '../../lib/api';

import { Suspense } from 'react';

function CartContent() {
    const { items, total, updateQuantity, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [restaurantStatus, setRestaurantStatus] = useState<{ isOpen: boolean; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<{ id: number; text: string } | null>(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm?: () => void;
        confirmText?: string;
        type?: 'info' | 'confirm';
        actionLink?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm'
    });

    // Load restaurant status
    useEffect(() => {
        fetch(`${API_URL}/api/restaurant/status`)
            .then(res => res.json())
            .then(data => setRestaurantStatus(data))
            .catch(err => console.error("Failed to fetch status", err));
    }, []);

    // Load address from query params
    useEffect(() => {
        const addressId = searchParams.get('addressId');
        const addressText = searchParams.get('addressText');
        if (addressId && addressText) {
            setSelectedAddress({ id: Number(addressId), text: addressText });
        }
    }, [searchParams]);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            setModalConfig({
                isOpen: true,
                title: 'Login Required',
                message: 'Please login to checkout.',
                confirmText: 'Login',
                onConfirm: () => router.push('/auth/login')
            });
            return;
        }

        if (restaurantStatus && !restaurantStatus.isOpen) {
            setModalConfig({
                isOpen: true,
                title: 'Restaurant Closed',
                message: restaurantStatus.message || 'Restaurant is currently closed.',
                confirmText: 'OK',
                onConfirm: () => { } // Just close
            });
            return;
        }

        if (!selectedAddress) {
            setModalConfig({
                isOpen: true,
                title: 'Address Required',
                message: 'Please select a delivery address to proceed.',
                confirmText: 'Select Address',
                onConfirm: () => router.push('/address?mode=select')
            });
            return;
        }

        setSubmitting(true);
        console.log("Placing order with user:", user);
        console.log("Address:", selectedAddress);
        try {
            const payload = {
                items,
                total,
                user_id: user?.id,
                address_id: selectedAddress.id
            };
            console.log("Order payload:", payload);

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                clearCart();
                setSelectedAddress(null);
                setModalConfig({
                    isOpen: true,
                    title: 'Order Placed Successfully!',
                    message: `Order ID: #${result.id}\n\nYour delicious food is being prepared and will be delivered to:\n${selectedAddress.text}`,
                    confirmText: 'Back to Menu',
                    type: 'info',
                    actionLink: '/'
                });
            } else {
                throw new Error(result.error || 'Failed to place order');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {items.length === 0 ? (
                !modalConfig.isOpen && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cart is empty</h2>
                        <p className="text-gray-500 mb-8">Add some delicious food to your cart!</p>
                        <Link href="/" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors">
                            Browse Menu
                        </Link>
                    </div>
                )
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Order</h1>

                    {restaurantStatus && !restaurantStatus.isOpen && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                            <strong>Restaurant Closed: </strong> {restaurantStatus.message}
                        </div>
                    )}

                    {/* Cart Items */}
                    <div className="space-y-4 mb-8">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="w-20 h-20 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                    <p className="text-orange-500 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-orange-100 dark:hover:bg-gray-600"
                                    >
                                        -
                                    </button>
                                    <span className="font-medium w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-orange-100 dark:hover:bg-gray-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Summary */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        {isAuthenticated && (
                            <Link
                                href="/address?mode=select"
                                className="flex items-center justify-between p-4 mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
                            >
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Delivery To</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedAddress ? selectedAddress.text : 'Select Address'}
                                    </p>
                                </div>
                                <span className="text-orange-600 text-sm font-semibold">Change</span>
                            </Link>
                        )}

                        <div className="flex justify-between items-end mb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-3xl font-bold text-orange-600">${total.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={submitting || (restaurantStatus ? !restaurantStatus.isOpen : false)}
                            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Processing...' :
                                (restaurantStatus && !restaurantStatus.isOpen ? 'Restaurant Closed' :
                                    isAuthenticated ? (selectedAddress ? 'Place Order' : 'Select Address') : 'Login to Checkout')}
                        </button>
                    </div>
                </>
            )}

            {/* Global Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                type={modalConfig.type || 'confirm'}
                actionLink={modalConfig.actionLink}
            />
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center pt-24">Loading...</div>}>
            <CartContent />
        </Suspense>
    );
}
