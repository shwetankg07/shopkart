let loading = null;

// load razorpay's checkout script once, and say so if it can't be reached instead of assuming window.Razorpay exists
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      loading = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loading;
};
