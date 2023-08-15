const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUER,

};



const app = express()
const coursesRouter = require('./routes/courses')
const { auth } = require('express-openid-connect');
app.use(express.static("public"));
app.use("/css", express.static(__dirname + 'public/css'))

app.set("views", "views")
app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(auth(config));


app.listen(3000, () => {
    console.log("Listening on port 3000")
})


mongoose.connect(process.env.URL)
    .then(() => {
        console.log("Connected to db")
    })


app.get("/", (req, res) => {
    res.render("index", { isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
})

app.use(coursesRouter)
