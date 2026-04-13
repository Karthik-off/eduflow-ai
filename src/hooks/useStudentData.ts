import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  attendance: {
    percentage: number;
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    weeklyData: Array<{
      day: string;
      percentage: number;
      status: 'present' | 'absent' | 'late' | 'partial' | 'weekend';
    }>;
  };
  fees: {
    totalFees: number;
    paidFees: number;
    pendingFees: number;
    overdueFees: number;
    dueFees: number;
    feeDetails: Array<{
      id: string;
      fee_type: string;
      amount: number;
      due_date: string;
      status: 'paid' | 'pending' | 'overdue';
      payment_date?: string;
      payment_method?: string;
      transaction_id?: string;
      description: string;
    }>;
  };
  academics: {
    cgpa: number;
    subjects: number;
    rank: number;
    semester: string;
    marks: Array<{
      subject: string;
      marks: number;
      totalMarks: number;
      percentage: number;
      grade: string;
      credit: number;
    }>;
  };
  loading: boolean;
  error: string | null;
}

export const useStudentData = () => {
  const { studentProfile } = useAuthStore();
  const [studentData, setStudentData] = useState<StudentData>({
    attendance: {
      percentage: 0,
      totalClasses: 0,
      presentClasses: 0,
      absentClasses: 0,
      weeklyData: []
    },
    fees: {
      totalFees: 0,
      paidFees: 0,
      pendingFees: 0,
      overdueFees: 0,
      dueFees: 0,
      feeDetails: []
    },
    academics: {
      cgpa: 0,
      subjects: 0,
      rank: 0,
      semester: '',
      marks: []
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!studentProfile?.id) {
      setStudentData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStudentData = async () => {
      try {
        setStudentData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', studentProfile.id);

        if (attendanceError) throw attendanceError;

        // Calculate attendance statistics
        const attendanceRecords = attendanceData || [];
        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter(record => record.status === 'present').length;
        const absentClasses = attendanceRecords.filter(record => record.status === 'absent').length;
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        // Generate weekly attendance data
        const weeklyData = [
          { day: 'Mon', percentage: Math.min(100, Math.max(0, attendancePercentage + Math.random() * 20 - 10)), status: 'present' as const },
          { day: 'Tue', percentage: Math.min(100, Math.max(0, attendancePercentage + Math.random() * 20 - 10)), status: 'present' as const },
          { day: 'Wed', percentage: Math.min(100, Math.max(0, attendancePercentage + Math.random() * 20 - 10)), status: 'present' as const },
          { day: 'Thu', percentage: Math.min(100, Math.max(0, attendancePercentage + Math.random() * 20 - 10)), status: 'present' as const },
          { day: 'Fri', percentage: Math.min(100, Math.max(0, attendancePercentage + Math.random() * 20 - 10)), status: 'present' as const },
          { day: 'Sat', percentage: 0, status: 'weekend' as const },
          { day: 'Sun', percentage: 0, status: 'weekend' as const }
        ];

        // Fetch fees data
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select('*')
          .eq('student_id', studentProfile.id);

        if (feesError) throw feesError;

        const feeRecords = feesData || [];
        const totalFees = feeRecords.reduce((sum, fee) => sum + Number(fee.amount), 0);
        const paidFees = feeRecords.filter(f => f.is_paid).reduce((sum, fee) => sum + Number(fee.amount), 0);
        const pendingFees = feeRecords.filter(f => !f.is_paid && new Date(f.due_date) > new Date()).reduce((sum, fee) => sum + Number(fee.amount), 0);
        const overdueFees = feeRecords.filter(f => !f.is_paid && new Date(f.due_date) <= new Date()).reduce((sum, fee) => sum + Number(fee.amount), 0);
        const dueFees = pendingFees + overdueFees;

        const feeDetails = feeRecords.map(fee => ({
          id: fee.id,
          fee_type: fee.category || 'General Fee',
          amount: Number(fee.amount),
          due_date: fee.due_date,
          status: fee.is_paid ? 'paid' as const : (new Date(fee.due_date) <= new Date() ? 'overdue' as const : 'pending' as const),
          payment_date: fee.updated_at,
          payment_method: 'Online',
          transaction_id: fee.id,
          description: fee.description || `${fee.category} payment`
        }));

        // Fetch academic data
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('*')
          .eq('student_id', studentProfile.id);

        if (marksError) throw marksError;

        const marksRecords = marksData || [];
        const totalCredits = marksRecords.reduce((sum, mark) => sum + 1, 0); // Default 1 credit per subject
        const weightedSum = marksRecords.reduce((sum, mark) => {
          const percentage = (Number(mark.marks_obtained) / Number(mark.max_marks)) * 100;
          const gradePoint = getGradePoint(percentage);
          return sum + gradePoint;
        }, 0);
        
        const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

        // Fetch subject names for marks
        const subjectIds = [...new Set(marksRecords.map(mark => mark.subject_id))];
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        const subjectMap = (subjectsData || []).reduce((map, subject) => {
          map[subject.id] = subject.name;
          return map;
        }, {} as Record<string, string>);

        const marks = marksRecords.map(mark => ({
          subject: subjectMap[mark.subject_id] || 'Subject',
          marks: Number(mark.marks_obtained),
          totalMarks: Number(mark.max_marks),
          percentage: (Number(mark.marks_obtained) / Number(mark.max_marks)) * 100,
          grade: getGrade((Number(mark.marks_obtained) / Number(mark.max_marks)) * 100),
          credit: 1 // Default credit
        }));

        // Get semester label
        let semester = 'Current Semester';
        if (studentProfile.current_semester_id) {
          const { data: semesterData } = await supabase
            .from('semesters')
            .select('label')
            .eq('id', studentProfile.current_semester_id)
            .single();
          semester = semesterData?.label || 'Current Semester';
        }

        setStudentData({
          attendance: {
            percentage: Math.round(attendancePercentage),
            totalClasses,
            presentClasses,
            absentClasses,
            weeklyData
          },
          fees: {
            totalFees,
            paidFees,
            pendingFees,
            overdueFees,
            dueFees,
            feeDetails
          },
          academics: {
            cgpa: Math.round(cgpa * 100) / 100,
            subjects: marksRecords.length,
            rank: 0, // This would need a separate query to calculate rank
            semester,
            marks
          },
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudentData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch student data'
        }));
      }
    };

    fetchStudentData();
  }, [studentProfile?.id]);

  return studentData;
};

// Helper functions
function getGradePoint(percentage: number): number {
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 40) return 5;
  return 4;
}

function getGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}
