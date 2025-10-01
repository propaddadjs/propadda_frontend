import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import AboutUs from "./pages/AboutUs";
import Testimonials from "./pages/Testimonials";
import PostPropPage from "./pages/Agent/PostPropertyPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AllListings from "./pages/Admin/AllListings";
import AdminLayout from "./components/AdminLayout";
import PendingListings from "./pages/Admin/PendingListings";
import ExpiredListings from "./pages/Admin/ExpiredListings";
import VipListings from "./pages/Admin/VipListings";
import ListingDetail from "./pages/Admin/ListingDetail";
import PropertySeekers from "./pages/Admin/PropertySeekers";
import AgentBroker from "./pages/Admin/AgentBroker";
import KycRequests from "./pages/Admin/KycRequests";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AgentLayout from "./components/AgentLayout";
import AgentDashboard from "./pages/Agent/AgentDashboard";
import BuyerLayout from "./components/BuyerLayout";
import BuyerDashboard from "./pages/Buyer/BuyerDashboard";
import AgentAllListings from "./pages/Agent/AgentAllListings";
import AgentPendingListings from "./pages/Agent/AgentPendingListings";
import AgentExpiredListings from "./pages/Agent/AgentExpiredListings";
import AgentNotifications from "./pages/Agent/AgentNotifications";
import AgentFeedback from "./pages/Agent/AgentFeedback";
import AgentHelp from "./pages/Agent/AgentHelp";
import KycStatus from "./pages/Agent/KycStatus";
import AgentProfile from "./pages/Agent/AgentProfile";
import AgentChangePassword from "./pages/Agent/AgentChangePassword";
import AgentListingDetail from "./pages/Agent/AgentListingDetail";
import SoldListings from "./pages/Admin/SoldListings";
import AgentSoldListings from "./pages/Agent/AgentSoldListings";
import EditPropertyPage from "./pages/Agent/EditPropertyPage";
// import Terms from "./pages/Terms";
// import Feedback from "./pages/Feedback";
// import Policy from "./pages/Policy";
// import FAQ from "./pages/FAQ";
// import ContactUs from "./pages/ContactUs";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* <Route path="/about" element={<AboutUs />} /> */}
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="listings">
            <Route path="active" element={<AllListings />} />
            <Route path="pending" element={<PendingListings />} />
            <Route path="expired" element={<ExpiredListings />} />
            <Route path="sold" element={<SoldListings />} />
            <Route path="vip" element={<VipListings />} />
            <Route path="/admin/listings/view/:category/:id" element={<ListingDetail />} />
          </Route>
          <Route path="leads">
            <Route path="active" element={<AllListings />} />
            <Route path="pending" element={<PendingListings />} />
            <Route path="expired" element={<ExpiredListings />} />
            <Route path="vip" element={<VipListings />} />
          </Route>
          <Route path="users">
            <Route path="propertySeekers" element={<PropertySeekers />} />
            <Route path="agentsBrokersBuilders" element={<AgentBroker />} />
            <Route path="KYC" element={<KycRequests />} />
          </Route>
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<AgentDashboard />} />
          <Route path="listings">
            <Route path="active" element={<AgentAllListings />} />
            <Route path="pending" element={<AgentPendingListings />} />
            <Route path="expired" element={<AgentExpiredListings />} />
            <Route path="sold" element={<AgentSoldListings />} />
            <Route path="/agent/listings/view/:category/:id" element={<AgentListingDetail />} />
            <Route path="/agent/listings/edit/:category/:id" element={<EditPropertyPage />} />
          </Route>
          <Route path="kycStatus" element={<KycStatus />} />
          <Route path="notifications" element={<AgentNotifications />} />
          <Route path="support">
            <Route path="feedback" element={<AgentFeedback />} />
            <Route path="help" element={<AgentHelp />} />
            <Route path="manageProfile" element={<AgentProfile />} />
          </Route>
          <Route path="postproperty" element={<PostPropPage />} />
          <Route path="changePassword" element={<AgentChangePassword />} />
        </Route>

        <Route path="/buyer" element={<BuyerLayout />}>
          <Route index element={<BuyerDashboard />} />
          {/* <Route path="listings">
            <Route path="active" element={<AllListings />} />
            <Route path="pending" element={<PendingListings />} />
            <Route path="expired" element={<ExpiredListings />} />
            <Route path="vip" element={<VipListings />} />
            <Route path="/admin/listings/view/:category/:id" element={<ListingDetail />} />
          </Route>
          <Route path="users">
            <Route path="propertySeekers" element={<PropertySeekers />} />
            <Route path="agentsBrokersBuilders" element={<AgentBroker />} />
            <Route path="KYC" element={<KycRequests />} />
          </Route>
          <Route path="notifications" element={<AdminNotifications />} /> */}
        </Route>
        {/* <Route path="/terms" element={<Terms />} /> */}
        {/* <Route path="/feedback" element={<Feedback />} /> */}
        {/* <Route path="/policy" element={<Policy />} /> */}
        {/* <Route path="/faq" element={<FAQ />} /> */}
        {/* <Route path="/contact" element={<ContactUs />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
