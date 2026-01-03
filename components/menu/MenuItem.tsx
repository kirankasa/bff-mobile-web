"use client";

import React from 'react';
import Image from 'next/image'; // Use Next.js Image for optimization if domain is configured, else standard img
import { useCart } from '../../context/CartContext';

type MenuItemProps = {
    item: {
        id: number;
        name: string;
        price: number;
        description: string;
        image: string;
        categoryId: number;
    };
};

export default function MenuItem({ item }: MenuItemProps) {
    const { addToCart, items, updateQuantity } = useCart();
    const cartItem = items.find((i) => i.id === item.id.toString());
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 md:line-clamp-none mb-3">
                        {item.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-orange-500">${item.price.toFixed(2)}</span>

                    {/* Add / Quantity Controls */}
                    {quantity > 0 ? (
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id.toString(), quantity - 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">{quantity}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id.toString(), quantity + 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-orange-500 font-bold"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart({ ...item, id: item.id.toString() });
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
