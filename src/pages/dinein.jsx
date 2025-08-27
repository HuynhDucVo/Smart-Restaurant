import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DineIn() {
    const navigate = useNavigate();
    const [dineInOrders, setDineInOrders] = useState([]);
    useEffect( () => {
        const fetchData = async () => {
            const res = await fetch('http://localhost:5000/dinein-order', {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',  
                }
            });

            if (!res.ok) {
                console.error('Failed to fetch dine-in orders');
                return;
            }

            const data = await res.json();
            setDineInOrders(data);
        }
        fetchData();
    }, [])

    // Handle table chosen
    const handleTableClick = (order) => {
        localStorage.setItem('tableNumber', JSON.stringify(order.tableNumber));
        handleTableStatus(order.tableNumber, order.tableStatus);
        navigate('/getOrder');
    }
    const handleTableStatus = async (tableNumber, tableStatus) => {
        try{
            const res = await fetch('http://localhost:5000/dinein-order', {
                method: 'PUT',
                headers: {  
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tableNumber, tableStatus: tableStatus})
            });
            if (!res.ok) {
                console.error('Failed to update table status');
                return;
            }
            const data = await res.json();
            console.log('Table status updated:', data);
        }
        catch (error) {
            console.error('Error updating table status:', error);  
        }
    }
        
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-bold text-gray-800">Dine In Management</h1>
                    </div>
                    
                    {/* Status Legend */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Occupied</span>
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Reserved</span>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {dineInOrders.map((order) => {
                        const { tableNumber, tableStatus } = order;
                        
                        return (
                            <div key={tableNumber} className="cursor-pointer group transition-all duration-300 transform hover:scale-105"
                            onClick={() => handleTableClick(order)}>
                                {/* Table Card */}
                                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl p-6 text-center border-2 border-gray-200 hover:border-gray-300">
                                    {/* Table Icon */}
                                    <div className="mb-4">
                                        <svg className="w-12 h-12 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    
                                    {/* Table Number */}
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Table {tableNumber}</h3>
                                    
                                    {/* Status Indicator */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <span className={`w-3 h-3 rounded-full ${tableStatus === 'Available' ? 'bg-green-500' : tableStatus === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                        <span className="text-sm font-medium text-gray-600">{tableStatus}</span>
                                    </div>
                                    
                                    {/* Capacity Info */}
                                    <div className="text-sm text-gray-500">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        2-4 seats
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DineIn;