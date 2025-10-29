import axios from 'axios';

export const generateDesign = async (garmentImage, modelGender = 'girl', ethnicity = 'middle-eastern', background = 'beige-studio', pose = 'classic-front') => {
  const formData = new FormData();
  formData.append('garment', garmentImage);
  formData.append('modelGender', modelGender);
  formData.append('ethnicity', ethnicity);
  formData.append('background', background);
  formData.append('pose', pose);

  const response = await axios.post('/api/design/generate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const generateVideo = async (imageUrl, prompt) => {
  const response = await axios.post('/api/video/generate', {
    imageUrl,
    prompt
  });

  return response.data;
};

export const getVideoStatus = async (taskId, socketAccessToken) => {
  const response = await axios.post('/api/video/status', {
    taskId,
    socketAccessToken
  });

  return response.data;
};
