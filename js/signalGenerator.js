/**
 * Signal Generator Module
 * Generates various RF modulated signals
 */

class SignalGenerator {
    constructor() {
        // Sampling parameters
        this.sampleRate = 44100; // Hz
        this.duration = 1; // seconds
        this.numSamples = this.sampleRate * this.duration;
        
        // Default parameters
        this.carrierFreq = 1000; // Hz
        this.symbolRate = 100; // Baud
        this.snr = 20; // dB
        this.modulationIndex = 0.5; // For AM/FM
        this.messageFreq = 100; // Hz, for AM/FM
        this.frequencyDeviation = 100; // Hz, for FSK
    }
    
    /**
     * Updates the generator parameters based on user inputs
     */
    updateParameters(params) {
        this.carrierFreq = params.carrierFreq || this.carrierFreq;
        this.symbolRate = params.symbolRate || this.symbolRate;
        this.snr = params.snr || this.snr;
        this.modulationIndex = params.modulationIndex || this.modulationIndex;
        this.messageFreq = params.messageFreq || this.messageFreq;
        this.frequencyDeviation = params.frequencyDeviation || this.frequencyDeviation;
    }
    
    /**
     * Generates time array
     */
    generateTimeArray() {
        const timeArray = new Array(this.numSamples);
        for (let i = 0; i < this.numSamples; i++) {
            timeArray[i] = i / this.sampleRate;
        }
        return timeArray;
    }
    
    /**
     * Add noise to the signal based on SNR
     */
    addNoise(signal, snrDb) {
        // Calculate signal power
        const signalPower = signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
        
        // Calculate noise power based on SNR
        const snrLinear = Math.pow(10, snrDb / 10);
        const noisePower = signalPower / snrLinear;
        const noiseAmplitude = Math.sqrt(noisePower);
        
        // Add Gaussian noise to the signal
        return signal.map(sample => {
            // Box-Muller transform to generate Gaussian noise
            const u1 = Math.random();
            const u2 = Math.random();
            const noise = noiseAmplitude * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return sample + noise;
        });
    }
    
    /**
     * Generate AM signal
     */
    generateAM() {
        const timeArray = this.generateTimeArray();
        const carrier = timeArray.map(t => Math.cos(2 * Math.PI * this.carrierFreq * t));
        const message = timeArray.map(t => Math.cos(2 * Math.PI * this.messageFreq * t));
        
        // AM modulation: s(t) = A_c[1 + μm(t)]cos(2πf_c t)
        const modulatedSignal = timeArray.map((t, i) => 
            (1 + this.modulationIndex * message[i]) * carrier[i]
        );
        
        // Add noise
        const noisySignal = this.addNoise(modulatedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: new Array(this.numSamples).fill(0), // No imaginary part for AM
            constellation: null // No constellation for AM
        };
    }
    
    /**
     * Generate FM signal
     */
    generateFM() {
        const timeArray = this.generateTimeArray();
        
        // Get the message signal
        const message = timeArray.map(t => Math.cos(2 * Math.PI * this.messageFreq * t));
        
        // Calculate the integrated message for phase modulation
        let integratedMessage = 0;
        const dt = 1 / this.sampleRate;
        
        // FM modulation: s(t) = A_c cos(2πf_c t + 2πk_f ∫m(τ)dτ)
        const modulatedSignal = timeArray.map((t, i) => {
            integratedMessage += message[i] * dt;
            const instantPhase = 2 * Math.PI * this.carrierFreq * t + 
                                 2 * Math.PI * this.frequencyDeviation * this.modulationIndex * integratedMessage;
            return Math.cos(instantPhase);
        });
        
        // Add noise
        const noisySignal = this.addNoise(modulatedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: new Array(this.numSamples).fill(0), // No imaginary part for FM
            constellation: null // No constellation for FM
        };
    }
    
