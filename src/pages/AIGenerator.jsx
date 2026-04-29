import React, { useState } from 'react';
import { FaTimes, FaTrophy, FaMoneyBill, FaPlusCircle, FaList, FaSignOutAlt, FaUser, FaInfoCircle } from "react-icons/fa";

const AIGenerator = () => {
  const [colabUrl, setColabUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [safetyFilter, setSafetyFilter] = useState(true);
  const [steps, setSteps] = useState(5);
  const [guidance, setGuidance] = useState(7.5);
  
  // ✅ ADD SIDEBAR STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to true for side-by-side

  // Banned keywords filter
  const bannedKeywords = [
    'nude', 'naked', 'sex', 'porn', 'nsfw', 'explicit', 'adult',
    'gore', 'violence', 'blood', 'death', 'corpse', 'murder',
    'drug', 'weapon', 'gun', 'knife', 'war', 'torture',
    'hitler', 'racist', 'offensive', 'abuse'
  ];

  const checkPromptSafety = (text) => {
    const lowerText = text.toLowerCase();
    for (const keyword of bannedKeywords) {
      if (lowerText.includes(keyword)) {
        return { safe: false, keyword };
      }
    }
    return { safe: true };
  };

  const connectToServer = async () => {
    if (!colabUrl) {
      setStatus('❌ Please enter a URL');
      return;
    }
    
    let url = colabUrl.trim().replace(/\/$/, '');
    if (!url.startsWith('http')) {
      url = 'https://' + url;
      setColabUrl(url);
    }
    
    setLoading(true);
    setStatus('🔌 Testing connection...');
    
    try {
      console.log('Testing connection to:', url);
      
      const endpoints = ['/health', '/', '/generate'];
      let connectedSuccess = false;
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${url}${endpoint}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000)
          });
          
          if (response.ok) {
            connectedSuccess = true;
            setConnected(true);
            setStatus('✅ Connected to Colab Server!');
            break;
          }
        } catch (e) {
          console.log(`Endpoint ${endpoint} failed:`, e.message);
        }
      }
      
      if (!connectedSuccess) {
        try {
          await fetch(url, { 
            mode: 'no-cors',
            signal: AbortSignal.timeout(3000)
          });
          setConnected(true);
          setStatus('✅ Connected to Colab Server!');
        } catch (e) {
          setStatus('❌ Connection failed - Make sure Colab is running and URL is correct');
        }
      }
      
    } catch (error) {
      setStatus('❌ Connection error: ' + error.message);
    }
    
    setLoading(false);
  };

  const generateImage = async () => {
    if (!connected || !prompt) return;
    
    if (safetyFilter) {
      const safetyCheck = checkPromptSafety(prompt);
      if (!safetyCheck.safe) {
        setStatus(`❌ Blocked: Contains inappropriate content (${safetyCheck.keyword})`);
        return;
      }
      
      if (negativePrompt) {
        const negSafetyCheck = checkPromptSafety(negativePrompt);
        if (!negSafetyCheck.safe) {
          setStatus(`❌ Blocked: Negative prompt contains inappropriate content`);
          return;
        }
      }
    }
    
    setLoading(true);
    setStatus('🎨 Generating realistic image...');
    setImage('');
    
    try {
      let url = colabUrl.trim().replace(/\/$/, '');
      const isNgrok = url.includes('ngrok');
      let apiUrl = url;
      
      if (isNgrok) {
        apiUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        console.log('Using CORS proxy for ngrok URL');
      }
      
      const realismBoosters = 'photorealistic, hyperrealistic, 8k, highly detailed, sharp focus, natural lighting, lifelike, cinematic, 35mm photography, f/1.8, professional photograph, award winning, trending on artstation';
      const enhancedPrompt = `${prompt}, ${realismBoosters}`;
      
      const defaultNegative = 'cartoon, anime, painting, drawing, sketch, 3d render, cgi, illustration, low quality, blurry, distorted, ugly, deformed, watermark, signature, text, extra limbs, bad anatomy, mutation, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, Photoshop, video game, tiled, low resolution, worst quality, normal quality, jpeg artifacts, error, pixelated';
      
      const finalNegativePrompt = negativePrompt ? `${negativePrompt}, ${defaultNegative}` : defaultNegative;
      
      const apiConfigs = [
        {
          endpoint: '/sdapi/v1/txt2img',
          payload: {
            prompt: enhancedPrompt,
            negative_prompt: finalNegativePrompt,
            steps: Math.min(steps, 20),
            cfg_scale: guidance,
            width: 512,
            height: 512,
            sampler_index: 'Euler a',
            seed: -1,
            batch_size: 1
          }
        },
        {
          endpoint: '/generate',
          payload: {
            prompt: enhancedPrompt,
            negative_prompt: finalNegativePrompt,
            num_inference_steps: Math.min(steps, 20),
            guidance_scale: guidance,
            width: 512,
            height: 512
          }
        },
        {
          endpoint: '/api/generate',
          payload: {
            prompt: enhancedPrompt,
            negative_prompt: finalNegativePrompt,
            steps: Math.min(steps, 20),
            cfg: guidance,
            width: 512,
            height: 512
          }
        }
      ];
      
      let generated = false;
      
      for (const config of apiConfigs) {
        try {
          console.log(`Trying ${config.endpoint}...`);
          
          const response = await fetch(`${apiUrl}${config.endpoint}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(config.payload),
            signal: AbortSignal.timeout(60000)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Response received:', data);
            
            let imageData = null;
            
            if (data.images && data.images[0]) {
              imageData = `data:image/png;base64,${data.images[0]}`;
            }
            else if (data.image) {
              if (typeof data.image === 'string') {
                if (data.image.startsWith('http')) {
                  try {
                    const imgResponse = await fetch(data.image, {
                      mode: 'cors',
                      headers: { 'Accept': 'image/*' }
                    });
                    const blob = await imgResponse.blob();
                    imageData = URL.createObjectURL(blob);
                  } catch (imgError) {
                    imageData = data.image;
                  }
                } else if (data.image.length > 100) {
                  imageData = `data:image/png;base64,${data.image}`;
                }
              }
            }
            else if (data.output && data.output[0]) {
              imageData = data.output[0];
            }
            else if (typeof data === 'string' && data.length > 100) {
              if (data.startsWith('http')) {
                imageData = data;
              } else {
                imageData = `data:image/png;base64,${data}`;
              }
            }
            else if (Array.isArray(data) && data[0]) {
              if (typeof data[0] === 'string') {
                imageData = data[0];
              }
            }
            
            if (imageData) {
              setImage(imageData);
              setStatus('✅ Image generated successfully!');
              generated = true;
              break;
            }
          }
        } catch (e) {
          console.log(`Endpoint ${config.endpoint} failed:`, e.message);
        }
      }
      
      if (!generated && isNgrok) {
        try {
          const directResponse = await fetch(`${url}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: enhancedPrompt,
              negative_prompt: finalNegativePrompt
            }),
            mode: 'cors'
          });
          
          if (directResponse.ok) {
            const data = await directResponse.json();
            if (data.image) {
              setImage(data.image);
              setStatus('✅ Image generated successfully!');
              generated = true;
            }
          }
        } catch (e) {
          console.log('Direct fallback failed:', e);
        }
      }
      
      if (!generated) {
        setStatus('❌ Generation failed - Please check:\n1. Colab is still running\n2. URL is correct\n3. Try visiting https://cors-anywhere.herokuapp.com and request access');
      }
      
    } catch (error) {
      setStatus('❌ Generation failed: ' + error.message);
    }
    setLoading(false);
  };

  const downloadImage = async () => {
    if (!image) return;
    
    try {
      const link = document.createElement('a');
      
      if (image.startsWith('data:')) {
        link.href = image;
        link.download = `ai-image-${Date.now()}.png`;
        link.click();
      } else if (image.startsWith('blob:')) {
        link.href = image;
        link.download = `ai-image-${Date.now()}.png`;
        link.click();
      } else if (image.startsWith('http')) {
        try {
          const response = await fetch(image, { 
            mode: 'cors',
            headers: { 'Accept': 'image/*' }
          });
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = `ai-image-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          window.open(image, '_blank');
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      window.open(image, '_blank');
    }
  };

  // ✅ TOGGLE SIDEBAR FUNCTION
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white flex">
      {/* ✅ SIDEBAR - FIXED ON LEFT WITH EXACT DESIGN FROM IMAGE */}
      <aside className={`w-[300px] bg-white text-gray-800 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0 ${
        isSidebarOpen ? 'block' : 'hidden'
      }`}>
        {/* CLOSE BUTTON */}
        <button 
          onClick={toggleSidebar}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-10"
        >
          <FaTimes className="text-gray-600" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-[#D6482B]">InnovativeWebShop</h1>
        </div>

        {/* Auctions Section */}
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Auctions
          </h2>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <FaTrophy className="text-[#D6482B]" /> Leaderboard
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <FaMoneyBill className="text-[#D6482B]" /> Submit Commission
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all bg-gray-50 border-l-4 border-[#D6482B]">
              <FaPlusCircle className="text-[#D6482B]" /> Create Auction
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <FaList className="text-[#D6482B]" /> View My Auctions
            </button>
          </nav>

          {/* Logout */}
          <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all w-full text-left mt-6">
            <FaSignOutAlt /> Logout
          </button>

          {/* Divider */}
          <div className="border-t my-6"></div>

          {/* AI Image Generator Section */}
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            AI Image Generator
          </h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Connect to Colab</p>
            <p className="text-xs text-gray-500 mb-2">Colab ngrok URL below</p>
            <input 
              type="text" 
              value="123.ngrok.io" 
              readOnly 
              className="w-full p-2 text-xs bg-white border rounded mb-3"
            />
            <button className="w-full bg-[#D6482B] text-white py-2 rounded-lg text-sm hover:bg-[#b8381e] transition-all">
              Test Connection
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
              <FaUser /> Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
              <FaInfoCircle /> How it works
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
              <FaInfoCircle /> About Us
            </button>
          </nav>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT - AI GENERATOR */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* TOGGLE SIDEBAR BUTTON - ONLY SHOWS WHEN SIDEBAR IS CLOSED */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 bg-[#D6482B] text-white p-3 rounded-lg z-50"
          >
            ☰ Open Menu
          </button>
        )}

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
            🎨 AI Image Generator
          </h1>
          
          {/* Connection Panel */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-2xl mb-4 text-blue-400">Step 1: Connect to Colab</h2>
            <div className={`p-3 rounded-lg mb-4 ${
              status.includes('✅') ? 'bg-green-500/20 text-green-400' : 
              status.includes('❌') ? 'bg-red-500/20 text-red-400' : 
              'bg-blue-500/20 text-blue-400'
            }`}>
              {status || 'Enter your Colab ngrok URL below'}
            </div>
            
            <input
              type="text"
              value={colabUrl}
              onChange={(e) => setColabUrl(e.target.value)}
              placeholder="https://abc123.ngrok.io"
              className="w-full p-3 bg-white/10 rounded-lg border border-white/20 mb-4 text-white"
            />
            
            <button
              onClick={connectToServer}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-all"
            >
              {loading ? 'Connecting...' : '🔌 Test Connection'}
            </button>
          </div>

          {/* Generator Panel */}
          {connected && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl mb-4 text-blue-400">Step 2: Generate Image</h2>
              
              <label className="block text-sm mb-2 text-gray-300">✨ What do you want to see?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A beautiful sunset over mountains, digital art, 8k"
                className="w-full p-3 bg-white/10 rounded-lg border border-white/20 mb-4 text-white min-h-[80px]"
              />
              
              <label className="block text-sm mb-2 text-gray-300">
                ⚠️ What to AVOID? (Optional - prevents bad images)
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, bad quality, deformed, ugly, extra limbs, bad anatomy, watermark, text"
                className="w-full p-3 bg-red-950/30 rounded-lg border border-red-500/30 mb-4 text-white min-h-[60px] placeholder-gray-400"
              />
              
              <details className="mb-4">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                  ⚙️ Advanced Settings
                </summary>
                <div className="mt-3 p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={safetyFilter}
                      onChange={(e) => setSafetyFilter(e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm">Enable safety filter</label>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Quality Steps: {steps}</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={steps}
                      onChange={(e) => setSteps(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400">Higher = better quality, slower</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Guidance Scale: {guidance}</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={guidance}
                      onChange={(e) => setGuidance(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400">Higher = follows prompt more strictly</p>
                  </div>
                </div>
              </details>
              
              <button
                onClick={generateImage}
                disabled={loading || !prompt}
                className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🎨 Generating...' : '🚀 Generate Beautiful Image'}
              </button>

              {/* Image Result */}
              {image && (
                <div className="text-center">
                  <img 
                    src={image} 
                    alt="Generated" 
                    className="max-w-full rounded-lg mx-auto shadow-2xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      setStatus('⚠️ Image failed to load');
                    }}
                  />
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={downloadImage}
                      className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>💾</span> Download
                    </button>
                    <button
                      onClick={() => {
                        if (image && image.startsWith('blob:')) {
                          URL.revokeObjectURL(image);
                        }
                        setPrompt('');
                        setNegativePrompt('');
                        setImage('');
                        setStatus('');
                      }}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>🆕</span> New Image
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">📋 Try these safe prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {['A serene landscape with mountains and lake', 
                    'Futuristic city at night with neon lights', 
                    'Cute cat playing with yarn, watercolor style', 
                    'Abstract painting with vibrant colors'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(suggestion)}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;