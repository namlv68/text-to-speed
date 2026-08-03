const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to get API Key (from header or env)
const MASTER_ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY || '21b97e4410782023937690e35d4e50ef84a03d841e1455831a438cea7afad0b9';

const getElevenLabsKey = (req) => {
  const headerKey = req.headers['x-elevenlabs-key'] || req.headers['x-api-key'];
  if (headerKey && headerKey.trim() !== '') return headerKey.trim();
  return MASTER_ELEVENLABS_KEY;
};

// Login API Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Tên đăng nhập' && password === 'Mật khẩu') {
    return res.json({
      success: true,
      user: { username: '0981028794', name: 'Nam AI Master VIP' },
      apiKey: MASTER_ELEVENLABS_KEY
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
  });
});

const getGoogleKey = (req) => {
  const headerKey = req.headers['x-google-key'];
  if (headerKey && headerKey.trim() !== '') return headerKey.trim();
  return process.env.GOOGLE_TTS_API_KEY || '';
};

const getVbeeKey = (req) => {
  const headerKey = req.headers['x-vbee-key'];
  if (headerKey && headerKey.trim() !== '') return headerKey.trim();
  return process.env.VBEE_API_KEY || process.env.VBEE_APP_ID || '';
};

// Default Voices (Nam AI Giọng Đọc Studio)
const MOCK_ELEVENLABS_VOICES = [
  {
    voice_id: "21m00Tcm4TlvDq8ikWAM",
    provider: "elevenlabs",
    name: "Rachel (Nữ - Truyền Cảm)",
    category: "premade",
    labels: { accent: "tiếng anh", gender: "female", age: "young", use_case: "narration" },
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/65f4b38e-cd70-4f81-9a74-98448f2195f2.mp3",
    description: "Giọng nữ truyền cảm, tự nhiên."
  },
  {
    voice_id: "EXAVITQu4vr4xnSDxMaL",
    provider: "elevenlabs",
    name: "Bella (Nữ - Ngọt Ngào & Nhẹ Nhàng)",
    category: "premade",
    labels: { accent: "đa ngôn ngữ", gender: "female", age: "young", use_case: "conversational" },
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/3a144e57-ab98-4645-a477-987be7b5c00e.mp3",
    description: "Giọng nữ hỗ trợ Tiếng Việt ngọt ngào."
  },
  {
    voice_id: "TxGEqnHWrfWFTfGW9XjX",
    provider: "elevenlabs",
    name: "Josh (Nam - Trầm Ấm)",
    category: "premade",
    labels: { accent: "đa ngôn ngữ", gender: "male", age: "young", use_case: "deep" },
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/3a6e382f-8700-474d-937a-bc12b87f8f11.mp3",
    description: "Giọng nam trầm ấm, chuyên nghiệp."
  },
  {
    voice_id: "pNInz6obpgDQGcFmaJgB",
    provider: "elevenlabs",
    name: "Adam (Nam - Truyền Cảm Hứng)",
    category: "premade",
    labels: { accent: "tiếng anh", gender: "male", age: "middle_aged", use_case: "deep" },
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/6a03b60f-e627-4632-94f4-5f4c4a45a7d9.mp3",
    description: "Giọng nam truyền cảm hứng."
  }
];

