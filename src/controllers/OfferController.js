  const OfferModel = require("../models/OfferModel");
  const VehicleModel = require("../models/VehicleModel")

  // CREATE OFFER
  const createOffer = async (req, res) => {
    try {
      console.log("--- DEBUG START ---");
    console.log("Body:", req.body);
    console.log("User from Token:", req.user); // 🚩 If this is undefined, that's your 500 error!
    console.log("--- DEBUG END ---");
      const { vehicle_id, offer_amount, message } = req.body;
      const buyer_id = req.user._id || req.user.id;

       const vehicle = await VehicleModel.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }


      const offer = await OfferModel.create({
        vehicle_id,
        buyer_id,
        seller_id: vehicle.seller_id,
        offered_amount: offer_amount,
        message: message || "New offer submitted via The Vault.",
        status:"Pending"
      });

      res.status(201).json({ 
        message: "Offer created successfully", 
        data: offer 
      });
    } catch (error) {
      console.error("Create Offer Error:", error);
      res.status(500).json({ 
        message: "Error creating offer", 
        error: error.message 
      });
    }
  };

  // GET OFFER BY ID
  // const getOfferById = async (req, res) => {
  //   try {
  //     const offer = await OfferModel.findById(req.params.id)
  //       .populate("buyer_id")
  //       .populate("vehicle_id");

  //     if (!offer) return res.status(404).json({ message: "Offer not found" });

  //     res.status(200).json(offer);
  //   } catch (error) {
  //     res.status(500).json({ 
  //       message: "Error fetching offer", 
  //       error: error.message 
  //     });
  //   }
  // };


  const getOfferById = async (req, res) => {
  try {
    const offer = await OfferModel.findById(req.params.id)
      .populate("buyer_id", "firstName lastName email phone")
      .populate("seller_id", "firstName lastName email phone")
      .populate("vehicle_id");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    let responseData = offer.toObject();

    // 🔒 HIDE CONTACT DETAILS IF DEAL NOT LOCKED
    if (offer.dealStatus !== "deal_locked") {
      responseData.seller_id.email = null;
      responseData.seller_id.phone = null;

      responseData.buyer_id.email = null;
      responseData.buyer_id.phone = null;
    }

    // ✅ OPTIONAL: Only show to buyer/seller (extra security)
    const userId = req.user._id || req.user.id;

    if (
      offer.buyer_id._id.toString() !== userId.toString() &&
      offer.seller_id._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to view this offer"
      });
    }

    res.status(200).json({
      message: "Offer fetched successfully",
      data: responseData
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching offer",
      error: error.message
    });
  }
};

  // GET BUYER OFFERS
  const getBuyerOffers = async (req, res) => {
    try {
      const offers = await OfferModel.find({ buyer_id: req.user.id }) // or we write req.params.buyerId
        .populate("vehicle_id")
        .populate("seller_id", "firstName lastName email phone")  

      res.status(200).json({ 
        message: "Offers fetched", 
        data: offers 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching offers", 
        error: error.message 
      });
    }
  };


  const getSellerOffers = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const offers = await OfferModel.find({ seller_id: userId })
      .populate("buyer_id","firstName lastName email phone")
      .populate("vehicle_id");

    res.status(200).json({
      message: "Seller offers fetched",
      data: offers
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching seller offers",
      error: error.message
    });
  }
};

  // GET VEHICLE OFFERS
  const getVehicleOffers = async (req, res) => {
    try {
      const offers = await OfferModel.find({ vehicle_id: req.params.vehicleId })
        .populate("buyer_id")
        .populate("vehicle_id");

      res.status(200).json({ 
        message: "Vehicle offers fetched", 
        data: offers 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching vehicle offers", 
        error: error.message 
      });
    }
  };

 

//   // UPDATE OFFER STATUS
// const updateOfferStatus = async (req, res) => {
//   try {
//     const { status, seller_response } = req.body;

//     const offer = await OfferModel.findById(req.params.id);

//     if (!offer) {
//       return res.status(404).json({ message: "Offer not found" });
//     }

//     // ✅ SECURITY: ONLY SELLER CAN UPDATE
//     const userId = req.user._id || req.user.id;
//     if (offer.seller_id.toString() !== userId.toString()) {
//       return res.status(403).json({
//         message: "Not authorized to update this offer"
//       });
//     }

