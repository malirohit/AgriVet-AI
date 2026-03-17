import appointmentModel from "../models/Appointment.js";

export const getDoctorAppointments = async (req, res) => {

  try {

    const appointments = await appointmentModel.find({ doctor: req.user.id })
      .populate("user", "name city village");

    res.status(200).json({
        success:true,
        message:"Doctor appointments fetched successfully",
        appointments
    });

  } catch (error) {

    console.error("Error fetching doctor appointments:", error.message);
    res.status(500).json({ message: error.message });
  }

};

export const updateAppointmentStatus = async (req, res) => {

  try {

    const appointment = await appointmentModel.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    res.status(200).json({
        success:true,
        message:"Appointment status updated successfully",
        appointment
    });
  } catch (error) {

    console.error("Error updating appointment status:", error.message);
    res.status(500).json({ message: error.message });
  }
};