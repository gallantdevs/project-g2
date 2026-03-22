import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import { GlobalProvider } from "./Context/GlobalContext.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { ProductProvider } from "./Context/ProductContext.jsx";
import { PosterProvider } from "./Context/PosterContext.jsx";
import { SectionProvider } from "./Context/SectionContext.jsx";
import { CartProvider } from "./Context/CartContext.jsx";
import { ComboProvider } from "./Context/ComboContext.jsx";
import { CouponProvider } from "./Context/CouponContext.jsx";
import { AdminProvider } from "./Context/AdminContext.jsx";
import { OrderProvider } from "./Context/OrderContext.jsx";
import { PaymentProvider } from "./Context/PaymentContext.jsx";
import { WishListProvider } from "./Context/WishListContext.jsx";

import { TrackingProvider } from "./Context/TrackingContext.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProductProvider>
            <ComboProvider>
              <PosterProvider>
                <SectionProvider>
                  <WishListProvider>
                    <CartProvider>
                      <CouponProvider>
                        <TrackingProvider>
                          <OrderProvider>
                            <PaymentProvider>
                              <AdminProvider>
                                <App />
                              </AdminProvider>
                            </PaymentProvider>
                          </OrderProvider>
                        </TrackingProvider>
                      </CouponProvider>
                    </CartProvider>
                  </WishListProvider>
                </SectionProvider>
              </PosterProvider>
            </ComboProvider>
          </ProductProvider>
        </AuthProvider>
      </BrowserRouter>
    </GlobalProvider>
  </React.StrictMode>
);
