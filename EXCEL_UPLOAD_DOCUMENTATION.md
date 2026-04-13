# Excel Upload Functionality - Documentation

## Overview
The Staff Module now supports Excel file uploads for both Student Management and Marks Entry. This functionality uses the `xlsx` (SheetJS) library to properly read and parse Excel files.

## Features Implemented

### 1. Student Management Excel Upload
- **File Format**: `.xlsx` and `.xls` files
- **Required Columns**:
  - Roll Number (or Roll No, rollNumber)
  - Full Name (or Name, fullName)
  - Email (optional)
  - Phone (optional)
  - Department
  - Year (1st, 2nd, 3rd, 4th)

### 2. Marks Entry Excel Upload
- **File Format**: `.xlsx` and `.xls` files
- **Required Columns**:
  - Roll Number (or Roll No, rollNumber)
  - Full Name (or Name, fullName)
  - Subject
  - Marks (obtained marks)
  - Max Marks (maximum possible marks)
  - Exam Type (Assignment, Quiz, Mid Term, Final Exam)

### 3. Excel Template Download
- Both pages now have a "Template" button
- Downloads a pre-formatted Excel file with sample data
- Shows the exact column names and format required

## Technical Implementation

### Dependencies Added
```bash
npm install xlsx
```

### Key Components

#### ExcelTemplate Component
- Location: `src/components/common/ExcelTemplate.tsx`
- Purpose: Provides downloadable Excel templates
- Features: Shows required columns and sample data

#### Updated File Upload Logic
- Uses `FileReader` API to read Excel files
- Parses with `XLSX.read()` and `XLSX.utils.sheet_to_json()`
- Flexible column mapping (accepts multiple column name variations)
- Comprehensive error handling and validation

### Error Handling
- File format validation
- Empty file detection
- Data validation with specific error messages
- Database error handling with user feedback
- Progress indicators during upload

## Usage Instructions

### For Students:
1. Click "Template" button to download the Excel template
2. Fill in student data following the format
3. Save as `.xlsx` file
4. Click "Upload Excel" and select the file
5. System will validate and import students

### For Marks:
1. Click "Template" button to download the Excel template
2. Fill in marks data following the format
3. Save as `.xlsx` file
4. Click "Upload Excel" and select the file
5. System will validate and import marks

## Validation Rules

### Student Upload:
- Roll Number: Required, must be unique
- Full Name: Required
- Email: Optional, must be valid email format
- Phone: Optional
- Department: Required, must match existing departments
- Year: Required, must be one of: 1st, 2nd, 3rd, 4th

### Marks Upload:
- Roll Number: Required, student must exist
- Full Name: Optional, for reference
- Subject: Required, subject must exist
- Marks: Required, must be numeric
- Max Marks: Required, must be numeric
- Exam Type: Required, must be valid exam type

## Error Messages

### Common Errors and Solutions:
1. **"Please upload an Excel file (.xlsx or .xls)"**
   - Solution: Ensure file has correct extension

2. **"Excel file is empty"**
   - Solution: Check that the Excel file contains data

3. **"Student not found: [Roll Number]"**
   - Solution: Ensure student exists in database (for marks upload)

4. **"Subject not found: [Subject Name]"**
   - Solution: Ensure subject exists in database

5. **"Validation errors: [details]"**
   - Solution: Check missing required fields or invalid data

## Database Integration

### Students Table
- Roll numbers are checked for uniqueness
- Department IDs are mapped from department names
- Section ID is automatically assigned based on staff assignment

### Marks Table
- Student IDs are resolved from roll numbers
- Subject IDs are resolved from subject names
- Created by field tracks which staff uploaded the marks

## Performance Considerations

- Batch processing (50 records per batch)
- Progress indicators for large files
- Memory-efficient file reading
- Error recovery continues processing other records

## Security Features

- File type validation
- Data sanitization
- SQL injection prevention through parameterized queries
- Staff authentication required for uploads

## Future Enhancements

- Support for multiple worksheets
- Bulk delete functionality
- Import preview before final submission
- Export functionality for existing data
- Real-time validation during upload
