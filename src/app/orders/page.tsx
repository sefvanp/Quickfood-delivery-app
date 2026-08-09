"use client";

import { useEffect, useState } from "react";
import { client } from "../../sanity/lib/client";
import { useUser, UserButton } from "@clerk/nextjs";
import { Utensils, ShoppingBag, Clock, CheckCircle2, Package, Bike, Phone, ArrowLeft, Timer, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  createdAt: string;
}

const deliveryPartners = [
  { name: "Rahul Das", phone: "+919876543210", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" },
  { name: "Arjun Nair", phone: "+919123456789", image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80" },
  { name: "Muhammed Ali", phone: "+919988776655", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { name: "Vipin Kumar", phone: "+919445566778", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
  { name: "Akash Menon", phone: "+919771122334", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80" },
];

const getPartnerForOrder = (orderId: string) => {
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % deliveryPartners.length;
  return deliveryPartners[index];
};

const DELIVERY_DURATION_SECONDS = 1800; // 30 minutes total delivery time

export default function OrdersPage() {
  const { user, isSignedIn } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLefts, setTimeLefts] = useState<{ [key: string]: number }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [ratedMsg, setRatedMsg] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      try {
        const query = `*[_type == "order" && customerEmail == $email]|order(createdAt desc)`;
        const data = await client.fetch(query, {
          email: user.primaryEmailAddress.emailAddress,
        });
        setOrders(data);

        // Calculate real time elapsed since createdAt
        const initialTimes: { [key: string]: number } = {};
        const now = new Date().getTime();

        data.forEach((order: Order) => {
          const orderTime = new Date(order.createdAt).getTime();
          const elapsedSeconds = Math.floor((now - orderTime) / 1000);
          const remaining = DELIVERY_DURATION_SECONDS - elapsedSeconds;
          
          // If more than 30 mins passed, set to 0 (Delivered)
          initialTimes[order._id] = remaining > 0 ? remaining : 0;
        });

        setTimeLefts(initialTimes);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, isSignedIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLefts((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 0) {
            updated[id] -= 1;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Completed";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getOrderStatus = (secondsLeft: number) => {
    if (secondsLeft <= 0) return "Delivered";
    if (secondsLeft <= 600) return "Out for Delivery";
    if (secondsLeft <= 1200) return "Packing";
    return "Preparing";
  };

  const getStepStatus = (currentStatus: string, step: string) => {
    const steps = ["Preparing", "Packing", "Out for Delivery", "Delivered"];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
  };

  const handleRate = (orderId: string, stars: number) => {
    setRatings((prev) => ({ ...prev, [orderId]: stars }));
    setRatedMsg((prev) => ({ ...prev, [orderId]: `Thank you! You rated ${stars} stars.` }));
    toast.success(`Rated ${stars} stars successfully! 🌟`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {isSignedIn && <UserButton />}
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-orange-500" /> My Live Orders
            </h1>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 shadow-sm hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {!isSignedIn ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-100">
            <p className="text-slate-600 mb-4">Please sign in to view your order history.</p>
          </div>
        ) : loading ? (
          <p className="text-center text-slate-500 py-12">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-100 space-y-4">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">No active orders</h3>
            <p className="text-slate-500 text-sm">You haven't placed any food orders yet.</p>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 mt-2">Order Food Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const secondsLeft = timeLefts[order._id] ?? 0;
              const currentStatus = getOrderStatus(secondsLeft);
              const partner = getPartnerForOrder(order._id);
              const currentRating = ratings[order._id] || 0;
              const isDelivered = secondsLeft <= 0;
              
              return (
                <div
                  key={order._id}
                  className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-100 border border-orange-100/60 space-y-6 relative overflow-hidden transition-all hover:shadow-2xl"
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${isDelivered ? "bg-green-500" : "bg-orange-500"}`} />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-lg">Order #{order._id.slice(-6)}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${isDelivered ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          <Sparkles className="w-3 h-3" /> {isDelivered ? "Delivered" : "Live Tracking"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(order.createdAt).toLocaleDateString()})
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-3 ${isDelivered ? "bg-green-600" : "bg-gradient-to-r from-orange-500 to-amber-500"}`}>
                        <Timer className={`w-5 h-5 ${!isDelivered ? "animate-pulse" : ""}`} />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-90">{isDelivered ? "Status" : "Live Arrival In"}</p>
                          <p className="text-base font-black tracking-tight">{formatTime(secondsLeft)}</p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
                        <span className="text-lg font-black text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Progress Steps */}
                  <div className="py-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Status Tracking</h4>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${isDelivered ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200/60 animate-pulse"}`}>
                        Status: {currentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${getStepStatus(currentStatus, "Preparing") ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        <Utensils className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] opacity-80 font-bold">Step 1</p>
                          <p className="text-xs font-bold">Preparing</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${getStepStatus(currentStatus, "Packing") ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        <Package className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] opacity-80 font-bold">Step 2</p>
                          <p className="text-xs font-bold">Packing</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${getStepStatus(currentStatus, "Out for Delivery") ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        <Bike className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] opacity-80 font-bold">Step 3</p>
                          <p className="text-xs font-bold">Out for Delivery</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${getStepStatus(currentStatus, "Delivered") ? "bg-green-50 border-green-200 text-green-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] opacity-80 font-bold">Step 4</p>
                          <p className="text-xs font-bold">Delivered</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Partner Card & Rating */}
                  <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/60 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={partner.image}
                            alt="Delivery Partner"
                            className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-sm"
                          />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            {partner.name} <span className="text-[10px] font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Delivery Partner</span>
                          </h5>
                          <p className="text-xs text-slate-500">{isDelivered ? "Order successfully delivered" : "Your food is secure & on the way"}</p>
                        </div>
                      </div>
                      {!isDelivered && (
                        <a href={`tel:${partner.phone}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-sm">
                            <Phone className="w-3.5 h-3.5" /> Call Driver
                          </Button>
                        </a>
                      )}
                    </div>

                    {/* Delivery Partner Rating Option */}
                    <div className="border-t border-slate-200/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Rate your Delivery Experience with {partner.name}:</p>
                        {ratedMsg[order._id] && <p className="text-[11px] text-green-600 font-semibold mt-0.5">{ratedMsg[order._id]}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(order._id, star)}
                            className="p-1 focus:outline-none transition-transform hover:scale-125"
                          >
                            <Star
                              className={`w-5 h-5 ${star <= currentRating ? "fill-yellow-400 text-yellow-500" : "text-slate-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}