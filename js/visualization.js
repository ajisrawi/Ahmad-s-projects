/**
 * Visualization Module
 * Handles all chart rendering using Chart.js
 */

class SignalVisualizer {
    constructor() {
        this.charts = {
            time: null,
            frequency: null,
            constellation: null,
            waterfall: null
        };
        
        this.waterfallData = [];
        this.maxWaterfallLines = 20;
        this.colorScale = [
            'rgba(0, 0, 50, 1)',
            'rgba(0, 0, 100, 1)',
            'rgba(0, 0, 150, 1)',
            'rgba(0, 50, 150, 1)',
            'rgba(0, 100, 150, 1)',
            'rgba(50, 150, 150, 1)',
            'rgba(100, 200, 150, 1)',
            'rgba(150, 250, 150, 1)',
            'rgba(200, 250, 100, 1)',
            'rgba(250, 250, 50, 1)',
            'rgba(250, 200, 0, 1)',
            'rgba(250, 150, 0, 1)',
            'rgba(250, 100, 0, 1)',
            'rgba(250, 50, 0, 1)',
            'rgba(250, 0, 0, 1)'
        ];
    }
    
    /**
     * Initialize all charts
     */
    initializeCharts() {
        this.initializeTimeChart();
        this.initializeFrequencyChart();
        this.initializeConstellationChart();
        this.initializeWaterfallChart();
    }
    
    /**
     * Initialize time domain chart
     */
    initializeTimeChart() {
        const ctx = document.getElementById('time-domain-chart').getContext('2d');
        
        this.charts.time = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Signal',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disables animation for better performance
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Time (s)',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amplitude',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize frequency domain chart
     */
    initializeFrequencyChart() {
        const ctx = document.getElementById('frequency-domain-chart').getContext('2d');
        
        this.charts.frequency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Spectrum',
                    data: [],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disables animation for better performance
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Frequency (Hz)',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Magnitude (dB)',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize constellation chart
     */
    initializeConstellationChart() {
        const ctx = document.getElementById('constellation-chart').getContext('2d');
        
        this.charts.constellation = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Constellation Points',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disables animation for better performance
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: -1.5,
                        max: 1.5,
                        title: {
                            display: true,
                            text: 'In-Phase (I)',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        }
                    },
                    y: {
                        min: -1.5,
                        max: 1.5,
                        title: {
                            display: true,
                            text: 'Quadrature (Q)',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            color: 'rgba(160, 174, 192, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Initialize waterfall chart
     */
    initializeWaterfallChart() {
        const ctx = document.getElementById('waterfall-chart').getContext('2d');
        
        // Clear waterfall data
        this.waterfallData = [];
        
        this.charts.waterfall = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disables animation for better performance
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Frequency (Hz)',
                            color: '#a0aec0'
                        },
                        ticks: {
                            color: '#a0aec0'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false // Hide Y axis for waterfall
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    },
                    line: {
                        tension: 0
                    }
                }
            }
        });
    }
    
    /**
     * Update time domain chart
     */
    updateTimeChart(signal) {
        // Downsample for better performance
        const downsampleFactor = Math.max(1, Math.floor(signal.time.length / 1000));
        const timeData = [];
        
        for (let i = 0; i < signal.time.length; i += downsampleFactor) {
            timeData.push({
                x: signal.time[i],
                y: signal.realSignal[i]
            });
        }
        
        this.charts.time.data.datasets[0].data = timeData;
        this.charts.time.update();
    }
    
    /**
     * Update frequency domain chart
     */
    updateFrequencyChart(fftData) {
        const freqData = [];
        
        // Convert magnitude to dB
        for (let i = 0; i < fftData.magnitude.length; i++) {
            const magnitudeDb = 20 * Math.log10(Math.max(fftData.magnitude[i], 1e-6));
            freqData.push({
                x: fftData.frequencies[i],
                y: magnitudeDb
            });
        }
        
        this.charts.frequency.data.datasets[0].data = freqData;
        this.charts.frequency.update();
    }
    
    /**
     * Update constellation chart
     */
    updateConstellationChart(constellation) {
        if (!constellation) {
            // Hide constellation chart if not applicable
            document.querySelector('.digital-modulation').style.display = 'none';
            return;
        }
        
        document.querySelector('.digital-modulation').style.display = 'block';
        
        // Create scatter points
        const points = constellation.map(point => ({
            x: point.x,
            y: point.y
        }));
        
        this.charts.constellation.data.datasets[0].data = points;
        this.charts.constellation.update();
    }
    
    /**
     * Update waterfall chart
     */
    updateWaterfallChart(fftData) {
        // Add new spectrum line to the waterfall
        const colors = this.getColorGradient(fftData.magnitude);
        
        // Add new data to the top of the waterfall
        this.waterfallData.unshift({
            data: fftData.magnitude.map((mag, i) => ({ 
                x: fftData.frequencies[i], 
                y: 0 
            })),
            borderColor: colors,
            borderWidth: 2,
            fill: false,
            pointRadius: 0
        });
        
        // Keep only the last N lines
        if (this.waterfallData.length > this.maxWaterfallLines) {
            this.waterfallData = this.waterfallData.slice(0, this.maxWaterfallLines);
        }
        
        // Assign y-values for display (stacking)
        for (let i = 0; i < this.waterfallData.length; i++) {
            const yVal = i / (this.waterfallData.length - 1);
            this.waterfallData[i].data = this.waterfallData[i].data.map(point => ({
                x: point.x,
                y: yVal
            }));
        }
        
        // Update the chart
        this.charts.waterfall.data.datasets = this.waterfallData;
        this.charts.waterfall.options.scales.y.min = 0;
        this.charts.waterfall.options.scales.y.max = 1;
        this.charts.waterfall.update();
    }
    
    /**
     * Map FFT magnitude values to colors
     */
    getColorGradient(magnitudes) {
        // Normalize magnitudes to 0-1 range for color mapping
        const max = Math.max(...magnitudes);
        const min = Math.min(...magnitudes);
        const range = max - min || 1; // Avoid division by zero
        
        const normalizedMags = magnitudes.map(mag => (mag - min) / range);
        
        // Map each magnitude to a color from the color scale
        return normalizedMags.map(normMag => {
            const colorIndex = Math.min(
                Math.floor(normMag * this.colorScale.length),
                this.colorScale.length - 1
            );
            return this.colorScale[colorIndex];
        });
    }
    
    /**
     * Update all charts with new signal data
     */
    updateCharts(signal, fftData) {
        this.updateTimeChart(signal);
        this.updateFrequencyChart(fftData);
        this.updateConstellationChart(signal.constellation);
        this.updateWaterfallChart(fftData);
    }
}