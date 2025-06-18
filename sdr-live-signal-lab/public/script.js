// Utility functions for generating random data and noise
function gaussianNoise(std, len) {
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let u1 = Math.random();
    let u2 = Math.random();
    let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    noise[i] = std * randStdNormal;
  }
  return noise;
}

function generateIQ(mod, carrier, rate, snr, samples, audioData) {
  const t = new Float32Array(samples);
  const i = new Float32Array(samples);
  const q = new Float32Array(samples);
  const noiseStd = Math.pow(10, -snr / 20);
  const noiseI = gaussianNoise(noiseStd, samples);
  const noiseQ = gaussianNoise(noiseStd, samples);

  for (let n = 0; n < samples; n++) {
    const time = n / rate;
    let phase = 2 * Math.PI * carrier * time;
    let amp = 1;
    const audioSample = audioData && audioData[n % audioData.length];
    switch (mod) {
      case 'AM':
        amp = 1 + (audioSample || 0);
        break;
      case 'FM':
        phase += (audioSample || 0) * Math.PI;
        break;
      case 'BPSK':
        phase += Math.PI * (audioSample > 0 ? 1 : 0);
        break;
      case 'QPSK':
        phase += (Math.PI / 2) * (audioSample || 0);
        break;
      case 'FSK':
        phase += (audioSample > 0 ? Math.PI/2 : -Math.PI/2);
        break;
    }
    i[n] = amp * Math.cos(phase) + noiseI[n];
    q[n] = amp * Math.sin(phase) + noiseQ[n];
    t[n] = time;
  }
  return { t, i, q };
}

async function readAudioFile(file) {
  if (!file) return null;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  return channelData;
}

function updatePlots(data) {
  const { t, i, q } = data;
  const timeTraceI = { x: t, y: i, mode: 'lines', name: 'I' };
  const timeTraceQ = { x: t, y: q, mode: 'lines', name: 'Q' };
  Plotly.newPlot('timePlot', [timeTraceI, timeTraceQ], {title: 'Time Domain'});

  const fftSize = 1024;
  const re = i.slice(0, fftSize);
  const im = q.slice(0, fftSize);
  const spectrum = new Float32Array(fftSize);
  for (let k = 0; k < fftSize; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      real += re[n] * Math.cos(angle) + im[n] * Math.sin(angle);
      imag += -re[n] * Math.sin(angle) + im[n] * Math.cos(angle);
    }
    spectrum[k] = Math.sqrt(real*real + imag*imag);
  }
  const freqAxis = Array.from({length: fftSize}, (_, k) => k);
  Plotly.newPlot('fftPlot', [{ x: freqAxis, y: spectrum, mode: 'lines' }], {title: 'FFT'});

  const waterfallData = [];
  const chunk = 256;
  for (let s = 0; s < spectrum.length - chunk; s += chunk) {
    waterfallData.push({ z: [spectrum.slice(s, s+chunk)], type: 'heatmap', showscale:false });
  }
  Plotly.newPlot('waterfall', waterfallData, {title: 'Waterfall'});
}

function analyzeSignal(data, params) {
  const { mod, carrier, snr } = params;
  const analysis = [];
  analysis.push(`Detected Modulation: ${mod}`);
  analysis.push(`Carrier Frequency: ${carrier} Hz`);
  analysis.push(`Estimated SNR: ${snr} dB`);
  analysis.push(`Bandwidth ~ ${params.rate} Hz`);
  return analysis.join('\n');
}

async function handleForm(event) {
  event.preventDefault();
  const carrier = parseFloat(document.getElementById('freq').value);
  const rate = parseFloat(document.getElementById('rate').value);
  const snr = parseFloat(document.getElementById('snr').value);
  const mod = document.getElementById('mod').value;
  const file = document.getElementById('audioFile').files[0];
  const audioData = await readAudioFile(file);

  const samples = rate * 1; // 1 second of data
  const data = generateIQ(mod, carrier, rate, snr, samples, audioData);
  updatePlots(data);
  const analysisText = analyzeSignal(data, { mod, carrier, rate, snr });
  document.getElementById('analysisOutput').textContent = analysisText;
}

document.getElementById('signalForm').addEventListener('submit', handleForm);
