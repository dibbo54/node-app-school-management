const express = require("express");
const morgan = require("morgan");
const adminRouter = require("../routes/staff/adminRouter");

const {
    globalErrHandler,
    notFoundErr,
  } = require("../middlewares/globalErrHandler");
const academicYearRouter = require("../routes/academics/academicYear");
const academicTermRouter = require("../routes/academics/academicTerm");
const ClassLevel = require("../model/Academic/ClassLevel");
const classLevelRouter = require("../routes/academics/classLevel");
const programRouter = require("../routes/academics/program");
const subjectRouter = require("../routes/academics/subjects");
const yearGroupRouter = require("../routes/academics/yearGroups");
const teachersRouter = require("../routes/staff/teachers");

const examRouter = require("../routes/academics/examRoutes");
const studentRouter = require("../routes/staff/student");
const questionsRouter= require("../routes/academics/questionRoutes");

// require("../routes/academics/examResultRouter");

const examResultRouter=require("../routes/academics/examRsultsRoute");




const app = express();

//Middlewares
app.use(morgan("dev"));
app.use(express.json()); //pass incoming json data

//Routes
//admin register
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/academic-years", academicYearRouter);
app.use("/api/v1/academic-terms", academicTermRouter);
app.use("/api/v1/class-levels", classLevelRouter);
app.use("/api/v1/programs", programRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/year-groups", yearGroupRouter);
app.use("/api/v1/teachers", teachersRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/questions", questionsRouter);
app.use("/api/v1/exam-results", examResultRouter);







//programRouter





//academicte

//academicTermRouter

//academicYearRouter



//Error middlewares
app.use(notFoundErr);
app.use(globalErrHandler);

module.exports = app;
