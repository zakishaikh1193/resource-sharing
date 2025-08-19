import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { GradeColumnComponent } from './components/GradeColumn';
import { GradeColumn, Resource, ViewMode } from './types';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';

// Main App Content (wrapped with authentication)
const AppContent: React.FC = () => {
  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [appName, setAppName] = useState('ICT EduShare');
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  // Fetch resources from backend
  useEffect(() => {
    if (token) {
      fetchResources();
    }
  }, [token]);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/resources?status=published&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const resources = data.data.resources || [];
        organizeResourcesByGrade(resources);
      } else {
        console.error('Failed to fetch resources:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const organizeResourcesByGrade = (resources: any[]) => {
    // Create grade columns (1-12)
    const columns: GradeColumn[] = Array.from({ length: 12 }, (_, i) => ({
      id: `grade-${i + 1}`,
      title: `Grade ${i + 1}`,
      grade: i + 1,
      color: `bg-gradient-to-br from-blue-${400 + (i * 20)} to-purple-${400 + (i * 20)}`,
      resources: []
    }));

    // Organize resources by grade
    resources.forEach((resource: any) => {
      const gradeNumber = parseInt(resource.grade_level.replace('Grade ', ''));
      const column = columns.find(col => col.grade === gradeNumber);
      
      if (column) {
        const frontendResource: Resource = {
          id: resource.resource_id.toString(),
          title: resource.title,
          description: resource.description,
          type: resource.type_name.toLowerCase() as any,
          subject: resource.subject_name,
          grade: gradeNumber,
          author: {
            id: resource.created_by?.toString() || '1',
            name: resource.author_name || 'Admin',
            avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?w=100&h=100&fit=crop&crop=face',
            subject: resource.subject_name,
            school: 'Admin'
          },
          createdAt: resource.created_at.split('T')[0],
          tags: [], // We'll need to fetch tags separately if needed
          status: resource.status,
          likes: resource.likes || 0,
          comments: resource.comments || 0,
          previewImage: 'https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?w=300&h=200&fit=crop'
        };
        
        column.resources.push(frontendResource);
      }
    });

    setGradeColumns(columns);
  };

  const handleEditResource = (resource: Resource) => {
    // TODO: Implement edit functionality (admin only)
    console.log('Edit resource:', resource);
  };

  const handleDeleteResource = (resourceId: string) => {
    // TODO: Implement delete functionality (admin only)
    console.log('Delete resource:', resourceId);
  };

  const filteredGradeColumns = gradeColumns.map(column => ({
    ...column,
    resources: column.resources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }));

  const totalResources = gradeColumns.reduce((sum, column) => sum + column.resources.length, 0);
  const totalTechnologies = new Set(gradeColumns.flatMap(column => column.resources.flatMap(r => r.tags))).size;

  // Show admin dashboard for admin users, school dashboard for school users
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={() => {}}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        appName={appName}
        onAppNameChange={setAppName}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Browse and download educational resources shared by the admin.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Resources</p>
                <p className="text-3xl font-bold text-gray-900">{totalResources}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">📚</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grade Levels</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">🎓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Technologies</p>
                <p className="text-3xl font-bold text-gray-900">{totalTechnologies}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">💻</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your School</p>
                <p className="text-3xl font-bold text-gray-900">{user?.organization || 'School'}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-orange-600">🏫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Columns - View Only */}
        <div className="overflow-x-auto pb-6">
          <div className="flex space-x-6 min-w-max">
            {filteredGradeColumns.map((gradeColumn) => (
              <GradeColumnComponent
                key={gradeColumn.id}
                gradeColumn={gradeColumn}
                viewMode={viewMode}
                onEditResource={handleEditResource}
                onDeleteResource={handleDeleteResource}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {searchTerm && filteredGradeColumns.every(column => column.resources.length === 0) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try searching for different technologies or subjects.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* No Resources State */}
        {!searchTerm && totalResources === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-400">📚</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources available</h3>
            <p className="text-gray-600">The admin hasn't uploaded any resources yet. Check back later!</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Main App Component with Authentication Provider
function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;