    /**
     * Generate BPSK signal
     */
    generateBPSK() {
        const timeArray = this.generateTimeArray();
        const symbolPeriod = 1 / this.symbolRate;
        const samplesPerSymbol = Math.floor(this.sampleRate / this.symbolRate);
        
        // Generate random binary data
        const numSymbols = Math.floor(this.numSamples / samplesPerSymbol);
        const bits = Array.from({length: numSymbols}, () => Math.random() > 0.5 ? 1 : -1);
        
        // Generate BPSK signal: s(t) = A_c * b_k * cos(2πf_c t)
        const modulatedReal = new Array(this.numSamples);
        const modulatedImag = new Array(this.numSamples);
        const constellation = [];
        
        for (let i = 0; i < this.numSamples; i++) {
            const symbolIndex = Math.floor(i / samplesPerSymbol);
            const bit = symbolIndex < bits.length ? bits[symbolIndex] : 1;
            
            const carrier = Math.cos(2 * Math.PI * this.carrierFreq * timeArray[i]);
            modulatedReal[i] = bit * carrier;
            modulatedImag[i] = 0; // No imaginary component for BPSK
            
            // Add constellation point (only one per symbol)
            if (i % samplesPerSymbol === 0 && symbolIndex < bits.length) {
                constellation.push({ x: bit, y: 0 });
            }
        }
        
        // Add noise
        const noisyReal = this.addNoise(modulatedReal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisyReal,
            imagSignal: modulatedImag,
            constellation: constellation
        };
    }
    
    /**
     * Generate QPSK signal
     */
    generateQPSK() {
        const timeArray = this.generateTimeArray();
        const symbolPeriod = 1 / this.symbolRate;
        const samplesPerSymbol = Math.floor(this.sampleRate / this.symbolRate);
        
        // Generate random quaternary data (dibits)
        const numSymbols = Math.floor(this.numSamples / samplesPerSymbol);
        const symbols = Array.from({length: numSymbols}, () => {
            // Generate dibits (00, 01, 10, 11) and map to constellation points
            const dibit = Math.floor(Math.random() * 4);
            switch(dibit) {
                case 0: return { i: 1/Math.sqrt(2), q: 1/Math.sqrt(2) };  // 00 -> (1,1)
                case 1: return { i: -1/Math.sqrt(2), q: 1/Math.sqrt(2) }; // 01 -> (-1,1)
                case 2: return { i: -1/Math.sqrt(2), q: -1/Math.sqrt(2) }; // 10 -> (-1,-1)
                case 3: return { i: 1/Math.sqrt(2), q: -1/Math.sqrt(2) };  // 11 -> (1,-1)
            }
        });
        
        // Generate QPSK signal: s(t) = I(t)cos(2πf_c t) - Q(t)sin(2πf_c t)
        const modulatedReal = new Array(this.numSamples);
        const modulatedImag = new Array(this.numSamples);
        const constellation = [];
        
        for (let i = 0; i < this.numSamples; i++) {
            const symbolIndex = Math.floor(i / samplesPerSymbol);
            const symbol = symbolIndex < symbols.length ? symbols[symbolIndex] : { i: 1/Math.sqrt(2), q: 1/Math.sqrt(2) };
            
            const carrierI = Math.cos(2 * Math.PI * this.carrierFreq * timeArray[i]);
            const carrierQ = Math.sin(2 * Math.PI * this.carrierFreq * timeArray[i]);
            
            modulatedReal[i] = symbol.i * carrierI;
            modulatedImag[i] = symbol.q * carrierQ;
            
            // Add constellation point (only one per symbol)
            if (i % samplesPerSymbol === 0 && symbolIndex < symbols.length) {
                constellation.push({ x: symbol.i, y: symbol.q });
            }
        }
        
        // Combine I and Q components
        const combinedSignal = modulatedReal.map((real, idx) => real - modulatedImag[idx]);
        
        // Add noise
        const noisySignal = this.addNoise(combinedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: modulatedImag,
            constellation: constellation
        };
    }
    