const MOCK_GOOGLE_VOICES = [
  {
    voice_id: "vi-VN-Neural2-A",
    provider: "google",
    name: "Họa Mi (Nữ - Tiếng Việt Neural2)",
    languageCode: "vi-VN",
    category: "Neural2",
    labels: { accent: "vietnamese", gender: "female", age: "adult", use_case: "natural" },
    description: "Giọng Nữ AI sinh động."
  },
  {
    voice_id: "vi-VN-Wavenet-A",
    provider: "google",
    name: "Thu Hà (Nữ - Tiếng Việt Chuẩn)",
    languageCode: "vi-VN",
    category: "Wavenet",
    labels: { accent: "vietnamese", gender: "female", age: "adult", use_case: "news" },
    description: "Giọng Nữ đọc báo, tin tức."
  },
  {
    voice_id: "vi-VN-Wavenet-B",
    provider: "google",
    name: "Minh Quân (Nam - Tiếng Việt Trầm Ấm)",
    languageCode: "vi-VN",
    category: "Wavenet",
    labels: { accent: "vietnamese", gender: "male", age: "adult", use_case: "narration" },
    description: "Giọng Nam truyền cảm."
  },
  {
    voice_id: "vi-VN-Wavenet-C",
    provider: "google",
    name: "Ngọc Mai (Nữ - Tiếng Việt Dịu Dàng)",
    languageCode: "vi-VN",
    category: "Wavenet",
    labels: { accent: "vietnamese", gender: "female", age: "young", use_case: "story" },
    description: "Giọng Nữ mượt mà đọc sách."
  },
  {
    voice_id: "vi-VN-Wavenet-D",
    provider: "google",
    name: "Hùng Dũng (Nam - Tiếng Việt Uy Nghiêm)",
    languageCode: "vi-VN",
    category: "Wavenet",
    labels: { accent: "vietnamese", gender: "male", age: "middle_aged", use_case: "announcement" },
    description: "Giọng Nam rõ ràng, uy nghiêm."
  }
];

const MOCK_VBEE_VOICES = [
  {
    voice_id: "vi_female_hn_ngoc_huyen_news_48k-v2",
    provider: "vbee",
    name: "Ngọc Huyền (Nữ Hà Nội - Vbee AI)",
    languageCode: "vi-VN",
    category: "Vbee",
    labels: { accent: "vietnamese", gender: "female", age: "adult", use_case: "news" },
    description: "Giọng Nữ Hà Nội đọc báo, phát thanh viên chuẩn Vbee."
  },
  {
    voice_id: "vi_male_hn_nam_khanh_48k-v2",
    provider: "vbee",
    name: "Nam Khánh (Nam Hà Nội - Vbee AI)",
    languageCode: "vi-VN",
    category: "Vbee",
    labels: { accent: "vietnamese", gender: "male", age: "adult", use_case: "narration" },
    description: "Giọng Nam Hà Nội trầm ấm, lồng tiếng phim Vbee."
  },
  {
    voice_id: "vi_female_sg_ngoc_trinh_48k-v2",
    provider: "vbee",
    name: "Ngọc Trinh (Nữ Sài Gòn - Vbee AI)",
    languageCode: "vi-VN",
    category: "Vbee",
    labels: { accent: "vietnamese", gender: "female", age: "young", use_case: "story" },
    description: "Giọng Nữ Miền Nam ngọt ngào, mượt mà."
  },
  {
    voice_id: "vi_male_sg_minh_hoang_48k-v2",
    provider: "vbee",
    name: "Minh Hoàng (Nam Sài Gòn - Vbee AI)",
    languageCode: "vi-VN",
    category: "Vbee",
    labels: { accent: "vietnamese", gender: "male", age: "adult", use_case: "commercial" },
    description: "Giọng Nam Miền Nam truyền cảm hứng, rõ tiếng."
  }
];

// 1. Health check & status
app.get('/api/health', async (req, res) => {
  const elevenKey = getElevenLabsKey(req);
  const googleKey = getGoogleKey(req);

  res.json({
    status: 'ok',
    elevenlabs: {
      hasKey: Boolean(elevenKey && elevenKey !== 'your_elevenlabs_api_key_here')
    },
    google: {
      hasKey: Boolean(googleKey && googleKey !== 'your_google_tts_api_key_here')
    }
  });
});

