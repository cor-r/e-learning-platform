const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('dotenv').config()
const methodOverride = require('method-override');


const newCourseSchema = new mongoose.Schema({
    instructor: {
        type: String,
        required: true
    },
    instructorName: {
        type: String,
        required: true,
    },
    instructorImage: {
        type: String,
        required: true
    },
    courseID: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    members: {
        type: Array,
        of: String,
        default: []
    },
    date: {
        type: String
    }
})

const Blog = mongoose.model('Courses', newCourseSchema);



router.get("/courses", async (req, res) => {

    const isAdmin = (process.env.ADMINS).includes(req.oidc.user.sub);
    let allCourses;

    if (isAdmin && req.oidc.isAuthenticated()) {
        allCourses = await Blog.find({ instructor: req.oidc.user.sid });
    } else if (req.oidc.isAuthenticated()) {
        allCourses = await Blog.find({ members: req.oidc.user.email });
    } else {
        console.log("error")
        res.redirect("/")
    }


    res.render("courses", {
        title: "Express Demo",
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
        isAdmin: isAdmin,
        allCourses: allCourses
    })



})


router.get("/courses/delete/:courseId", async (req, res) => {
    try {

        const courseId = decodeURIComponent(req.params.courseId);
        await Blog.findOneAndDelete({ courseID: courseId });
        res.redirect('/courses');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course.');
    }
})

router.post("/courses/invite/:courseId", async (req, res) => {
    try {

        const courseId = decodeURIComponent(req.params.courseId);
        await Blog.findOneAndUpdate({ courseID: courseId }, { $push: { members: req.body.userEmail } });
        res.redirect('/courses');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course.');
    }
})

router.post("/courses/join/:userEmail", async (req, res) => {
    try {

        const courseId = decodeURIComponent(req.body.classCode);
        await Blog.findOneAndUpdate({ courseID: courseId }, { $push: { members: req.params.userEmail } });

        res.redirect('/courses');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course.');
    }
})


router.get("/courses/leave/:classCode", async (req, res) => {
    try {
        const courseId = decodeURIComponent(req.params.classCode);
        await Blog.findOneAndUpdate({ courseID: courseId }, { $pull: { members: req.oidc.user.email } });
        res.redirect('/courses');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error leaving course.');
    }
})

router.get("/courses/edit/:courseId", async (req, res) => {
    try {
        const course = await Blog.findOne({ courseID: req.params.courseId });

        res.render("editCourse", { course: course })

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course.');
    }
})

router.post("/courses/edit/:courseId", async (req, res) => {
    try {
        const course = await Blog.findOneAndUpdate({ courseID: req.params.courseId }, { $set: { courseName: req.body.newName, description: req.body.newDesc } }, { new: true });
        res.redirect("/courses")

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course.');
    }
})

router.get("/courses/course/:courseId", async (req, res) => {
    try {
        const course = await Blog.findOne({ courseID: req.params.courseId });


        res.render("coursePage", { course: course })

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting course.');
    }
})



router.post("/courses", (req, res) => {
    const newCourse = [{
        instructor: req.oidc.user.sid,
        instructorName: req.oidc.user.nickname,
        instructorImage: req.oidc.user.picture,
        courseID: generateRandomId(9),
        courseName: req.body.courseName,
        description: req.body.courseDesc,
        date: formatDate(Date.now())
    }]


    Blog.create(newCourse)


    res.redirect("/courses")
})



function formatDate(timestamp) {
    const date = new Date(timestamp);

    var month = date.getMonth() + 1; // Months are zero-based, so add 1
    var day = date.getDate();
    var year = date.getFullYear();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }

    return `${month}/${day}/${year}`;
}



function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const idLength = length || 9;
    let id = '';

    for (let i = 0; i < idLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters.charAt(randomIndex);
    }

    return id;
}

module.exports = router;