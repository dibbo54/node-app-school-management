const AysncHandler = require("express-async-handler");
const Teacher = require("../../model/Staff/Teacher");
const { hashPassword, isPassMatched } = require("../../utils/helpers");
const generateToken = require("../../utils/generateToken");
const Admin = require("../../model/Staff/Admin");
//@desc  Admin Register Teacher
//@route POST /api/teachers/admin/register
//@acess  Private

exports.adminRegisterTeacher = AysncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  //find the admin
  const adminFound = await Admin.findById(req.userAuth._id);
  
  if (!adminFound) {
    throw new Error("Admin not found");
  }
  //check if teacher already exists
  const teacher = await Teacher.findOne({ email });
  if (teacher) {
    throw new Error("Teacher already employed");
  }
  //Hash password
  const hashedPassword = await hashPassword(password);
  // create
  const teacherCreated = await Teacher.create({
    name,
    email,
    password: hashedPassword,
  });
  //push teacher into admin
  adminFound.teachers.push(teacherCreated?._id);
  await adminFound.save();
  //send teacher data
  res.status(201).json({
    status: "success",
    message: "Teacher registered successfully",
    data: teacherCreated,
  });
});


exports.loginTeacher = AysncHandler(async (req, res) => {
  const { email, password } = req.body;
  //find the  user
  const teacher = await Teacher.findOne({ email });
  if (!teacher) {
    return res.json({ message: "Invalid login crendentials" });
  }
  //verify the password
  const isMatched = await isPassMatched(password, teacher.password);
  if (!isMatched) {
    return res.json({ message: "Invalid login crendentials" });
  } else {
    res.status(200).json({
      status: "success",
      message: "Teacher logged in successfully",
      data: generateToken(teacher._id),
    });

    
  }
});

// exports.getAllTeachersAdmin = AysncHandler(async (req, res) => {
//   const teachers = await Teacher.find();
//   res.status(200).json({
//     status: "success",
//     message: "Teachers fetched successfully",
//     data: teachers,
//   });
// });

// exports.getAllTeachersAdmin = AysncHandler(async (req, res) => {
//   // Extracting pagination parameters from request query
//   const page = parseInt(req.query.page) || 1; // default page 1 if not provided
//   const limit = parseInt(req.query.limit) || 10; // default limit 10 if not provided

//   // Calculate the starting index of the teachers to be returned
//   const startIndex = (page - 1) * limit;

//   // Calculate the ending index of the teachers to be returned
//   const endIndex = page * limit;

//   // Query database to get total count of teachers
//   const totalTeachers = await Teacher.countDocuments();

//   // Fetch teachers for the current page
//   const teachers = await Teacher.find().skip(startIndex).limit(limit);

//   // Construct response object
//   const response = {
//     status: "success",
//     message: "Teachers fetched successfully",
//     currentPage: page,
//     totalTeachers: totalTeachers,
//     totalPages: Math.ceil(totalTeachers / limit),
//     data: teachers,
//   };

//   // Check if there's a next page
//   if (endIndex < totalTeachers) {
//     response.nextPage = page + 1;
//   }

//   // Check if there's a previous page
//   if (startIndex > 0) {
//     response.prevPage = page - 1;
//   }

//   res.status(200).json(response);
// });

exports.getAllTeachersAdmin = AysncHandler(async (req, res) => {
  // Extracting pagination parameters from request query
  const page = parseInt(req.query.page) || 1; // default page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // default limit 10 if not provided

  // Extracting filtering parameters from request query
  const filters = {};

  // Example: Filtering by teacher's name
  if (req.query.name) {
    filters.name = { $regex: new RegExp(req.query.name, "i") }; // Case-insensitive regex match
  }

  // Calculate the starting index of the teachers to be returned
  const startIndex = (page - 1) * limit;

  // Query database to get total count of teachers with applied filters
  const totalTeachers = await Teacher.countDocuments(filters);

  // Fetch teachers for the current page with applied filters
  const teachers = await Teacher.find(filters).skip(startIndex).limit(limit);

  // Construct response object
  const response = {
    status: "success",
    message: "Teachers fetched successfully",
    currentPage: page,
    totalTeachers: totalTeachers,
    totalPages: Math.ceil(totalTeachers / limit),
    data: teachers,
  };

  // Check if there's a next page
  if (startIndex + limit < totalTeachers) {
    response.nextPage = page + 1;
  }

  // Check if there's a previous page
  if (startIndex > 0) {
    response.prevPage = page - 1;
  }

  res.status(200).json(response);
});