// 2. Fetch voices from provider or fallback
app.get('/api/voices', async (req, res) => {
  const provider = req.query.provider || 'all'; // 'elevenlabs', 'google', 'vbee', 'all'
  const elevenKey = getElevenLabsKey(req);
  const googleKey = getGoogleKey(req);
  const vbeeKey = getVbeeKey(req);

  let resultVoices = [];

  // Fetch ElevenLabs voices if requested
  if (provider === 'elevenlabs' || provider === 'all') {
    if (elevenKey && elevenKey !== 'your_elevenlabs_api_key_here') {
      try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': elevenKey }
        });
        const formatted = response.data.voices.map(v => ({ ...v, provider: 'elevenlabs' }));
        resultVoices.push(...formatted);
      } catch (err) {
        console.warn('ElevenLabs API fetch error, using mock:', err.message);
        resultVoices.push(...MOCK_ELEVENLABS_VOICES);
      }
    } else {
      resultVoices.push(...MOCK_ELEVENLABS_VOICES);
    }
  }

  // Fetch Google Cloud voices if requested
  if (provider === 'google' || provider === 'all') {
    if (googleKey && googleKey !== 'your_google_tts_api_key_here') {
      try {
        const response = await axios.get(`https://texttospeech.googleapis.com/v1/voices?key=${googleKey}`);
        if (response.data?.voices) {
          const gVoices = response.data.voices
            .filter(v => v.languageCodes.some(lc => lc.startsWith('vi') || lc === 'en-US'))
            .map(v => ({
              voice_id: v.name,
              provider: 'google',
              name: `Google ${v.name.includes('Wavenet') ? 'Wavenet' : v.name.includes('Neural') ? 'Neural2' : 'Standard'} (${v.languageCodes[0]} - ${v.ssmlGender})`,
              languageCode: v.languageCodes[0],
              category: v.name.includes('Wavenet') ? 'Wavenet' : 'Neural2',
              labels: {
                accent: v.languageCodes[0].startsWith('vi') ? 'vietnamese' : 'american',
                gender: v.ssmlGender.toLowerCase(),
                use_case: 'tts'
              },
              description: `Giọng ${v.ssmlGender} chuẩn Google ${v.languageCodes[0]}`
            }));
          resultVoices.push(...(gVoices.length > 0 ? gVoices : MOCK_GOOGLE_VOICES));
        } else {
          resultVoices.push(...MOCK_GOOGLE_VOICES);
        }
      } catch (err) {
        console.warn('Google Cloud TTS API fetch error, using default list:', err.message);
        resultVoices.push(...MOCK_GOOGLE_VOICES);
      }
    } else {
      resultVoices.push(...MOCK_GOOGLE_VOICES);
    }
  }

  res.json({ voices: resultVoices });
});

