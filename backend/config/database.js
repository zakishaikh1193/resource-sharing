const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'resources_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database with required tables and data
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Insert default grades if they don't exist
    const grades = Array.from({ length: 12 }, (_, i) => ({
      grade_level: `Grade ${i + 1}`,
      grade_number: i + 1,
      description: `Educational resources for Grade ${i + 1} students`
    }));

    for (const grade of grades) {
      await connection.execute(
        'INSERT IGNORE INTO grades (grade_level, grade_number, description) VALUES (?, ?, ?)',
        [grade.grade_level, grade.grade_number, grade.description]
      );
    }

    // Insert default subjects
    const subjects = [
      { name: 'Mathematics', color: '#EF4444', description: 'Mathematical concepts and problem solving' },
      { name: 'Science', color: '#10B981', description: 'Scientific principles and experiments' },
      { name: 'English', color: '#3B82F6', description: 'English language and literature' },
      { name: 'History', color: '#F59E0B', description: 'Historical events and social studies' },
      { name: 'Geography', color: '#8B5CF6', description: 'Geographical concepts and world studies' },
      { name: 'Computer Science', color: '#06B6D4', description: 'Programming and technology' },
      { name: 'Art', color: '#EC4899', description: 'Creative arts and design' },
      { name: 'Physical Education', color: '#84CC16', description: 'Sports and physical activities' }
    ];

    for (const subject of subjects) {
      await connection.execute(
        'INSERT IGNORE INTO subjects (subject_name, color, description) VALUES (?, ?, ?)',
        [subject.name, subject.color, subject.description]
      );
    }

    // Insert default resource types
    const resourceTypes = [
      { name: 'Document', extensions: 'pdf,doc,docx,txt', icon: 'document', maxSize: 104857600 },
      { name: 'Presentation', extensions: 'ppt,pptx,key', icon: 'presentation', maxSize: 104857600 },
      { name: 'Video', extensions: 'mp4,avi,mov,wmv,flv', icon: 'video', maxSize: 524288000 },
      { name: 'Image', extensions: 'jpg,jpeg,png,gif,bmp', icon: 'image', maxSize: 52428800 },
      { name: 'Archive', extensions: 'zip,rar,7z,tar,gz', icon: 'archive', maxSize: 104857600 },
      { name: 'Spreadsheet', extensions: 'xls,xlsx,csv', icon: 'spreadsheet', maxSize: 104857600 },
      { name: 'Audio', extensions: 'mp3,wav,ogg,aac', icon: 'audio', maxSize: 104857600 }
    ];

    for (const type of resourceTypes) {
      await connection.execute(
        'INSERT IGNORE INTO resource_types (type_name, allowed_extensions, icon, max_file_size, description) VALUES (?, ?, ?, ?, ?)',
        [type.name, type.extensions, type.icon, type.maxSize, `${type.name} files`]
      );
    }

    // Insert default tags
    const tags = [
      { name: 'JavaScript', color: '#F7DF1E' },
      { name: 'Python', color: '#3776AB' },
      { name: 'HTML', color: '#E34F26' },
      { name: 'CSS', color: '#1572B6' },
      { name: 'React', color: '#61DAFB' },
      { name: 'Node.js', color: '#339933' },
      { name: 'MySQL', color: '#4479A1' },
      { name: 'Git', color: '#F05032' },
      { name: 'Docker', color: '#2496ED' },
      { name: 'AWS', color: '#FF9900' },
      { name: 'Machine Learning', color: '#FF6B6B' },
      { name: 'Data Science', color: '#4ECDC4' },
      { name: 'Web Development', color: '#45B7D1' },
      { name: 'Mobile Development', color: '#96CEB4' },
      { name: 'Cybersecurity', color: '#FFEAA7' },
      { name: 'Cloud Computing', color: '#DDA0DD' },
      { name: 'DevOps', color: '#98D8C8' },
      { name: 'UI/UX Design', color: '#F7DC6F' },
      { name: 'Database Design', color: '#BB8FCE' },
      { name: 'API Development', color: '#85C1E9' }
    ];

    for (const tag of tags) {
      await connection.execute(
        'INSERT IGNORE INTO resource_tags (tag_name, color, description) VALUES (?, ?, ?)',
        [tag.name, tag.color, `${tag.name} related resources`]
      );
    }

    // Create default admin user if not exists
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(
      'INSERT IGNORE INTO users (name, email, password, role, organization, designation) VALUES (?, ?, ?, ?, ?, ?)',
      ['System Admin', 'admin@resources.com', hashedPassword, 'admin', 'System', 'Administrator']
    );

    connection.release();
    console.log('✅ Database initialized with default data');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
