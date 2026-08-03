document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const userAccountBadge = document.getElementById('userAccountBadge');
  const userNameText = document.getElementById('userNameText');
  const logoutBtn = document.getElementById('logoutBtn');
  
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  
  // Text Inputs & Presets
  const ttsInput = document.getElementById('ttsInput');
  const charCount = document.getElementById('charCount');
  const clearTextBtn = document.getElementById('clearTextBtn');
  const pasteTextBtn = document.getElementById('pasteTextBtn');
  const presetBtn = document.getElementById('presetBtn');
  const presetMenu = document.getElementById('presetMenu');

  // Accordion Settings
  const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
  const settingsContent = document.getElementById('settingsContent');
  
  // Controls
  const modelSelect = document.getElementById('modelSelect');
  const sliderStability = document.getElementById('sliderStability');
  const valStability = document.getElementById('valStability');
  const sliderClarity = document.getElementById('sliderClarity');
  const valClarity = document.getElementById('valClarity');
  const sliderStyle = document.getElementById('sliderStyle');
  const valStyle = document.getElementById('valStyle');
  const chkSpeakerBoost = document.getElementById('chkSpeakerBoost');
  const chkEnhance = document.getElementById('chkEnhance');
  const emotionBtns = document.querySelectorAll('.emotion-btn');

  // Emotion Presets Config
  const EMOTION_PRESETS = {
    expressive: { stability: 35, clarity: 80, style: 40 },
    dramatic: { stability: 25, clarity: 75, style: 65 },
    news: { stability: 60, clarity: 85, style: 15 },
    soft: { stability: 45, clarity: 80, style: 25 }
  };

  // Voice List & Filtering
  const voiceSearchInput = document.getElementById('voiceSearchInput');
  const voiceList = document.getElementById('voiceList');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const selectedVoiceName = document.getElementById('selectedVoiceName');

  // Action Button & Loading Status
  const generateBtn = document.getElementById('generateBtn');
  const actionLoadingState = document.getElementById('actionLoadingState');
  const loadingMessageText = document.getElementById('loadingMessageText');

  // Audio Player
  const audioPlayerCard = document.getElementById('audioPlayerCard');
  const audioElement = document.getElementById('audioElement');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const progressBar = document.getElementById('progressBar');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationTimeDisplay = document.getElementById('durationTime');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const downloadBtn = document.getElementById('downloadBtn');
  const audioStatusText = document.getElementById('audioStatusText');
  const visualizerCanvas = document.getElementById('visualizerCanvas');

  // Detailed Error Popup Modal
  const errorPopupModal = document.getElementById('errorPopupModal');
  const closeErrorModal = document.getElementById('closeErrorModal');
  const closeErrorBtn = document.getElementById('closeErrorBtn');
  const errorPopupTitle = document.getElementById('errorPopupTitle');
  const errorPopupDetail = document.getElementById('errorPopupDetail');
  const errorPopupGuide = document.getElementById('errorPopupGuide');

  // App State
  let voices = [];
  let selectedVoice = null;
  let currentFilter = 'all';
  let searchQuery = '';
  let previewAudio = new Audio();
  let generatedObjectUrl = null;
  let audioContext = null;
  let analyser = null;
  let sourceNode = null;

  // Master API Key for 0981028794
  const MASTER_KEY = '21b97e4410782023937690e35d4e50ef84a03d841e1455831a438cea7afad0b9';

  // Preset texts
  const PRESETS = {
    vi_intro: "Xin chào quý vị! Cảm ơn bạn đã trải nghiệm ứng dụng Nam AI Giọng Đọc với giao diện Cam Đất sang trọng và giọng đọc siêu truyền cảm.",
    vi_story: "Ngày xửa ngày xưa, ở một ngôi làng nhỏ ven chân núi, có một dòng suối chảy qua xanh trong như ngọc. Người dân nơi đây luôn sống chan hòa và vui vẻ.",
    en_promo: "Welcome to Nam AI Speech Studio! Transform text into lifelike speech with expressive AI voices."
  };

  // 1. Initial Authentication Check
  checkAuth();

  function checkAuth() {
    const isLoggedIn = localStorage.getItem('nam_ai_logged_in') === 'true';
    const userPhone = localStorage.getItem('nam_ai_user') || '0981028794';

    if (isLoggedIn) {
      loginModal.classList.remove('active');
      userAccountBadge.style.display = 'flex';
      userNameText.textContent = userPhone;
      initApp();
    } else {
      loginModal.classList.add('active');
      userAccountBadge.style.display = 'none';
    }
  }

  // Handle Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.classList.remove('show');
    
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('nam_ai_logged_in', 'true');
        localStorage.setItem('nam_ai_user', username);
        
        loginModal.classList.remove('active');
        userAccountBadge.style.display = 'flex';
        userNameText.textContent = username;
        showToast('Đăng nhập thành công tài khoản Nam AI VIP!', 'success');
        initApp();
      } else {
        loginErrorMsg.textContent = data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!';
        loginErrorMsg.classList.add('show');
      }
    } catch (err) {
      loginErrorMsg.textContent = 'Lỗi kết nối máy chủ đăng nhập!';
      loginErrorMsg.classList.add('show');
    }
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('nam_ai_logged_in');
    localStorage.removeItem('nam_ai_user');
    showToast('Đã đăng xuất khỏi ứng dụng', 'info');
    location.reload();
  });

  async function initApp() {
    setupEventListeners();
    await fetchVoices();
    initVisualizerCanvas();
  }

  // 2. Fetch Voices
  async function fetchVoices() {
    voiceList.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Đang nạp danh sách giọng đọc Nam AI...</p>
      </div>
    `;

    try {
      const res = await fetch(`/api/voices?provider=all`, {
        headers: {
          'x-elevenlabs-key': MASTER_KEY
        }
      });
      const data = await res.json();
      voices = data.voices || [];

      if (voices.length > 0) {
        selectedVoice = voices[0];
        renderVoices();
      } else {
        voiceList.innerHTML = `<div class="loading-state"><p>Không tìm thấy giọng đọc nào.</p></div>`;
      }
    } catch (err) {
      console.error('Error fetching voices:', err);
      showErrorPopupModal(
        'Không thể nạp danh sách giọng đọc',
        err.message || 'Lỗi kết nối máy chủ backend.',
        'Vui lòng kiểm tra lại kết nối mạng hoặc làm mới lại trang web.'
      );
    }
  }

  // 3. Render Voices Grid
  function renderVoices() {
    voiceList.innerHTML = '';

    const filtered = voices.filter(v => {
      const gender = (v.labels?.gender || '').toLowerCase();
      const accent = (v.labels?.accent || '').toLowerCase();
      const lang = (v.languageCode || '').toLowerCase();

      if (currentFilter === 'female' && gender !== 'female') return false;
      if (currentFilter === 'male' && gender !== 'male') return false;
      if (currentFilter === 'vietnamese' && !(accent.includes('vietnamese') || lang.startsWith('vi'))) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const nameMatch = v.name.toLowerCase().includes(q);
        const descMatch = (v.description || '').toLowerCase().includes(q);
        const tagMatch = Object.values(v.labels || {}).some(val => String(val).toLowerCase().includes(q));
        return nameMatch || descMatch || tagMatch;
      }

      return true;
    });

    if (filtered.length === 0) {
      voiceList.innerHTML = `<div class="loading-state"><p>Không tìm thấy giọng đọc phù hợp.</p></div>`;
      return;
    }

    filtered.forEach(voice => {
      const isSelected = selectedVoice && selectedVoice.voice_id === voice.voice_id;

      let providerSymbol = 'E';
      let providerClass = 'eleven';
      let providerTitle = 'Giọng ElevenLabs AI';

      if (voice.provider === 'vbee') {
        providerSymbol = 'V';
        providerClass = 'vbee';
        providerTitle = 'Giọng Vbee AI';
      } else if (voice.provider === 'google') {
        providerSymbol = 'G';
        providerClass = 'google';
        providerTitle = 'Giọng Google AI';
      }

      if (isSelected) {
        selectedVoiceName.innerHTML = `<span class="provider-symbol-badge ${providerClass}" title="${providerTitle}">${providerSymbol}</span> ${voice.name}`;
      }

      const card = document.createElement('div');
      card.className = `voice-card ${isSelected ? 'selected' : ''}`;
      
      const gender = voice.labels?.gender || 'voice';
      const accent = voice.labels?.accent || 'truyền cảm';

      card.innerHTML = `
        <div class="voice-card-left">
          <div class="voice-avatar">
            <i class="fa-solid ${gender === 'female' ? 'fa-user-nurse' : 'fa-user-astronaut'}"></i>
          </div>
          <div class="voice-info">
            <h4>
              <span class="provider-symbol-badge ${providerClass}" title="${providerTitle}">${providerSymbol}</span>
              ${voice.name}
            </h4>
            <div class="voice-tags">
              <span class="tag">${gender === 'female' ? 'Nữ' : 'Nam'}</span>
              <span class="tag">${accent}</span>
            </div>
          </div>
        </div>

        <div class="voice-card-right">
          ${voice.preview_url ? `
            <button class="btn-preview-sample" title="Nghe thử âm thanh mẫu" data-preview="${voice.preview_url}">
              <i class="fa-solid fa-play"></i>
            </button>
          ` : ''}
          <div class="radio-check"></div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-preview-sample')) return;
        selectedVoice = voice;
        selectedVoiceName.innerHTML = `<span class="provider-symbol-badge ${providerClass}" title="${providerTitle}">${providerSymbol}</span> ${voice.name}`;
        document.querySelectorAll('.voice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });

      const previewBtn = card.querySelector('.btn-preview-sample');
      if (previewBtn) {
        previewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playPreviewSample(voice.preview_url, previewBtn);
        });
      }

      voiceList.appendChild(card);
    });
  }

  function playPreviewSample(url, btnElement) {
    if (previewAudio.src === url && !previewAudio.paused) {
      previewAudio.pause();
      btnElement.innerHTML = '<i class="fa-solid fa-play"></i>';
      return;
    }

    document.querySelectorAll('.btn-preview-sample').forEach(b => b.innerHTML = '<i class="fa-solid fa-play"></i>');
    previewAudio.src = url;
    previewAudio.play();
    btnElement.innerHTML = '<i class="fa-solid fa-pause"></i>';
    previewAudio.onended = () => btnElement.innerHTML = '<i class="fa-solid fa-play"></i>';
  }

  // 4. Set up Event Listeners
  function setupEventListeners() {
    // Text input & counter
    ttsInput.addEventListener('input', () => {
      charCount.textContent = ttsInput.value.length;
    });

    clearTextBtn.addEventListener('click', () => {
      ttsInput.value = '';
      charCount.textContent = 0;
    });

    pasteTextBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        ttsInput.value = text;
        charCount.textContent = text.length;
        showToast('Đã dán văn bản từ Clipboard!', 'success');
      } catch (err) {
        showToast('Hãy sử dụng tổ hợp phím Ctrl+V để dán', 'error');
      }
    });

    // Presets dropdown
    presetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      presetMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.presets-dropdown')) {
        presetMenu.classList.remove('show');
      }
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const key = item.dataset.preset;
        if (PRESETS[key]) {
          ttsInput.value = PRESETS[key];
          charCount.textContent = PRESETS[key].length;
          showToast('Đã chọn mẫu văn bản Nam AI!', 'success');
        }
        presetMenu.classList.remove('show');
      });
    });

    // Accordion Toggle
    toggleSettingsBtn.addEventListener('click', () => {
      toggleSettingsBtn.classList.toggle('open');
      settingsContent.classList.toggle('show');
    });

    // Sliders value updates
    sliderStability.addEventListener('input', () => valStability.textContent = `${sliderStability.value}%`);
    sliderClarity.addEventListener('input', () => valClarity.textContent = `${sliderClarity.value}%`);
    sliderStyle.addEventListener('input', () => valStyle.textContent = `${sliderStyle.value}%`);

    // Emotion Presets 1-Click
    emotionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        emotionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.preset;
        if (EMOTION_PRESETS[key]) {
          const { stability, clarity, style } = EMOTION_PRESETS[key];
          sliderStability.value = stability;
          valStability.textContent = `${stability}%`;
          sliderClarity.value = clarity;
          valClarity.textContent = `${clarity}%`;
          sliderStyle.value = style;
          valStyle.textContent = `${style}%`;
          showToast(`Đã chọn phong cách: ${btn.textContent.trim()}`, 'success');
        }
      });
    });

    // Voice Filter Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderVoices();
      });
    });

    // Search Input
    voiceSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderVoices();
    });

    // Main Generate Button Click
    generateBtn.addEventListener('click', generateSpeech);

    // Audio Player Controls
    playPauseBtn.addEventListener('click', toggleAudioPlay);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', () => {
      durationTimeDisplay.textContent = formatTime(audioElement.duration);
      progressBar.max = audioElement.duration;
    });

    audioElement.addEventListener('ended', () => {
      playIcon.className = 'fa-solid fa-play';
      audioStatusText.textContent = 'Hoàn thành phát âm';
    });

    progressBar.addEventListener('input', () => audioElement.currentTime = progressBar.value);

    volumeSlider.addEventListener('input', () => {
      audioElement.volume = volumeSlider.value;
      updateVolumeIcon(volumeSlider.value);
    });

    muteBtn.addEventListener('click', () => {
      if (audioElement.muted) {
        audioElement.muted = false;
        updateVolumeIcon(audioElement.volume);
      } else {
        audioElement.muted = true;
        volumeIcon.className = 'fa-solid fa-volume-xmark';
      }
    });

    // Error Popup Modal Controls
    closeErrorModal.addEventListener('click', () => errorPopupModal.classList.remove('show'));
    closeErrorBtn.addEventListener('click', () => errorPopupModal.classList.remove('show'));
    errorPopupModal.addEventListener('click', (e) => {
      if (e.target === errorPopupModal) errorPopupModal.classList.remove('show');
    });
  }

  // 5. Generate Speech Function (Full Capabilities with Master Key)
  async function generateSpeech() {
    const text = ttsInput.value.trim();
    if (!text) {
      showToast('Vui lòng nhập nội dung văn bản cần đọc!', 'error');
      ttsInput.focus();
      return;
    }

    if (!selectedVoice) {
      showToast('Vui lòng chọn một giọng đọc Nam AI!', 'error');
      return;
    }

    // Show Loading State on button & dedicated bar below button
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    actionLoadingState.classList.add('show');
    loadingMessageText.textContent = `Nam AI đang tạo giọng đọc "${selectedVoice.name}", vui lòng chờ...`;

    try {
      let endpoint = '/api/tts';
      let headers = {};
      let body = {};

      if (selectedVoice.provider === 'vbee') {
        endpoint = '/api/tts/vbee';
        body = {
          text: text,
          voice_id: selectedVoice.voice_id,
          speed: 1.0
        };
      } else if (selectedVoice.provider === 'google') {
        endpoint = '/api/tts/google';
        body = {
          text: text,
          voice_name: selectedVoice.voice_id,
          language_code: selectedVoice.languageCode || 'vi-VN',
          speaking_rate: 1.0,
          pitch: 0.0
        };
      } else {
        headers = { 'x-elevenlabs-key': MASTER_KEY };
        body = {
          text: text,
          voice_id: selectedVoice.voice_id,
          model_id: modelSelect.value,
          enhance: chkEnhance ? chkEnhance.checked : true,
          voice_settings: {
            stability: parseFloat(sliderStability.value) / 100,
            similarity_boost: parseFloat(sliderClarity.value) / 100,
            style: parseFloat(sliderStyle.value) / 100,
            use_speaker_boost: chkSpeakerBoost.checked
          }
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorTitle = 'Không thể tạo giọng đọc Nam AI';
        const errorDetail = errorData.message || errorData.error || 'Lỗi từ dịch vụ tổng hợp giọng nói.';
        const errorGuide = 'Vui lòng kiểm tra lại đoạn văn bản hoặc chọn giọng đọc khác.';

        showErrorPopupModal(errorTitle, errorDetail, errorGuide);
        return;
      }

      const blob = await response.blob();
      if (generatedObjectUrl) URL.revokeObjectURL(generatedObjectUrl);
      generatedObjectUrl = URL.createObjectURL(blob);

      audioElement.src = generatedObjectUrl;

      // Download Button setup
      const filename = `nam_ai_${text.substring(0, 15).replace(/\s+/g, '_')}.mp3`;
      downloadBtn.href = generatedObjectUrl;
      downloadBtn.download = filename;
      downloadBtn.classList.remove('disabled');

      // Enable Player
      playPauseBtn.disabled = false;
      progressBar.disabled = false;
      audioStatusText.textContent = `Sẵn sàng phát âm thanh (${(blob.size / 1024).toFixed(1)} KB)`;

      // Auto Play & Visualizer
      await toggleAudioPlay();
      showToast('Tạo giọng đọc Nam AI thành công!', 'success');
      audioPlayerCard.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      console.error('TTS Error:', err);
      showErrorPopupModal(
        'Lỗi Kết Nối Máy Chủ',
        err.message || 'Không thể gửi yêu cầu đến backend.',
        'Vui lòng kiểm tra lại đường truyền mạng hoặc liên hệ quản trị viên.'
      );
    } finally {
      generateBtn.classList.remove('loading');
      generateBtn.disabled = false;
      actionLoadingState.classList.remove('show');
    }
  }

  // 6. Detailed Error Popup Modal Function
  function showErrorPopupModal(title, detail, guide) {
    errorPopupTitle.textContent = title;
    errorPopupDetail.textContent = detail;
    errorPopupGuide.textContent = guide;
    errorPopupModal.classList.add('show');
  }

  // 7. Audio Player Controls
  async function toggleAudioPlay() {
    if (!audioElement.src) return;
    setupWebAudioContext();

    if (audioElement.paused) {
      try {
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        await audioElement.play();
        playIcon.className = 'fa-solid fa-pause';
        audioStatusText.textContent = 'Đang phát âm thanh...';
        drawVisualizer();
      } catch (e) {
        console.error('Play error:', e);
      }
    } else {
      audioElement.pause();
      playIcon.className = 'fa-solid fa-play';
      audioStatusText.textContent = 'Tạm dừng phát';
    }
  }

  function updateProgress() {
    if (!audioElement.duration) return;
    progressBar.value = audioElement.currentTime;
    currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
  }

  function updateVolumeIcon(vol) {
    if (vol == 0) volumeIcon.className = 'fa-solid fa-volume-xmark';
    else if (vol < 0.5) volumeIcon.className = 'fa-solid fa-volume-low';
    else volumeIcon.className = 'fa-solid fa-volume-high';
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // 8. Web Audio Canvas Visualizer (Terracotta Theme)
  function setupWebAudioContext() {
    if (audioContext) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      sourceNode = audioContext.createMediaElementSource(audioElement);
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (err) {}
  }

  function initVisualizerCanvas() {
    const ctx = visualizerCanvas.getContext('2d');
    visualizerCanvas.width = visualizerCanvas.offsetWidth || 800;
    visualizerCanvas.height = visualizerCanvas.offsetHeight || 80;

    ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    ctx.fillStyle = '#D96B43';
    ctx.globalAlpha = 0.2;
    const barWidth = 6;
    const gap = 4;
    const numBars = Math.floor(visualizerCanvas.width / (barWidth + gap));
    for (let i = 0; i < numBars; i++) {
      const barHeight = Math.sin(i * 0.3) * 15 + 20;
      ctx.fillRect(i * (barWidth + gap), (visualizerCanvas.height - barHeight) / 2, barWidth, barHeight);
    }
  }

  function drawVisualizer() {
    if (!analyser) return;

    const ctx = visualizerCanvas.getContext('2d');
    const width = visualizerCanvas.width = visualizerCanvas.offsetWidth;
    const height = visualizerCanvas.height = visualizerCanvas.offsetHeight;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
      if (audioElement.paused) return;
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);
      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#B84A25');
        gradient.addColorStop(0.5, '#D96B43');
        gradient.addColorStop(1, '#F4A261');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 3, barHeight);
        x += barWidth;
      }
    }
    renderFrame();
  }

  // 9. Toast Helper
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
