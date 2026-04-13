import React, { useState, useEffect } from 'react';
import { Button } from '@/components/premium-ui/Button';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Input } from '@/components/premium-ui/Input';
import { 
  Users, 
  UserPlus, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building,
  Calendar,
  MoreVertical,
  Plus,
  FileText,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users2,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  year: string | null;
  created_at: string;
  updated_at: string | null;
}

const PremiumStudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data
  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'cs', name: 'Computer Science' },
    { id: 'ee', name: 'Electrical Engineering' },
    { id: 'me', name: 'Mechanical Engineering' },
    { id: 'ce', name: 'Civil Engineering' },
  ];

  const years = [
    { id: 'all', name: 'All Years' },
    { id: '1st', name: '1st Year' },
    { id: '2nd', name: '2nd Year' },
    { id: '3rd', name: '3rd Year' },
    { id: '4th', name: '4th Year' },
  ];

  const stats = {
    total: 1234,
    newThisMonth: 45,
    active: 1189,
    departments: 5,
    averageGPA: 3.4,
  };

  useEffect(() => {
    // Simulate fetching students
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: '1',
          roll_number: 'CS2024001',
          name: 'John Doe',
          email: 'john.doe@university.edu',
          phone: '+1234567890',
          department: 'Computer Science',
          year: '3rd',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          roll_number: 'EE2024002',
          name: 'Jane Smith',
          email: 'jane.smith@university.edu',
          phone: '+0987654321',
          department: 'Electrical Engineering',
          year: '2nd',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-14T14:20:00Z',
        },
        {
          id: '3',
          roll_number: 'ME2024003',
          name: 'Mike Johnson',
          email: 'mike.johnson@university.edu',
          phone: '+1122334455',
          department: 'Mechanical Engineering',
          year: '4th',
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
        },
      ];
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = !searchQuery || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (student.phone?.includes(searchQuery) ?? false);
      
      const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
      const matchesYear = selectedYear === 'all' || student.year === selectedYear;
      
      return matchesSearch && matchesDepartment && matchesYear;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Student];
      let bValue: any = b[sortBy as keyof Student];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage);
  const paginatedStudents = filteredAndSortedStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map(student => student.id));
    }
  };

  const handleDeleteSelected = async () => {
    // Simulate delete
    setStudents(prev => prev.filter(student => !selectedStudents.includes(student.id)));
    setSelectedStudents([]);
  };

  const handleExport = () => {
    // Simulate export
    const csvContent = [
      ['Roll Number', 'Name', 'Email', 'Phone', 'Department', 'Year'],
      ...paginatedStudents.map(student => [
        student.roll_number,
        student.name,
        student.email || '',
        student.phone || '',
        student.department || '',
        student.year || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students.csv';
    link.click();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{stats.total.toLocaleString()} Students</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 w-64"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedDepartment !== 'all' || selectedYear !== 'all' || searchQuery) && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Active</span>
                )}
              </Button>

              {/* Add Student */}
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>

              {/* Export */}
              <Button variant="outline" onClick={handleExport}>
                <FileText className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                >
                  {years.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDepartment('all');
                  setSelectedYear('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card variant="gradient" className="p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">Total Students</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">New This Month</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">Active Students</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Users2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4 bg-gradient-to-br from-orange-600 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">Departments</p>
                <p className="text-2xl font-bold">{stats.departments}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">Avg GPA</p>
                <p className="text-2xl font-bold">{stats.averageGPA}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedStudents.length === paginatedStudents.length}
                onChange={handleSelectAll}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-blue-900">
                {selectedStudents.length} of {paginatedStudents.length} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudents([])}
              >
                Clear Selection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <Card className="overflow-hidden">
          <CardHeader title="Students" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === paginatedStudents.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        Student
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('roll_number')}
                    >
                      <div className="flex items-center space-x-1">
                        Roll Number
                        {sortBy === 'roll_number' && (
                          sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center space-x-1">
                        Department
                        {sortBy === 'department' && (
                          sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('year')}
                    >
                      <div className="flex items-center space-x-1">
                        Year
                        {sortBy === 'year' && (
                          sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-500">Loading students...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <AlertCircle className="w-12 h-12 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                          <p className="text-gray-500">Try adjusting your filters or add new students to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student, index) => (
                      <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">ID: {student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{student.roll_number}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{student.email || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{student.phone || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            {student.department || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                            {student.year || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PremiumStudentManagement;