//     offer.status = status;
//     offer.seller_response = seller_response;

//     await offer.save();

//     res.status(200).json({ 
//       message: "Offer updated successfully", 
//       data: offer 
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       message: "Error updating offer", 
//       error: error.message 
//     });
//   }
// };


const updateOfferStatus = async (req, res) => {
  try {
    const { status, seller_response } = req.body;

    const offer = await OfferModel.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // ✅ SECURITY: ONLY SELLER CAN UPDATE
    const userId = req.user._id || req.user.id;
    if (offer.seller_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this offer"
      });
    }

    // ✅ UPDATE STATUS
    offer.status = status;
    offer.seller_response = seller_response;

    // 🔥 NEW LOGIC: dealStatus update
    if (status === "Accepted") {
      offer.dealStatus = "offer_accepted";
    }

    if (status === "Rejected") {
      offer.dealStatus = "cancelled";
    }

    await offer.save();

    res.status(200).json({ 
      message: "Offer updated successfully", 
      data: offer 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating offer", 
      error: error.message 
    });
  }
};

  // DELETE OFFER
  const deleteOffer = async (req, res) => {
    try {
      const deleted = await OfferModel.findByIdAndDelete(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Offer not found" });

      res.status(200).json({ 
        message: "Offer deleted successfully", 
        data: deleted 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error deleting offer", 
        error: error.message 
      });
    }
  };


  const confirmDeal = async (req, res) => {
  try {
    console.log("===== 🚀 CONFIRM DEAL API HIT =====");

    const offer = await OfferModel.findById(req.params.id);

    console.log("👉 Offer ID:", req.params.id);
    console.log("👉 Offer Found:", offer ? "YES" : "NO");

    if (!offer) {
      console.log("❌ Offer not found in DB");
      return res.status(404).json({ message: "Offer not found" });
    }

    const userId = req.user._id || req.user.id;

    console.log("👤 Logged-in User ID:", userId);
    console.log("🧑 Buyer ID:", offer.buyer_id.toString());
    console.log("🧑 Seller ID:", offer.seller_id.toString());

    console.log("📊 Offer Status:", offer.status);
    console.log("📊 Deal Status:", offer.dealStatus);
    console.log("✅ Buyer Confirmed:", offer.buyerConfirmed);
    console.log("✅ Seller Confirmed:", offer.sellerConfirmed);

    // ✅ AUTH CHECK
    if (
      offer.buyer_id.toString() !== userId.toString() &&
      offer.seller_id.toString() !== userId.toString()
    ) {
      console.log("❌ User not authorized");
      return res.status(403).json({
        message: "Not authorized to confirm this deal"
      });
    }

    // ✅ STATUS CHECK
    if (offer.status !== "Accepted") {
      console.log("❌ Offer is NOT accepted yet");
      return res.status(400).json({
        message: "Deal can only be confirmed after offer is accepted"
      });
    }

    // ✅ SET CONFIRMATION
    if (offer.buyer_id.toString() === userId.toString()) {
      console.log("✅ Buyer clicked confirm");
      offer.buyerConfirmed = true;
    }

    if (offer.seller_id.toString() === userId.toString()) {
      console.log("✅ Seller clicked confirm");
      offer.sellerConfirmed = true;
    }

    console.log("🔄 Updated Buyer Confirmed:", offer.buyerConfirmed);
    console.log("🔄 Updated Seller Confirmed:", offer.sellerConfirmed);

    // 🔥 FINAL LOCK
    if (offer.buyerConfirmed && offer.sellerConfirmed) {
      console.log("🎉 DEAL LOCKED SUCCESSFULLY");
      offer.dealStatus = "deal_locked";
    } else {
      console.log("⏳ Waiting for other party...");
    }

    await offer.save();

    console.log("💾 Offer saved successfully");

    res.status(200).json({
      message: "Deal confirmation updated",
      data: offer
    });

  } catch (error) {
    console.error("🔥 ERROR IN CONFIRM DEAL:", error);
    res.status(500).json({
      message: "Error confirming deal",
      error: error.message
    });
  }
};

  module.exports = {
    createOffer,
    getOfferById,
    getBuyerOffers,
    getSellerOffers,
    getVehicleOffers,
    updateOfferStatus,
    deleteOffer,
    confirmDeal
  };