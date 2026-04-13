const mongoose = require("mongoose");
const User = require("./backend/models/User");

mongoose.connect("mongodb://localhost:27017/servicemate").then(async () => {
    try {
        const admins = await User.find({ role: "admin" }).select("name email password role");
        console.log("Admins found:", admins);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