// 3. ElevenLabs TTS Endpoint
app.post('/api/tts', async (req, res) => {
  const { text, voice_id, model_id, voice_settings, enhance } = req.body;
  const apiKey = getElevenLabsKey(req);

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Văn bản không được để trống' });
  }

  if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
    return res.status(401).json({
      error: 'NO_ELEVENLABS_KEY',
      message: 'Bạn chưa nhập ElevenLabs API Key. Vui lòng nhấn nút "API Keys" ở trên cùng để nhập Key.'
    });
  }

  // Enhance Mode Tuning for Eleven v3
  const isV3 = model_id === 'eleven_v3';
  const isEnhance = enhance !== false;

  let finalStability = typeof voice_settings?.stability === 'number' ? voice_settings.stability : 0.35;
  let finalClarity = typeof voice_settings?.similarity_boost === 'number' ? voice_settings.similarity_boost : 0.80;
  let finalStyle = typeof voice_settings?.style === 'number' ? voice_settings.style : 0.40;

  if (isV3 && isEnhance) {
    // Optimized values for Eleven v3 hyper-realism and expressive dynamics
    finalStability = Math.min(finalStability, 0.30);
    finalClarity = Math.max(finalClarity, 0.85);
    finalStyle = Math.max(finalStyle, 0.50);
  }

  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id || '21m00Tcm4TlvDq8ikWAM'}`,
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      data: {
        text: text,
        model_id: model_id || 'eleven_v3',
        voice_settings: {
          stability: finalStability,
          similarity_boost: finalClarity,
          style: finalStyle,
          use_speaker_boost: voice_settings?.use_speaker_boost !== undefined ? Boolean(voice_settings.use_speaker_boost) : true
        }
      },
      responseType: 'arraybuffer'
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="elevenlabs_speech.mp3"',
      'Content-Length': response.data.length
    });

    return res.send(Buffer.from(response.data));
  } catch (error) {
    let errorMsg = error.message;
    let isInvalidKey = false;

    if (error.response?.status === 401) {
      isInvalidKey = true;
    }

    if (error.response?.data) {
      try {
        const decoded = JSON.parse(Buffer.from(error.response.data).toString());
        errorMsg = decoded.detail?.message || decoded.detail?.status || JSON.stringify(decoded);
        if (typeof errorMsg === 'string' && (errorMsg.includes('invalid_api_key') || errorMsg.includes('Invalid API key'))) {
          isInvalidKey = true;
        }
      } catch (e) {}
    }

    console.error('ElevenLabs Error:', errorMsg);

    if (isInvalidKey) {
      return res.status(401).json({
        error: 'INVALID_ELEVENLABS_KEY',
        message: 'API Key ElevenLabs không chính xác hoặc đã hết hạn (Invalid API key). Vui lòng cập nhật API Key mới từ elevenlabs.io.'
      });
    }

    return res.status(500).json({ error: `ElevenLabs Lỗi: ${errorMsg}` });
  }
});

// 4. Google Cloud Text-to-Speech Endpoint (Có tự động dự phòng sang Google Speech)
app.post('/api/tts/google', async (req, res) => {
  const { text, voice_name, language_code, speaking_rate, pitch } = req.body;
  const apiKey = getGoogleKey(req);

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Văn bản không được để trống' });
  }

  // 4a. Nếu có Google Cloud API Key, thử gọi Google Cloud API trước
  if (apiKey && apiKey !== 'your_google_tts_api_key_here') {
    try {
      const payload = {
        input: { text: text },
        voice: {
          languageCode: language_code || 'vi-VN',
          name: voice_name || 'vi-VN-Neural2-A'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: parseFloat(speaking_rate) || 1.0,
          pitch: parseFloat(pitch) || 0.0
        }
      };

      const googleUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const response = await axios.post(googleUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data?.audioContent) {
        const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'inline; filename="google_cloud_speech.mp3"',
          'Content-Length': audioBuffer.length
        });
        return res.send(audioBuffer);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.warn('Google Cloud API gặp lỗi (Đang chuyển sang Google Translate Speech):', errorMsg);

      // Nếu lỗi là do chưa kích hoạt dịch vụ "Cloud Text-to-Speech API" trong Google Console
      if (errorMsg.includes('has not been used in project') || errorMsg.includes('is disabled')) {
        // Fallback tự động qua Google Speech Free Service
        try {
          const lang = language_code || 'vi';
          const freeUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
          const freeRes = await axios.get(freeUrl, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'inline; filename="google_free_speech.mp3"',
            'Content-Length': freeRes.data.length
          });
          return res.send(Buffer.from(freeRes.data));
        } catch (e) {
          return res.status(403).json({
            error: `Google Cloud API chưa được bật trong dự án của bạn (Project 560783465009). Vui lòng nhấn nút "ENABLE" tại link Google Console bên dưới.`,
            details: errorMsg
          });
        }
      }
    }
  }

  // 4b. Dự phòng phát âm qua Google Speech miễn phí nếu chưa có API Key
  try {
    const lang = (language_code || 'vi-VN').split('-')[0];
    const freeUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const freeRes = await axios.get(freeUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="google_speech.mp3"',
      'Content-Length': freeRes.data.length
    });
    return res.send(Buffer.from(freeRes.data));
  } catch (error) {
    return res.status(500).json({ error: 'Không thể tạo âm thanh từ Google TTS' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🔥 Multi-Provider TTS App running on port ${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
