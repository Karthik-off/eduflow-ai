import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { FileText, Bell } from "lucide-react";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import LoginPage from "./pages/LoginPage";
// SignUpPage removed — students are provisioned by class teachers only
import StaffLoginPage from "./pages/StaffLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSignUpPage from "./pages/AdminSignUpPage";
import StudentDashboard from "./pages/StudentDashboardFixed";
import StaffDashboard from "./pages/StaffDashboard";
import StaffClassDetailPage from "./pages/StaffClassDetailPage";
import StaffSubjectPage from "./pages/StaffSubjectPage";
import StaffAttendancePage from "./pages/StaffAttendancePage";
import StaffStudentManagement from "./pages/StaffStudentManagement";
import StaffMarksEntry from "./pages/StaffMarksEntry";
import StaffAcademicCalendar from "./pages/StaffAcademicCalendar";
import StaffTimetableManagement from "./pages/StaffTimetableManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClassDetailPage from "./pages/AdminClassDetailPage";
import AcademicsPage from "./pages/AcademicsPageFixed";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import FeesPage from "./pages/FeesPageFixed";
import AttendancePage from "./pages/AttendancePageFixed";
import StudentProfilePage from "./pages/StudentProfilePageFixed";
import AIAssistantPage from "./pages/AIAssistantPageFixed";
import ExamsPage from "./pages/ExamsPageFixed";
import AlertsPage from "./pages/AlertsPageFixed";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

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
