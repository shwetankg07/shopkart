// log the real error here, the client only ever sees a generic message
export const serverError = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
};
