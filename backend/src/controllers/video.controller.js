import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import fs from 'fs/promises';
import db from '../db/database.js';

// Generate video from image
export const generateVideo = async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ 
        error: 'Image URL is required' 
      });
    }

    const apiKey = process.env.WIRO_API_KEY;
    const apiSecret = process.env.WIRO_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('Wiro.ai API credentials not configured');
    }

    // Generate authentication headers
    const nonce = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', apiKey)
      .update(apiSecret + nonce)
      .digest('hex');

    console.log('Generating video from image:', imageUrl);

    // Create form data for Wiro.ai API
    const formData = new FormData();
    
    // Use image URL instead of file
    formData.append('inputImageFirstUrl', imageUrl);
    formData.append('prompt', prompt || 'A realistic, high-resolution video of a child model in a professional photoshoot setting. The child makes subtle, natural movements: slightly swaying side to side, adjusting stance, gently shifting weight, looking softly left and right, and giving a brief joyful expression. The lighting is soft and even. The tone is warm, gentle, and innocent — like a boutique kidswear catalog video.');
    formData.append('promptOptimizer', 'true');
    formData.append('resolution', '768P');
    formData.append('duration', '6');

    // Make request to Wiro.ai Hailuo video generation model
    console.log('Sending request to Wiro.ai Hailuo for video generation...');
    const response = await axios.post(
      'https://api.wiro.ai/v1/Run/minimax/hailuo-2-3',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': apiKey,
          'x-nonce': nonce,
          'x-signature': signature
        },
        timeout: 300000 // 5 minutes timeout
      }
    );

    console.log('Video generation task created:', response.data);

    if (!response.data.result) {
      throw new Error('Failed to create video generation task');
    }

    // Save video task to database
    const stmt = db.prepare(`
      INSERT INTO videos (task_id, socket_token, image_url, status, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(response.data.taskid, response.data.socketaccesstoken, imageUrl, 'processing');

    res.json({
      success: true,
      taskId: response.data.taskid,
      socketAccessToken: response.data.socketaccesstoken
    });

  } catch (error) {
    console.error('Video generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.errors?.[0] || error.message || 'Failed to generate video'
    });
  }
};

// Get video task status
export const getVideoTaskStatus = async (req, res) => {
  try {
    const { taskId, socketAccessToken } = req.body;

    if (!taskId && !socketAccessToken) {
      return res.status(400).json({ 
        error: 'Task ID or socket access token is required' 
      });
    }

    const apiKey = process.env.WIRO_API_KEY;
    const apiSecret = process.env.WIRO_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('Wiro.ai API credentials not configured');
    }

    // Generate authentication headers
    const nonce = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', apiKey)
      .update(apiSecret + nonce)
      .digest('hex');

    const formData = new FormData();
    if (taskId) {
      formData.append('taskid', taskId);
    } else {
      formData.append('tasktoken', socketAccessToken);
    }

    // Get task details
    const response = await axios.post(
      'https://api.wiro.ai/v1/Task/Detail',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': apiKey,
          'x-nonce': nonce,
          'x-signature': signature
        }
      }
    );

    console.log('Task status:', response.data);

    if (!response.data.result || !response.data.tasklist || response.data.tasklist.length === 0) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    const task = response.data.tasklist[0];
    const videoUrl = task.outputs && task.outputs.length > 0 ? task.outputs[0].url : null;
    
    // Update database if video is complete
    if (task.status === 'task_postprocess_end' && videoUrl) {
      const updateStmt = db.prepare(`
        UPDATE videos 
        SET video_url = ?, status = 'completed'
        WHERE task_id = ?
      `);
      updateStmt.run(videoUrl, taskId || task.id);
    }
    
    res.json({
      success: true,
      status: task.status,
      outputs: task.outputs || [],
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error('Get task status error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.errors?.[0] || error.message || 'Failed to get task status'
    });
  }
};

// List all videos
export const listVideos = async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM videos 
      WHERE status = 'completed'
      ORDER BY created_at DESC
    `);
    const videos = stmt.all();
    
    res.json({
      success: true,
      videos: videos
    });
  } catch (error) {
    console.error('List videos error:', error.message);
    res.status(500).json({ 
      error: 'Failed to list videos'
    });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM videos WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Video not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete video'
    });
  }
};
