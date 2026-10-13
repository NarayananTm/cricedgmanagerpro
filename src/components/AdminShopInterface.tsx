import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Package, Image as ImageIcon, Tag, DollarSign, List, ShoppingCart, CheckCircle2, Clock, Upload, Smartphone, CreditCard, X, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order } from '../types';
import { cn } from '../lib/utils';

export const AdminShopInterface = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    image_url: '',
    selling_options: '',
    stock: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const [pRes, oRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/orders')
    ]);
    const pData = await pRes.json();
    const oData = await oRes.json();
    setProducts(pData);
    setOrders(oData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        alert('Please upload a JPG image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          category: '',
          description: '',
          price: '',
          image_url: '',
          selling_options: '',
          stock: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      selling_options: product.selling_options,
      stock: product.stock.toString()
    });
    setShowAddModal(true);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading shop data...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link 
          to="/admin" 
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
            <p className="text-zinc-400 mt-1">Manage products and customer orders</p>
          </div>
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'products' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              Products
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'orders' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              Orders
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button 
                onClick={() => { setEditingProduct(null); setShowAddModal(true); }}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition-all"
              >
                <Plus className="h-4 w-4" /> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                      {product.category}
                    </span>
                    <span className="text-xs text-zinc-500">Stock: {product.stock}</span>
                  </div>
                  <p className="text-sm text-zinc-500 mb-6 line-clamp-2 flex-1">{product.description}</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-500">₹{product.price}</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                      ID: #{product.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Order ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payment</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <Link 
                            to={`/admin/order/${order.id}`}
                            className="font-mono text-xs text-emerald-500 hover:text-emerald-400 font-bold underline decoration-emerald-500/30 underline-offset-4"
                          >
                            #{order.id.toString().padStart(5, '0')}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{order.product_name}</p>
                          <p className="text-xs text-zinc-500">Qty: {order.quantity}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{order.customer_name}</p>
                          <p className="text-xs text-zinc-500">{order.customer_email}</p>
                          <p className="text-xs text-zinc-500">{order.customer_mobile}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.payment_method === 'upi' ? (
                              <Smartphone className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <CreditCard className="h-3 w-3 text-emerald-500" />
                            )}
                            <span className="text-[10px] uppercase font-bold text-zinc-400">{order.payment_method || 'UPI'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-500">₹{order.total_price}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-zinc-800 border-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer",
                              order.status === 'pending' ? "text-yellow-500" :
                              order.status === 'shipped' ? "text-blue-500" :
                              "text-emerald-500"
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No orders received yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Product Name</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input 
                        required
                        type="text"
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Cricket Bat"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input 
                        required
                        type="text"
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Equipment"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                    placeholder="Describe the product..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price (INR ₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="999.99"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stock Quantity</label>
                    <div className="relative">
                      <List className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input 
                        required
                        type="number"
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="100"
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Product Image (JPG)</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative mb-2">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input 
                          type="url"
                          className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="https://example.com/image.jpg"
                          value={formData.image_url}
                          onChange={e => setFormData({...formData, image_url: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg"
                          onChange={handleImageUpload}
                          className="hidden" 
                          id="image-upload" 
                        />
                        <label 
                          htmlFor="image-upload"
                          className="flex items-center justify-center gap-2 w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold cursor-pointer hover:bg-zinc-700 transition-all"
                        >
                          <Upload className="h-4 w-4" /> Upload JPG Image
                        </label>
                      </div>
                    </div>
                    <div className="h-24 w-24 rounded-2xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-800">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Selling Options (Sizes, Colors, etc.)</label>
                  <input 
                    type="text"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Small, Medium, Large"
                    value={formData.selling_options}
                    onChange={e => setFormData({...formData, selling_options: e.target.value})}
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
