  const mongoose = require("mongoose");

  const vehicleDetailsSchema = new mongoose.Schema({

    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicles",
      required: true
    },

    seller_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"users",
      required:true
    },

  
    // VEHICLE SPECIFICATIONS


    engine_capacity: {
      type: String
    },

    horsepower: {
      type: Number
    },

    torque: {
      type: String
    },

    seating_capacity: {
      type: Number
    },

    number_of_doors: {
      type: Number
    },

    drive_type: {
      type: String
    },

    fuel_tank_capacity: {
      type: Number
    },

    top_speed: {
      type: Number
    },

    acceleration: {
      type: String
    },

  
    // INTERIOR DETAILS


    seat_material: {
      type: String
    },

    seat_condition: {
      type: String
    },

    dashboard_condition: {
      type: String
    },

    infotainment_system: {
      type: String
    },

    touchscreen_display: {
      type: Boolean
    },

    air_conditioning: {
      type: Boolean
    },

    rear_ac_vents: {
      type: Boolean
    },

    interior_cleanliness: {
      type: String
    },

    adjustable_seats: {
      type: Boolean
    },

    steering_condition: {
      type: String
    },

    speaker_system: {
      type: String
    },

    
    // EXTERIOR DETAILS


    paint_condition: {
      type: String
    },

    body_condition: {
      type: String
    },

    tyre_condition: {
      type: String
    },

    tyre_brand: {
      type: String
    },

    headlights_condition: {
      type: String
    },

    scratches_or_dents: {
      type: String
    },

    rust_status: {
      type: String
    },

    alloy_wheels: {
      type: Boolean
    },

    sunroof: {
      type: Boolean
    },

    fog_lamps: {
      type: Boolean
    },

    rear_spoiler: {
      type: Boolean
    },

  
    // SAFETY FEATURES


    airbags: {
      type: Number
    },

    abs: {
      type: Boolean
    },

    parking_sensors: {
      type: Boolean
    },

    rear_camera: {
      type: Boolean
    },

    traction_control: {
      type: Boolean
    },

    central_locking: {
      type: Boolean
    },

    child_safety_locks: {
      type: Boolean
    },


    // ADDITIONAL INFORMATION
    

    registration_state: {
      type: String
    },

    insurance_status: {
      type: String
    },

    last_service_date: {
      type: Date
    },

    service_history_available: {
      type: Boolean
    }

  }, { timestamps: true });

  module.exports = mongoose.model("vehicle_details", vehicleDetailsSchema);