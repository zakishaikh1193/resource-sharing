const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all grades
router.get('/grades', async (req, res) => {
  try {
    const [grades] = await pool.execute(
      'SELECT * FROM grades ORDER BY grade_number'
    );

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get grades'
    });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const [subjects] = await pool.execute(
      'SELECT * FROM subjects ORDER BY subject_name'
    );

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get subjects'
    });
  }
});

// Create a new grade
router.post('/grades', async (req, res) => {
  try {
    const { grade_level, description } = req.body;

    // Check if grade already exists
    const [existing] = await pool.execute(
      'SELECT * FROM grades WHERE grade_level = ?',
      [grade_level]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO grades (grade_level, description) VALUES (?, ?)',
      [grade_level, description]
    );

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: { grade_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grade'
    });
  }
});

// Update a grade
router.put('/grades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { grade_level, description } = req.body;

    // Check if grade exists
    const [existing] = await pool.execute(
      'SELECT * FROM grades WHERE grade_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check if new grade_level conflicts with other grades
    const [conflict] = await pool.execute(
      'SELECT * FROM grades WHERE grade_level = ? AND grade_id != ?',
      [grade_level, id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade level already exists'
      });
    }

    await pool.execute(
      'UPDATE grades SET grade_level = ?, description = ? WHERE grade_id = ?',
      [grade_level, description, id]
    );

    res.json({
      success: true,
      message: 'Grade updated successfully'
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade'
    });
  }
});

// Delete a grade
router.delete('/grades/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if grade is being used by any resources
    const [resources] = await pool.execute(
      'SELECT COUNT(*) as count FROM resources WHERE grade_id = ?',
      [id]
    );

    if (resources[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete grade that is being used by resources'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM grades WHERE grade_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grade'
    });
  }
});

// Create a new subject
router.post('/subjects', async (req, res) => {
  try {
    const { subject_name, description } = req.body;

    // Check if subject already exists
    const [existing] = await pool.execute(
      'SELECT * FROM subjects WHERE subject_name = ?',
      [subject_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject already exists'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO subjects (subject_name, description) VALUES (?, ?)',
      [subject_name, description]
    );

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject'
    });
  }
});

// Update a subject
router.put('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, description } = req.body;

    // Check if subject exists
    const [existing] = await pool.execute(
      'SELECT * FROM subjects WHERE subject_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if new subject_name conflicts with other subjects
    const [conflict] = await pool.execute(
      'SELECT * FROM subjects WHERE subject_name = ? AND subject_id != ?',
      [subject_name, id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject name already exists'
      });
    }

    await pool.execute(
      'UPDATE subjects SET subject_name = ?, description = ? WHERE subject_id = ?',
      [subject_name, description, id]
    );

    res.json({
      success: true,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject'
    });
  }
});

// Delete a subject
router.delete('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject is being used by any resources
    const [resources] = await pool.execute(
      'SELECT COUNT(*) as count FROM resources WHERE subject_id = ?',
      [id]
    );

    if (resources[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject that is being used by resources'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM subjects WHERE subject_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject'
    });
  }
});

// Get all resource types
router.get('/resource-types', async (req, res) => {
  try {
    const [types] = await pool.execute(
      'SELECT * FROM resource_types ORDER BY type_name'
    );

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get resource types'
    });
  }
});

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const [tags] = await pool.execute(
      'SELECT * FROM resource_tags ORDER BY tag_name'
    );

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get tags'
    });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total resources
    const [resourceCount] = await pool.execute('SELECT COUNT(*) as total FROM resources');
    
    // Get total users
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users');
    
    // Get total downloads
    const [downloadCount] = await pool.execute('SELECT COUNT(*) as total FROM resource_downloads');
    
    // Get total views
    const [viewCount] = await pool.execute('SELECT COUNT(*) as total FROM resource_views');

    res.json({
      success: true,
      data: {
        totalResources: resourceCount[0].total,
        totalUsers: userCount[0].total,
        totalDownloads: downloadCount[0].total,
        totalViews: viewCount[0].total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
});

module.exports = router;

