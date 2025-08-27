import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: "appetizers", name: "Appetizers" },
  { id: "soups", name: "Soups" },
  { id: "salads", name: "Salads" },
  { id: "noodles", name: "Noodles" },
  { id: "rice", name: "Rice" },
  { id: "bread", name: "Bread" },
  { id: "house_specials", name: "House Specials" },
  { id: "seafood", name: "Seafood" },
  { id: "beef", name: "Beef" },
  { id: "chicken", name: "Chicken" },
  { id: "vegetarian", name: "Vegetarian" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
];

// Keep the same MENU as getOrder.jsx by importing from it would be ideal,
// but to avoid cross-file coupling here we replicate the structure quickly.
const MENU = [
  { id: "ap1", cat: "appetizers", name: "Spring Rolls", price: 6.5 },
  { id: "ap2", cat: "appetizers", name: "Potstickers", price: 7.25 },
  { id: "ap3", cat: "appetizers", name: "Chicken Satay", price: 8.95 },
  { id: "ap4", cat: "appetizers", name: "Crispy Tofu", price: 6.95 },
  { id: "ap5", cat: "appetizers", name: "Edamame", price: 5.5 },
  { id: "ap6", cat: "appetizers", name: "Shrimp Tempura", price: 9.25 },
  { id: "so1", cat: "soups", name: "Miso Soup", price: 3.5 },
  { id: "so2", cat: "soups", name: "Hot & Sour Soup", price: 4.95 },
  { id: "so3", cat: "soups", name: "Wonton Soup", price: 5.95 },
  { id: "so4", cat: "soups", name: "Tom Yum", price: 7.95 },
  { id: "so5", cat: "soups", name: "Chicken Noodle Soup", price: 6.95 },
  { id: "sa1", cat: "salads", name: "House Green Salad", price: 6.95 },
  { id: "sa2", cat: "salads", name: "Seaweed Salad", price: 5.95 },
  { id: "sa3", cat: "salads", name: "Cucumber Salad", price: 5.5 },
  { id: "sa4", cat: "salads", name: "Papaya Salad", price: 8.95 },
  { id: "sa5", cat: "salads", name: "Tofu Sesame Salad", price: 9.5 },
  { id: "nd1", cat: "noodles", name: "Chow Mein", price: 10.75 },
  { id: "nd2", cat: "noodles", name: "Pad Thai", price: 11.95 },
  { id: "nd3", cat: "noodles", name: "Udon Stir-Fry", price: 12.5 },
  { id: "nd4", cat: "noodles", name: "Drunken Noodles", price: 12.95 },
  { id: "nd5", cat: "noodles", name: "Beef Lo Mein", price: 12.95 },
  { id: "rc1", cat: "rice", name: "Steamed Rice", price: 2.5 },
  { id: "rc2", cat: "rice", name: "Egg Fried Rice", price: 10.25 },
  { id: "rc3", cat: "rice", name: "Chicken Fried Rice", price: 11.25 },
  { id: "rc4", cat: "rice", name: "Shrimp Fried Rice", price: 12.5 },
  { id: "rc5", cat: "rice", name: "Pineapple Fried Rice", price: 12.95 },
  { id: "br1", cat: "bread", name: "Garlic Naan", price: 3.95 },
  { id: "br2", cat: "bread", name: "Plain Naan", price: 2.95 },
  { id: "br3", cat: "bread", name: "Roti", price: 2.75 },
  { id: "br4", cat: "bread", name: "Paratha", price: 3.95 },
  { id: "br5", cat: "bread", name: "Sesame Flatbread", price: 4.5 },
  { id: "hs1", cat: "house_specials", name: "Chef Combo A", price: 14.95 },
  { id: "hs2", cat: "house_specials", name: "Chef Combo B", price: 16.95 },
  { id: "hs3", cat: "house_specials", name: "Crispy Orange Chicken", price: 13.5 },
  { id: "hs4", cat: "house_specials", name: "Honey Walnut Shrimp", price: 16.5 },
  { id: "hs5", cat: "house_specials", name: "Basil Chili Beef", price: 15.95 },
  { id: "sf1", cat: "seafood", name: "Garlic Butter Shrimp", price: 15.95 },
  { id: "sf2", cat: "seafood", name: "Salt & Pepper Calamari", price: 14.95 },
  { id: "sf3", cat: "seafood", name: "Grilled Salmon", price: 18.5 },
  { id: "sf4", cat: "seafood", name: "Curry Prawns", price: 17.95 },
  { id: "sf5", cat: "seafood", name: "Fish & Ginger", price: 16.25 },
  { id: "bf1", cat: "beef", name: "Beef with Broccoli", price: 13.5 },
  { id: "bf2", cat: "beef", name: "Mongolian Beef", price: 13.95 },
  { id: "bf3", cat: "beef", name: "Black Pepper Beef", price: 14.5 },
  { id: "bf4", cat: "beef", name: "Beef Teriyaki", price: 14.25 },
  { id: "bf5", cat: "beef", name: "Beef Fried Rice", price: 12.95 },
  { id: "ck1", cat: "chicken", name: "General Tso's Chicken", price: 12.95 },
  { id: "ck2", cat: "chicken", name: "Sesame Chicken", price: 12.5 },
  { id: "ck3", cat: "chicken", name: "Lemongrass Chicken", price: 12.95 },
  { id: "ck4", cat: "chicken", name: "Chicken Katsu", price: 12.95 },
  { id: "ck5", cat: "chicken", name: "Garlic Chicken", price: 12.25 },
  { id: "vg1", cat: "vegetarian", name: "Mapo Tofu (Veg)", price: 11.5 },
  { id: "vg2", cat: "vegetarian", name: "Stir-Fried Mixed Veg", price: 10.95 },
  { id: "vg3", cat: "vegetarian", name: "Tofu & Eggplant", price: 11.95 },
  { id: "vg4", cat: "vegetarian", name: "Veg Chow Mein", price: 10.75 },
  { id: "vg5", cat: "vegetarian", name: "Coconut Curry Veg", price: 12.25 },
  { id: "ds1", cat: "desserts", name: "Mango Sticky Rice", price: 7.95 },
  { id: "ds2", cat: "desserts", name: "Fried Banana", price: 6.25 },
  { id: "ds3", cat: "desserts", name: "Green Tea Ice Cream", price: 4.95 },
  { id: "ds4", cat: "desserts", name: "Sesame Balls", price: 5.5 },
  { id: "ds5", cat: "desserts", name: "Coconut Pudding", price: 5.95 },
  { id: "dr1", cat: "drinks", name: "Thai Iced Tea", price: 4.25 },
  { id: "dr2", cat: "drinks", name: "Iced Coffee", price: 4.5 },
  { id: "dr3", cat: "drinks", name: "Jasmine Tea (Hot)", price: 2.95 },
  { id: "dr4", cat: "drinks", name: "Soda", price: 2.5 },
  { id: "dr5", cat: "drinks", name: "Sparkling Water", price: 3.25 },
];

