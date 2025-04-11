/**
 * Main Application Module
 * Initializes and coordinates all components of the Live Signal Lab
 */

// Initialize all components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create instances of our modules
    const signalGenerator = new SignalGenerator();
    const visualizer = new SignalVisualizer();
    const analyzer = new SignalAnalyzer();
    
    // Initialize the charts
    visualizer.initializeCharts();
    
    // Set up event listeners for UI controls
    setupControlListeners();
    
    // Generate initial signal
    generateAndDisplaySignal();
    
    /**
     * Set up event listeners for all controls
     */
    function setupControlListeners() {
        // Generate button
        document.getElementById('generate-btn').addEventListener('click', generateAndDisplaySignal);
        
        // Modulation type change
        document.getElementById('modulation-type').addEventListener('change', updateModulationControls);
        
        // SNR slider
        document.getElementById('snr').addEventListener('input', function() {
            document.getElementById('snr-value').textContent = this.value + ' dB';
        });
        
        // Modulation index slider
        document.getElementById('modulation-index').addEventListener('input', function() {
            document.getElementById('modulation-index-value').textContent = this.value + '%';
        });
        
        // Initial setup of modulation-specific controls
        updateModulationControls();
    }
    
    /**
     * Show/hide controls based on selected modulation type
     */
    function updateModulationControls() {
        const modulationType = document.getElementById('modulation-type').value;
        
        // Hide all modulation-specific controls first
        document.querySelectorAll('.modulation-specific').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show controls for the selected modulation
        switch(modulationType) {
            case 'am':
            case 'fm':
                document.querySelectorAll('.am-controls, .fm-controls').forEach(el => {
                    el.style.display = 'block';
                });
                break;
            case 'fsk':
                document.querySelectorAll('.fsk-controls').forEach(el => {
                    el.style.display = 'block';
                });
                break;
        }
        
        // Show/hide constellation diagram for digital modulations
        const digitalModulations = ['bpsk', 'qpsk', 'fsk'];
        document.querySelectorAll('.digital-modulation').forEach(el => {
            el.style.display = digitalModulations.includes(modulationType) ? 'block' : 'none';
        });
    }
    
    /**
     * Generate a signal and update all visualizations
     */
    function generateAndDisplaySignal() {
        // Gather parameters from UI
        const params = {
            modulationType: document.getElementById('modulation-type').value,
            carrierFreq: parseFloat(document.getElementById('carrier-frequency').value),
            symbolRate: parseFloat(document.getElementById('symbol-rate').value),
            snr: parseFloat(document.getElementById('snr').value),
            modulationIndex: parseFloat(document.getElementById('modulation-index').value) / 100,
            messageFreq: parseFloat(document.getElementById('message-frequency').value),
            frequencyDeviation: parseFloat(document.getElementById('frequency-deviation')?.value || 100)
        };
        
        // Update signal generator parameters
        signalGenerator.updateParameters(params);
        
        // Generate the signal
        const signal = signalGenerator.generateSignal(params.modulationType);
        
        // Compute FFT for frequency domain visualization
        const fftData = signalGenerator.computeFFT(signal.realSignal);
        
        // Update charts
        visualizer.updateCharts(signal, fftData);
        
        // Analyze the signal
        const analysis = analyzer.analyzeSignal(signal, fftData, params);
        
        // Update analysis results
        document.getElementById('signal-type-result').textContent = analysis.signalType;
        document.getElementById('bandwidth-result').textContent = analysis.bandwidth;
        document.getElementById('snr-result').textContent = analysis.snr;
        document.getElementById('educational-insights').innerHTML = analysis.insights;
    }
});