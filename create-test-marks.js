import * as XLSX from 'xlsx';

// Create test marks data
const testMarksData = [
  {
    'Roll Number': 'STU001',
    'Full Name': 'Alice Johnson',
    'Subject': 'Computer Science Fundamentals',
    'Marks': 85,
    'Max Marks': 100,
    'Exam Type': 'Mid Term'
  },
  {
    'Roll Number': 'STU002',
    'Full Name': 'Bob Smith',
    'Subject': 'Data Structures',
    'Marks': 78,
    'Max Marks': 100,
    'Exam Type': 'Mid Term'
  },
  {
    'Roll Number': 'STU003',
    'Full Name': 'Carol Davis',
    'Subject': 'Computer Science Fundamentals',
    'Marks': 92,
    'Max Marks': 100,
    'Exam Type': 'Assignment'
  },
  {
    'Roll Number': 'STU004',
    'Full Name': 'David Wilson',
    'Subject': 'Algorithms',
    'Marks': 88,
    'Max Marks': 100,
    'Exam Type': 'Final'
  },
  {
    'Roll Number': 'STU005',
    'Full Name': 'Emma Brown',
    'Subject': 'Data Structures',
    'Marks': 95,
    'Max Marks': 100,
    'Exam Type': 'Assignment'
  }
];

// Create workbook
const ws = XLSX.utils.json_to_sheet(testMarksData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Marks');

// Save file
XLSX.writeFile(wb, 'test_marks.xlsx');

console.log('Test marks Excel file created: test_marks.xlsx');