exports.getTeacherByAdmin = AysncHandler(async (req, res) => {
  const teacherID = req.params.teacherID;
  //find the teacher
  const teacher = await Teacher.findById(teacherID).populate("examsCreated");
  if (!teacher) {
    throw new Error("Teacher not found");
  }
  res.status(200).json({
    status: "success",
    message: "Teacher fetched successfully",
    data: teacher,
  });
});


exports.getTeacherProfile = AysncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.userAuth?._id).select(
    "-password -createdAt -updatedAt"
  );
  if (!teacher) {
    throw new Error("Teacher not found");
  }
  res.status(200).json({
    status: "success",
    data: teacher,
    message: "Teacher Profile fetched  successfully",
  });
});


//@desc    Teacher updating profile admin
//@route    UPDATE /api/v1/teachers/:teacherID/update
//@access   Private Teacher only

exports.teacherUpdateProfile = AysncHandler(async (req, res) => {
  const { email, name, password } = req.body;
  //if email is taken
  const emailExist = await Teacher.findOne({ email });
  if (emailExist) {
    throw new Error("This email is taken/exist");
  }

  

  //hash password
  //check if user is updating password

  const teacherID = req.params.teacherID;
  //const teacherID = req.params.teacherID;
  //find the teacher
  const teacher = await Teacher.findById(teacherID);
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if(teacherID == req.userAuth._id){
    if (password) {
      //update
      const teacher = await Teacher.findByIdAndUpdate(
        req.userAuth._id,
        {
          email,
          password: await hashPassword(password),
          name,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json({
        status: "success",
        data: teacher,
        message: "Teacher updated successfully",
      });
    } else {
      //update
      const teacher = await Teacher.findByIdAndUpdate(
        req.userAuth._id,
        {
          email,
          name,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(200).json({
        status: "success",
        data: teacher,
        message: "Teacher updated successfully",
      });
    }
  }else {
    throw new Error("Teacher not found");
  }


 
});

//@desc     Admin updating Teacher profile
//@route    UPDATE /api/v1/teachers/:teacherID/admin
//@access   Private Admin only

exports.adminUpdateTeacher = AysncHandler(async (req, res) => {
  const { program, classLevel, academicYear, subject } = req.body;
  //if email is taken
  const teacherFound = await Teacher.findById(req.params.teacherID);
  if (!teacherFound) {
    throw new Error("Teacher not found");
  }
  //Check if teacher is withdrawn
  if (teacherFound.isWitdrawn) {
    throw new Error("Action denied, teacher is withdraw");
  }
  //assign a program
  if (program) {
    teacherFound.program = program;
    await teacherFound.save();
    res.status(200).json({
      status: "success",
      data: teacherFound,
      message: "Teacher updated successfully",
    });
  }

  //assign Class level
  if (classLevel) {
    teacherFound.classLevel = classLevel;
    await teacherFound.save();
    res.status(200).json({
      status: "success",
      data: teacherFound,
      message: "Teacher updated successfully",
    });
  }

  //assign Academic year
  if (academicYear) {
    teacherFound.academicYear = academicYear;
    await teacherFound.save();
    res.status(200).json({
      status: "success",
      data: teacherFound,
      message: "Teacher updated successfully",
    });
  }

  //assign subject
  if (subject) {
    teacherFound.subject = subject;
    await teacherFound.save();
    res.status(200).json({
      status: "success",
      data: teacherFound,
      message: "Teacher updated successfully",
    });
  }
});
