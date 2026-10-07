let loading = null;

// resolves false when the script can't load, so checkout can show an error
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
