"use client";

import { useEffect } from "react";
import { useCartStore } from "../../store/useCartStore";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";

export default function OrderSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // പേജിലേക്ക് വരുമ്പോൾ കാർട്ട് പൂർണ്ണമായി ക്ലിയർ ചെയ്യുന്നു
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-100 max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Order Placed Successfully!</h1>
          <p className="text-slate-500 text-sm">
            Thank you for your order! Your delicious food is being prepared and will be delivered to your doorstep soon.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders">
            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> View My Orders
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              Back to Home <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
