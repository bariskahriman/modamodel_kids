import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Upload, X, Shirt, Camera, Download, Image as ImageIcon, User, DollarSign, ZoomIn, ZoomOut, Maximize2, Video } from 'lucide-react';
import { generateDesign, generateVideo, getVideoStatus } from './lib/api';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import { translations } from './translations';

function ImageUpload({ title, icon, description, image, onImageChange, t }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {!image ? (
        <label className="block cursor-pointer">
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-700">{t('clickToUpload')}</span>
            <span className="text-xs text-gray-500 mt-1">{t('fileFormat')}</span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-2 text-sm text-gray-600 truncate">{image.name}</div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [garmentImage, setGarmentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showEthnicityModal, setShowEthnicityModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showPoseModal, setShowPoseModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [modelGender, setModelGender] = useState('girl'); // 'girl' or 'boy'
  const [ageGroup, setAgeGroup] = useState('child'); // 'child' or 'teen'
  const [ethnicity, setEthnicity] = useState('middle-eastern'); // ethnicity selection
  const [background, setBackground] = useState('beige-studio'); // background selection
  const [pose, setPose] = useState('classic-front'); // pose selection
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoTaskId, setVideoTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoProgressMessage, setVideoProgressMessage] = useState('');
  const [credits, setCredits] = useState(100); // Starting credits
  const [showPricing, setShowPricing] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'tr'
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Get translation helper
  const t = (key) => translations[language][key] || key;

  const ageGroups = [
    {
      id: 'child',
      label: 'Child (5-8 years)',
      description: 'Young kids, playful and innocent',
      emoji: '👧👦',
      color: 'pink'
    },
    {
      id: 'teen',
      label: 'Teenager (15-18 years)',
      description: 'Teenage models, confident and stylish',
      emoji: '🧑‍🎤',
      color: 'indigo'
    }
  ];

  const poses = [
    { 
      id: 'classic-front', 
      label: 'Classic Front Pose (Arms Relaxed)',
      description: 'Standing tall, arms at sides, neutral and clear',
      emoji: '🧍',
      color: 'blue'
    },
    { 
      id: 'one-foot-forward', 
      label: 'One Foot Forward (Natural Stance)',
      description: 'Slight forward step, sense of motion and confidence',
      emoji: '🚶',
      color: 'green'
    },
    { 
      id: 'hands-behind', 
      label: 'Hands Behind Back (Playful but Calm)',
      description: 'Arms behind back, innocent and charming',
      emoji: '🙋',
      color: 'yellow'
    },
    { 
      id: 'tilted-head', 
      label: 'Tilted Head with Light Smile',
      description: 'Head slightly tilted, friendly and soft',
      emoji: '😊',
      color: 'orange'
    },
    { 
      id: 'holding-dress', 
      label: 'Feet Together, Holding Dress',
      description: 'Lightly holding sides of garment, elegant',
      emoji: '👗',
      color: 'red'
    }
  ];

  const backgrounds = [
    { 
      id: 'beige-studio', 
      label: 'Soft Beige Studio with Wooden Floor',
      description: 'Warm, calming environment with natural texture',
      emoji: '🏠'
    },
    { 
      id: 'pastel-gradient', 
      label: 'Pastel Gradient Wall (Pink–Peach–Cream)',
      description: 'Gentle, dreamy tones highlighting innocence',
      emoji: '🌸'
    },
    { 
      id: 'white-balloons', 
      label: 'White Wall with Light Balloons',
      description: 'Editorial and playful, clean and fashion-forward',
      emoji: '🎈'
    },
    { 
      id: 'sunlit-window', 
      label: 'Sunlit Window Studio',
      description: 'Natural light with cheerful, candid energy',
      emoji: '☀️'
    },
    { 
      id: 'panel-wall', 
      label: 'Classic Panel Wall (Pale Blue/Mint)',
      description: 'Vintage studio-style with elegant structure',
      emoji: '🎨'
    }
  ];

  const femaleEthnicities = [
    { id: 'middle-eastern', label: 'Middle Eastern', emoji: '👧🏽' },
    { id: 'asian', label: 'Asian', emoji: '👧🏻' },
    { id: 'black', label: 'Black / African Descent', emoji: '👧🏿' },
    { id: 'latin', label: 'Latin', emoji: '👧🏽' },
    { id: 'middle-eastern-hijab', label: 'Middle Eastern (with Hijab)', emoji: '🧕' },
    { id: 'scandinavian', label: 'Scandinavian', emoji: '👧🏼' }
  ];

  const maleEthnicities = [
    { id: 'middle-eastern', label: 'Middle Eastern', emoji: '👦🏽' },
    { id: 'asian', label: 'Asian', emoji: '👦🏻' },
    { id: 'black', label: 'Black / African Descent', emoji: '👦🏿' },
    { id: 'latin', label: 'Latin', emoji: '👦🏽' },
    { id: 'scandinavian', label: 'Scandinavian', emoji: '👦🏼' }
  ];

  const currentEthnicities = modelGender === 'girl' ? femaleEthnicities : maleEthnicities;

  // Helper functions to get selected labels
  const getSelectedEthnicity = () => {
    const selected = currentEthnicities.find(e => e.id === ethnicity);
    return selected ? selected.label : 'Middle Eastern';
  };

  const getSelectedBackground = () => {
    const selected = backgrounds.find(b => b.id === background);
    return selected ? selected.label : 'Soft Beige Studio';
  };

  const getSelectedPose = () => {
    const selected = poses.find(p => p.id === pose);
    return selected ? selected.label : 'Classic Front Pose';
  };

  const getSelectedAge = () => {
    const selected = ageGroups.find(a => a.id === ageGroup);
    return selected ? selected.label : 'Child (5-8 years)';
  };

  // Track which attributes are selected (not default/empty)
  const [hasSelectedModel, setHasSelectedModel] = useState(false);
  const [hasSelectedAge, setHasSelectedAge] = useState(false);
  const [hasSelectedEthnicity, setHasSelectedEthnicity] = useState(false);
  const [hasSelectedBackground, setHasSelectedBackground] = useState(false);
  const [hasSelectedPose, setHasSelectedPose] = useState(false);

  // Calculate image generation cost based on new rules
  const calculateImageCost = () => {
    // Base cost for upload is always 4 credits
    let cost = 4;
    
    // Add 1 credit for each selection
    if (hasSelectedModel) cost += 1;
    if (hasSelectedAge) cost += 1;
    if (hasSelectedEthnicity) cost += 1;
    if (hasSelectedBackground) cost += 1;
    if (hasSelectedPose) cost += 1;
    
    return cost;
  };

  const videoCost = 6; // Fixed cost for video generation

  const handleGenerate = async () => {
    if (!garmentImage) {
      setError('Please upload a garment image');
      return;
    }

    const cost = calculateImageCost();
    if (credits < cost) {
      setError(`Insufficient credits. You need ${cost} credits but only have ${credits}.`);
      return;
    }

    // Show info toast if no selections (random bundle)
    if (cost === 4) {
      console.log('ℹ️ We\'ll pick a random model, age, ethnicity, background, and pose for you.');
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setProgressMessage('Initializing...');

    // Simulate realistic progress
    const progressSteps = [
      { progress: 10, message: 'Uploading garment image...', delay: 500 },
      { progress: 25, message: 'Analyzing garment details...', delay: 1000 },
      { progress: 40, message: 'Preparing AI model...', delay: 1500 },
      { progress: 55, message: 'Generating photoshoot...', delay: 2000 },
      { progress: 70, message: 'Applying lighting effects...', delay: 3000 },
      { progress: 85, message: 'Finalizing image...', delay: 4000 },
      { progress: 95, message: 'Almost ready...', delay: 5000 }
    ];

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const nextStep = progressSteps.find(step => step.progress > prev);
        if (nextStep) {
          setProgressMessage(nextStep.message);
          return nextStep.progress;
        }
        return prev;
      });
    }, 800);

    try {
      const response = await generateDesign(garmentImage, modelGender, ethnicity, background, pose);
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Complete!');
      
      // Deduct credits on success
      setCredits(prev => prev - cost);
      
      // Small delay to show 100%
      setTimeout(() => {
        setResult(response.imageUrl);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to generate photoshoot');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleReset = () => {
    setGarmentImage(null);
    setResult(null);
    setError(null);
    setZoom(100);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleGenerateVideo = async () => {
    if (!result) {
      setError('Please generate a photoshoot first');
      return;
    }

    if (credits < videoCost) {
      setError(`Insufficient credits. You need ${videoCost} credits but only have ${credits}.`);
      return;
    }

    setVideoLoading(true);
    setError(null);
    setVideoUrl(null);
    setVideoProgress(0);
    setVideoProgressMessage('Initializing video generation...');

    // Video generation progress steps
    const videoProgressSteps = [
      { progress: 10, message: 'Preparing image for video...', delay: 500 },
      { progress: 20, message: 'Analyzing motion patterns...', delay: 1000 },
      { progress: 35, message: 'Generating video frames...', delay: 5000 },
      { progress: 50, message: 'Processing animations...', delay: 10000 },
      { progress: 65, message: 'Applying motion effects...', delay: 15000 },
      { progress: 80, message: 'Rendering video...', delay: 20000 },
      { progress: 90, message: 'Finalizing video...', delay: 25000 },
      { progress: 95, message: 'Almost ready...', delay: 30000 }
    ];

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setVideoProgress(prev => {
        const nextStep = videoProgressSteps.find(step => step.progress > prev);
        if (nextStep && prev < 95) {
          setVideoProgressMessage(nextStep.message);
          return nextStep.progress;
        }
        return prev;
      });
    }, 2000);

    try {
      // Generate video prompt based on selections
      const genderText = modelGender === 'girl' ? 'girl' : 'boy';
      const ethnicityLabels = {
        'middle-eastern': 'Middle Eastern',
        'asian': 'Asian',
        'black': 'Black',
        'latin': 'Latin',
        'middle-eastern-hijab': 'Middle Eastern with hijab',
        'scandinavian': 'blonde'
      };
      const ethnicityDesc = ethnicityLabels[ethnicity] || 'Middle Eastern';
      
      const videoPrompt = `A realistic, high-resolution video of a ${ethnicityDesc} ${genderText} child model in a professional photoshoot setting. The child makes subtle, natural movements: slightly swaying side to side, adjusting stance, gently shifting weight from one foot to the other, looking softly left and right with eyes or head, and giving a brief joyful expression. The lighting is soft and even. The tone is warm, gentle, and innocent — like a boutique kidswear catalog video.`;

      const videoResponse = await generateVideo(result, videoPrompt);
      
      if (!videoResponse.success) {
        throw new Error('Failed to start video generation');
      }

      setVideoTaskId(videoResponse.taskId);

      // Poll for video status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await getVideoStatus(videoResponse.taskId, videoResponse.socketAccessToken);
          
          if (statusResponse.status === 'task_postprocess_end' && statusResponse.videoUrl) {
            clearInterval(progressInterval);
            clearInterval(pollInterval);
            setVideoProgress(100);
            setVideoProgressMessage('Complete!');
            
            // Deduct credits on success
            setCredits(prev => prev - videoCost);
            
            // Small delay to show 100%
            setTimeout(() => {
              setVideoUrl(statusResponse.videoUrl);
              setVideoLoading(false);
            }, 500);
          } else if (statusResponse.status.includes('error') || statusResponse.status === 'task_cancel') {
            throw new Error('Video generation failed');
          }
        } catch (err) {
          console.error('Status check error:', err);
          clearInterval(progressInterval);
          clearInterval(pollInterval);
          setVideoLoading(false);
          setError('Failed to generate video');
        }
      }, 3000); // Check every 3 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(pollInterval);
        if (videoLoading) {
          setVideoLoading(false);
          setError('Video generation timed out');
        }
      }, 300000);

    } catch (err) {
      console.error('Video generation error:', err);
      clearInterval(progressInterval);
      setError(err.message || 'Failed to generate video');
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('appTitle')}
                </h1>
                <p className="text-gray-600 text-sm mt-1">{t('appSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Credits Display */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border-2 border-green-200">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-900">{credits} {t('credits')}</span>
              </div>
              
              {/* Language Selection Button */}
              <button
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 px-4 py-2 rounded-full transition-colors border-2 border-blue-200"
              >
                <span className="text-lg">{language === 'en' ? '🇬🇧' : '🇹🇷'}</span>
                <span className="text-sm font-medium text-blue-900">{t('language')}</span>
              </button>
              
              <button
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 px-4 py-2 rounded-full transition-colors"
              >
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">{t('pricing')}</span>
              </button>
              <button
                onClick={() => setShowGallery(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 px-4 py-2 rounded-full transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">{t('gallery')}</span>
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-full transition-colors shadow-md"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{t('profile')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>{t('heroTag')}</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('heroTitle1')}
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('heroTitle2')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('heroDescription')}
          </p>
        </div>

        {/* Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 relative">
              {/* 4 Credits Badge */}
              <div 
                className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                title="If you don't choose any settings, we'll randomize them. Total cost: 4 credits."
                aria-label="Upload with no selections costs 4 credits"
              >
                4 credits
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('uploadTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('uploadSubtitle')}</p>
              </div>
              <ImageUpload
                title={t('kidsGarment')}
                icon={<Shirt className="w-6 h-6" />}
                description={t('uploadClear')}
                image={garmentImage}
                onImageChange={setGarmentImage}
                t={t}
              />
            </div>

            {/* Compact Selection Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t('settingsTitle')}</h3>
                <p className="text-gray-600 text-sm">{t('settingsSubtitle')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Model Preference Button */}
                <button
                  onClick={() => setShowGenderModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all bg-white hover:bg-purple-50 relative"
                  title="Selecting this category adds 1 credit to your image"
                  aria-label="Model selection, costs +1 credit"
                >
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasSelectedModel ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    +1
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">{hasSelectedModel ? (modelGender === 'girl' ? '👧' : '👦') : '🎲'}</div>
                    <div className="text-xs font-semibold text-gray-900">{t('model')}</div>
                    <div className="text-xs text-gray-600 mt-1">{hasSelectedModel ? (modelGender === 'girl' ? t('girlModel').split(' ')[0] : t('boyModel').split(' ')[0]) : t('random')}</div>
                  </div>
                </button>

                {/* Age Group Button */}
                <button
                  onClick={() => setShowAgeModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all bg-white hover:bg-purple-50 relative"
                  title="Selecting this category adds 1 credit to your image"
                  aria-label="Age selection, costs +1 credit"
                >
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasSelectedAge ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    +1
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">{hasSelectedAge ? (ageGroups.find(a => a.id === ageGroup)?.emoji || '👧👦') : '🎲'}</div>
                    <div className="text-xs font-semibold text-gray-900">{t('age')}</div>
                    <div className="text-xs text-gray-600 mt-1 truncate">{hasSelectedAge ? (ageGroup === 'child' ? '5-8 ' + (language === 'tr' ? 'yaş' : 'yrs') : '15-18 ' + (language === 'tr' ? 'yaş' : 'yrs')) : t('random')}</div>
                  </div>
                </button>

                {/* Ethnicity Button */}
                <button
                  onClick={() => setShowEthnicityModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all bg-white hover:bg-purple-50 relative"
                  title="Selecting this category adds 1 credit to your image"
                  aria-label="Ethnicity selection, costs +1 credit"
                >
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasSelectedEthnicity ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    +1
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">{hasSelectedEthnicity ? (currentEthnicities.find(e => e.id === ethnicity)?.emoji || '👧🏽') : '🎲'}</div>
                    <div className="text-xs font-semibold text-gray-900">{t('ethnicity')}</div>
                    <div className="text-xs text-gray-600 mt-1 truncate">{hasSelectedEthnicity ? getSelectedEthnicity().split(' ')[0] : t('random')}</div>
                  </div>
                </button>

                {/* Background Button */}
                <button
                  onClick={() => setShowBackgroundModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all bg-white hover:bg-purple-50 relative"
                  title="Selecting this category adds 1 credit to your image"
                  aria-label="Background selection, costs +1 credit"
                >
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasSelectedBackground ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    +1
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">{hasSelectedBackground ? (backgrounds.find(b => b.id === background)?.emoji || '🏠') : '🎲'}</div>
                    <div className="text-xs font-semibold text-gray-900">{t('background')}</div>
                    <div className="text-xs text-gray-600 mt-1 truncate">{hasSelectedBackground ? getSelectedBackground().split(' ')[0] : t('random')}</div>
                  </div>
                </button>

                {/* Pose Button */}
                <button
                  onClick={() => setShowPoseModal(true)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all bg-white hover:bg-purple-50 relative"
                  title="Selecting this category adds 1 credit to your image"
                  aria-label="Pose selection, costs +1 credit"
                >
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasSelectedPose ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    +1
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">{hasSelectedPose ? (poses.find(p => p.id === pose)?.emoji || '🧍') : '🎲'}</div>
                    <div className="text-xs font-semibold text-gray-900">{t('pose')}</div>
                    <div className="text-xs text-gray-600 mt-1 truncate">{hasSelectedPose ? getSelectedPose().split(' ')[0] : t('random')}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Cost Summary Panel */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5 shadow-lg">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                {t('costBreakdown')}
              </h4>
              
              <div className="space-y-2 mb-3">
                {garmentImage ? (
                  /* Show cost breakdown when image is uploaded */
                  <>
                    {/* Base Upload Cost */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{t('uploadGarment')}</span>
                      <span className="font-bold text-purple-900">4</span>
                    </div>
                    
                    {/* Show selections if any */}
                    {hasSelectedModel && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">+ {t('model')}</span>
                        <span className="font-semibold text-green-600">1</span>
                      </div>
                    )}
                    {hasSelectedAge && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">+ {t('age')}</span>
                        <span className="font-semibold text-green-600">1</span>
                      </div>
                    )}
                    {hasSelectedEthnicity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">+ {t('ethnicity')}</span>
                        <span className="font-semibold text-green-600">1</span>
                      </div>
                    )}
                    {hasSelectedBackground && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">+ {t('background')}</span>
                        <span className="font-semibold text-green-600">1</span>
                      </div>
                    )}
                    {hasSelectedPose && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">+ {t('pose')}</span>
                        <span className="font-semibold text-green-600">1</span>
                      </div>
                    )}
                    
                    {/* Show helper text if no selections */}
                    {calculateImageCost() === 4 && (
                      <p className="text-xs text-gray-600 italic pt-1">{t('noSelectionsMessage')}</p>
                    )}
                  </>
                ) : (
                  /* Show message when no image uploaded */
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 italic">{t('uploadCostMessage')}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t-2 border-purple-300 pt-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">{t('subtotal')}</span>
                  <span className="text-2xl font-bold text-purple-900">{garmentImage ? calculateImageCost() : 0}</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('yourBalance')}</span>
                  <span className="text-lg font-bold text-green-600">{credits}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !garmentImage || credits < calculateImageCost()}
                className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t('creatingMagic')}
                  </>
                ) : credits < calculateImageCost() ? (
                  <>
                    <span>{t('notEnoughCredits')}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <div className="flex flex-col items-center">
                      <span>{t('generatePhotoshoot')}</span>
                      <span className="text-xs font-normal opacity-90">{calculateImageCost()} {t('credits').toLowerCase()}</span>
                    </div>
                  </>
                )}
              </button>

              {(garmentImage || result) && (
                <button
                  onClick={handleReset}
                  className="w-full px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-lg"
                >
                  {t('startOver')}
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg">
                <p className="text-red-800 text-center font-medium text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Side - Output Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-full mb-6">
                  <Camera className="w-16 h-16 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('photoshootAppear')}</h3>
                <p className="text-gray-600 max-w-sm">
                  {t('photoshootAppearDesc')}
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center p-12">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <Loader2 className="relative w-20 h-20 text-purple-600 animate-spin" />
                </div>
                <div className="text-center w-full max-w-md">
                  <p className="text-2xl font-bold text-gray-900 mb-2">{t('creatingPhotoshoot')}</p>
                  <p className="text-purple-700 font-medium mb-6">{progressMessage}</p>
                  
                  {/* Progress Bar with Percentage */}
                  <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{width: `${progress}%`}}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Percentage Display */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600 font-medium">{progress}%</span>
                    <span className="text-gray-500">{t('usuallyTakes')}</span>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-6">
                    <div className={`flex flex-col items-center ${progress >= 25 ? 'text-purple-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 25 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                      <span>{t('upload')}</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    <div className={`flex flex-col items-center ${progress >= 55 ? 'text-purple-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 55 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                      <span>{t('generate')}</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    <div className={`flex flex-col items-center ${progress >= 85 ? 'text-purple-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 85 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                      <span>{t('finalize')}</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                    <div className={`flex flex-col items-center ${progress === 100 ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress === 100 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <span>{t('done')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{t('professionalPhotoshoot')}</h3>
                        <p className="text-purple-100 text-xs">{t('readyToDownload')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowFullscreen(true)}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors"
                      >
                        <Maximize2 className="w-4 h-4" />
                        {t('fullscreen')}
                      </button>
                      <button className="flex items-center gap-2 bg-white text-purple-600 px-3 py-1.5 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors">
                        <Download className="w-4 h-4" />
                        {t('download')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  <div className="relative group h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <img 
                      src={result} 
                      alt="Generated model photoshoot" 
                      className="relative rounded-xl transition-transform duration-300"
                      style={{ 
                        transform: `scale(${zoom / 100})`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>AI Generated</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Professional Quality</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span>Ready for Use</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {zoom}%
                      </button>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Generate Video Button / Progress */}
                  {!videoLoading ? (
                    <button
                      onClick={handleGenerateVideo}
                      disabled={videoLoading || credits < videoCost}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      title={credits < videoCost ? `Not enough credits. You need ${videoCost} credits but only have ${credits}.` : 'Create a short video from this result. Cost: 6 credits.'}
                      aria-label="Generate video from photoshoot, costs 6 credits"
                    >
                      <Video className="w-5 h-5" />
                      <div className="flex flex-col items-center">
                        <span>{credits < videoCost ? 'Not Enough Credits' : 'Generate Video'}</span>
                        <span className="text-xs font-normal opacity-90">{videoCost} credits</span>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full bg-white border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Generating Video</p>
                          <p className="text-xs text-blue-600">{videoProgressMessage}</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                          style={{width: `${videoProgress}%`}}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Percentage */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{videoProgress}%</span>
                        <span className="text-gray-500">Usually takes 30-60 seconds</span>
                      </div>
                    </div>
                  )}

                  {/* Video Player */}
                  {videoUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden border-2 border-blue-200">
                      <video 
                        src={videoUrl} 
                        controls 
                        className="w-full"
                        autoPlay
                        loop
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('howItWorks')}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-pink-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('step1Title')}</h4>
                <p className="text-gray-600 text-sm">
                  {t('step1Desc')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('step2Title')}</h4>
                <p className="text-gray-600 text-sm">
                  {t('step2Desc')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('step3Title')}</h4>
                <p className="text-gray-600 text-sm">
                  {t('step3Desc')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            {t('footerText')}
          </p>
        </div>
      </footer>

      {/* Gallery Modal */}
      {showGallery && <Gallery onClose={() => setShowGallery(false)} />}

      {/* Profile Modal */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}

      {/* Fullscreen Image Modal */}
      {showFullscreen && result && (
        <div
          className="fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
            <img
              src={result}
              alt="Full size photoshoot"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
            Click anywhere to close
          </div>
        </div>
      )}

      {/* Gender Selection Modal */}
      {showGenderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowGenderModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Model Preference</h3>
              <button onClick={() => setShowGenderModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setHasSelectedModel(false);
                  setShowGenderModal(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  !hasSelectedModel ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🎲</div>
                  <div className={`font-semibold ${!hasSelectedModel ? 'text-purple-600' : 'text-gray-700'}`}>
                    Random
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setModelGender('girl');
                  setEthnicity('middle-eastern');
                  setHasSelectedModel(true);
                  setShowGenderModal(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  hasSelectedModel && modelGender === 'girl' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👧</div>
                  <div className={`font-semibold ${hasSelectedModel && modelGender === 'girl' ? 'text-pink-600' : 'text-gray-700'}`}>
                    Girl Model
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setModelGender('boy');
                  setEthnicity('middle-eastern');
                  setHasSelectedModel(true);
                  setShowGenderModal(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  hasSelectedModel && modelGender === 'boy' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👦</div>
                  <div className={`font-semibold ${hasSelectedModel && modelGender === 'boy' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Boy Model
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowLanguageModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{t('language')}</h3>
              <button onClick={() => setShowLanguageModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLanguageModal(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  language === 'en' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🇬🇧</div>
                  <div className={`font-semibold ${language === 'en' ? 'text-blue-600' : 'text-gray-700'}`}>
                    English
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setLanguage('tr');
                  setShowLanguageModal(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  language === 'tr' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🇹🇷</div>
                  <div className={`font-semibold ${language === 'tr' ? 'text-red-600' : 'text-gray-700'}`}>
                    Türkçe
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Age Selection Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowAgeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Age Group</h3>
              <button onClick={() => setShowAgeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {/* Random Option */}
              <button
                onClick={() => {
                  setHasSelectedAge(false);
                  setShowAgeModal(false);
                }}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  !hasSelectedAge ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🎲</div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold text-lg ${!hasSelectedAge ? 'text-purple-600' : 'text-gray-900'}`}>
                      Random Age
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Let us pick the age group
                    </div>
                  </div>
                </div>
              </button>
              
              {ageGroups.map((age) => (
                <button
                  key={age.id}
                  onClick={() => {
                    setAgeGroup(age.id);
                    setHasSelectedAge(true);
                    setShowAgeModal(false);
                  }}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    hasSelectedAge && ageGroup === age.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{age.emoji}</div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold text-lg ${hasSelectedAge && ageGroup === age.id ? 'text-purple-600' : 'text-gray-900'}`}>
                        {age.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {age.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ethnicity Selection Modal */}
      {showEthnicityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowEthnicityModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Ethnicity</h3>
              <button onClick={() => setShowEthnicityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {/* Random Option */}
              <button
                onClick={() => {
                  setHasSelectedEthnicity(false);
                  setShowEthnicityModal(false);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  !hasSelectedEthnicity ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl">🎲</div>
                <div className={`font-medium text-left ${!hasSelectedEthnicity ? 'text-purple-600' : 'text-gray-700'}`}>
                  Random Ethnicity
                </div>
              </button>
              
              {currentEthnicities.map((eth) => (
                <button
                  key={eth.id}
                  onClick={() => {
                    setEthnicity(eth.id);
                    setHasSelectedEthnicity(true);
                    setShowEthnicityModal(false);
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    hasSelectedEthnicity && ethnicity === eth.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl">{eth.emoji}</div>
                  <div className={`font-medium text-left ${hasSelectedEthnicity && ethnicity === eth.id ? 'text-purple-600' : 'text-gray-700'}`}>
                    {eth.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Selection Modal */}
      {showBackgroundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowBackgroundModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Background Setting</h3>
              <button onClick={() => setShowBackgroundModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {/* Random Option */}
              <button
                onClick={() => {
                  setHasSelectedBackground(false);
                  setShowBackgroundModal(false);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  !hasSelectedBackground ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">🎲</div>
                  <div className="text-left flex-1">
                    <div className={`font-semibold text-sm ${!hasSelectedBackground ? 'text-purple-600' : 'text-gray-900'}`}>
                      Random Background
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Let us pick the background</div>
                  </div>
                </div>
              </button>
              
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setBackground(bg.id);
                    setHasSelectedBackground(true);
                    setShowBackgroundModal(false);
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    hasSelectedBackground && background === bg.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0">{bg.emoji}</div>
                    <div className="text-left flex-1">
                      <div className={`font-semibold text-sm ${hasSelectedBackground && background === bg.id ? 'text-pink-600' : 'text-gray-900'}`}>
                        {bg.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{bg.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pose Selection Modal */}
      {showPoseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowPoseModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Model Pose</h3>
              <button onClick={() => setShowPoseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {/* Random Option */}
              <button
                onClick={() => {
                  setHasSelectedPose(false);
                  setShowPoseModal(false);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  !hasSelectedPose ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">🎲</div>
                  <div className="text-left flex-1">
                    <div className={`font-semibold text-sm ${!hasSelectedPose ? 'text-purple-600' : 'text-gray-900'}`}>
                      Random Pose
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Let us pick the pose</div>
                  </div>
                </div>
              </button>
              
              {poses.map((p) => {
                const colorClasses = {
                  blue: hasSelectedPose && pose === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
                  green: hasSelectedPose && pose === p.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
                  yellow: hasSelectedPose && pose === p.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300',
                  orange: hasSelectedPose && pose === p.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300',
                  red: hasSelectedPose && pose === p.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                };
                const textColorClasses = {
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  yellow: 'text-yellow-600',
                  orange: 'text-orange-600',
                  red: 'text-red-600'
                };
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPose(p.id);
                      setHasSelectedPose(true);
                      setShowPoseModal(false);
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${colorClasses[p.color]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{p.emoji}</div>
                      <div className="text-left flex-1">
                        <div className={`font-semibold text-sm ${hasSelectedPose && pose === p.id ? textColorClasses[p.color] : 'text-gray-900'}`}>
                          {p.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4" onClick={() => setShowPricing(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Credit Pricing</h3>
                <p className="text-gray-600 text-sm mt-1">Pay only for what you use</p>
              </div>
              <button onClick={() => setShowPricing(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Current Credits */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Current Balance</p>
                  <p className="text-3xl font-bold text-green-900">{credits} Credits</p>
                </div>
                <Sparkles className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Image Generation Pricing */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Image Generation
              </h4>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                <div className="mb-4">
                  <p className="font-semibold text-purple-900 text-lg mb-2">Pricing Structure:</p>
                  <div className="bg-white rounded-lg p-3 mb-3 border border-purple-200">
                    <p className="font-semibold text-purple-900 text-sm mb-1">Base Cost</p>
                    <p className="text-xs text-gray-600">Upload Garment → <strong>4 credits</strong> (always required)</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <p className="font-semibold text-purple-900 text-sm mb-1">Optional Selections</p>
                    <p className="text-xs text-gray-600">Choose any attributes → <strong>+1 credit each</strong></p>
                  </div>
                </div>
                <div className="border-t border-purple-200 pt-4">
                  <p className="font-semibold text-purple-900 mb-3">Available Selections (+1 credit each):</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">Model (Girl/Boy)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">Age Group</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">Ethnicity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">Background</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">Pose</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Your Current Cost:</p>
                    <p className="text-xl font-bold text-purple-900">{calculateImageCost()} Credits</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculateImageCost() === 4 ? '(Base only - no selections)' : `(Base 4 + ${calculateImageCost() - 4} selection${calculateImageCost() - 4 > 1 ? 's' : ''})`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Generation Pricing */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Video Generation
              </h4>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900 text-lg">Fixed Price: 6 Credits</p>
                    <p className="text-sm text-gray-600 mt-1">6-second animated video from your photoshoot</p>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">6</div>
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">💡 Examples:</p>
              <p className="text-xs text-gray-600 mb-2">
                <strong>No selections:</strong> Base (4) = <span className="font-bold">4 credits</span>
              </p>
              <p className="text-xs text-gray-600 mb-2">
                <strong>2 selections:</strong> Base (4) + Ethnicity (1) + Background (1) = <span className="font-bold">6 credits</span>
              </p>
              <p className="text-xs text-gray-600">
                <strong>All selections + video:</strong> Base (4) + Model (1) + Age (1) + Ethnicity (1) + Background (1) + Pose (1) + Video (6) = <span className="font-bold text-gray-900">15 Credits Total</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
