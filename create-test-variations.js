import * as XLSX from 'xlsx';

// Create test student data with various column name variations
const testStudentsVariations = [
  {
    'RollNo': 'VAR001',
    'Name': 'Alice Johnson',
    'Email ID': 'alice.j@test.com',
    'Mobile': '+1234567890',
    'Dept': 'Computer Science',
    'Academic Year': '1st'
  },
  {
    'Register Number': 'VAR002',
    'Student Name': 'Bob Smith',
    'Email': 'bob.smith@test.com',
    'Mobile Number': '+1234567891',
    'Department': 'Information Technology',
    'Year': '2nd'
  },
  {
    'Reg No': 'VAR003',
    'Full Name': 'Carol Davis',
    'Email ID': 'carol.d@test.com',
    'Phone': '+1234567892',
    'Dept': 'Computer Science',
    'Academic Year': '3rd'
  },
  {
    'Roll Number': 'VAR004',
    'Name': 'David Wilson',
    'Email': 'david.w@test.com',
    'Mobile Number': '+1234567893',
    'Department': 'Mechanical Engineering',
    'Year': '1st'
  },
  {
    'RollNo': 'VAR005',
    'Student Name': 'Emma Brown',
    'Email ID': 'emma.b@test.com',
    'Phone': '+1234567894',
    'Dept': 'Electronics & Communication',
    'Academic Year': '2nd'
  }
];

// Create workbook
const ws = XLSX.utils.json_to_sheet(testStudentsVariations);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Students');

// Save file
XLSX.writeFile(wb, 'test_students_variations.xlsx');

console.log('Test Excel file with column variations created: test_students_variations.xlsx');
