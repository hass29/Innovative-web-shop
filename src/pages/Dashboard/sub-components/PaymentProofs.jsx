// PaymentProofs.jsx
import {
  deletePaymentProof,
  getSinglePaymentProofDetail,
  updatePaymentProof,
} from "@/store/slices/superAdminSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Define Drawer component
const Drawer = ({ setOpenDrawer, openDrawer }) => {
  const { singlePaymentProof, loading } = useSelector(
    (state) => state.superAdmin
  );
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const dispatch = useDispatch();

  // Reset form when drawer opens/closes or singlePaymentProof changes
  useEffect(() => {
    if (singlePaymentProof) {
      setAmount(singlePaymentProof.amount || "");
      setStatus(singlePaymentProof.status || "");
    }
  }, [singlePaymentProof, openDrawer]);

  const handlePaymentProofUpdate = () => {
    dispatch(updatePaymentProof(singlePaymentProof._id, status, amount));
  };

  const handleClose = () => {
    setOpenDrawer(false);
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (openDrawer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openDrawer]);

  return (
    <div className={`fixed inset-0 z-50 ${openDrawer ? "block" : "hidden"}`}>
      {/* Overlay with click to close */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Drawer content */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white pt-4 pb-2 flex justify-center z-10 border-b">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        <div className="w-full px-5 py-8 sm:max-w-[640px] sm:mx-auto">
          <h3 className="text-[#D6482B] text-3xl font-semibold text-center mb-1">
            Update Payment Proof
          </h3>
          <p className="text-stone-600 text-center mb-6">
            You can update payment status and amount.
          </p>
          
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-[16px] text-stone-600">User ID</label>
              <input
                type="text"
                value={singlePaymentProof?.userId || ""}
                disabled
                className="text-xl px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-stone-600"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-[16px] text-stone-600">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xl px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-[16px] text-stone-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-xl px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6482B] focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-[16px] text-stone-600">Comment</label>
              <textarea
                rows={4}
                value={singlePaymentProof?.comment || ""}
                disabled
                className="text-xl px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-stone-600 resize-none"
              />
            </div>
            
            <div>
              <Link
                to={singlePaymentProof?.proof?.url || ""}
                className="bg-[#D6482B] flex justify-center w-full py-3 rounded-lg text-white font-semibold text-xl transition-all duration-300 hover:bg-[#b8381e]"
                target="_blank"
              >
                View Payment Proof
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="bg-blue-500 flex-1 py-3 rounded-lg text-white font-semibold text-xl transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePaymentProofUpdate}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
              
              <button
                type="button"
                className="bg-gray-500 flex-1 py-3 rounded-lg text-white font-semibold text-xl transition-all duration-300 hover:bg-gray-700"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main PaymentProofs component
const PaymentProofs = () => {
  const { paymentProofs, singlePaymentProof } = useSelector(
    (state) => state.superAdmin
  );
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch();

  const handlePaymentProofDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this payment proof?")) {
      dispatch(deletePaymentProof(id));
    }
  };

  const handleFetchPaymentDetail = (id) => {
    dispatch(getSinglePaymentProofDetail(id));
  };

  useEffect(() => {
    // Open drawer when singlePaymentProof has data
    if (singlePaymentProof && Object.keys(singlePaymentProof).length > 0) {
      setOpenDrawer(true);
    }
  }, [singlePaymentProof]);

  // Clean up body overflow when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">User ID</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {paymentProofs.length > 0 ? (
              paymentProofs.map((element, index) => (
                <tr 
                  key={element._id || index} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 border-b">{element.userId}</td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      element.status === "Approved" 
                        ? "bg-green-100 text-green-800" 
                        : element.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : element.status === "Settled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {element.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b font-semibold">
                    Rs. {element.amount?.toLocaleString() || "0"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all duration-300 text-sm"
                        onClick={() => handleFetchPaymentDetail(element._id)}
                      >
                        Update
                      </button>
                      <button
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-all duration-300 text-sm"
                        onClick={() => handlePaymentProofDelete(element._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan="4" 
                  className="py-8 px-4 text-center text-gray-500 text-lg"
                >
                  No payment proofs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Render Drawer */}
      <Drawer setOpenDrawer={setOpenDrawer} openDrawer={openDrawer} />
    </div>
  );
};

export default PaymentProofs;