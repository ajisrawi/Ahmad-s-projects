# SDR Live Signal Lab

SDR Live Signal Lab is a demo web application for RF signal simulation, visualization and simple analysis.

## Features

- Generate IQ streams for AM, FM, BPSK, QPSK, FSK modulations
- Adjustable carrier frequency, symbol rate and SNR
- Optional audio file upload to use as modulation input
- Interactive plots using Plotly.js: time domain IQ, FFT spectrum, waterfall
- Basic AI-style analysis output with estimated parameters
- UI built with Tailwind CSS

Run the server with:

```bash
npm install
npm start
```

Then open `http://localhost:3000` in a browser.
