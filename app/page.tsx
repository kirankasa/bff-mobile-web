"use client";

import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api';
import MenuItem from '../components/menu/MenuItem';

type Category = {
  id: number;
  name: string;
};

type MenuItemType = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId: number;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantStatus, setRestaurantStatus] = useState<{ isOpen: boolean; message: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, statusRes] = await Promise.all([
          fetch(`${API_URL}/api/menu`),
          fetch(`${API_URL}/api/restaurant/status`)
        ]);

        const menuData = await menuRes.json();
        const statusData = await statusRes.json();

        // Parse nested API response: { data: [{ id, name, items: [...] }] }
        const cats: Category[] = [];
        const allItems: MenuItemType[] = [];

        if (menuData.data && Array.isArray(menuData.data)) {
          menuData.data.forEach((cat: any) => {
            cats.push({ id: Number(cat.id), name: cat.name });
            if (cat.items && Array.isArray(cat.items)) {
              cat.items.forEach((item: any) => {
                allItems.push({
                  id: Number(item.id),
                  name: item.name,
                  price: item.price,
                  description: item.description,
                  image: item.image,
                  categoryId: Number(cat.id) // Ensure we link back to category
                });
              });
            }
          });
        }

        setCategories(cats);
        setMenuItems(allItems);
        setRestaurantStatus(statusData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-20 pt-20 md:pt-8">
      {/* Hero / Status */}
      <div className="py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Our Menu
        </h1>
        {restaurantStatus && !restaurantStatus.isOpen && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Restaurant Closed: </strong>
            <span className="block sm:inline">{restaurantStatus.message}</span>
          </div>
        )}
      </div>

      {/* Menu Categories */}
      <div className="space-y-12">
        {categories.map((category) => {
          const categoryItems = menuItems.filter((item) => item.categoryId === category.id);
          if (categoryItems.length === 0) return null;

          return (
            <section key={category.id} id={`category-${category.id}`}>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItems.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
