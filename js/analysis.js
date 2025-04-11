/**
 * Signal Analysis Module
 * Provides AI-powered signal analysis features
 */

class SignalAnalyzer {
    constructor() {
        // Signal knowledge base for educational content
        this.signalInfo = {
            am: {
                name: "Amplitude Modulation (AM)",
                description: "Amplitude modulation varies the amplitude of the carrier wave in proportion to the message signal. It's one of the oldest and simplest modulation techniques.",
                bandwidth: "Twice the highest frequency in the message signal (2 × fm)",
                applications: "AM radio broadcasting (535-1705 kHz), aircraft communication",
                advantages: "Simple to implement and demodulate, requires less precise frequency control",
                disadvantages: "Inefficient power usage, susceptible to noise and interference"
            },
            fm: {
                name: "Frequency Modulation (FM)",
                description: "Frequency modulation varies the frequency of the carrier wave in proportion to the message signal, while keeping the amplitude constant.",
                bandwidth: "Typically 2 × (Δf + fm) where Δf is the peak frequency deviation and fm is the maximum message frequency",
                applications: "FM radio broadcasting (88-108 MHz), police and emergency services communications",
                advantages: "Better noise immunity than AM, higher fidelity audio reproduction",
                disadvantages: "Requires more bandwidth than AM, more complex demodulation"
            },
            bpsk: {
                name: "Binary Phase Shift Keying (BPSK)",
                description: "BPSK changes the phase of the carrier wave between two values (0° and 180°) to represent binary data (0s and 1s).",
                bandwidth: "Approximately equal to the symbol rate",
                applications: "Satellite communications, low-rate wireless systems, deep space telemetry",
                advantages: "Most power-efficient form of PSK, robust against noise and interference",
                disadvantages: "Low spectral efficiency (1 bit per symbol)"
            },
            qpsk: {
                name: "Quadrature Phase Shift Keying (QPSK)",
                description: "QPSK uses four different phase states (45°, 135°, 225°, and 315°) to represent dibits (00, 01, 10, 11).",
                bandwidth: "Approximately equal to the symbol rate",
                applications: "Satellite communications, cellular systems, Wi-Fi, cable modems",
                advantages: "Twice the data rate of BPSK for the same bandwidth, good balance of performance and complexity",
                disadvantages: "More sensitive to phase noise than BPSK"
            },
            fsk: {
                name: "Frequency Shift Keying (FSK)",
                description: "FSK varies the frequency of the carrier wave between two discrete values to represent binary data (0s and 1s).",
                bandwidth: "Approximately 2 × (Δf + symbol rate/2) where Δf is the frequency deviation",
                applications: "Low-frequency radio systems, RFID, early computer modems",
                advantages: "Simple implementation, robust against amplitude variations and distortion",
                disadvantages: "Less spectral efficiency compared to phase-based modulations"
            },
            lsb: {
                name: "Lower Sideband (LSB)",
                description: "LSB is a form of single-sideband modulation that transmits only the lower sideband of the AM signal, suppressing the carrier and upper sideband.",
                bandwidth: "Equal to the bandwidth of the message signal",
                applications: "Amateur radio voice communications, maritime and aviation communications",
                advantages: "More power-efficient than full AM, reduced bandwidth requirements",
                disadvantages: "More complex to generate and demodulate than AM"
            },
            usb: {
                name: "Upper Sideband (USB)",
                description: "USB is a form of single-sideband modulation that transmits only the upper sideband of the AM signal, suppressing the carrier and lower sideband.",
                bandwidth: "Equal to the bandwidth of the message signal",
                applications: "Amateur radio voice communications, military radio, shortwave broadcasting",
                advantages: "More power-efficient than full AM, reduced bandwidth requirements",
                disadvantages: "More complex to generate and demodulate than AM"
            },
            ssb: {
                name: "Single Sideband (SSB)",
                description: "SSB is a form of amplitude modulation that transmits only one sideband (either upper or lower) of the AM signal, suppressing the carrier and the other sideband.",
                bandwidth: "Equal to the bandwidth of the message signal",
                applications: "Amateur radio, maritime and aviation communications, point-to-point radio links",
                advantages: "Most power-efficient form of AM, halves the bandwidth requirement",
                disadvantages: "Requires more complex equipment, receiver must have accurate frequency control"
            }
        };
    }
    
    /**
     * Analyze signal and provide insights
     */
    analyzeSignal(signal, fftData, params) {
        const modulationType = params.modulationType;
        const carrierFreq = params.carrierFreq;
        const symbolRate = params.symbolRate;
        const userSetSnr = params.snr;
        
        // Extract the modulation name
        const modName = this.signalInfo[modulationType]?.name || "Unknown modulation";
        
        // Calculate bandwidth
        const bandwidth = this.estimateBandwidth(fftData, modulationType, symbolRate);
        
        // Estimate SNR from signal
        const measuredSnr = this.estimateSnr(signal.realSignal);
        
        // Generate educational insights
        const insights = this.generateInsights(modulationType, carrierFreq, symbolRate);
        
        return {
            signalType: modName,
            bandwidth: bandwidth.toFixed(1) + " Hz",
            snr: measuredSnr.toFixed(1) + " dB",
            insights: insights
        };
    }
    
