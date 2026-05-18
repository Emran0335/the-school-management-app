import { createBrowserRouter } from "react-router";
import Home from "../Home";
import Login from "../Login";
import PrivateRoutes from "./PrivateRoutes";
import Dashboard from "../Dashboard";
import AcademicYear from "../settings/academic-year";
import UserManagementPage from "../users";
import Classes from "../academics/Classes";
import Subjects from "../academics/Subjects";
import Timetable from "../academics/Timetable";
import Exams from "../lms/Exams";
import Exam from "../lms/Exam";

export const router = createBrowserRouter([
  {
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      {
        element: <PrivateRoutes />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "activities-log", element: <Dashboard /> },
          { path: "settings/academic-years", element: <AcademicYear /> },
          {
            path: "users/students",
            element: (
              <UserManagementPage
                role="student"
                title="Students"
                description="Manage student directory and class assignments."
              />
            ),
          },
          {
            path: "users/teachers",
            element: (
              <UserManagementPage
                role="teacher"
                title="Teachers"
                description="Manage teaching staff"
              />
            ),
          },
          {
            path: "users/parents",
            element: (
              <UserManagementPage
                role="parents"
                title="Parents"
                description="Manage parents"
              />
            ),
          },
          {
            path: "users/admins",
            element: (
              <UserManagementPage
                role="admin"
                title="Admins"
                description="Manage admins"
              />
            ),
          },
          {
            path: "classes",
            element: <Classes />,
          },
          {
            path: "subjects",
            element: <Subjects />,
          },
          {
            path: "timetable",
            element: <Timetable />,
          },
          {
            path: "lms/exams",
            element: <Exams />,
          },
          {
            path: "lms/exams/:id",
            element: <Exam />,
          },
        ],
      },
    ],
  },
]);
