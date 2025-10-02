import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock as ClockIcon,
  User,
  Map,
  Heart,
  Eye,
  Video,
  ExternalLink,
  Copy
} from 'lucide-react';
import apiClient from '../utils/api.js';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    upcomingSessions: 0,
    totalSpent: 0
  });
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    gradeLevel: '',
    minPrice: 0,
    maxPrice: 1000
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    sessionCount: 1,
    paymentMethod: 'credit_card'
  });

  const statsCards = [
    { name: 'Active Sessions', value: stats.upcomingSessions, icon: Calendar, color: 'text-blue-600' },
    { name: 'My Courses', value: stats.activeEnrollments, icon: BookOpen, color: 'text-green-600' },
    { name: 'Pending Requests', value: stats.pendingRequests, icon: MessageSquare, color: 'text-orange-600' },
    { name: 'Total Spent', value: `$${stats.totalSpent}`, icon: DollarSign, color: 'text-purple-600' },
    { name: 'Total Requests', value: stats.totalRequests, icon: TrendingUp, color: 'text-indigo-600' },
    { name: 'Completed Courses', value: stats.totalEnrollments - stats.activeEnrollments, icon: UserCheck, color: 'text-pink-600' }
  ];

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
  ];

  const gradeLevels = [
    'Primary', 'Secondary', 'Ordinary Level', 'Advance Level', 'Diploma Level', 'University Level'
  ];

  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchRequests();
    fetchEnrollments();
    fetchUpcomingSessions();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm, filters]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/student/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm,
        subject: filters.subject,
        gradeLevel: filters.gradeLevel,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString()
      });

      const response = await apiClient.get(`/student/courses?${params}`);
      if (response.data.success) {
        setCourses(response.data.courses);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('/student/requests');
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await apiClient.get('/student/enrollments');
      if (response.data.success) {
        setEnrollments(response.data.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments', error);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const response = await apiClient.get('/student/sessions/upcoming');
      if (response.data.success) {
        setUpcomingSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions', error);
    }
  };

  const requestCourse = async (courseId, message) => {
    try {
      const response = await apiClient.post(`/student/courses/${courseId}/request`, {
        message: message || `I would like to enroll in this course.`
      });
      
      if (response.data.success) {
        fetchCourses();
        fetchRequests();
        fetchStats();
        setShowCourseModal(false);
        alert('Course request sent successfully!');
      }
    } catch (error) {
      console.error('Error requesting course', error);
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handlePayment = async () => {
    try {
      if (!selectedEnrollment) return;
      
      const response = await apiClient.post(`/student/courses/${selectedEnrollment.course._id}/payment`, paymentData);
      
      if (response.data.success) {
        setShowPaymentModal(false);
        fetchEnrollments();
        fetchStats();
        alert('Payment processed successfully!');
      }
    } catch (error) {
      console.error('Error processing payment', error);
      alert('Payment failed. Please try again.');
    }
  };

  const cancelEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to cancel this enrollment?')) {
      try {
        const response = await apiClient.put(`/student/enrollments/${enrollmentId}/cancel`);
        
        if (response.data.success) {
          fetchEnrollments();
          fetchUpcomingSessions();
          fetchStats();
          alert(response.data.message);
        }
      } catch (error) {
        console.error('Error cancelling enrollment', error);
        alert('Failed to cancel enrollment');
      }
    }
  };

  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const openPaymentModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setPaymentData({
      amount: enrollment.course.pricing.pricePerSession,
      sessionCount: 1,
      paymentMethod: 'credit_card'
    });
    setShowPaymentModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      subject: '',
      gradeLevel: '',
      minPrice: 0,
      maxPrice: 1000
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const copyMeetingLink = (meetingUrl) => {
    navigator.clipboard.writeText(meetingUrl);
    alert('Meeting link copied to clipboard!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSessionToday = (date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const sessionDate = new Date(date).setHours(0, 0, 0, 0);
    return today === sessionDate;
  };

  const getSessionStatusColor = (session) => {
    if (session.status === 'completed') return 'bg-green-100 text-green-800';
    if (session.status === 'started') return 'bg-yellow-100 text-yellow-800';
    if (session.status === 'cancelled') return 'bg-red-100 text-red-800';
    if (isSessionToday(session.scheduledAt)) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSessionTimeUntil = (date) => {
    const now = new Date();
    const sessionTime = new Date(date);
    const diffMs = sessionTime - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'Session has passed';
    if (diffDays > 0) return `${diffDays} day(s) remaining`;
    if (diffHours > 0) return `${diffHours} hour(s) remaining`;
    if (diffMinutes > 0) return `${diffMinutes} minute(s) remaining`;
    return 'Session starting now';
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Discover courses and connect with amazing teachers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'courses', name: 'Browse Courses', icon: BookOpen },
              { id: 'enrollments', name: 'My Courses', icon: UserCheck },
              { id: 'requests', name: 'Requests', icon: MessageSquare },
              { id: 'sessions', name: 'Upcoming Sessions', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="card">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-grow">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="input-field pl-10"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    className="input-field w-40"
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <select
                    className="input-field w-40"
                    value={filters.gradeLevel}
                    onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {gradeLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Min Price"
                    className="input-field w-32"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    className="input-field w-32"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 1000)}
                  />
                  <button
                    onClick={resetFilters}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.subject} • {course.gradeLevel}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">{course.rating || 0}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollmentCount} enrolled
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.pricing.freeTrialDays} days free
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-primary-600">
                      ${course.pricing.pricePerSession}/session
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openCourseModal(course)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {course.isEnrolled ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Enrolled
                        </span>
                      ) : course.isRequested ? (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.requestStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          course.requestStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.requestStatus}
                        </span>
                      ) : (
                        <button
                          onClick={() => requestCourse(course._id)}
                          className="btn-primary text-sm py-1 px-3"
                        >
                          Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary flex items-center space-x-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary flex items-center space-x-1 disabled:opacity-50"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Enrolled Courses</h2>
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{enrollment.course.title}</h4>
                        <p className="text-sm text-gray-500">{enrollment.course.subject}</p>
                        <p className="text-sm text-gray-600">Teacher: {enrollment.teacher.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${enrollment.course.pricing.pricePerSession}/session
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {enrollment.payment.sessionsCompleted} sessions completed
                        </span>
                        {enrollment.status === 'trial' && (
                          <span className="flex items-center text-orange-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Trial ends: {new Date(enrollment.trialEndsAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {enrollment.status === 'active' && (
                          <button
                            onClick={() => openPaymentModal(enrollment)}
                            className="btn-primary text-sm py-1 px-3"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </button>
                        )}
                        <button
                          onClick={() => cancelEnrollment(enrollment._id)}
                          className="btn-secondary text-sm py-1 px-3 text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Requests</h2>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.course.title}</h4>
                        <p className="text-sm text-gray-500">Teacher: {request.teacher.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => {
                            fetchEnrollments();
                            setActiveTab('enrollments');
                          }}
                          className="btn-primary text-sm py-1 px-3"
                        >
                          View Enrollment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{session.course.title}</h4>
                        <p className="text-sm text-gray-500">Teacher: {session.teacher.name}</p>
                        <p className="text-sm text-gray-600">
                          Session: {formatDate(session.scheduledAt)} at {formatTime(session.scheduledAt)}
                        </p>
                        <p className="text-sm text-gray-500">{getSessionTimeUntil(session.scheduledAt)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSessionStatusColor(session)}`}>
                        {session.status}
                      </span>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    )}
                    
                    {/* Meeting Information */}
                    {session.meeting && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Video className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {session.meeting.platform.charAt(0).toUpperCase()}{session.meeting.platform.slice(1)} Meeting
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Duration: {session.duration} minutes
                          </span>
                          {session.meeting.meetingId && (
                            <span className="flex items-center">
                              <Copy className="h-4 w-4 mr-1" />
                              ID: {session.meeting.meetingId}
                            </span>
                          )}
                          {session.meeting.meetingPassword && (
                            <span className="flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Password Protected
                            </span>
                          )}
                        </div>
                        
                        {session.meeting.meetingUrl && (
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => window.open(session.meeting.meetingUrl, '_blank')}
                              className="btn-primary text-sm py-1 px-3 flex items-center space-x-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Join Meeting</span>
                            </button>
                            <button
                              onClick={() => copyMeetingLink(session.meeting.meetingUrl)}
                              className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy Link</span>
                            </button>
                          </div>
                        )}
                        
                        {session.meeting.meetingPassword && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium">Password:</span> {session.meeting.meetingPassword}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Session Materials */}
                    {session.materials && session.materials.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Session Materials</h5>
                        <div className="space-y-1">
                          {session.materials.map((material, index) => (
                            <a
                              key={index}
                              href={material}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Material {index + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Course Details Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedCourse.title}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
                    <p className="text-sm text-gray-600 mb-3">{selectedCourse.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Subject:</span> {selectedCourse.subject}
                      </div>
                      <div>
                        <span className="font-medium">Level:</span> {selectedCourse.gradeLevel}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> ${selectedCourse.pricing.pricePerSession}/session
                      </div>
                      <div>
                        <span className="font-medium">Free Trial:</span> {selectedCourse.pricing.freeTrialDays} days
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Teacher</h4>
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{selectedCourse.teacher.name}</p>
                        <p className="text-sm text-gray-500">{selectedCourse.teacher.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                    <p className="text-sm text-gray-600">
                      {selectedCourse.availableSlots} of {selectedCourse.enrollment.maxStudents} spots available
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  {!selectedCourse.isEnrolled && !selectedCourse.isRequested && (
                    <button
                      onClick={() => requestCourse(selectedCourse._id)}
                      className="btn-primary"
                    >
                      Request Enrollment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment for {selectedEnrollment.course.title}</h3>
                <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sessions to Pay</label>
                    <input
                      type="number"
                      min="1"
                      className="input-field mt-1"
                      value={paymentData.sessionCount}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        sessionCount: parseInt(e.target.value),
                        amount: selectedEnrollment.course.pricing.pricePerSession * parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <div className="text-lg font-bold text-primary-600">
                      ${paymentData.amount}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      className="input-field mt-1"
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;