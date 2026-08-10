"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { MapPin, Utensils, Eye, Star, ShoppingBag, Flame, Percent, Truck, Users, Heart, Award, Clock } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { client } from "../sanity/lib/client";
import { urlFor } from "../sanity/lib/image";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

interface FoodItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: any;
}

const categories = [
  { id: 1, name: "All", icon: "🍽️" },
  { id: 2, name: "Burger", icon: "🍔" },
  { id: 3, name: "Pizza", icon: "🍕" },
  { id: 4, name: "Biryani", icon: "🍲" },
  { id: 5, name: "Drinks", icon: "🥤" },
];

const reviews = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    comment: "The Chicken Biryani was absolutely amazing! Fresh, hot, and delivered on time.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
  {
    id: 2,
    name: "Ananya Roy",
    rating: 5,
    comment: "Best Pepperoni Pizza in town. Super cheesy and crispy crust. Loved it!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: 3,
    name: "Mohammed Faizal",
    rating: 4,
    comment: "Quick delivery and great packaging. The cold coffee was refreshing.",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80",
  },
];

export default function Home() {
  const { user, isSignedIn } = useUser();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCartStore();

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Promo code states
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") === "true") {
      toast.success("Order placed successfully! Thank you for ordering.");
      clearCart();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (query.get("canceled") === "true") {
      toast.error("Order payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [clearCart]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const query = `*[_type == "food"]{ _id, name, price, category, description, image }`;
        const data = await client.fetch(query, {}, { useCdn: false });
        setFoodItems(data);
      } catch (err) {
        console.error("Sanity Fetch Error:", err);
      }
    };

    fetchFoods();
  }, []);

  const handleApplyPromoCode = () => {
    const code = discountCodeInput.trim().toUpperCase();
    if (code === "QUICK50") {
      setDiscountPercentage(50);
      setAppliedDiscountCode(code);
      toast.success("Promo code applied: 50% OFF");
    } else if (code === "WELCOME10" || code === "QUICKFREE") {
      setDiscountPercentage(10);
      setAppliedDiscountCode(code);
      toast.success("Promo code applied: 10% OFF");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handleCheckout = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to complete your order");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          userName: user?.fullName || "Customer",
          discountCode: appliedDiscountCode,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout failed! Please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: FoodItem) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  const filteredFoodItems = foodItems.filter((item: FoodItem) => {
    const matchesCategory =
      selectedCategory === "All" || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItemsCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const subtotalPrice = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotalPrice * discountPercentage) / 100;
  const totalPrice = subtotalPrice - discountAmount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="pb-16">
        <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <UserButton />
              ) : (
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Sign In</Button>
                </SignInButton>
              )}
            </div>

            <div className="text-2xl font-bold text-orange-500 flex items-center gap-2">
              <Utensils className="w-6 h-6" /> QuickFood
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-600 text-sm bg-slate-100 px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Deliver to:</span>
              <select className="bg-transparent border-none font-semibold text-slate-800 cursor-pointer focus:outline-none">
                <option>Wayanad, Kerala</option>
                <option>Kochi, Kerala</option>
                <option>Kozhikode, Kerala</option>
              </select>
            </div>
          </div>

          <div className="space-x-3 flex items-center">
            {isSignedIn && (
              <Link href="/orders">
                <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                  <ShoppingBag className="w-4 h-4 text-orange-500" /> My Orders
                </Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Cart ({totalItemsCount})
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col justify-between">
                <div>
                  <SheetHeader>
                    <SheetTitle className="text-xl font-bold">Your Order Cart</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">Your cart is empty.</p>
                    ) : (
                      cart.map((item: any) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm"
                        >
                          {item.image && (
                            <img
                              src={urlFor(item.image).url()}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                            <p className="text-xs font-medium text-orange-600 mt-0.5">
                              ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 rounded-none hover:bg-slate-100 text-slate-600 font-bold"
                                  onClick={() => updateQuantity(item._id, -1)}
                                >
                                  -
                                </Button>
                                <span className="px-2 text-xs font-semibold text-slate-800">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 rounded-none hover:bg-slate-100 text-slate-600 font-bold"
                                  onClick={() => updateQuantity(item._id, 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-red-500 h-6 w-6 p-0 hover:bg-red-50 rounded-md ml-auto"
                                onClick={() => {
                                  removeFromCart(item._id);
                                  toast.error("Item removed");
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    {/* Available Promo Codes Section (Paytm Style) */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-slate-700">Available Offers:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          onClick={() => setDiscountCodeInput("QUICK50")}
                          className="bg-white p-2 rounded-lg border border-orange-200 cursor-pointer hover:border-orange-500 transition-all flex flex-col justify-between shadow-xs"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-xs text-orange-600">QUICK50</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-semibold">50% OFF</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">Tap to apply code</span>
                        </div>

                        <div 
                          onClick={() => setDiscountCodeInput("WELCOME10")}
                          className="bg-white p-2 rounded-lg border border-orange-200 cursor-pointer hover:border-orange-500 transition-all flex flex-col justify-between shadow-xs"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-xs text-orange-600">WELCOME10</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-semibold">10% OFF</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">Tap to apply code</span>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code Input Section */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value)}
                        className="text-xs h-9 uppercase font-mono"
                      />
                      {appliedDiscountCode ? (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-9 px-3 text-xs"
                          onClick={() => {
                            setAppliedDiscountCode("");
                            setDiscountPercentage(0);
                            setDiscountCodeInput("");
                            toast.success("Promo code removed");
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs" 
                          onClick={handleApplyPromoCode}
                        >
                          Apply
                        </Button>
                      )}
                    </div>

                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-xs text-green-600 font-medium bg-green-50 p-2 rounded-lg border border-green-200">
                        <span>Applied ({appliedDiscountCode}): {discountPercentage}% OFF</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-bold pt-1">
                      <span>Total Amount:</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-base font-bold shadow-md"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Pay ₹{totalPrice.toFixed(2)} with Stripe`}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl font-extrabold tracking-tight text-slate-900">
              Delicious Food Delivered To Your Doorstep
            </h2>
            <p className="text-lg text-slate-600">
              Order your favorite meals from top local restaurants with fast & fresh delivery.
            </p>
            <div className="flex gap-4">
              <Link href="#menu-section">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Order Now
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md h-72 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="Hero Food"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Offers Section */}
        <section className="max-w-6xl mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-2xl shadow-md text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Flame className="w-6 h-6 animate-pulse" /> Today's Hot Offers 🔥
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-3">
                <Percent className="w-8 h-8 text-yellow-200" />
                <div>
                  <h4 className="font-bold text-lg">50% OFF</h4>
                  <p className="text-xs text-orange-100">Use code: QUICK50</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-yellow-200" />
                <div>
                  <h4 className="font-bold text-lg">10% OFF</h4>
                  <p className="text-xs text-orange-100">Use code: WELCOME10</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-3">
                <Truck className="w-8 h-8 text-yellow-200" />
                <div>
                  <h4 className="font-bold text-lg">Free Delivery</h4>
                  <p className="text-xs text-orange-100">Use code: QUICKFREE</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="menu-section" className="max-w-6xl mx-auto px-6 pt-6">
          <Input
            type="text"
            placeholder="Search for burgers, pizza, drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-white border-slate-200"
          />
        </section>

        <section className="max-w-6xl mx-auto px-6 py-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Categories</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                    selectedCategory === cat.name
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-slate-50 border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-500"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Popular Dishes</h3>
            {filteredFoodItems.length === 0 ? (
              <p className="text-slate-500">No dishes found. Add items from Sanity Studio.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFoodItems.map((item: FoodItem) => (
                  <div
                    key={item._id}
                    className="bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="relative overflow-hidden" onClick={() => setSelectedFood(item)}>
                      <img
                        src={item.image ? urlFor(item.image).url() : ""}
                        alt={item.name}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Eye className="w-3.5 h-3.5" /> Quick View
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                        {item.category}
                      </span>
                      <h4
                        className="font-bold text-slate-800 text-lg leading-snug hover:text-orange-500 transition-colors"
                        onClick={() => setSelectedFood(item)}
                      >
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold text-slate-900">₹{item.price}</span>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">What Our Customers Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-semibold text-slate-800 text-sm">{review.name}</h5>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
          {selectedFood && (
            <DialogContent className="sm:max-w-lg">
              <div className="space-y-4">
                <img
                  src={selectedFood.image ? urlFor(selectedFood.image).url() : ""}
                  alt={selectedFood.name}
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full">
                    {selectedFood.category}
                  </span>
                  <span className="text-2xl font-bold text-slate-900">₹{selectedFood.price}</span>
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-slate-800">
                    {selectedFood.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 pt-2 text-sm leading-relaxed">
                    {selectedFood.description}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      handleAddToCart(selectedFood);
                      setSelectedFood(null);
                    }}
                  >
                    Add to Cart
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>

      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Utensils className="w-6 h-6 text-orange-500" /> QuickFood
            </h3>
            <p className="text-sm text-slate-400">
              Fresh and delicious food delivered straight to your home with speed & love.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Home</button></li>
              <li><button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Menu</button></li>
              <li><button onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Offers</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={() => { setSelectedCategory("Burger"); window.scrollTo({ top: 600, behavior: 'smooth' }); }} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Burgers</button></li>
              <li><button onClick={() => { setSelectedCategory("Pizza"); window.scrollTo({ top: 600, behavior: 'smooth' }); }} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Pizzas</button></li>
              <li><button onClick={() => { setSelectedCategory("Biryani"); window.scrollTo({ top: 600, behavior: 'smooth' }); }} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Biryani</button></li>
              <li><button onClick={() => { setSelectedCategory("Drinks"); window.scrollTo({ top: 600, behavior: 'smooth' }); }} className="hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer p-0">Beverages</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-3 text-sm text-slate-400">
              <a href="https://www.facebook.com/valorant.yt.9/" className="hover:text-orange-500 transition-colors bg-slate-800 px-3 py-1 rounded-full">Facebook</a>
              <a href="https://www.instagram.com/__sfvn____/" className="hover:text-orange-500 transition-colors bg-slate-800 px-3 py-1 rounded-full">Instagram</a>
              <a href="https://x.com/mr_sefvan_pp" className="hover:text-orange-500 transition-colors bg-slate-800 px-3 py-1 rounded-full">Twitter</a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} QuickFood. All rights reserved.
        </div>
      </footer>
    </div>
  );
}