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
  const getOfferById = async (req, res) => {
    try {
      const offer = await OfferModel.findById(req.params.id)
        .populate("buyer_id")
        .populate("vehicle_id");

      if (!offer) return res.status(404).json({ message: "Offer not found" });

      res.status(200).json(offer);
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
        .populate("vehicle_id");

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
      .populate("buyer_id")
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

  // UPDATE OFFER STATUS
  // const updateOfferStatus = async (req, res) => {
  //   try {
  //     const { status, seller_response } = req.body;
  //     const updated = await OfferModel.findByIdAndUpdate(
  //       req.params.id, 
  //       { status, seller_response },
  //       { new: true }
  //     );

  //     if (!updated) return res.status(404).json({ message: "Offer not found" });

  //     res.status(200).json({ 
  //       message: "Offer updated successfully", 
  //       data: updated 
  //     });
  //   } catch (error) {
  //     res.status(500).json({ 
  //       message: "Error updating offer", 
  //       error: error.message 
  //     });
  //   }
  // };


  // UPDATE OFFER STATUS
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

    offer.status = status;
    offer.seller_response = seller_response;

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

  module.exports = {
    createOffer,
    getOfferById,
    getBuyerOffers,
    getSellerOffers,
    getVehicleOffers,
    updateOfferStatus,
    deleteOffer,
  };