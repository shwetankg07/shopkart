import { useEffect, useState } from "react";

export default function BootScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="boot" role="status">
      <p className="boot-mark">shopkart</p>
      {slow && (
        <p className="boot-note">
          Waking up the store. The server sleeps when nobody is shopping, so the first visit can take up to a
          minute.
        </p>
      )}
    </div>
  );
}
