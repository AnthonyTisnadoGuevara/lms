import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecoverPassword from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";
import AssignStudents from "./pages/AssignStudents";
// Admin
import DashboardAdmin from "./pages/DashboardAdmin";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import ManageRoles from "./pages/ManageRoles";
import AssignTeacher from "./pages/AssignTeacher"; // ✅ EXISTE en tu carpeta

// Docente
import DashboardDocente from "./pages/DashboardDocente";
import TeacherSessions from "./pages/TeacherSessions";
import TeacherHomeworks from "./pages/TeacherHomeworks";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherGrades from "./pages/TeacherGrades";

// Estudiante
import DashboardStudent from "./pages/DashboardStudent";
import StudentSessions from "./pages/StudentSessions";
import StudentHomeworks from "./pages/StudentHomeworks";
import StudentSubmit from "./pages/StudentSubmit";
import StudentGrades from "./pages/StudentGrades";

// Protección
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =======================
                AUTH
        ======================= */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* =======================
                ADMIN
        ======================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/create-course"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assign-students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssignStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-course/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageRoles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assign-teacher"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssignTeacher />
            </ProtectedRoute>
          }
        />

        {/* =======================
               DOCENTE
        ======================= */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["docente"]}>
              <DashboardDocente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/sessions/:courseId"
          element={
            <ProtectedRoute allowedRoles={["docente"]}>
              <TeacherSessions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/homeworks/:courseId"
          element={
            <ProtectedRoute allowedRoles={["docente"]}>
              <TeacherHomeworks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/grades/:homeworkId"
          element={
            <ProtectedRoute allowedRoles={["docente"]}>
              <TeacherGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students/:courseId"
          element={
            <ProtectedRoute allowedRoles={["docente"]}>
              <TeacherStudents />
            </ProtectedRoute>
          }
        />

        {/* =======================
               ESTUDIANTE
        ======================= */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["estudiante"]}>
              <DashboardStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/sessions/:courseId"
          element={
            <ProtectedRoute allowedRoles={["estudiante"]}>
              <StudentSessions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/homeworks/:courseId"
          element={
            <ProtectedRoute allowedRoles={["estudiante"]}>
              <StudentHomeworks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/submit/:homeworkId"
          element={
            <ProtectedRoute allowedRoles={["estudiante"]}>
              <StudentSubmit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/grades/:courseId"
          element={
            <ProtectedRoute allowedRoles={["estudiante"]}>
              <StudentGrades />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
