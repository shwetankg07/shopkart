import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/authSlice.js";
import Layout from "./components/Layout.jsx";
import PageTransition from "./components/PageTransition.jsx";
import BootScreen from "./components/BootScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";

export default function App() {
  const dispatch = useDispatch();
  const checked = useSelector((state) => state.auth.checked);
  const location = useLocation();

  // routes render this lagging copy, so the old page stays put until the transition covers it
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!checked) {
    return <BootScreen />;
  }

  // same page with a new query string (search, filters) just follows along, no transition
  let shown = displayLocation;
  if (location.pathname === displayLocation.pathname) {
    shown = location;
  }

  return (
    <>
      <PageTransition
        location={location}
        displayLocation={displayLocation}
        onSwap={() => setDisplayLocation(location)}
      />

      <Routes location={shown}>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}
