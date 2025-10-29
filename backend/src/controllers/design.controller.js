import fs from 'fs/promises';
import crypto from 'crypto';
import FormData from 'form-data';
import axios from 'axios';
import { savePhotoshoot, getAllPhotoshoots, deletePhotoshoot } from '../db/database.js';

// Helper function to generate signature
const generateSignature = (apiKey, apiSecret, nonce) => {
  const message = `${apiSecret}${nonce}`;
  return crypto.createHmac('sha256', apiKey).update(message).digest('hex');
};

// Helper function to poll task status
const pollTaskStatus = async (taskToken, apiKey, apiSecret, maxAttempts = 60) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const nonce = Date.now().toString();
    const signature = generateSignature(apiKey, apiSecret, nonce);
    
    try {
      const response = await axios.post('https://api.wiro.ai/v1/Task/Detail', {
        tasktoken: taskToken
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-nonce': nonce,
          'x-signature': signature
        }
      });
      
      if (response.data.tasklist && response.data.tasklist.length > 0) {
        const task = response.data.tasklist[0];
        
        if (task.status === 'task_postprocess_end' && task.outputs && task.outputs.length > 0) {
          return task.outputs[0].url;
        }
        
        if (task.status.includes('error') || task.status === 'task_cancel') {
          throw new Error(`Task failed with status: ${task.status}`);
        }
      }
    } catch (error) {
      console.error('Error polling task:', error.message);
    }
  }
  
  throw new Error('Task timeout - image generation took too long');
};

export const generateDesign = async (req, res) => {
  try {
    if (!req.files || !req.files.garment) {
      return res.status(400).json({ 
        error: 'Garment image is required' 
      });
    }

    const garmentFile = req.files.garment[0];
    const modelGender = req.body.modelGender || 'girl'; // Default to girl if not specified
    const ethnicity = req.body.ethnicity || 'middle-eastern'; // Default ethnicity
    const background = req.body.background || 'beige-studio'; // Default background
    const pose = req.body.pose || 'classic-front'; // Default pose

    console.log('Processing garment image:', {
      garment: garmentFile.filename,
      modelGender: modelGender,
      ethnicity: ethnicity,
      background: background,
      pose: pose
    });

    const apiKey = process.env.WIRO_API_KEY;
    const apiSecret = process.env.WIRO_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('Wiro.ai API credentials not configured');
    }

    // Generate authentication headers
    const nonce = Date.now().toString();
    const signature = generateSignature(apiKey, apiSecret, nonce);

    // Create form data for Wiro.ai API
    const formData = new FormData();
    
    // Send garment image
    formData.append('inputImage', await fs.readFile(garmentFile.path), {
      filename: garmentFile.originalname,
      contentType: garmentFile.mimetype
    });
    
    // Prompt for professional kid model photoshoot with gender, ethnicity, and background specification
    const genderText = modelGender === 'boy' ? 'boy' : 'girl';
    const pronouns = modelGender === 'boy' ? 'he' : 'she';
    
    // Map ethnicity to descriptive text
    const ethnicityDescriptions = {
      'middle-eastern': 'Middle Eastern',
      'asian': 'Asian',
      'black': 'Black/African descent',
      'latin': 'Latin/Hispanic',
      'middle-eastern-hijab': 'Middle Eastern wearing a hijab',
      'scandinavian': 'Scandinavian/Nordic'
    };
    
    // Map background to descriptive text
    const backgroundDescriptions = {
      'beige-studio': 'soft beige studio background with wooden floor, warm and calming environment with natural texture',
      'pastel-gradient': 'pastel gradient wall with pink, peach, and cream tones, gentle and dreamy atmosphere',
      'white-balloons': 'clean white wall with subtle light balloons in the background (slightly blurred), editorial and playful style',
      'sunlit-window': 'sunlit window studio with white curtains, natural light creating cheerful and candid energy',
      'panel-wall': 'classic panel wall in pale blue or mint color, vintage studio-style with elegant structure'
    };
    
    // Map pose to descriptive text
    const poseDescriptions = {
      'classic-front': 'standing tall facing forward with arms gently relaxed at sides, feet flat on the ground, neutral and confident stance',
      'one-foot-forward': 'one foot slightly forward with gentle shift in body weight, natural stance with sense of motion and subtle confidence',
      'hands-behind': 'arms behind the back with chest open and body straight, playful yet calm posture showing innocence and charm',
      'tilted-head': 'standing with head slightly tilted to one side with a light smile, friendly and soft expression creating warmth',
      'holding-dress': 'feet together or slightly apart, lightly holding the sides of the garment with gentle expression, elegant and poised'
    };
    
    const ethnicityText = ethnicityDescriptions[ethnicity] || 'Middle Eastern';
    const backgroundText = backgroundDescriptions[background] || 'soft beige studio background with wooden floor';
    const poseText = poseDescriptions[pose] || 'standing tall facing forward with arms relaxed at sides';
    const hijabNote = ethnicity === 'middle-eastern-hijab' ? ' The child is wearing a traditional hijab as part of their cultural attire.' : '';
    
    formData.append('prompt', `Professional photoshoot of a cute ${ethnicityText} ${genderText} kid model wearing this garment. Background: ${backgroundText}. Pose: ${poseText}. Studio lighting, fashion photography, high quality, the child should be smiling naturally. The garment should fit perfectly and ${pronouns} should look stylish and confident. Professional fashion catalog style.${hijabNote}`);
    formData.append('temperature', '0.9');

    // Make request to Wiro.ai Nano Banana model
    console.log('Sending request to Wiro.ai Nano Banana for photoshoot generation...');
    const response = await axios.post(
      'https://api.wiro.ai/v1/Run/google/nano-banana',
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

    if (!response.data.result || !response.data.socketaccesstoken) {
      throw new Error('Failed to start image generation task');
    }

    console.log('Task started, polling for results...');
    const taskToken = response.data.socketaccesstoken;
    
    // Poll for task completion
    const imageUrl = await pollTaskStatus(taskToken, apiKey, apiSecret);

    // Save to database
    const photoshootId = savePhotoshoot(
      garmentFile.originalname,
      garmentFile.path,
      imageUrl
    );

    console.log(`Photoshoot saved to database with ID: ${photoshootId}`);

    // Clean up uploaded file
    await fs.unlink(garmentFile.path);

    res.json({
      success: true,
      imageUrl,
      photoshootId,
      message: 'Model photoshoot generated successfully'
    });

  } catch (error) {
    console.error('Error generating photoshoot:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Clean up files on error
    if (req.files && req.files.garment) {
      await fs.unlink(req.files.garment[0].path).catch(() => {});
    }

    res.status(500).json({ 
      error: 'Failed to generate design visualization',
      message: error.message,
      details: error.toString()
    });
  }
};

// Get all photoshoots
export const getPhotoshoots = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const photoshoots = getAllPhotoshoots(limit);
    
    res.json({
      success: true,
      count: photoshoots.length,
      photoshoots
    });
  } catch (error) {
    console.error('Error fetching photoshoots:', error);
    res.status(500).json({
      error: 'Failed to fetch photoshoots',
      message: error.message
    });
  }
};

// Delete a photoshoot
export const removePhotoshoot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = deletePhotoshoot(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Photoshoot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Photoshoot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photoshoot:', error);
    res.status(500).json({
      error: 'Failed to delete photoshoot',
      message: error.message
    });
  }
};
