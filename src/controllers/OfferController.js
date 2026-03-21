  const OfferModel = require("../models/OfferModel");

  // CREATE OFFER
  const createOffer = async (req, res) => {
    try {
      const offer = await OfferModel.create({
        ...req.body,
        buyer_id: req.user._id, 
      });

      res.status(201).json({ 
        message: "Offer created successfully", 
        data: offer 
      });
    } catch (error) {
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
      const offers = await OfferModel.find({ buyer_id: req.user._id }) // or we write req.params.buyerId
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
  const updateOfferStatus = async (req, res) => {
    try {
      const { status, seller_response } = req.body;
      const updated = await OfferModel.findByIdAndUpdate(
        req.params.id, 
        { status, seller_response },
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: "Offer not found" });

      res.status(200).json({ 
        message: "Offer updated successfully", 
        data: updated 
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
    getVehicleOffers,
    updateOfferStatus,
    deleteOffer,
  };