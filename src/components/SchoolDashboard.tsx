import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, getFileUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import ResourceViewModal from './ResourceViewModal';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Grid3X3, 
  List, 
  BookOpen, 
  FileText, 
  Video, 
  Presentation, 
  Image, 
  Archive, 
  Music,
  ChevronDown,
  X,
  LogOut,
  User,
  School,
  Check,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface Resource {
  resource_id: number;
  title: string;
  description: string;
  type_id: number;
  subject_id: number;
  grade_id: number;
  created_by: number;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  preview_image?: string;
  tags?: Array<{
    tag_id: number;
    tag_name: string;
  }>;
}

interface FilterState {
  subjects: number[];
  types: number[];
}

// MultiSelect Dropdown Component
interface MultiSelectProps {
  options: Array<{ id: number; name: string }>;
  selectedValues: number[];
  onSelectionChange: (values: number[]) => void;
  placeholder: string;
  label: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selectedValues, 
  onSelectionChange, 
  placeholder, 
  label 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: number) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.id === selectedValues[0]);
      return option ? option.name : placeholder;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className={`${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="text-sm text-gray-900">{option.name}</span>
                {selectedValues.includes(option.id) && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SchoolDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    subjects: [],
    types: []
  });
  
  // View modal state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Available filter options
  const [availableSubjects, setAvailableSubjects] = useState<Array<{subject_id: number, subject_name: string}>>([]);
  const [availableGrades, setAvailableGrades] = useState<Array<{grade_id: number, grade_level: string}>>([]);
  const [availableTypes, setAvailableTypes] = useState<Array<{type_id: number, type_name: string}>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{tag_id: number, tag_name: string}>>([]);

  // Kanban scroll state
  const kanbanRef = useRef<HTMLDivElement>(null);

  // Fetch resources and metadata
  useEffect(() => {
    if (token) {
      fetchResources();
      fetchMetadata();
    }
  }, [token]);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [resources, searchTerm, filters]);

  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RESOURCES}?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const resourcesWithTags = data.data.resources || [];
        setResources(resourcesWithTags);
      } else {
        console.error('Failed to fetch resources:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      // Fetch subjects, grades, types, and tags for filters
      const [subjectsRes, gradesRes, typesRes, tagsRes] = await Promise.all([
        fetch(API_ENDPOINTS.SUBJECTS, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_ENDPOINTS.GRADES, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_ENDPOINTS.RESOURCE_TYPES, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_ENDPOINTS.TAGS, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [subjectsData, gradesData, typesData, tagsData] = await Promise.all([
        subjectsRes.json(),
        gradesRes.json(),
        typesRes.json(),
        tagsRes.json()
      ]);

      if (subjectsData.success) setAvailableSubjects(subjectsData.data);
      if (gradesData.success) setAvailableGrades(gradesData.data);
      if (typesData.success) setAvailableTypes(typesData.data);
      if (tagsData.success) setAvailableTags(tagsData.data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const applyFilters = () => {
    let filtered = resources;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => {
        const subjectName = availableSubjects.find(s => s.subject_id === resource.subject_id)?.subject_name || '';
        const gradeLevel = availableGrades.find(g => g.grade_id === resource.grade_id)?.grade_level || '';
        const typeName = availableTypes.find(t => t.type_id === resource.type_id)?.type_name || '';
        
        return resource.title.toLowerCase().includes(term) ||
               resource.description.toLowerCase().includes(term) ||
               subjectName.toLowerCase().includes(term) ||
               gradeLevel.toLowerCase().includes(term) ||
               typeName.toLowerCase().includes(term) ||
               (resource.tags && resource.tags.some(tag => tag.tag_name.toLowerCase().includes(term)));
      });
    }

    // Apply filters
    if (filters.subjects.length > 0) {
      filtered = filtered.filter(resource => filters.subjects.includes(resource.subject_id));
    }
    if (filters.types.length > 0) {
      filtered = filtered.filter(resource => filters.types.includes(resource.type_id));
    }

    setFilteredResources(filtered);
  };

  const toggleFilter = (category: keyof FilterState, value: number) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({ subjects: [], types: [] });
    setSearchTerm('');
  };

  const getFileIcon = (typeName: string) => {
    const iconMap: { [key: string]: any } = {
      'Document': FileText,
      'Video': Video,
      'Presentation': Presentation,
      'Image': Image,
      'Archive': Archive,
      'Spreadsheet': FileText,
      'Audio': Music
    };
    return iconMap[typeName] || FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_DOWNLOAD(resource.resource_id), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download resource');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resource');
    }
  };

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedResource(null);
  };

  const getPreviewImage = (resource: Resource) => {
    if (resource.preview_image) {
      return getFileUrl(resource.preview_image);
    }
    return '/logo.png';
  };

  // Helper functions to get mapped names
  const getSubjectName = (subjectId: number) => {
    return availableSubjects.find(s => s.subject_id === subjectId)?.subject_name || 'Not specified';
  };

  const getGradeLevel = (gradeId: number) => {
    return availableGrades.find(g => g.grade_id === gradeId)?.grade_level || 'Not specified';
  };

  const getTypeName = (typeId: number) => {
    return availableTypes.find(t => t.type_id === typeId)?.type_name || 'Unknown';
  };

  // Get resources for a specific grade
  const getResourcesForGrade = (gradeId: number) => {
    return filteredResources.filter(resource => resource.grade_id === gradeId);
  };

  // Scroll Kanban board
  const scrollKanban = (direction: 'left' | 'right') => {
    if (kanbanRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = kanbanRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      kanbanRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                <img src="/logo.png" alt="Byline Learning Solutions" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-md lg:text-xl font-bold text-gray-900 truncate">Byline Learning Solutions</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Byline Resource Sharing</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <School className="w-4 h-4" />
                <span className="truncate">{user?.organization || 'School'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Discover and download educational resources organized by grade levels.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Available Resources</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{resources.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{availableSubjects.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Grade Levels</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{availableGrades.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title, description, subject, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  showFilters || Object.values(filters).some(f => f.length > 0)
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(Object.values(filters).some(f => f.length > 0) || searchTerm) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Active Filters:</span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {Object.entries(filters).map(([category, values]) =>
                  values.map((value: number) => {
                    let displayName = '';
                    if (category === 'subjects') {
                      displayName = availableSubjects.find(s => s.subject_id === value)?.subject_name || '';
                    } else if (category === 'types') {
                      displayName = availableTypes.find(t => t.type_id === value)?.type_name || '';
                    }
                    
                    return (
                      <span
                        key={`${category}-${value}`}
                        className="inline-flex items-center px-2 sm:px-3 py-1 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded-full"
                      >
                        {category}: {displayName}
                        <button
                          onClick={() => toggleFilter(category as keyof FilterState, value)}
                          className="ml-2 hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Subjects Filter */}
                <MultiSelect
                  options={availableSubjects.map(s => ({ id: s.subject_id, name: s.subject_name }))}
                  selectedValues={filters.subjects}
                  onSelectionChange={(values) => setFilters(prev => ({ ...prev, subjects: values }))}
                  placeholder="Select subjects..."
                  label="Subjects"
                />

                {/* Types Filter */}
                <MultiSelect
                  options={availableTypes.map(t => ({ id: t.type_id, name: t.type_name }))}
                  selectedValues={filters.types}
                  onSelectionChange={(values) => setFilters(prev => ({ ...prev, types: values }))}
                  placeholder="Select resource types..."
                  label="Resource Types"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {filteredResources.length} of {resources.length} resources
          </p>
        </div>

        {/* Kanban Board */}
        {filteredResources.length > 0 ? (
          <div className="relative">
            {/* Scroll Controls */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={() => scrollKanban('left')}
                className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={() => scrollKanban('right')}
                className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Kanban Board */}
            <div 
              ref={kanbanRef}
              className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableGrades.map((grade) => {
                const gradeResources = getResourcesForGrade(grade.grade_id);
                const gradeColor = getGradeColor(grade.grade_id);
                
                return (
                  <div key={grade.grade_id} className="flex-shrink-0 w-80 sm:w-96">
                    {/* Grade Column Header */}
                    <div className={`${gradeColor.bg} ${gradeColor.border} rounded-t-xl p-4 mb-4`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{grade.grade_level}</h3>
                          <p className="text-sm text-white/80">{gradeResources.length} resources</p>
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Resources in this grade */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {gradeResources.map((resource) => {
                        const typeName = availableTypes.find(t => t.type_id === resource.type_id)?.type_name || 'Unknown';
                        const IconComponent = getFileIcon(typeName);
                        
                        return (
                          <div 
                            key={resource.resource_id} 
                            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                          >
                            {/* Preview Image */}
                            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                              <img
                                src={getPreviewImage(resource)}
                                alt={resource.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <div class="w-12 h-12 text-gray-300">
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                        </svg>
                                      </div>
                                    </div>
                                  `;
                                }}
                              />
                              {/* File type icon overlay */}
                              <div className="absolute top-2 left-2">
                                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                                  <IconComponent className="w-4 h-4 text-gray-700" />
                                </div>
                              </div>
                              {/* File size badge */}
                              <div className="absolute top-2 right-2">
                                <div className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg">
                                  {formatFileSize(resource.file_size)}
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              {/* Title and Description */}
                              <div className="mb-3">
                                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                  {resource.title}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                  {resource.description}
                                </p>
                              </div>

                              {/* Subject */}
                              <div className="mb-3">
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Subject</p>
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                      {availableSubjects.find(s => s.subject_id === resource.subject_id)?.subject_name || 'Not specified'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Tags */}
                              {resource.tags && resource.tags.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-1">
                                    {resource.tags.slice(0, 2).map(tag => (
                                      <span
                                        key={tag.tag_id}
                                        className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                                      >
                                        {tag.tag_name}
                                      </span>
                                    ))}
                                    {resource.tags.length > 2 && (
                                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                        +{resource.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => handleViewResource(resource)}
                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] text-sm"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Details</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Empty State
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(f => f.length > 0)
                ? "Try adjusting your search terms or filters."
                : "No resources are available yet. Check back later!"
              }
            </p>
            {(searchTerm || Object.values(filters).some(f => f.length > 0)) && (
              <button
                onClick={clearAllFilters}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* Resource View Modal */}
      <ResourceViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        resource={selectedResource}
        onDownload={handleDownload}
        getSubjectName={getSubjectName}
        getGradeLevel={getGradeLevel}
        getTypeName={getTypeName}
        formatFileSize={formatFileSize}
        formatDate={formatDate}
      />
    </div>
  );
};

// Helper function to get grade colors
const getGradeColor = (gradeId: number) => {
  const colors = [
    { bg: 'bg-blue-500', border: 'border-blue-500' },
    { bg: 'bg-green-500', border: 'border-green-500' },
    { bg: 'bg-purple-500', border: 'border-purple-500' },
    { bg: 'bg-yellow-500', border: 'border-yellow-500' },
    { bg: 'bg-red-500', border: 'border-red-500' },
    { bg: 'bg-indigo-500', border: 'border-indigo-500' },
    { bg: 'bg-pink-500', border: 'border-pink-500' },
    { bg: 'bg-orange-500', border: 'border-orange-500' },
    { bg: 'bg-teal-500', border: 'border-teal-500' },
    { bg: 'bg-cyan-500', border: 'border-cyan-500' },
    { bg: 'bg-emerald-500', border: 'border-emerald-500' },
    { bg: 'bg-violet-500', border: 'border-violet-500' }
  ];
  
  return colors[gradeId % colors.length];
};

export default SchoolDashboard;
