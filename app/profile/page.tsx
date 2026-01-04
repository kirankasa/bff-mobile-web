"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../lib/api';
import AddressList from '../../components/address/AddressList';
import OrderList from '../../components/orders/OrderList';
import { User, MapPin, ShoppingBag } from 'lucide-react';

export default function ProfilePage() {
    const { user, login, isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'orders'>('details');

    // Local form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            const res = await fetch(`${API_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();

            if (res.ok) {
                // Update global auth state
                login({ ...user, ...data.user });
                showToast('Profile updated successfully', 'success');
            } else {
                showToast(data.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) return <div className="p-8 text-center pt-24 text-gray-500">Please login to view your profile.</div>;

    const tabs = [
        { id: 'details', label: 'Personal Details', icon: User },
        { id: 'addresses', label: 'Address Book', icon: MapPin },
        { id: 'orders', label: 'Order History', icon: ShoppingBag },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl pt-24">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Sidebar: Navigation */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                        <div className="p-6 bg-orange-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome,</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        </div>
                        <nav className="p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${activeTab === tab.id
                                                ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="md:col-span-3">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">

                        {activeTab === 'details' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <User className="h-5 w-5 text-orange-500" />
                                    Personal Information
                                </h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={user?.phone_number || ''}
                                            disabled
                                            className="w-full bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg p-2.5 text-sm border border-gray-200 dark:border-gray-600 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-orange-500" />
                                    Address Book
                                </h2>
                                <AddressList />
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-orange-500" />
                                    Order History
                                </h2>
                                <OrderList />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
