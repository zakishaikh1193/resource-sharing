import React from 'react';
import { FileText, Video, Presentation, Activity, ClipboardCheck, Heart, MessageCircle, Calendar, User, BookOpen, Edit, Trash2, Download } from 'lucide-react';
import { Resource } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResourceCardProps {
  resource: Resource;
  isDragging?: boolean;
  viewMode: 'view' | 'edit';
  onEdit?: (resource: Resource) => void;
  onDelete?: (resourceId: string) => void;
  onView?: (resource: Resource) => void;
}

const typeIcons = {
  document: FileText,
  video: Video,
  presentation: Presentation,
  interactive: Activity,
  assessment: ClipboardCheck,
  // Add fallbacks for common variations
  'Document': FileText,
  'DOCUMENT': FileText,
  'Video': Video,
  'VIDEO': Video,
  'Presentation': Presentation,
  'PRESENTATION': Presentation,
  'Interactive': Activity,
  'INTERACTIVE': Activity,
  'Assessment': ClipboardCheck,
  'ASSESSMENT': ClipboardCheck
};

const typeColors = {
  document: 'text-blue-600 bg-blue-50',
  video: 'text-red-600 bg-red-50',
  presentation: 'text-green-600 bg-green-50',
  interactive: 'text-purple-600 bg-purple-50',
  assessment: 'text-orange-600 bg-orange-50'
};

// Helper function to get tag colors
const getTagColor = (tagIndex: number) => {
  const colors = [
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-red-100 text-red-700 border-red-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-lime-100 text-lime-700 border-lime-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200'
  ];
  
  return colors[tagIndex % colors.length];
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  isDragging, 
  viewMode, 
  onEdit, 
  onDelete,
  onView
}) => {
  const { user } = useAuth();
  console.log('Resource type:', resource.type, 'Available types:', Object.keys(typeIcons));
  const TypeIcon = typeIcons[resource.type] || FileText; // Fallback to FileText if type not found
  
  const handleDownload = () => {
    // TODO: Implement actual download functionality
    console.log('Downloading resource:', resource.id);
    // This would typically trigger a download from the backend
  };

  return (
         <div 
       className={`
         bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer w-96
         hover:shadow-md hover:border-blue-300 transition-all duration-200 group
         ${isDragging ? 'rotate-3 shadow-lg scale-105' : ''}
       `}
       onClick={() => onView?.(resource)}
     >
             {/* Header */}
       <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${typeColors[resource.type]}`}>
          <TypeIcon size={16} />
        </div>
                 <div className="flex items-center space-x-2">
           {user?.role === 'admin' && viewMode === 'edit' && (
             <div className="flex items-center space-x-1">
               <button
                 onClick={() => onEdit?.(resource)}
                 className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
               >
                 <Edit size={14} />
               </button>
               <button
                 onClick={() => onDelete?.(resource.id)}
                 className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
               >
                 <Trash2 size={14} />
               </button>
             </div>
           )}
         </div>
      </div>

                    {/* Preview Image */}
       {resource.previewImage && (
         <div className="mb-3 rounded-lg overflow-hidden">
           <img 
             src={resource.previewImage} 
             alt={resource.title}
             className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
           />
         </div>
       )}

             {/* Content */}
       <div className="mb-3">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {resource.description}
        </p>
      </div>

             {/* Tags */}
       <div className="flex flex-wrap gap-1 mb-3">
        {resource.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getTagColor(index)}`}
          >
            {tag}
          </span>
        ))}
        {resource.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
            +{resource.tags.length - 3} more
          </span>
        )}
      </div>

             {/* Footer */}
       <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
            {resource.author.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <span>{resource.author.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar size={12} />
          <span>{resource.createdAt}</span>
        </div>
      </div>

             {/* Status Badge */}
       <div className="mt-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          resource.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : resource.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {resource.status}
        </span>
      </div>

             {/* View Button - Centered at Bottom */}
       <div className="mt-3 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            onView?.(resource);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 text-sm font-medium"
        >
          <BookOpen size={16} />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};