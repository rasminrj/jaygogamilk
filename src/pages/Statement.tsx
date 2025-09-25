import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout/Layout';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DailyOrder, Customer } from '../types';
import { IndianRupee, ShoppingCart, CheckCircle, Clock, FileText } from 'lucide-react';

interface StatementResult {
  orders: DailyOrder[];
  totalAmount: number;
  totalPaid: number;
  pendingAmount: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
}

const Statement: React.FC = () => {
  const [orders] = useLocalStorage<DailyOrder[]>('jay_goga_orders', []);
  const [customers] = useLocalStorage<Customer[]>('jay_goga_customers', []);

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');
  const [generatedStatement, setGeneratedStatement] = useState<StatementResult | null>(null);

  const handleGenerateStatement = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      orderDate.setUTCHours(0, 0, 0, 0);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);

      const isDateInRange = orderDate >= start && orderDate <= end;
      const isCustomerMatch = selectedCustomerId === 'all' || order.customerId === selectedCustomerId;
      
      return isDateInRange && isCustomerMatch;
    });

    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalPaid = filteredOrders.reduce((sum, order) => sum + (order.amountPaid || 0), 0);
    const pendingAmount = totalAmount - totalPaid;
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const pendingOrders = filteredOrders.length - deliveredOrders;

    setGeneratedStatement({
      orders: filteredOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      totalAmount,
      totalPaid,
      pendingAmount,
      totalOrders: filteredOrders.length,
      deliveredOrders,
      pendingOrders,
    });
  };

  const stats = useMemo(() => {
    if (!generatedStatement) return [];
    return [
      { icon: IndianRupee, label: 'Total Order Value', value: `₹${generatedStatement.totalAmount.toFixed(2)}`, color: 'bg-blue-100 text-blue-600' },
      { icon: CheckCircle, label: 'Total Paid', value: `₹${generatedStatement.totalPaid.toFixed(2)}`, color: 'bg-green-100 text-green-600' },
      { icon: Clock, label: 'Pending Amount', value: `₹${generatedStatement.pendingAmount.toFixed(2)}`, color: 'bg-orange-100 text-orange-600' },
      { icon: ShoppingCart, label: 'Total Orders', value: generatedStatement.totalOrders, color: 'bg-purple-100 text-purple-600' },
    ];
  }, [generatedStatement]);

  return (
    <Layout title="Statement">
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Statement</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dairy-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dairy-500"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dairy-500">
                <option value="all">All Customers</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <motion.button
              onClick={handleGenerateStatement}
              className="w-full bg-dairy-600 text-white py-3 rounded-lg font-medium"
              whileTap={{ scale: 0.98 }}
            >
              Generate Statement
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {generatedStatement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg inline-block ${stat.color} mb-2`}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
              {generatedStatement.orders.length > 0 ? (
                <div className="space-y-3">
                  {generatedStatement.orders.map(order => {
                    const amountPaid = order.amountPaid || 0;
                    const balance = order.totalAmount - amountPaid;
                    return (
                      <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('en-IN', { timeZone: 'UTC' })}</p>
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paid:</span>
                            <span className="font-medium text-green-600">₹{amountPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Balance:</span>
                            <span className={`font-bold ${balance <= 0 ? 'text-green-700' : 'text-red-600'}`}>
                              ₹{balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                  <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-600">No orders found for the selected criteria.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Statement;
