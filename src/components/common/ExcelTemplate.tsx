import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelTemplateProps {
  type: 'students' | 'marks';
  onClose: () => void;
}

const ExcelTemplate = ({ type, onClose }: ExcelTemplateProps) => {
  const downloadTemplate = () => {
    if (type === 'students') {
      // Create student template
      const studentData = [
        {
          'Roll Number': 'CS001',
          'Full Name': 'John Doe',
          'Email': 'john.doe@example.com',
          'Phone': '+1234567890',
          'Department': 'Computer Science',
          'Year': '1st'
        },
        {
          'Roll Number': 'CS002',
          'Full Name': 'Jane Smith',
          'Email': 'jane.smith@example.com',
          'Phone': '+1234567891',
          'Department': 'Computer Science',
          'Year': '1st'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(studentData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, 'student_template.xlsx');
    } else {
      // Create marks template
      const marksData = [
        {
          'Roll Number': 'CS001',
          'Full Name': 'John Doe',
          'Subject': 'Computer Science Fundamentals',
          'Marks': 85,
          'Max Marks': 100,
          'Exam Type': 'Mid Term'
        },
        {
          'Roll Number': 'CS002',
          'Full Name': 'Jane Smith',
          'Subject': 'Computer Science Fundamentals',
          'Marks': 92,
          'Max Marks': 100,
          'Exam Type': 'Mid Term'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(marksData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Marks');
      XLSX.writeFile(wb, 'marks_template.xlsx');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Excel Template - {type === 'students' ? 'Students' : 'Marks'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Required Columns:</h3>
            {type === 'students' ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Roll Number:</strong> Unique student roll number</li>
                <li>• <strong>Full Name:</strong> Student's complete name</li>
                <li>• <strong>Email:</strong> Email address (optional)</li>
                <li>• <strong>Phone:</strong> Phone number (optional)</li>
                <li>• <strong>Department:</strong> Department name</li>
                <li>• <strong>Year:</strong> Academic year (1st, 2nd, 3rd, 4th)</li>
              </ul>
            ) : (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Roll Number:</strong> Student's roll number</li>
                <li>• <strong>Full Name:</strong> Student's complete name</li>
                <li>• <strong>Subject:</strong> Subject name</li>
                <li>• <strong>Marks:</strong> Obtained marks</li>
                <li>• <strong>Max Marks:</strong> Maximum possible marks</li>
                <li>• <strong>Exam Type:</strong> Assignment, Quiz, Mid Term, Final Exam</li>
              </ul>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Download this template to see the exact format required for Excel uploads.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelTemplate;