    /**
     * Generate FSK signal
     */
    generateFSK() {
        const timeArray = this.generateTimeArray();
        const symbolPeriod = 1 / this.symbolRate;
        const samplesPerSymbol = Math.floor(this.sampleRate / this.symbolRate);
        
        // Generate random binary data
        const numSymbols = Math.floor(this.numSamples / samplesPerSymbol);
        const bits = Array.from({length: numSymbols}, () => Math.random() > 0.5 ? 1 : 0);
        
        // Define the two frequencies
        const freq0 = this.carrierFreq - this.frequencyDeviation;
        const freq1 = this.carrierFreq + this.frequencyDeviation;
        
        // Generate FSK signal: s(t) = A_c * cos(2π(f_c + b_k*Δf)t)
        const modulatedSignal = new Array(this.numSamples);
        const constellation = [];
        
        for (let i = 0; i < this.numSamples; i++) {
            const symbolIndex = Math.floor(i / samplesPerSymbol);
            const bit = symbolIndex < bits.length ? bits[symbolIndex] : 0;
            
            // Choose frequency based on bit value
            const freq = bit ? freq1 : freq0;
            modulatedSignal[i] = Math.cos(2 * Math.PI * freq * timeArray[i]);
            
            // Add constellation point (essentially shows which frequency is being used)
            if (i % samplesPerSymbol === 0 && symbolIndex < bits.length) {
                // For FSK, we can plot the frequency deviation
                constellation.push({ x: bit ? 1 : -1, y: 0 });
            }
        }
        
        // Add noise
        const noisySignal = this.addNoise(modulatedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: new Array(this.numSamples).fill(0), // No imaginary part for basic FSK
            constellation: constellation
        };
    }
    
    /**
     * Generate LSB (Lower Sideband) signal
     */
    generateLSB() {
        const timeArray = this.generateTimeArray();
        
        // Generate message signal (voice-like)
        const message = this.generateVoiceLikeSignal(timeArray);
        
        // Hilbert transform approximation for phase shift
        const hilbertMessage = this.approximateHilbertTransform(message);
        
        // Generate carriers
        const carrier = timeArray.map(t => Math.cos(2 * Math.PI * this.carrierFreq * t));
        const carrierShifted = timeArray.map(t => Math.sin(2 * Math.PI * this.carrierFreq * t));
        
        // LSB modulation: s(t) = m(t)cos(2πf_c t) + Ĥ{m(t)}sin(2πf_c t)
        // For LSB, we use the negative of the imaginary component
        const modulatedSignal = timeArray.map((t, i) => 
            message[i] * carrier[i] - hilbertMessage[i] * carrierShifted[i]
        );
        
        // Add noise
        const noisySignal = this.addNoise(modulatedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: hilbertMessage, // Store Hilbert transform for reference
            constellation: null // No constellation for LSB
        };
    }
    
    /**
     * Generate USB (Upper Sideband) signal
     */
    generateUSB() {
        const timeArray = this.generateTimeArray();
        
        // Generate message signal (voice-like)
        const message = this.generateVoiceLikeSignal(timeArray);
        
        // Hilbert transform approximation for phase shift
        const hilbertMessage = this.approximateHilbertTransform(message);
        
        // Generate carriers
        const carrier = timeArray.map(t => Math.cos(2 * Math.PI * this.carrierFreq * t));
        const carrierShifted = timeArray.map(t => Math.sin(2 * Math.PI * this.carrierFreq * t));
        
        // USB modulation: s(t) = m(t)cos(2πf_c t) - Ĥ{m(t)}sin(2πf_c t)
        // For USB, we use the positive of the imaginary component
        const modulatedSignal = timeArray.map((t, i) => 
            message[i] * carrier[i] + hilbertMessage[i] * carrierShifted[i]
        );
        
        // Add noise
        const noisySignal = this.addNoise(modulatedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: hilbertMessage, // Store Hilbert transform for reference
            constellation: null // No constellation for USB
        };
    }
    
