export const rupees = (amount) => {
  return "₹" + Number(amount).toLocaleString("en-IN");
};

export const firstName = (fullName) => {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
};

export const shortId = (id) => {
  return String(id).slice(-6).toUpperCase();
};

export const formatDate = (value) => {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
