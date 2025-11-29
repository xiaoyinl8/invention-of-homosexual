// ========================================
// ACCESSIBILITY FEATURES JAVASCRIPT
// Text-to-Speech, Font Controls, High Contrast
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // TEXT-TO-SPEECH FUNCTIONALITY
    // ========================================
    
    let currentUtterance = null;
    let isReading = false;
    
    // Function to stop any ongoing speech
    function stopSpeech() {
        window.speechSynthesis.cancel();
        isReading = false;
        
        // Reset all read-aloud buttons
        document.querySelectorAll('.read-aloud-btn').forEach(btn => {
            btn.classList.remove('reading');
            btn.innerHTML = '<span aria-hidden="true">🔊</span> Read Aloud';
        });
        
        // Reset read page button
        const readPageBtn = document.getElementById('read-page-btn');
        if (readPageBtn) {
            readPageBtn.classList.remove('reading');
            readPageBtn.innerHTML = '<span aria-hidden="true">🔊</span> Read Page';
        }
    }
    
    // Function to read text aloud
    function readTextAloud(text, button) {
        // If already reading, stop
        if (isReading) {
            stopSpeech();
            return;
        }
        
        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Set language
        utterance.lang = 'en-US';
        
        // Visual feedback
        button.classList.add('reading');
        button.innerHTML = '<span aria-hidden="true">⏸</span> Stop Reading';
        isReading = true;
        
        // When speech ends
        utterance.onend = function() {
            button.classList.remove('reading');
            button.innerHTML = '<span aria-hidden="true">🔊</span> Read Aloud';
            isReading = false;
        };
        
        // Handle errors
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            stopSpeech();
            alert('Sorry, text-to-speech is not available in your browser or an error occurred.');
        };
        
        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }
    
    // Add read-aloud functionality to gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        const button = item.querySelector('.read-aloud-btn');
        
        if (button) {
            button.addEventListener('click', function() {
                const content = item.querySelector('.gallery-content');
                
                // Extract text content, excluding button text
                const textToRead = Array.from(content.childNodes)
                    .filter(node => {
                        // Exclude the button itself
                        return node !== button && !node.classList?.contains('read-aloud-btn');
                    })
                    .map(node => node.textContent)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                readTextAloud(textToRead, button);
            });
        }
    });
    
    // Read entire page functionality
    const readPageBtn = document.getElementById('read-page-btn');
    if (readPageBtn) {
        readPageBtn.addEventListener('click', function() {
            const mainContent = document.getElementById('main-content');
            
            if (mainContent) {
                // Get all text content from main area, excluding buttons and navigation
                const textToRead = Array.from(mainContent.querySelectorAll('p, h2, h3, h4, li'))
                    .map(el => el.textContent)
                    .join('. ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                readTextAloud(textToRead, readPageBtn);
            }
        });
    }
    
    // Stop speech when navigating away
    window.addEventListener('beforeunload', stopSpeech);
    
    
    // ========================================
    // FONT SIZE CONTROLS
    // ========================================
    
    let fontSize = 100;
    const savedFontSize = localStorage.getItem('fontSize');
    
    if (savedFontSize) {
        fontSize = parseInt(savedFontSize);
        document.documentElement.style.fontSize = fontSize + '%';
    }
    
    document.getElementById('increase-font')?.addEventListener('click', function() {
        fontSize = Math.min(fontSize + 10, 150);
        document.documentElement.style.fontSize = fontSize + '%';
        localStorage.setItem('fontSize', fontSize);
        announceToScreenReader('Font size increased to ' + fontSize + ' percent');
    });
    
    document.getElementById('decrease-font')?.addEventListener('click', function() {
        fontSize = Math.max(fontSize - 10, 80);
        document.documentElement.style.fontSize = fontSize + '%';
        localStorage.setItem('fontSize', fontSize);
        announceToScreenReader('Font size decreased to ' + fontSize + ' percent');
    });
    
    document.getElementById('reset-font')?.addEventListener('click', function() {
        fontSize = 100;
        document.documentElement.style.fontSize = '100%';
        localStorage.setItem('fontSize', fontSize);
        announceToScreenReader('Font size reset to default');
    });
    
    
    // ========================================
    // HIGH CONTRAST MODE
    // ========================================
    
    const contrastToggle = document.getElementById('contrast-toggle');
    
    if (contrastToggle) {
        // Check for saved preference
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
            contrastToggle.innerHTML = '<span aria-hidden="true">◑</span> Normal Contrast';
        }
        
        contrastToggle.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            const isHighContrast = document.body.classList.contains('high-contrast');
            
            this.innerHTML = isHighContrast 
                ? '<span aria-hidden="true">◑</span> Normal Contrast' 
                : '<span aria-hidden="true">◐</span> High Contrast';
            
            localStorage.setItem('highContrast', isHighContrast);
            announceToScreenReader(isHighContrast ? 'High contrast mode enabled' : 'Normal contrast mode enabled');
        });
    }
    
    
    // ========================================
    // KEYBOARD NAVIGATION ENHANCEMENTS
    // ========================================
    
    // Add keyboard support for gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.setAttribute('tabindex', '0');
        
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const link = this.querySelector('.source-link');
                if (link) {
                    e.preventDefault();
                    link.click();
                }
            }
        });
    });
    
    
    // ========================================
    // SCREEN READER ANNOUNCEMENTS
    // ========================================
    
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    
    // ========================================
    // PAUSE ANIMATIONS FOR REDUCED MOTION
    // ========================================
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-speed', '0s');
    }
});
