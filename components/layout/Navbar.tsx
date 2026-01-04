"use client";

import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { count } = useCart();
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                    <UtensilsCrossed className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
                <span className="hidden sm:inline text-xl font-bold text-orange-600 dark:text-orange-500">Beyond Food Flavours</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-6">
                {/* Cart Icon */}
                <Link href="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 dark:text-gray-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    {count > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                            {count}
                        </span>
                    )}
                </Link>

                {/* Auth Links */}
                {user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-orange-500 transition-colors">
                            My Account
                        </Link>
                        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                            Hi, {user.name ? user.name.split(' ')[0] : 'Guest'}
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-orange-500 transition-colors"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav >
    );
}
