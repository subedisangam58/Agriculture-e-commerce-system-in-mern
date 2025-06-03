"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideNavbar from "@/components/farmer/SideNavbar";

function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const hasShownToast = useRef(false);

    const [weather, setWeather] = useState({
        temp: null as number | null,
        condition: 'Loading...',
        icon: null,
        forecast: [] as { day: string; temp: number; condition: string; icon: string }[]
    });
    const [location, setLocation] = useState<{
        lat: number | null;
        lon: number | null;
        city: string;
    }>({
        lat: null,
        lon: null,
        city: 'Loading location...'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tempUnit, setTempUnit] = useState('C');

    const [notifications, setNotifications] = useState([
        { type: "order", message: "New order for 5kg carrots.", date: "2025-05-07" },
        { type: "info", message: "Soil moisture low in field 3.", date: "2025-05-06" },
    ]);

    useEffect(() => {
        if (!loading && !user) {
            if (!hasShownToast.current) {
                toast.warn("Please login first");
                hasShownToast.current = true;
            }
            router.replace("/login");
        }
    }, [loading, user, router]);

    const fahrenheitToCelsius = (f: number) => Math.round((f - 32) * 5 / 9);
    const displayTemp = (temp: number | null) => temp === null ? 'N/A' : tempUnit === 'C' ? `${fahrenheitToCelsius(temp)}°C` : `${temp}°F`;

    const fetchWeatherData = async (lat: number, lon: number, isDefault = false) => {
        try {
            setLocation(prev => ({ ...prev, lat, lon }));
            const apiKey = 'd272e01a7ac0aaa59d5c537330435a2c';
            const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
            const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
            if (!wRes.ok || !fRes.ok) throw new Error("Weather fetch error");

            const weatherData = await wRes.json();
            const forecastData = await fRes.json();

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date().getDay();
            const nextDays = Array.from({ length: 4 }, (_, i) => (today + i + 1) % 7);
            const forecastList = forecastData.list;

            const processed = nextDays.map(dayIndex => {
                const sameDay = forecastList.filter((f: { dt: number; }) => new Date(f.dt * 1000).getDay() === dayIndex);
                const midDay = sameDay.find((f: { dt: number; }) => {
                    const hour = new Date(f.dt * 1000).getHours();
                    return hour >= 11 && hour <= 14;
                }) || sameDay[0];
                return {
                    day: days[dayIndex],
                    temp: Math.round(midDay.main.temp),
                    condition: midDay.weather[0].main,
                    icon: midDay.weather[0].icon,
                };
            });

            setWeather({
                temp: Math.round(weatherData.main.temp),
                condition: weatherData.weather[0].main,
                icon: weatherData.weather[0].icon,
                forecast: processed,
            });

            setLocation(prev => ({ ...prev, city: isDefault ? `${weatherData.name} (Default)` : weatherData.name }));
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setError("Unable to load weather data.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchLocationAndWeather = async () => {
            const fallback = { latitude: 40.7128, longitude: -74.0060 };
            if (!navigator.geolocation) {
                await fetchWeatherData(fallback.latitude, fallback.longitude, true);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async pos => await fetchWeatherData(pos.coords.latitude, pos.coords.longitude),
                async () => await fetchWeatherData(fallback.latitude, fallback.longitude, true),
                { timeout: 10000 }
            );
        };

        fetchLocationAndWeather();
    }, []);

    if (loading || !user) return <div className="p-6">Checking authentication...</div>;

    return (
        <div className="flex h-screen overflow-hidden">
            <SideNavbar
                isSidebarOpen={true}
                toggleSidebar={() => { }}
                activePage="dashboard"
            />
            <main className="flex-1 overflow-y-auto bg-gray-100 p-4 ml-0 md:ml-14">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Farmer Dashboard</h1>

                {/* Farm Statistics */}
                <div className="bg-white shadow rounded p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Farm Statistics</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><p className="text-gray-500">Crops</p><p className="text-lg font-bold">12</p></div>
                        <div><p className="text-gray-500">Harvested</p><p className="text-lg font-bold">3</p></div>
                        <div><p className="text-gray-500">Livestock</p><p className="text-lg font-bold">54</p></div>
                        <div><p className="text-gray-500">Revenue</p><p className="text-lg font-bold text-green-600">$12,450</p></div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white shadow rounded p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                    <ul className="space-y-3">
                        {notifications.map((note, idx) => (
                            <li key={idx} className={`p-4 rounded-lg ${note.type === 'order' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                <p className="text-sm text-gray-700">{note.date}</p>
                                <p className="font-medium text-gray-800">{note.message}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weather */}
                <div className="bg-white shadow rounded p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Weather Forecast</h2>
                        <button
                            onClick={() => setTempUnit(t => (t === 'C' ? 'F' : 'C'))}
                            className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                        >
                            {tempUnit === 'C' ? 'Switch to °F' : 'Switch to °C'}
                        </button>
                    </div>
                    {!isLoading && !error ? (
                        <>
                            <div className="flex items-center mb-4">
                                <div className="text-2xl font-bold text-gray-800">{displayTemp(weather.temp)}</div>
                                <div className="ml-4 text-gray-600">{location.city}</div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {weather.forecast.map((day, idx) => (
                                    <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="font-semibold text-gray-800">{day.day}</p>
                                        <p className="text-gray-600 text-sm">{displayTemp(day.temp)}</p>
                                        <p className="text-xs text-gray-500">{day.condition}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;