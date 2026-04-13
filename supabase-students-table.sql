-- Create students table for Excel upload data
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    department VARCHAR(255),
    year VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);

-- Add RLS (Row Level Security) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all students
CREATE POLICY "Users can view all students" ON students
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert students
CREATE POLICY "Users can insert students" ON students
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update students
CREATE POLICY "Users can update students" ON students
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete students
CREATE POLICY "Users can delete students" ON students
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
