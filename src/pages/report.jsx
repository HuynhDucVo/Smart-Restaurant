import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const formatUSD = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

function Report() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/report?date=${selectedDate}`
      );
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 text-lg">No report available</p>
    </div>
  );

  // Prepare chart data for simple bar visualization
  const chartData = Object.entries(report.breakdown).map(([type, val]) => ({
    type,
    sales: val.sales,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sales Report</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Date Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Select Date</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={fetchReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Update Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Sales</p>
          <p className="text-3xl font-bold text-gray-800">{formatUSD(report.totalSales)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Tips</p>
          <p className="text-3xl font-bold text-gray-800">{formatUSD(report.totalTips)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-gray-800">{report.orderCount}</p>
        </div>
      </div>

      {/* Breakdown Chart - Simple CSS-based visualization */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Sales by Order Type</h2>
        <div className="space-y-4">
          {chartData.map((item, index) => {
            const maxSales = Math.max(...chartData.map(d => d.sales));
            const percentage = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
            
            return (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 capitalize">{item.type}</span>
                  <span className="text-sm text-gray-600">{formatUSD(item.sales)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900">{new Date(o.paymentDate).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900 capitalize">{o.orderType}</td>
                  <td className="px-4 py-3 text-gray-900">{o.customerName || "-"}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{formatUSD(o.totalAmount)}</td>
                  <td className="px-4 py-3 text-gray-900">{o.tip ? formatUSD(o.tip) : formatUSD(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {report.orders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found for the selected date.</p>
          </div>
        )}
      </div>

      {/* Report Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Date:</span> {new Date(report.selectedDate).toLocaleDateString()}
          </div>
          <div>
            <span className="text-blue-700 font-medium">Average Order Value:</span> {report.orderCount > 0 ? formatUSD(report.totalSales / report.orderCount) : formatUSD(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;