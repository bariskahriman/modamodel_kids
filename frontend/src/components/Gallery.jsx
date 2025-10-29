import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, X, ZoomIn, ZoomOut, Image as ImageIcon, Video, Download, CheckSquare, Square, FolderPlus } from 'lucide-react';
import axios from 'axios';

function Gallery({ onClose, t, language }) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'videos'
  const [photoshoots, setPhotoshoots] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchPhotoshoots();
    fetchVideos();
  }, []);

  const fetchPhotoshoots = async () => {
    try {
      const response = await axios.get('/api/design/photoshoots');
      setPhotoshoots(response.data.photoshoots);
    } catch (error) {
      console.error('Error fetching photoshoots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/video/list');
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      await axios.delete(`/api/design/photoshoots/${id}`);
      setPhotoshoots(photoshoots.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting photoshoot:', error);
      alert(t('deleteFailedPhotoshoot'));
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm(t('deleteVideoConfirm'))) return;
    
    try {
      await axios.delete(`/api/video/${id}`);
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(t('deleteFailedVideo'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Multi-select handlers
  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = activeTab === 'images' 
      ? photoshoots.map(p => p.id)
      : videos.map(v => v.id);
    setSelectedItems(allIds);
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(t('deleteBulkConfirm').replace('{count}', selectedItems.length))) return;
    
    try {
      if (activeTab === 'images') {
        await Promise.all(selectedItems.map(id => axios.delete(`/api/design/photoshoots/${id}`)));
        setPhotoshoots(photoshoots.filter(p => !selectedItems.includes(p.id)));
      } else {
        await Promise.all(selectedItems.map(id => axios.delete(`/api/video/${id}`)));
        setVideos(videos.filter(v => !selectedItems.includes(v.id)));
      }
      clearSelection();
    } catch (error) {
      console.error('Error deleting items:', error);
      alert(t('deleteFailedPhotoshoot'));
    }
  };

  const handleBulkDownload = async () => {
    const items = activeTab === 'images' 
      ? photoshoots.filter(p => selectedItems.includes(p.id))
      : videos.filter(v => selectedItems.includes(v.id));
    
    for (const item of items) {
      const url = activeTab === 'images' ? item.result_url : item.video_url;
      const filename = activeTab === 'images' 
        ? `photoshoot-${item.id}.jpg`
        : `video-${item.id}.mp4`;
      
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Error downloading item:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{t('myGallery')}</h2>
              <p className="text-purple-100 text-sm mt-1">
                {photoshoots.length} {t('images').toLowerCase()} • {videos.length} {t('videos').toLowerCase()}
                {selectionMode && ` • ${selectedItems.length} ${t('selected')}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Selection Mode Controls */}
          {selectionMode ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={selectAll}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
              >
                <CheckSquare className="w-4 h-4" />
                {t('selectAll')}
              </button>
              <button
                onClick={clearSelection}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                {t('cancel')}
              </button>
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDownload}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {t('download')} ({selectedItems.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete')} ({selectedItems.length})
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSelectionMode(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
            >
              <CheckSquare className="w-4 h-4" />
              {t('selectItems')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'images'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              {t('images')} ({photoshoots.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'videos'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Video className="w-5 h-5" />
              {t('videos')} ({videos.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">{t('loading')}</div>
            </div>
          ) : activeTab === 'images' ? (
            // Images Tab
            photoshoots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <ImageIcon className="w-12 h-12 text-purple-600" />
                </div>
                <div className="text-gray-400 text-lg mb-2">{t('noImagesYet')}</div>
                <div className="text-gray-500 text-sm">{t('generateFirstPhotoshoot')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoshoots.map((photoshoot) => {
                  const isSelected = selectedItems.includes(photoshoot.id);
                  return (
                    <div
                      key={photoshoot.id}
                      className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all group ${
                        isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                      }`}
                    >
                      <div 
                        className="relative aspect-square cursor-pointer"
                        onClick={() => selectionMode ? toggleSelection(photoshoot.id) : setSelectedImage(photoshoot.result_url)}
                      >
                        <img
                          src={photoshoot.result_url}
                          alt={photoshoot.garment_filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Selection Checkbox */}
                        {selectionMode && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-purple-600 border-2 border-purple-600' 
                                : 'bg-white/90 border-2 border-gray-300'
                            }`}>
                              {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {photoshoot.garment_filename}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(photoshoot.created_at)}</span>
                            </div>
                          </div>
                          {!selectionMode && (
                            <button
                              onClick={() => handleDelete(photoshoot.id)}
                              className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Videos Tab
            videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Video className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-gray-400 text-lg mb-2">{t('noVideosYet')}</div>
                <div className="text-gray-500 text-sm">{t('generateFirstVideo')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => {
                  const isSelected = selectedItems.includes(video.id);
                  return (
                    <div
                      key={video.id}
                      className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all group ${
                        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}
                    >
                      <div 
                        className="relative aspect-square cursor-pointer bg-black"
                        onClick={() => selectionMode ? toggleSelection(video.id) : setSelectedVideo(video.video_url)}
                      >
                        <video
                          src={video.video_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="bg-white/90 p-4 rounded-full">
                            <Video className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        
                        {/* Selection Checkbox */}
                        {selectionMode && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-blue-600 border-2 border-blue-600' 
                                : 'bg-white/90 border-2 border-gray-300'
                            }`}>
                              {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Video {video.id}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(video.created_at)}</span>
                            </div>
                          </div>
                          {!selectionMode && (
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Image Modal with Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex flex-col"
          onClick={() => {
            setSelectedImage(null);
            setZoom(100);
          }}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(prev => Math.max(prev - 25, 50));
                }}
                disabled={zoom <= 50}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <span className="text-white font-medium min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(prev => Math.min(prev + 25, 200));
                }}
                disabled={zoom >= 200}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(100);
                }}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-white text-sm font-medium"
              >
                {t('reset')}
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedImage(null);
                setZoom(100);
              }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={selectedImage}
              alt={t('fullSize')}
              className="rounded-lg transition-transform duration-300"
              style={{ 
                transform: `scale(${zoom / 100})`,
                maxWidth: zoom > 100 ? 'none' : '100%',
                maxHeight: zoom > 100 ? 'none' : '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Hint */}
          <div className="p-4 text-center">
            <p className="text-white/60 text-sm">{t('clickAnywhereToClose')} • {t('useZoomControls')}</p>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-60 flex flex-col"
          onClick={() => setSelectedVideo(null)}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="text-white font-semibold">{t('videoPlayback')}</div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <video
              src={selectedVideo}
              controls
              autoPlay
              loop
              className="rounded-lg"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Bottom Hint */}
          <div className="p-4 text-center">
            <p className="text-white/60 text-sm">{t('clickAnywhereToClose')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
