import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { render } from "ejs";

mongoose.connect("mongodb://localhost:27017", {
    dbName: "Backend"
}).then(() => console.log("Database Connected"))
    .catch((e) => console.log(e));
const UserSchema = new mongoose.Schema({
    name: String,
    password : String,
    email: String,
    userType:String
});
const User = mongoose.model("User", UserSchema);
const app = express();
const users = [];
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
// Authentication middleware
const is_Authenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "setjdjdrshagwe");
        req.user = await User.findById(decoded._id)
        next();
    } else {
        res.redirect("/login"); // Redirect to the login page if not authenticated
    }
};
// Initial route, opens the login page
app.get("/", (req, res) => {
    res.redirect("/login");
});
// Login route, displays the login page
app.get("/login", (req, res) => {
    res.render("login"); // Assuming you have a "login.ejs" view
});
app.post("/login", async (req, res) => {
    const { username, email, password, userType } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
        return res.redirect("/register");
    }

    const isMatchedPass = user.password == password;
    const isMatchedtype = user.userType == userType;

    if (!isMatchedPass) {
        return res.render("login", { email, message: "Incorrect password" });
    }

    if (!isMatchedtype) {
        return res.render("login", { email, message: "Incorrect usertype" });
    }

    if (userType == 'admin') {
        res.render("home_admin", { name: username });
    } else {
        res.render("home_user", { name: username });
    }
});

// Logout route, displays the logout page
app.get("/logout", (req, res) => {
    res.render("logout"); // Assuming you have a "logout.ejs" view
});
app.get("/create", (req, res) => {
    res.render("create"); // Assuming you have a "logout.ejs" view
});
app.post("/create",async(req,res)=>{
    const { name, email,password,userType } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        return res.render("create",{message:"User already exists"});
    }
    user = await User.create({
        name,
        email,
        password,
        userType
    });
    res.redirect("/home_admin");
})
  
app.get("/update", (req, res) => {
    res.render("update"); // Assuming you have a "logout.ejs" view
});
app.get("/delete", (req, res) => {
    res.render("delete"); // Assuming you have a "logout.ejs" view
});
app.get("/home_admin",(req,res)=>{
    res.render("home_admin");
})
app.get("/home_user",(req,res)=>{
    res.render("home_user");
})
// ... (existing code)
app.get('/display', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.render('display', { users }); // Render the HTML template with user data
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred.');
    }
});
// app.delete("/users/:email", async (req, res) => {
//     try {
//         const email = req.params.email;
//         // Use Mongoose to delete the user from the database
//         const result = await User.findOneAndDelete({ email: email });
//         if (!result) {
//             return res.status(404).send("User not found");
//         }
//         res.status(200).send("User deleted successfully");
//     } catch (err) {
//         res.status(500).send("Internal server error");
//     }
// });
app.get("/delete",(req,res)=>{
    res.render("delete");
})
app.get("/forgot",(req,res)=>{
    res.render("forgot");
})
app.post("/forgot",async(req,res)=>{
    const {email,password,Cpassword}=req.body;
    if(password!=Cpassword){
        return res.render("forgot",{message:"Password is not matched"});
    }
    else{
        const user = await User.find({ email });
        user.password=password;
        return res.render("login");
    }
})
app.post("/delete",async(req,res)=>{
    try {
        const email = req.body.email;
        // Use Mongoose to delete the user from the database
        const result = await User.findOneAndDelete({ email: email });
        if (!result) {
            return res.status(404).send("User not found");
        }
        res.status(200).send("User deleted successfully");
        return res.render("delete",{message:"User deleted succesfully"})
    } catch (err) {
        res.status(500).send("Internal server error");
    }
})
app.get("/register", (req, res) => {
    res.render("register"); // Assuming you have a "register.ejs" view
});
app.post("/register", async (req, res) => {
    const { name, email,password,userType } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        return res.render("register",{message:"User already exists"});
    }
    user = await User.create({
        name,
        email,
        password,
        userType
    });
    const token = jwt.sign({ _id: user._id }, "sjdtfwgwkec");
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });
    // After successful registration, redirect back to the login page
    res.redirect("/login");
});
app.listen(5000, () => {
    console.log("Server is working");
});