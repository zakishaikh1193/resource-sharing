import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, FileText, Image } from 'lucide-react';

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
}

interface ResourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceData: any) => Promise<void>;
  resource: Resource | null;
  grades: any[];
  subjects: any[];
  resourceTypes: any[];
}

const ResourceEditModal: React.FC<ResourceEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  resource,
  grades,
  subjects,
  resourceTypes
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type_id: '',
    subject_id: '',
    grade_id: '',
    status: 'published'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        type_id: resourceTypes.find(t => t.type_name === resource.type_name)?.type_id?.toString() || '',
        subject_id: subjects.find(s => s.subject_name === resource.subject_name)?.subject_id?.toString() || '',
        grade_id: grades.find(g => g.grade_level === resource.grade_level)?.grade_id?.toString() || '',
        status: resource.status
      });
    }
  }, [resource, grades, subjects, resourceTypes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePreviewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPreviewImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Add files if selected
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }
      if (selectedPreviewImage) {
        formDataToSend.append('preview_image', selectedPreviewImage);
      }
      
      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Error updating resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Type
              </label>
              <select
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Type</option>
                {resourceTypes.map(type => (
                  <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>{subject.subject_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={formData.grade_id}
                onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade.grade_id} value={grade.grade_id}>{grade.grade_level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">File Uploads (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resource File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource File
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.zip,.rar,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm,.jpg,.jpeg,.png,.gif"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {selectedFile ? selectedFile.name : 'Choose File'}
                    </span>
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {resource?.file_name && !selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">Current: {resource.file_name}</p>
                )}
              </div>

              {/* Preview Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Image
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={previewImageInputRef}
                    onChange={handlePreviewImageSelect}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => previewImageInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {selectedPreviewImage ? selectedPreviewImage.name : 'Choose Image'}
                    </span>
                  </button>
                  {selectedPreviewImage && (
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewImage(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {resource?.preview_image && !selectedPreviewImage && (
                  <p className="text-xs text-gray-500 mt-1">Current preview image exists</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Resource</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceEditModal;
