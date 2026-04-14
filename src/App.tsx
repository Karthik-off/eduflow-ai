import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from "react";
import { useAuthStore } from '@/stores/authStore';
import '@/utils/simpleStaffAuthFix'; // Import staff auth utilities
import { FileText, Bell } from "lucide-react";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import LoginPage from "./pages/LoginPage";
// SignUpPage removed — students are provisioned by class teachers only
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffAuthFixPage from "./pages/StaffAuthFixPage"; // Add this line
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSignUpPage from "./pages/AdminSignUpPage";
import StudentDashboard from "./pages/StudentDashboardNew";
import StaffDashboard from "./pages/StaffDashboard";
import StaffClassDetailPage from "./pages/StaffClassDetailPage";
import StaffSubjectPage from "./pages/StaffSubjectPage";
import StaffAttendancePage from "./pages/StaffAttendancePage";
import StaffStudentManagement from "./pages/StaffStudentManagement";
import StaffMarksEntry from "./pages/StaffMarksEntry";
import StaffAcademicCalendar from "./pages/StaffAcademicCalendar";
import StaffTimetableManagement from "./pages/StaffTimetableManagement";
import StaffAIAssistantPage from "./pages/StaffAIAssistantPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClassDetailPage from "./pages/AdminClassDetailPage";
import AdminStaffManagement from "./pages/AdminStaffManagement";
import AdminStudents from "./pages/AdminStudents";
import AdminClasses from "./pages/AdminClasses";
import AdminTimetable from "./pages/AdminTimetable";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AcademicsPage from "./pages/AcademicsPageFixed";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import FeesPage from "./pages/FeesPageFixed";
import AttendancePage from "./pages/AttendancePageFixed";
import StudentProfilePage from "./pages/StudentProfilePageFixed";
import AIAssistantPage from "./pages/AIAssistantPageFixed";
import AdminAIAssistantPage from "./pages/AdminAIAssistantPage";
import ExamsPage from "./pages/ExamsPageFixed";
import AlertsPage from "./pages/AlertsPageFixed";
import SettingsPage from "./pages/SettingsPage";
import StaffDebugPage from "./pages/StaffDebugPage";
import CreateStaffPage from "./pages/CreateStaffPage";
import StaffLoginDebugPage from "./pages/StaffLoginDebugPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import CreateStaffUsers from "./utils/CreateStaffUsers";
import CreateAdminUser from "./utils/CreateAdminUser";

const queryClient = new QueryClient();

const RoleBasedRedirect = () => {
  const { user, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  switch (role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'student':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

const AppRoutes = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Student auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />

        {/* Staff auth */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignUpPage />} />

        {/* Debug route */}
        <Route path="/debug/staff" element={<StaffDebugPage />} />
        <Route path="/debug/create-staff" element={<CreateStaffPage />} />
        <Route path="/debug/staff-login" element={<StaffLoginDebugPage />} />
        <Route path="/debug/staff-auth-fix" element={<StaffAuthFixPage />} />

        {/* Student routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academics" element={
          <ProtectedRoute requiredRole="student">
            <AcademicsPage />
          </ProtectedRoute>
        } />
        <Route path="/academics/:subjectId" element={
          <ProtectedRoute requiredRole="student">
            <SubjectDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute requiredRole="student">
            <AttendancePage />
          </ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute requiredRole="student">
            <ExamsPage />
          </ProtectedRoute>
        } />
        <Route path="/fees" element={
          <ProtectedRoute requiredRole="student">
            <FeesPage />
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute requiredRole="student">
            <AlertsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requiredRole="student">
            <StudentProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/ai-assistant" element={
          <ProtectedRoute requiredRole="student">
            <AIAssistantPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requiredRole="student">
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        {/* Staff routes */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute requiredRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/class/:sectionId" element={
          <ProtectedRoute requiredRole="staff">
            <StaffClassDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/staff/subject/:sectionId/:subjectId" element={
          <ProtectedRoute requiredRole="staff">
            <StaffSubjectPage />
          </ProtectedRoute>
        } />
        <Route path="/staff/attendance" element={
          <ProtectedRoute requiredRole="staff">
            <StaffAttendancePage />
          </ProtectedRoute>
        } />
        <Route path="/staff/students" element={
          <ProtectedRoute requiredRole="staff">
            <StaffStudentManagement />
          </ProtectedRoute>
        } />
        <Route path="/staff/marks" element={
          <ProtectedRoute requiredRole="staff">
            <StaffMarksEntry />
          </ProtectedRoute>
        } />
        <Route path="/staff/calendar" element={
          <ProtectedRoute requiredRole="staff">
            <StaffAcademicCalendar />
          </ProtectedRoute>
        } />
        <Route path="/staff/timetable" element={
          <ProtectedRoute requiredRole="staff">
            <StaffTimetableManagement />
          </ProtectedRoute>
        } />
        <Route path="/staff/ai-assistant" element={
          <ProtectedRoute requiredRole="staff">
            <StaffAIAssistantPage />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/class/:sectionId" element={
          <ProtectedRoute requiredRole="admin">
            <AdminClassDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/create-staff-users" element={
          <ProtectedRoute requiredRole="admin">
            <CreateStaffUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute requiredRole="admin">
            <AdminStaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute requiredRole="admin">
            <AdminStudents />
          </ProtectedRoute>
        } />
        <Route path="/admin/classes" element={
          <ProtectedRoute requiredRole="admin">
            <AdminClasses />
          </ProtectedRoute>
        } />
        <Route path="/admin/timetable" element={
          <ProtectedRoute requiredRole="admin">
            <AdminTimetable />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <AdminReports />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/ai-assistant" element={
          <ProtectedRoute requiredRole="admin">
            <AdminAIAssistantPage />
          </ProtectedRoute>
        } />

        {/* Public routes for setup */}
        <Route path="/setup/admin" element={<CreateAdminUser />} />
        <Route path="/setup/staff" element={<CreateStaffUsers />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DarkModeProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </DarkModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
