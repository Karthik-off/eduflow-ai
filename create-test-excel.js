import * as XLSX from 'xlsx';

// Create test student data
const testStudents = [
  {
    'Roll Number': 'TEST001',
    'Full Name': 'John Smith',
    'Email': 'john.smith@test.com',
    'Phone': '+1234567890',
    'Department': 'Computer Science',
    'Year': '1st'
  },
  {
    'Roll Number': 'TEST002',
    'Full Name': 'Jane Johnson',
    'Email': 'jane.johnson@test.com',
    'Phone': '+1234567891',
    'Department': 'Computer Science',
    'Year': '1st'
  },
  {
    'Roll Number': 'TEST003',
    'Full Name': 'Bob Wilson',
    'Email': 'bob.wilson@test.com',
    'Phone': '+1234567892',
    'Department': 'Information Technology',
    'Year': '2nd'
  }
];

// Create workbook
const ws = XLSX.utils.json_to_sheet(testStudents);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Students');

// Save file
XLSX.writeFile(wb, 'test_students.xlsx');

console.log('Test Excel file created: test_students.xlsx');
