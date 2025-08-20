import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, BookOpen, FileText, Settings, BarChart3, UserPlus, Upload, Download, Calendar, Tag, Grid3X3, List, Video, Image, Archive, Music, Presentation, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateSchoolModal from './CreateSchoolModal';
import { AddResourceModal } from './AddResourceModal';
import GradeModal from './GradeModal';
import SubjectModal from './SubjectModal';
import ResourceViewModal from './ResourceViewModal';
import ResourceEditModal from './ResourceEditModal';
import TagModal from './TagModal';
import { API_ENDPOINTS, getFileUrl } from '../config/api';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'admin' | 'school';
  organization?: string;
  designation?: string;
  status: string;
  created_at: string;
}

interface Resource {
  resource_id: number;
  title: string;
  description: string;
  type_name: string;
  subject_name: string;
  grade_level: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  author_name: string;
  download_count: number;
  view_count: number;
  likes: number;
  preview_image?: string;
  subject_color?: string;
  icon?: string;
  tags?: Array<{
    tag_id: number;
    tag_name: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'school'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [filterResourceStatus, setFilterResourceStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showResourceViewModal, setShowResourceViewModal] = useState(false);
  const [showResourceEditModal, setShowResourceEditModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [gradeModalMode, setGradeModalMode] = useState<'create' | 'edit'>('create');
  const [subjectModalMode, setSubjectModalMode] = useState<'create' | 'edit'>('create');
  const [tagModalMode, setTagModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'metadata' | 'settings'>('overview');

  useEffect(() => {
    fetchUsers();
    fetchResources();
    fetchGrades();
    fetchSubjects();
    fetchResourceTypes();
    fetchTags();
  }, [token]);

  const fetchUsers = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.GRADES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      } else {
        console.error('Failed to fetch grades:', data.message);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjects = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.SUBJECTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      } else {
        console.error('Failed to fetch subjects:', data.message);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchResourceTypes = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_TYPES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setResourceTypes(data.data);
      } else {
        console.error('Failed to fetch resource types:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resource types:', error);
    }
  };

  const fetchTags = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.TAGS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setTags(data.data);
      } else {
        console.error('Failed to fetch tags:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchResources = async () => {
    if (!token) return;
    
    setIsLoadingResources(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.RESOURCES_ALL}?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setResources(data.data.resources || []);
      } else {
        console.error('Failed to fetch resources:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredResources = resources.filter(resource => {
    const searchTerm = resourceSearchTerm.toLowerCase();
    
    // Search in title, description, subject, grade, and tags
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm) ||
                         resource.description.toLowerCase().includes(searchTerm) ||
                         (resource.subject_name && resource.subject_name.toLowerCase().includes(searchTerm)) ||
                         (resource.grade_level && resource.grade_level.toLowerCase().includes(searchTerm)) ||
                         (resource.tags && resource.tags.some(tag => tag.tag_name.toLowerCase().includes(searchTerm)));
    
    const matchesStatus = filterResourceStatus === 'all' || resource.status === filterResourceStatus;
    const matchesGrade = filterGrade === 'all' || resource.grade_level === filterGrade;
    const matchesSubject = filterSubject === 'all' || resource.subject_name === filterSubject;

    return matchesSearch && matchesStatus && matchesGrade && matchesSubject;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    schools: users.filter(u => u.role === 'school').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  const resourceStats = {
    total: resources.length,
    published: resources.filter(r => r.status === 'published').length,
    draft: resources.filter(r => r.status === 'draft').length,
    totalDownloads: resources.reduce((sum, r) => sum + (r.download_count || 0), 0),
    totalViews: resources.reduce((sum, r) => sum + (r.view_count || 0), 0),
  };

  const handleCreateSchool = async (schoolData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/schools`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchUsers();
        return { success: true, message: 'School account created successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to create school account' };
      }
    } catch (error) {
      console.error('Error creating school:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleCreateResource = async (resourceData: any) => {
    // Resource is already created by the modal, just refresh the list
    await fetchResources();
    return { success: true, message: 'Resource created successfully!' };
  };

  // Grade CRUD operations
  const handleCreateGrade = async (gradeData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.GRADES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchGrades();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  };

  const handleUpdateGrade = async (gradeData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.GRADES}/${selectedGrade.grade_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchGrades();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.GRADES}/${gradeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchGrades();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Failed to delete grade');
    }
  };

  // Subject CRUD operations
  const handleCreateSubject = async (subjectData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.SUBJECTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubjects();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  };

  const handleUpdateSubject = async (subjectData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SUBJECTS}/${selectedSubject.subject_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubjects();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.SUBJECTS}/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubjects();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  // Tag CRUD operations
  const handleCreateTag = async (tagData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.TAGS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTags();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag');
    }
  };

  const handleUpdateTag = async (tagData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.TAGS}/${selectedTag.tag_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTags();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.TAGS}/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchTags();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag');
    }
  };

  // Resource CRUD operations
  const handleUpdateResource = async (resourceData: any) => {
    try {
      const headers: any = {
        'Authorization': `Bearer ${token}`,
      };

      // If resourceData is FormData (has files), don't set Content-Type
      // If it's a regular object, set Content-Type to application/json
      if (!(resourceData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        resourceData = JSON.stringify(resourceData);
      }

      const response = await fetch(API_ENDPOINTS.RESOURCE_BY_ID(selectedResource.resource_id), {
        method: 'PUT',
        headers,
        body: resourceData,
      });

      const data = await response.json();
      if (data.success) {
        await fetchResources();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_BY_ID(resourceId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchResources();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  // Modal handlers
  const openGradeModal = (mode: 'create' | 'edit', grade?: any) => {
    setGradeModalMode(mode);
    setSelectedGrade(grade || null);
    setShowGradeModal(true);
  };

  const openSubjectModal = (mode: 'create' | 'edit', subject?: any) => {
    setSubjectModalMode(mode);
    setSelectedSubject(subject || null);
    setShowSubjectModal(true);
  };

  const openTagModal = (mode: 'create' | 'edit', tag?: any) => {
    setTagModalMode(mode);
    setSelectedTag(tag || null);
    setShowTagModal(true);
  };

  const openResourceViewModal = (resource: any) => {
    setSelectedResource(resource);
    setShowResourceViewModal(true);
  };

  const openResourceEditModal = (resource: any) => {
    setSelectedResource(resource);
    setShowResourceEditModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (typeName: string) => {
    const iconMap: { [key: string]: any } = {
      'video': Video,
      'document': FileText,
      'presentation': Presentation,
      'image': Image,
      'archive': Archive,
      'spreadsheet': BarChart3,
      'audio': Music
    };
    
    return iconMap[typeName.toLowerCase()] || FileText;
  };

  const getPreviewImage = (resource: Resource) => {
    if (resource.preview_image) {
      return getFileUrl(resource.preview_image);
    }
    return '/logo.png'; // Default logo
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage schools, content, and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'School Management', icon: Users },
              { id: 'content', label: 'Content Management', icon: BookOpen },
              { id: 'metadata', label: 'Metadata', icon: Tag },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Schools</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.schools}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Schools</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Resources</p>
                    <p className="text-3xl font-bold text-purple-600">{resourceStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-3xl font-bold text-orange-600">{resourceStats.totalDownloads}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add New School</p>
                    <p className="text-sm text-gray-500">Create school account</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowResourceModal(true)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Upload Resource</p>
                    <p className="text-sm text-gray-500">Share new educational content</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">System Settings</p>
                    <p className="text-sm text-gray-500">Configure platform settings</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Resources</h3>
              <div className="space-y-4">
                {resources.slice(0, 5).map((resource) => (
                  <div key={resource.resource_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* Preview Image */}
                    <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getPreviewImage(resource)}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/logo.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: resource.subject_color || '#6B7280' }}
                          ></div>
                          <span>{resource.subject_name}</span>
                        </div>
                        <span>•</span>
                        <span>{resource.grade_level}</span>
                        <span>•</span>
                        <span>{resource.type_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-gray-400">
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                      <span className="text-gray-500">{formatFileSize(resource.file_size)}</span>
                    </div>
                  </div>
                ))}
                {resources.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No resources uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">School Management</h2>
                <p className="text-gray-600">Manage school accounts and their access</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add School</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search schools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="school">School</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Users className="w-3 h-3 mr-1" />
                                School
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.organization || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
                <p className="text-gray-600">Create and manage educational resources for schools</p>
              </div>
              <button
                onClick={() => setShowResourceModal(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resource</span>
              </button>
            </div>

            {/* Resource Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Resources</p>
                    <p className="text-3xl font-bold text-gray-900">{resourceStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-3xl font-bold text-green-600">{resourceStats.published}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-3xl font-bold text-yellow-600">{resourceStats.draft}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-3xl font-bold text-purple-600">{resourceStats.totalDownloads}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={resourceSearchTerm}
                      onChange={(e) => setResourceSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <select
                  value={filterResourceStatus}
                  onChange={(e) => setFilterResourceStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Grade Filter */}
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade.grade_id} value={grade.grade_level}>{grade.grade_level}</option>
                  ))}
                </select>

                {/* Subject Filter */}
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.subject_id} value={subject.subject_name}>{subject.subject_name}</option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Resources Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {isLoadingResources ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredResources.length > 0 ? (
                viewMode === 'list' ? (
                  // List View
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResources.map((resource) => (
                          <tr key={resource.resource_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                {resource.preview_image ? (
                                  <img
                                    src={getPreviewImage(resource)}
                                    alt={resource.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                {!resource.preview_image && (() => {
                                  const IconComponent = getFileIcon(resource.type_name);
                                  return <IconComponent className="w-5 h-5 text-gray-500" />;
                                })()}
                              </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                                  <div className="text-sm text-gray-500">{formatFileSize(resource.file_size)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {resource.type_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: resource.subject_color || '#6B7280' }}
                                ></div>
                                {resource.subject_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {resource.grade_level}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                resource.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {resource.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span title="Downloads">
                                  <Download className="w-4 h-4 inline mr-1" />
                                  {resource.download_count || 0}
                                </span>
                                <span title="Views">
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  {resource.view_count || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(resource.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button 
                                  onClick={() => openResourceViewModal(resource)}
                                  className="text-blue-600 hover:text-blue-900" 
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openResourceEditModal(resource)}
                                  className="text-green-600 hover:text-green-900" 
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteResource(resource.resource_id)}
                                  className="text-red-600 hover:text-red-900" 
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Grid View
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredResources.map((resource) => (
                        <div key={resource.resource_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Preview Image */}
                          <div className="aspect-[3/2] bg-gray-100 relative overflow-hidden">
                            <img
                              src={getPreviewImage(resource)}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/logo.png';
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                resource.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {resource.status}
                              </span>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2">
                                  {(() => {
                                    const IconComponent = getFileIcon(resource.type_name);
                                    return <IconComponent className="w-4 h-4 text-blue-600" />;
                                  })()}
                                </div>
                                <span className="text-xs text-gray-500">{resource.type_name}</span>
                              </div>
                              <span className="text-xs text-gray-500">{formatFileSize(resource.file_size)}</span>
                            </div>
                            
                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <div className="flex items-center">
                                <div 
                                  className="w-2 h-2 rounded-full mr-1" 
                                  style={{ backgroundColor: resource.subject_color || '#6B7280' }}
                                ></div>
                                <span>{resource.subject_name}</span>
                              </div>
                              <span>{resource.grade_level}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-3">
                                <span title="Downloads">
                                  <Download className="w-3 h-3 inline mr-1" />
                                  {resource.download_count || 0}
                                </span>
                                <span title="Views">
                                  <Eye className="w-3 h-3 inline mr-1" />
                                  {resource.view_count || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button 
                                  onClick={() => openResourceViewModal(resource)}
                                  className="text-blue-600 hover:text-blue-900 p-1" 
                                  title="View"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => openResourceEditModal(resource)}
                                  className="text-green-600 hover:text-green-900 p-1" 
                                  title="Edit"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteResource(resource.resource_id)}
                                  className="text-red-600 hover:text-red-900 p-1" 
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-600 mb-4">Upload your first resource to get started.</p>
                  <button
                    onClick={() => setShowResourceModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Your First Resource
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades & Subjects Tab */}
        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Grades & Subjects Management</h2>
              <p className="text-gray-600">Manage grades and subjects for educational resources</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grades Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Grades</h3>
                  <button 
                    onClick={() => openGradeModal('create')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add Grade
                  </button>
                </div>
                <div className="space-y-2">
                  {grades.map(grade => (
                    <div key={grade.grade_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{grade.grade_level}</span>
                        <p className="text-sm text-gray-500">{grade.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openGradeModal('edit', grade)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGrade(grade.grade_id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
                  <button 
                    onClick={() => openSubjectModal('create')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <div key={subject.subject_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{subject.subject_name}</span>
                        <p className="text-sm text-gray-500">{subject.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openSubjectModal('edit', subject)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject.subject_id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Tags Section - Separate Row */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                <button 
                  onClick={() => openTagModal('create')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add Tag
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tags.map(tag => (
                  <div key={tag.tag_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{tag.tag_name}</span>
                      {tag.description && (
                        <p className="text-sm text-gray-500">{tag.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openTagModal('edit', tag)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTag(tag.tag_id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
              <p className="text-gray-600">Configure platform settings and preferences</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
              <p className="text-gray-600">This feature will be implemented soon.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create School Modal */}
      <CreateSchoolModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSchool}
      />

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        onSubmit={handleCreateResource}
        initialGrade={1}
      />

      {/* Grade Modal */}
      <GradeModal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        onSubmit={gradeModalMode === 'create' ? handleCreateGrade : handleUpdateGrade}
        grade={selectedGrade}
        mode={gradeModalMode}
      />

      {/* Subject Modal */}
      <SubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onSubmit={subjectModalMode === 'create' ? handleCreateSubject : handleUpdateSubject}
        subject={selectedSubject}
        mode={subjectModalMode}
      />

      {/* Tag Modal */}
      <TagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onSubmit={tagModalMode === 'create' ? handleCreateTag : handleUpdateTag}
        tag={selectedTag}
        mode={tagModalMode}
      />

      {/* Resource View Modal */}
      <ResourceViewModal
        isOpen={showResourceViewModal}
        onClose={() => setShowResourceViewModal(false)}
        resource={selectedResource}
      />

      {/* Resource Edit Modal */}
      <ResourceEditModal
        isOpen={showResourceEditModal}
        onClose={() => setShowResourceEditModal(false)}
        onSubmit={handleUpdateResource}
        resource={selectedResource}
        grades={grades}
        subjects={subjects}
        resourceTypes={resourceTypes}
      />
    </div>
  );
};

export default AdminDashboard;
