
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import StaffDashboard from "./Component/Panels/Staff/StaffPages/StaffDashboard";
import Login from "./Component/Panels/Auth/Login";
import ForgotPassword from "./Component/Panels/Auth/ForgotPassword";
import ResetPassword from "./Component/Panels/Auth/ResetPassword";


// Staff Pages (Mobile Only)
import MyRetailers from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/MyRetailers";
import AddRetailer from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/AddRetailer";

import SalesVisits from "./Component/Panels/Staff/StaffPages/Staff_SalesVisits/SalesVisits";
import LogVisit from "./Component/Panels/Staff/StaffPages/Staff_SalesVisits/LogVisit";
import StaffExpenses from "./Component/Panels/Staff/StaffPages/Staff_Expenses/StaffExpenses";
import AddExpense from "./Component/Panels/Staff/StaffPages/Staff_Expenses/AddExpense";
import StaffOffers from "./Component/Panels/Staff/StaffPages/Staff_Offers/StaffOffers";


import Staff_expensive from "./Component/Panels/Staff/StaffPages/Expensive/Staff_expensive";
import Staff_Add_expensive from "./Component/Panels/Staff/StaffPages/Expensive/Staff_Add_expensive";

import PlaceSalesOrder from "./Component/Panels/Staff/StaffPages/PlaceOrder/PlaceSalesOrder";
import Cart from "./Component/Panels/Staff/StaffPages/Cart/Cart"
import CheckoutPage from "./Component/Panels/Staff/StaffPages/CheckOut/CheckOut";
import OrderSuccess from "./Component/Panels/Staff/StaffPages/OrderPlaced/OrderPlace";
import ViewDetails from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/ViewDetails";
import StaffOrders from "./Component/Panels/Staff/StaffPages/PlaceOrder/StaffOrders";
import OrderFullDetails from "./Component/Panels/Staff/StaffPages/PlaceOrder/OrderFullDetails";
import ProfilePage from "./Component/Panels/Staff/StaffPages/StaffMobileLayout/ProfilePage";
import StaffInventory from "./Component/Panels/Staff/StaffPages/Inventory"; // Adjust path as needed




function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />

        <Route path="/staff/inventory" element={<StaffInventory />} />

        {/* Staff Mobile Pages */}
        <Route path="/staff/retailers" element={<MyRetailers />} />
        <Route path="/staff/view-retailers/:id" element={<ViewDetails />} />
        <Route path="/staff/profile" element={<ProfilePage />} />
        <Route path="/staff/add-retailer" element={<AddRetailer mode="add" />} />
        <Route path="/staff/edit-retailer/:id" element={<AddRetailer mode="edit" />} />
        <Route path="/staff/view-retailer/:id" element={<AddRetailer mode="view" />} />
        <Route path="/staff/sales-visits" element={<SalesVisits />} />
        <Route path="/staff/log-visit" element={<LogVisit />} />
        <Route path="/staff/expences" element={<StaffExpenses />} />
        <Route path="/staff/add-expense" element={<AddExpense />} />
        <Route path="/staff/offers" element={<StaffOffers />} />
        <Route path="/staff/place-sales-order" element={<PlaceSalesOrder />} />
        <Route path="/staff/cart" element={<Cart />} />
        <Route path="/staff/checkout" element={<CheckoutPage />} />
        <Route path="/staff/order-success" element={<OrderSuccess />} />
        <Route path="/staff/orders" element={<StaffOrders />} />
        <Route path="/staff_expensive" element={<Staff_expensive />} />
        <Route path="/staff_add_expensive" element={<Staff_Add_expensive />} />

        <Route
          path="/staff/order-details/:orderNumber"
          element={<OrderFullDetails />}
        />

      </Routes>
    </Router>
  );
}

export default App;