    /**
     * Estimate bandwidth of the signal from FFT data
     */
    estimateBandwidth(fftData, modulationType, symbolRate) {
        // Start with theoretical bandwidth calculations
        let bandwidth = 0;
        
        switch(modulationType) {
            case 'am':
                bandwidth = 2 * (symbolRate || 100); // Twice the message frequency
                break;
            case 'fm':
                // Carson's rule: BW = 2(Δf + fm)
                bandwidth = 2 * (100 + (symbolRate || 100));
                break;
            case 'bpsk':
            case 'qpsk':
                // Approximately equal to symbol rate for filtered signals
                bandwidth = symbolRate;
                break;
            case 'fsk':
                // BW ≈ 2Δf + symbol rate
                bandwidth = 2 * 100 + symbolRate;
                break;
            case 'lsb':
            case 'usb':
            case 'ssb':
                bandwidth = symbolRate || 100;
                break;
            default:
                bandwidth = symbolRate || 100;
        }
        
        // Also attempt to measure bandwidth from FFT if available
        if (fftData && fftData.magnitude && fftData.frequencies) {
            // Find the cutoff point where the magnitude falls below a threshold
            const peakMagnitude = Math.max(...fftData.magnitude);
            const threshold = peakMagnitude / 10; // -10 dB from peak
            
            let minFreq = fftData.frequencies[0];
            let maxFreq = fftData.frequencies[0];
            
            for (let i = 0; i < fftData.magnitude.length; i++) {
                if (fftData.magnitude[i] > threshold) {
                    minFreq = Math.min(minFreq, fftData.frequencies[i]);
                    maxFreq = Math.max(maxFreq, fftData.frequencies[i]);
                }
            }
            
            const measuredBandwidth = maxFreq - minFreq;
            
            // Return the measured bandwidth if it seems reasonable
            if (measuredBandwidth > 0 && measuredBandwidth < fftData.frequencies[fftData.frequencies.length - 1] / 2) {
                return measuredBandwidth;
            }
        }
        
        return bandwidth;
    }
    
    /**
     * Estimate SNR from the signal
     */
    estimateSnr(signal) {
        // This is a simplified estimation - in real systems more sophisticated methods are used
        // We'll use the signal's peak-to-RMS ratio as a rough estimate
        
        // Calculate the RMS of the signal
        const signalPower = signal.reduce((sum, sample) => sum + sample * sample, 0) / signal.length;
        const signalRms = Math.sqrt(signalPower);
        
        // Estimate noise by looking at signal fluctuations
        const detrended = new Array(signal.length);
        
        // Detrending - remove the overall signal shape to isolate noise
        for (let i = 4; i < signal.length - 4; i++) {
            const avg = (signal[i-4] + signal[i-2] + signal[i] + signal[i+2] + signal[i+4]) / 5;
            detrended[i] = signal[i] - avg;
        }
        
        // Calculate noise power
        const noisePower = detrended.reduce((sum, val) => sum + val * val, 0) / detrended.length;
        const noiseRms = Math.sqrt(noisePower);
        
        // SNR in dB
        const snrDb = 20 * Math.log10(signalRms / (noiseRms + 1e-10));
        
        return Math.max(0, Math.min(30, snrDb)); // Clamp between 0 and 30 dB
    }
    
    /**
     * Generate educational insights about the signal
     */
    generateInsights(modulationType, carrierFreq, symbolRate) {
        const info = this.signalInfo[modulationType];
        
        if (!info) {
            return "No information available for this modulation type.";
        }
        
        // Generate insights based on the modulation type and parameters
        let insights = `<strong>${info.name}</strong>: ${info.description}<br><br>`;
        
        insights += `<strong>Key Characteristics:</strong><br>`;
        insights += `• Carrier Frequency: ${carrierFreq} Hz<br>`;
        
        if (['bpsk', 'qpsk', 'fsk'].includes(modulationType)) {
            insights += `• Symbol Rate: ${symbolRate} symbols/second<br>`;
        } else {
            insights += `• Message Frequency: ${symbolRate} Hz<br>`;
        }
        
        insights += `• Theoretical Bandwidth: ${info.bandwidth}<br><br>`;
        
        insights += `<strong>Applications:</strong> ${info.applications}<br><br>`;
        
        insights += `<strong>Advantages:</strong> ${info.advantages}<br>`;
        insights += `<strong>Disadvantages:</strong> ${info.disadvantages}<br>`;
        
        return insights;
    }
}