const formatUSD = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

function TakeAway() {
  const navigate = useNavigate();

  const CART_KEY = `cartItems:takeaway`;
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [showMenuCategory, setShowMenuCategory] = useState("appetizers");
  const [isOrderFired, setIsOrderFired] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [source, setSource] = useState("Phone");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // If coming from orders page with a specific takeaway orderId, load it
  useEffect(() => {
    const storedId = localStorage.getItem('takeawayOrderId');
    if (storedId && !orderId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:5000/takeaway-order?orderId=${storedId}`);
          if (res.ok) {
            const order = await res.json();
            setOrderId(order._id);
            setCustomerName(order.customerName || "");
            const items = (order.items || []).map((it, idx) => ({ id: `loaded-${idx}`, name: it.itemName, price: it.price, qty: it.quantity }));
            setCartItems(items);
            setIsOrderFired(true);
            localStorage.removeItem('takeawayOrderId');
          }
        } catch (e) {
          // ignore load errors
        }
      })();
    }
  }, [orderId]);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.0975;
  const total = subtotal + tax;

  const addItem = async (menuItem) => {
    const updater = (prev) => {
      const existing = prev.find((p) => p.id === menuItem.id);
      if (existing) return prev.map((p) => (p.id === menuItem.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { ...menuItem, qty: 1 }];
    };
    if (isOrderFired) {
      const confirmed = window.confirm("Are you sure you want to update this order?");
      if (!confirmed) return;
      setIsUpdating(true);
      try {
        const newItems = updater(cartItems);
        const newTotal = newItems.reduce((sum, i) => sum + i.price * i.qty, 0) * 1.0975;
        const res = await fetch("http://localhost:5000/takeaway-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderType: `Takeaway - ${source}`,
            customerName,
            items: newItems.map((it) => ({ itemName: it.name, quantity: it.qty, price: it.price })),
            totalAmount: newTotal,
            orderDate: new Date(),
          }),
        });
        if (!res.ok) throw new Error("Failed to update order");
        const data = await res.json();
        setCartItems(newItems);
        setOrderId(data.order?._id || orderId);
      } catch (e) {
        alert("Failed to add item.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setCartItems(updater);
    }
  };

  const inc = async (id) => {
    if (isOrderFired) {
      const confirmed = window.confirm("Are you sure you want to update this order?");
      if (!confirmed) return;
      setIsUpdating(true);
      try {
        const newItems = cartItems.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p));
        const newTotal = newItems.reduce((s, i) => s + i.price * i.qty, 0) * 1.0975;
        const res = await fetch("http://localhost:5000/takeaway-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderType: `Takeaway - ${source}`,
            customerName,
            items: newItems.map((it) => ({ itemName: it.name, quantity: it.qty, price: it.price })),
            totalAmount: newTotal,
            orderDate: new Date(),
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCartItems(newItems);
        setOrderId(data.order?._id || orderId);
      } catch {
        alert("Failed to update quantity.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setCartItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
    }
  };

  const dec = async (id) => {
    if (isOrderFired) {
      const confirmed = window.confirm("Are you sure you want to update this order?");
      if (!confirmed) return;
      setIsUpdating(true);
      try {
        const newItems = cartItems
          .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
          .filter((p) => p.qty > 0);
        const newTotal = newItems.reduce((s, i) => s + i.price * i.qty, 0) * 1.0975;
        const res = await fetch("http://localhost:5000/takeaway-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderType: `Takeaway - ${source}`,
            customerName,
            items: newItems.map((it) => ({ itemName: it.name, quantity: it.qty, price: it.price })),
            totalAmount: newTotal,
            orderDate: new Date(),
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCartItems(newItems);
        setOrderId(data.order?._id || orderId);
      } catch {
        alert("Failed to update quantity.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setCartItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p)).filter((p) => p.qty > 0));
    }
  };

  const removeItem = async (id) => {
    if (isOrderFired) {
      const confirmed = window.confirm("Are you sure you want to update this order?");
      if (!confirmed) return;
      setIsUpdating(true);
      try {
        const newItems = cartItems.filter((p) => p.id !== id);
        const newTotal = newItems.reduce((s, i) => s + i.price * i.qty, 0) * 1.0975;
        const res = await fetch("http://localhost:5000/takeaway-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderType: `Takeaway - ${source}`,
            items: newItems.map((it) => ({ itemName: it.name, quantity: it.qty, price: it.price })),
            totalAmount: newTotal,
            orderDate: new Date(),
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCartItems(newItems);
        setOrderId(data.order?._id || orderId);
      } catch {
        alert("Failed to remove item.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setCartItems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const clearCart = async () => {
    if (isOrderFired) {
      const confirmed = window.confirm("Are you sure you want to update this order?");
      if (!confirmed) return;
      setIsUpdating(true);
      try {
        const res = await fetch("http://localhost:5000/takeaway-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, orderType: `Takeaway - ${source}`, customerName, items: [], totalAmount: 0, orderDate: new Date() }),
        });
        if (!res.ok) throw new Error();
        setCartItems([]);
      } catch {
        alert("Failed to clear cart.");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setCartItems([]);
    }
  };

  const handleOrderSubmit = async (nameForOrder) => {
    // Get current employee info
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const res = await fetch("http://localhost:5000/takeaway-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderType: `Takeaway - ${source}`,
        customerName: nameForOrder,
        items: cartItems.map((it) => ({ itemName: it.name, quantity: it.qty, price: it.price })),
        totalAmount: total,
        orderDate: new Date(),
        employeeId: currentUser.id,
        employeeName: currentUser.username
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.errorMsg || "Failed to submit order");
    }
    return res.json();
  };

  const onSubmitOrder = async () => {
    if (cartItems.length === 0) {
      alert("Please add items to the order before submitting.");
      return;
    }
    try {
      const name = window.prompt('Customer name?');
      if (!name || !name.trim()) {
        alert('Please enter a customer name.');
        return;
      }
      setCustomerName(name.trim());
      if (isOrderFired) {
        alert("Order is already fired. Use the menu to make changes.");
        return;
      }
      const data = await handleOrderSubmit(name.trim());
      setIsOrderFired(true);
      setOrderId(data.order?._id || null);
      setCartItems([]);
      localStorage.removeItem(CART_KEY);
      alert("Order submitted successfully!");
      navigate('/dashboard');
    } catch (e) {
      alert(e.message);
    }
  };

  const onPayOrder = async () => {
    if (!orderId) {
      alert("No submitted order to pay.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/pay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.errorMsg || "Failed to pay order");
      }
      await res.json();
      setCartItems([]);
      localStorage.removeItem(CART_KEY);
      setIsOrderFired(false);
      setOrderId(null);
      alert("Order paid successfully!");
      navigate('/order');
    } catch (e) {
      alert(e.message);
    }
  };

  const visibleMenu = useMemo(() => MENU.filter((m) => m.cat === showMenuCategory), [showMenuCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Takeaway</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-gray-500">Total items:</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium">
              {cartItems.length} items
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Order */}
        <section className="lg:col-span-4 bg-white rounded-2xl shadow-sm border flex flex-col h-[calc(100vh-112px)] min-h-0">
          <div className="sticky top-0 z-10 p-4 border-b bg-white flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-lg font-semibold">Cart</h2>
            </div>
            <button type="button" onClick={() => clearCart()} className="bg-white text-sm rounded-full px-3 py-1 border hover:bg-gray-100 disabled:cursor-not-allowed" disabled={cartItems.length === 0}>
              Clear
            </button>
          </div>

          <div className="p-3 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Source</label>
            <div className="grid grid-cols-2 gap-2">
              {['Phone', 'Waiting', 'DoorDash', 'Uber Eats'].map((s) => (
                <button key={s} type="button" onClick={() => setSource(s)} className={`px-3 py-2 rounded-lg border text-sm ${source === s ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No items yet. Select from the menu →</div>
            ) : (
              <ul className="divide-y">
                {cartItems.map((it) => (
                  <li key={it.id} className="p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-500">{formatUSD(it.price)} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => dec(it.id)} className="w-8 h-8 rounded-full border flex items-center justify-center">-</button>
                      <span className="w-8 text-center font-medium">{it.qty}</span>
                      <button type="button" onClick={() => inc(it.id)} className="w-8 h-8 rounded-full border flex items-center justify-center">+</button>
                    </div>
                    <div className="w-24 text-right font-semibold">{formatUSD(it.price * it.qty)}</div>
                    <button type="button" onClick={() => removeItem(it.id)} className="ml-2 text-sm text-red-600 hover:underline">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Source</span>
              <span className="font-medium">{source}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Customer</span>
              <span className="font-medium">{customerName || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatUSD(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tax (9.75%)</span>
              <span className="font-medium">{formatUSD(tax)}</span>
            </div>
            <div className="flex items-center justify-between text-lg pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatUSD(total)}</span>
            </div>
            <button type="button" onClick={onSubmitOrder} className={`mt-3 w-full h-11 rounded-xl font-medium transition-colors ${isOrderFired ? (isUpdating ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white cursor-not-allowed') : 'bg-black text-white hover:opacity-90'}`} disabled={isOrderFired && !isUpdating}>
              {isOrderFired ? (isUpdating ? 'Updating Order...' : 'Order Fired') : 'Fire All'}
            </button>
            <button type="button" onClick={onPayOrder} className="mt-3 w-full h-11 rounded-xl bg-black text-white font-medium hover:opacity-90 disabled:cursor-not-allowed" disabled={!orderId}>
              Pay order
            </button>
          </div>
        </section>

        {/* Right: Menu */}
        <section className="lg:col-span-8 bg-white rounded-2xl shadow-sm border overflow-hidden h-[calc(100vh-112px)] min-h-0 flex flex-col">
          <div className="sticky top-0 z-10 p-4 border-b bg-white rounded-t-2xl">
            <div className="text-sm text-gray-500">Menu</div>
          </div>
          <div className="grid grid-cols-12 flex-1 min-h-0">
            <aside className="col-span-4 xl:col-span-3 border-r bg-gray-50 p-2 overflow-y-auto">
              <ul className="space-y-1">
                {CATEGORIES.map((c) => {
                  const isActive = c.id === showMenuCategory;
                  return (
                    <li key={c.id}>
                      <button onClick={() => setShowMenuCategory(c.id)} className={"w-full text-left px-3 py-2 rounded-xl transition " + (isActive ? "bg-black text-white" : "hover:bg-white border")}>
                        {c.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
            <div className="col-span-8 xl:col-span-9 p-3 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {visibleMenu.map((it) => (
                  <button type="button" key={it.id} onClick={() => addItem(it)} className="group border rounded-2xl p-3 text-left hover:shadow transition bg-white">
                    <div className="aspect-video w-full rounded-xl bg-gray-100 mb-2" />
                    <div className="font-medium leading-tight">{it.name}</div>
                    <div className="mt-2 font-semibold">{formatUSD(it.price)}</div>
                    <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100">Click to add</div>
                  </button>
                ))}
              </div>
              {visibleMenu.length === 0 && <div className="p-6 text-center text-gray-500">No items found.</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default TakeAway;