import React from "react";
import Breadcrumb from "../../components/Breadcrumb";
import HeaderPages from "../../components/HeaderPages";
import PropertyForm from "../../components/PostProperty";
import { HousePlus } from "lucide-react";

const PostPropPage: React.FC = () => {
  return (
    <div className="App">
      {/* <div className="hero-wrapper">
        <HeaderPages centeredText="POST PROPERTY" />
      </div> */}

      {/* <Breadcrumb
        items={[
          { label: "Home", href: "index.html" },
          { label: "Post Property" },
          { label: "Form" },
        ]}
      /> */}
      <div className="flex justify-center">
        {/* <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-[#ffe9df] border border-orange-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <HousePlus className="w-8 h-8 text-orange-600" /> Post a Listing</h2>
        </div>
        </div> */}
    </div>
      <PropertyForm />
    </div>
  );
}

export default PostPropPage;
