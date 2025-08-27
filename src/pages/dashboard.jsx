import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Dashboard() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeOrders: 0,
        todaySales: 0,
        customersServed: 0,
        totalTips: 0
    });
    
    // Update time and greeting every minute
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            
            const hour = now.getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 17) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        }, 60000);
        
        // Set initial greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
        
        return () => clearInterval(timer);
    }, []);

    // Fetch real data from your backend
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/order-history');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Set default values if API fails
            setStats({
                activeOrders: 0,
                todaySales: 0,
                customersServed: 0,
                totalTips: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersData) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter today's orders
        const todayOrders = ordersData.filter(order => {
            const orderDate = new Date(order.paymentDate || order.orderDate);
            return orderDate >= today;
        });

        // Calculate active orders (orders from today that might still be active)
        const activeOrders = todayOrders.length;

        // Calculate today's sales
        const todaySales = todayOrders.reduce((sum, order) => {
            return sum + (order.totalAmount || 0);
        }, 0);

        // Calculate customers served (unique customers from today)
        const uniqueCustomers = new Set();
        todayOrders.forEach(order => {
            if (order.customerName) {
                uniqueCustomers.add(order.customerName);
            }
            if (order.tableNumber) {
                uniqueCustomers.add(`Table ${order.tableNumber}`);
            }
        });
        const customersServed = uniqueCustomers.size;

        // Calculate total tips from today
        const totalTips = todayOrders.reduce((sum, order) => {
            return sum + (order.tip || 0);
        }, 0);

        setStats({
            activeOrders,
            todaySales,
            customersServed,
            totalTips
        });
    };
    
    const handleDineIn = () => navigate('/dine-in');
    const handleTakeAway = () => navigate('/take-away');
    const handleOrder = () => navigate('/order');
    const handleTips = () => navigate('/tips');
    const handleReport = () => navigate('/report');
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {greeting}!
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    {currentTime.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                                <div className="flex items-center mt-3 space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">Live</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600 font-mono">
                                        {currentTime.toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* <div className="text-right">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600 mt-3 font-medium">Restaurant Dashboard</p>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Active Orders</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? (
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        stats.activeOrders
                                    )}
                                </p>
                                <p className="text-xs text-green-600 mt-1">Today's orders</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Today's Sales</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? (
                                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        `$${stats.todaySales.toFixed(2)}`
                                    )}
                                </p>
                                <p className="text-xs text-green-600 mt-1">Real-time data</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Customers Served</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? (
                                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        stats.customersServed
                                    )}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Today's unique customers</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Tips</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? (
                                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        `$${stats.totalTips.toFixed(2)}`
                                    )}
                                </p>
                                <p className="text-xs text-orange-600 mt-1">Today's tips</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Dine-In */}
                    <button 
                        onClick={handleDineIn}
                        className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white p-10 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Dine-In</h3>
                            <p className="text-blue-100 text-lg">Table Management & Orders</p>
                            <div className="mt-4 flex items-center justify-center space-x-2 text-blue-200">
                                <span className="text-sm">Active Tables: {stats.activeOrders}</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </button>

                    {/* Take Away */}
                    <button 
                        onClick={handleTakeAway}
                        className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white p-10 rounded-3xl shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Take Away</h3>
                            <p className="text-green-100 text-lg">Pickup Orders</p>
                            <div className="mt-4 flex items-center justify-center space-x-2 text-green-200">
                                <span className="text-sm">Today: {stats.activeOrders}</span>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </button>

                    {/* Orders */}
                    <button 
                        onClick={handleOrder}
                        className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 hover:from-purple-600 hover:via-purple-700 hover:to-violet-700 text-white p-10 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Orders</h3>
                            <p className="text-purple-100 text-lg">Order Management</p>
                            <div className="mt-4 flex items-center justify-center space-x-2 text-purple-200">
                                <span className="text-sm">Total: {orders.length}</span>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </button>

                    {/* Tips */}
                    <button 
                        onClick={handleTips}
                        className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-600 hover:via-yellow-700 hover:to-amber-700 text-white p-10 rounded-3xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Tips</h3>
                            <p className="text-yellow-100 text-lg">Tip Management</p>
                            <div className="mt-4 flex items-center justify-center space-x-2 text-yellow-200">
                                <span className="text-sm">Today: ${stats.totalTips.toFixed(2)}</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </button>

                    {/* Reports */}
                    <button 
                        onClick={handleReport}
                        className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700 text-white p-10 rounded-3xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Reports</h3>
                            <p className="text-orange-100 text-lg">Sales Analytics</p>
                            <div className="mt-4 flex items-center justify-center space-x-2 text-orange-200">
                                <span className="text-sm">Sales: ${stats.todaySales.toFixed(2)}</span>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </button>

                    {/* Quick Actions */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-slate-500 via-slate-600 to-gray-600 hover:from-slate-600 hover:via-slate-700 hover:to-gray-700 text-white p-10 rounded-3xl shadow-2xl hover:shadow-slate-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Quick Stats</h3>
                            <p className="text-slate-100 text-lg">Performance Overview</p>
                            <div className="mt-4 flex items-center justify-center space-x-2 text-slate-200">
                                <span className="text-sm">View All</span>
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Live Updates</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            // Loading placeholders
                            <>
                                <div className="p-6 bg-gray-100 rounded-2xl animate-pulse">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-100 rounded-2xl animate-pulse">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-100 rounded-2xl animate-pulse">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded w-20"></div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : orders.length > 0 ? (
                            // Real recent orders (show last 3)
                            orders.slice(0, 3).map((order, index) => (
                                <div key={order._id} className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
                                                {order.bucketType === 'dine-in' ? 'Dine-in Order' : 
                                                 order.bucketType === 'takeaway' ? 'Takeaway Order' : 'Order'} 
                                                {order.tableNumber ? ` - Table ${order.tableNumber}` : 
                                                 order.customerName ? ` - ${order.customerName}` : ''}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {new Date(order.paymentDate || order.orderDate).toLocaleDateString()} - ${(order.totalAmount || 0).toFixed(2)}
                                            </p>
                                            <div className="flex items-center mt-2 space-x-2">
                                                <span className="text-lg font-bold text-blue-600">${(order.totalAmount || 0).toFixed(2)}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    order.bucketType === 'dine-in' ? 'bg-blue-100 text-blue-800' :
                                                    order.bucketType === 'takeaway' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.bucketType || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // No orders message
                            <div className="col-span-3 text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <p className="text-lg font-medium text-gray-900 mb-2">No orders yet</p>
                                <p className="text-gray-600">Orders will appear here as they are created</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;