    /**
     * Generate SSB (Single Sideband) signal - implementation that can do both USB and LSB
     */
    generateSSB(isLSB = false) {
        const timeArray = this.generateTimeArray();
        
        // Generate message signal (voice-like)
        const message = this.generateVoiceLikeSignal(timeArray);
        
        // Hilbert transform approximation for phase shift
        const hilbertMessage = this.approximateHilbertTransform(message);
        
        // Generate carriers
        const carrier = timeArray.map(t => Math.cos(2 * Math.PI * this.carrierFreq * t));
        const carrierShifted = timeArray.map(t => Math.sin(2 * Math.PI * this.carrierFreq * t));
        
        // SSB modulation
        // LSB: s(t) = m(t)cos(2πf_c t) - Ĥ{m(t)}sin(2πf_c t)
        // USB: s(t) = m(t)cos(2πf_c t) + Ĥ{m(t)}sin(2πf_c t)
        const modulatedSignal = timeArray.map((t, i) => 
            message[i] * carrier[i] + (isLSB ? -1 : 1) * hilbertMessage[i] * carrierShifted[i]
        );
        
        // Add noise
        const noisySignal = this.addNoise(modulatedSignal, this.snr);
        
        return {
            time: timeArray,
            realSignal: noisySignal,
            imagSignal: hilbertMessage, // Store Hilbert transform for reference
            constellation: null // No constellation for SSB
        };
    }
    
    /**
     * Generate a voice-like signal (sum of sinusoids with different frequencies)
     */
    generateVoiceLikeSignal(timeArray) {
        // Create a voice-like signal with multiple frequency components
        return timeArray.map(t => {
            // Mix a few frequencies with different amplitudes
            return 0.5 * Math.sin(2 * Math.PI * this.messageFreq * t) +
                   0.3 * Math.sin(2 * Math.PI * (this.messageFreq * 1.5) * t) +
                   0.15 * Math.sin(2 * Math.PI * (this.messageFreq * 2.2) * t) +
                   0.05 * Math.sin(2 * Math.PI * (this.messageFreq * 3.7) * t);
        });
    }
    
    /**
     * Approximate Hilbert transform for SSB modulation
     */
    approximateHilbertTransform(signal) {
        // This is a simplified Hilbert transform implementation
        // A true Hilbert would use FFT, but this approximation works for our demo
        const hilbertSignal = new Array(signal.length);
        
        // Simple all-pass filter with 90-degree phase shift
        for (let i = 3; i < signal.length; i++) {
            hilbertSignal[i] = 0.5 * (signal[i] - signal[i-2]);
        }
        
        return hilbertSignal;
    }
    
    /**
     * Generate a signal based on the selected modulation type
     */
    generateSignal(modulationType) {
        switch(modulationType) {
            case 'am':
                return this.generateAM();
            case 'fm':
                return this.generateFM();
            case 'bpsk':
                return this.generateBPSK();
            case 'qpsk':
                return this.generateQPSK();
            case 'fsk':
                return this.generateFSK();
            case 'lsb':
                return this.generateLSB();
            case 'usb':
                return this.generateUSB();
            case 'ssb':
                return this.generateSSB(false); // Default to USB
            default:
                return this.generateAM(); // Default to AM
        }
    }
    
    /**
     * Compute FFT of a signal
     */
    computeFFT(signal) {
        // Simple FFT computation
        // In a real application, we would use a more efficient FFT library
        const fftSize = 1024;
        const fft = new Array(fftSize).fill(0);
        
        // Downsample signal to FFT size
        const downsampleFactor = Math.floor(signal.length / fftSize);
        
        for (let i = 0; i < fftSize; i++) {
            const originalIndex = i * downsampleFactor;
            if (originalIndex < signal.length) {
                fft[i] = signal[originalIndex];
            }
        }
        
        // Compute FFT (simplified - actually just a DFT here)
        const fftResult = new Array(fftSize/2);
        const frequencies = new Array(fftSize/2);
        
        for (let k = 0; k < fftSize/2; k++) {
            let real = 0;
            let imag = 0;
            
            for (let n = 0; n < fftSize; n++) {
                const angle = -2 * Math.PI * k * n / fftSize;
                real += fft[n] * Math.cos(angle);
                imag += fft[n] * Math.sin(angle);
            }
            
            fftResult[k] = Math.sqrt(real*real + imag*imag) / fftSize;
            frequencies[k] = k * this.sampleRate / fftSize;
        }
        
        return { magnitude: fftResult, frequencies: frequencies };
    }
}