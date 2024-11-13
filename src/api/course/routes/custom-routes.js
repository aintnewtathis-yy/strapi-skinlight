module.exports = {
  routes: [
    {
      method: "GET",
      path: "/getCourseData", 
      handler: "course.getCourseData",
    },
    {
      method: "GET",
      path: "/getAllCourses", 
      handler: "course.getAllCourses",
    },
    {
      method: "POST",
      path: "/sendCourseAttendantToAdmin", 
      handler: "course.sendCourseAttendantToAdmin",
    },
  ],
};
