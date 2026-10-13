import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShoppingCart, X, CheckCircle2, Package, Mail, Phone, MapPin, User, CreditCard, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { Product } from '../types';
import { cn } from '../lib/utils';

export const ShopInterface = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({ upi: '', bank: '', name: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    paymentMethod: 'upi', // Default to UPI
    upiAddress: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });

    fetch('/api/settings/payment')
      .then(res => res.json())
      .then(data => setPaymentSettings(data));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const user = JSON.parse(localStorage.getItem('user_data') || 'null');
  const isPro = user?.plan === 'pro';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentDetails = formData.paymentMethod === 'upi' 
      ? formData.upiAddress 
      : `${formData.cardNumber} | ${formData.cardExpiry}`;

    try {
      for (const item of cart) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: item.product.id,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_mobile: formData.mobile,
            customer_address: formData.address,
            quantity: item.quantity,
            total_price: item.product.price * item.quantity,
            payment_method: formData.paymentMethod,
            payment_details: paymentDetails
          })
        });
      }
      
      setOrderSuccess(true);
      setCart([]);
      setShowCheckout(false);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading products...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-emerald-500" />
              Sports <span className="text-emerald-500">Shop</span>
            </h1>
            <p className="text-zinc-500 mt-2">Premium sports gear and merchandise</p>
          </div>
          <div className="flex items-center gap-4">
            {isPro && (
              <Link 
                to="/admin/shop" 
                className="bg-zinc-900 border border-white/10 px-6 py-2 rounded-xl text-xs font-bold text-emerald-500 hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <Package className="h-4 w-4" /> Manage Shop
              </Link>
            )}
            <button 
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all"
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-[10px] font-bold flex items-center justify-center text-black">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                selectedCategory === cat 
                  ? "bg-emerald-500 border-emerald-500 text-black" 
                  : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <motion.div 
              layout
              key={product.id} 
              className="group rounded-3xl bg-zinc-900/30 border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all"
            >
              <Link to={`/shop/product/${product.id}`} className="block aspect-square bg-zinc-800 relative overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    {product.category}
                  </span>
                </div>
              </Link>
              <div className="p-6">
                <Link to={`/shop/product/${product.id}`}>
                  <h3 className="font-bold text-lg mb-1 hover:text-emerald-500 transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-500">₹{product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="p-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md bg-zinc-900 h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-500" />
                  Your Cart
                </h2>
                <button onClick={() => setShowCart(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl bg-black border border-white/5">
                      <div className="h-16 w-16 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                        {item.product.image_url && (
                          <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-emerald-500 mt-1">₹{item.product.price * item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <ShoppingCart className="h-12 w-12 mb-4 opacity-10" />
                    <p>Your cart is empty</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-black border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-500">₹{cartTotal}</span>
                  </div>
                  <button 
                    onClick={() => { setShowCart(false); setShowCheckout(true); }}
                    className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Checkout</h2>
                <button onClick={() => setShowCheckout(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCheckout} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input 
                      required
                      type="text"
                      className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input 
                        required
                        type="email"
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input 
                        required
                        type="tel"
                        className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="+91 98765 43210"
                        value={formData.mobile}
                        onChange={e => setFormData({...formData, mobile: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 h-4 w-4 text-zinc-500" />
                    <textarea 
                      required
                      className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                      placeholder="Enter your full address..."
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'upi'})}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                        formData.paymentMethod === 'upi' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : "bg-black border-white/10 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm font-bold">UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                        formData.paymentMethod === 'card' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : "bg-black border-white/10 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-bold">Card</span>
                    </button>
                  </div>
                  
                  {/* Receiver Info */}
                  <div className="p-4 rounded-2xl bg-zinc-800/50 border border-white/5 space-y-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Send Payment To</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{paymentSettings.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {formData.paymentMethod === 'upi' ? paymentSettings.upi : 'Bank Transfer'}
                      </span>
                    </div>
                    {formData.paymentMethod === 'card' && (
                      <p className="text-[10px] text-zinc-500 leading-relaxed pt-1 border-t border-white/5">
                        {paymentSettings.bank}
                      </p>
                    )}
                  </div>
                </div>

                {/* Conditional Payment Fields */}
                <AnimatePresence mode="wait">
                  {formData.paymentMethod === 'upi' ? (
                    <motion.div
                      key="upi-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">UPI ID (VPA)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input 
                          required
                          type="text"
                          className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="username@upi"
                          value={formData.upiAddress}
                          onChange={e => setFormData({...formData, upiAddress: e.target.value})}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="card-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input 
                            required
                            type="text"
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="0000 0000 0000 0000"
                            value={formData.cardNumber}
                            onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Expiry Date</label>
                          <input 
                            required
                            type="text"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={e => setFormData({...formData, cardExpiry: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">CVV</label>
                          <input 
                            required
                            type="password"
                            maxLength={3}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="***"
                            value={formData.cardCvv}
                            onChange={e => setFormData({...formData, cardCvv: e.target.value})}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-zinc-400">Order Total</span>
                    <span className="text-2xl font-black text-emerald-500">₹{cartTotal}</span>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-black px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6" />
            Order Placed Successfully!
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

const Trash2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
