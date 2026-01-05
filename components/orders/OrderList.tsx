"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../lib/api';

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
};

type Order = {
    id: number;
    total: number;
    status: string;
    created_at: string;
    items: OrderItem[];
    address_line1: string;
    city: string;
    zip: string;
};

export default function OrderList() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/${user?.id}/orders`);
            const data = await res.json();
            if (data.data) {
                setOrders(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="inline-flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                <Link href="/" className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition">
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Order ID</p>
                            <p className="font-bold text-gray-900 dark:text-white">#{order.id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                            <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full mt-0.5 ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status || 'Pending'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                            <p className="font-bold text-orange-600">₹{Number(order.total).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="space-y-3 mb-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{item.quantity}x</span>
                                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                    </div>
                                    <span className="text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
                            Delivered to: <span className="text-gray-700 dark:text-gray-300 font-medium">{order.address_line1}, {order.city} {order.zip}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
