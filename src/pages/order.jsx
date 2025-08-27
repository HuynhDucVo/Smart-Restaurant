import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const formatUSD = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function Order() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('current'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const currentOrdersRes = await fetch('http://localhost:5000/dinein-order?source=orders');
        const currentOrders = currentOrdersRes.ok ? await currentOrdersRes.json() : [];
        const takeAwayRes = await fetch('http://localhost:5000/takeaway-order');
        const takeAwayOrders = takeAwayRes.ok ? await takeAwayRes.json() : [];
        const historyRes = await fetch('http://localhost:5000/order-history');
        const orderHistory = historyRes.ok ? await historyRes.json() : [];
        setOrders([...currentOrders, ...takeAwayOrders]);
        setOrderHistory(orderHistory);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders by type
  const getFilteredOrders = () => {
    let filtered = [];
    if (filter === 'current') {
      filtered = orders.map(o => ({ ...o, bucketType: 'current' }));
    } else if (filter === 'history') {
      filtered = orderHistory.map(o => ({ ...o, bucketType: 'history' }));
    } else {
      filtered = [
        ...orders.map(o => ({ ...o, bucketType: 'current' })),
        ...orderHistory.map(o => ({ ...o, bucketType: 'history' }))
      ];
    }
    return filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  };

  // Apply search + date filter
  const getSearchFilteredOrders = () => {
    let filteredOrders = getFilteredOrders();

    // Search
    if (searchTerm) {
      filteredOrders = filteredOrders.filter(order =>
        order.tableNumber?.toString().includes(searchTerm) ||
        order.orderType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item =>
          item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Date filter - single date with UTC handling
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      // Use UTC to avoid timezone issues
      const startOfDay = new Date(Date.UTC(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate(), 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate(), 23, 59, 59, 999));

      console.log('Order filtering - Selected date:', selectedDate);
      console.log('Order filtering - Start of day (UTC):', startOfDay);
      console.log('Order filtering - End of day (UTC):', endOfDay);

      filteredOrders = filteredOrders.filter(order => {
        // Use paymentDate for history orders, orderDate for current orders
        let dateToCheck;
        if (order.bucketType === 'history') {
          dateToCheck = new Date(order.paymentDate || order.orderDate);
        } else {
          dateToCheck = new Date(order.orderDate);
        }
        
        const isInRange = dateToCheck >= startOfDay && dateToCheck <= endOfDay;
        
        // Enhanced debugging
        if (selectedDate === '2024-08-28') {
          console.log('=== DEBUG ORDER ===');
          console.log('Order ID:', order._id);
          console.log('Order type:', order.bucketType);
          console.log('Order date:', order.orderDate);
          console.log('Payment date:', order.paymentDate);
          console.log('Date being checked:', dateToCheck);
          console.log('Start of day:', startOfDay);
          console.log('End of day:', endOfDay);
          console.log('Is in range:', isInRange);
          console.log('==================');
        }
        
        return isInRange;
      });
    }

    return filteredOrders;
  };

  const getOrderTypeColor = (bucketType) => {
    switch (bucketType) {
      case 'current':
        return 'bg-blue-100 text-blue-800';
      case 'history':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order) => {
    if (order.bucketType === 'current') {
      // Heuristic: if it has a tableNumber, it's dine-in; otherwise takeaway
      if (order.tableNumber) {
        localStorage.setItem('tableNumber', order.tableNumber);
        navigate('/getOrder');
      } else {
        // For takeaway, store orderId to let takeaway page fetch and load it
        localStorage.setItem('takeawayOrderId', order._id);
        navigate('/take-away');
      }
    } else {
      alert(`Order Details:\nTable: ${order.tableNumber ?? 'N/A'}\nTotal: ${formatUSD(order.totalAmount)}\nDate: ${formatDate(order.orderDate)}`);
    }
  };

  const filteredOrders = getSearchFilteredOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Order Management</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Order History</p>
                <p className="text-2xl font-bold text-gray-900">{orderHistory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length + orderHistory.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter==='all'?'bg-black text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Orders
              </button>
              <button 
                onClick={() => setFilter('current')} 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter==='current'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Current Orders
              </button>
              <button 
                onClick={() => setFilter('history')} 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter==='history'?'bg-gray-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Order History
              </button>
            </div>

            {/* Search & Date Filters */}
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Clear date filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Date Filter Summary */}
          {selectedDate && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Date Filter Active:</span> Showing orders for {new Date(selectedDate).toLocaleDateString()}
                <br />
                <span className="text-xs text-blue-600">
                  (UTC: {new Date(Date.UTC(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), new Date(selectedDate).getDate(), 0, 0, 0, 0)).toISOString()} to {new Date(Date.UTC(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), new Date(selectedDate).getDate(), 23, 59, 59, 999)).toISOString()})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Orders' : filter === 'current' ? 'Current Orders' : 'Order History'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredOrders.length} orders)
              </span>
            </h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredOrders.map((order, index) => (
                <div key={`${order.orderType}-${order._id || index}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(order.bucketType)}`}>
                          {order.bucketType === 'current' ? 'Current Order' : order.orderType || 'Order History'}
                        </span>
                        {/* For dine-in show table; for takeaway show order type */}
                        {order.tableNumber ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.bucketType === 'history' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            Table {order.tableNumber}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {order.orderType || 'Takeaway'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Order Type</p>
                          <p className="text-sm text-gray-900">{order.orderType || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Amount</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatUSD(order.totalAmount || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Order Date</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(order.orderDate || new Date())}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Employee</p>
                          <p className="text-sm text-gray-900">{order.employeeName || '-'}</p>
                        </div>
                        {!order.tableNumber && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Customer</p>
                            <p className="text-sm text-gray-900">{order.customerName || '-'}</p>
                          </div>
                        )}
                      </div>

                      {/* Order Items hidden on orders page per request */}

                      {/* Payment Date for History Orders */}
                      {order.paymentDate && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600">Payment Date</p>
                          <p className="text-sm text-gray-900">{formatDate(order.paymentDate)}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {order.bucketType === 'current' ? 'View Order' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Order;