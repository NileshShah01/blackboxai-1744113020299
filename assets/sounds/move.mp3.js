// This would be replaced with actual MP3 file
// For now we'll generate a simple tone
function generateTone(freq, duration) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// Generate different tones for different sounds
const sounds = {
    move: () => generateTone(440, 0.1),
    capture: () => generateTone(220, 0.2),
    check: () => generateTone(880, 0.3),
    gameEnd: () => { generateTone(587.33, 0.2); setTimeout(() => generateTone(493.88, 0.2), 200); }
};

// Export for use in script.js
window.chessSounds = sounds;