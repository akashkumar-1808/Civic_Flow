/**
 * CivicFlow - Vanilla ES6 Frontend Application Logic
 * Architecture focuses on keeping bundle size 0 (no dependencies)
 * Priority: Documentation, Clean Code, Accessibility
 */

class VoterJourney {
    constructor() {
        // App states mapping to percentage completion and DOM node IDs
        this.states = {
            'unregistered': { id: 'state-unregistered', progress: '25%' },
            'registered':   { id: 'state-registered', progress: '50%' },
            'informed':     { id: 'state-informed', progress: '75%' },
            'voted':        { id: 'state-voted', progress: '100%' }
        };
        
        // Load persisted state or default to unregistered
        this.currentState = localStorage.getItem('civicFlow_state') || 'unregistered';
        
        // Cache DOM elements
        this.progressBar = document.getElementById('progress-bar');
        this.resetBtn = document.getElementById('reset-flow-btn');
        this.remindMeBtn = document.getElementById('remind-me-btn');
        this.transitionBtns = document.querySelectorAll('.state-transition-btn');

        this.init();
    }

    /**
     * Initialize application logic, bind events and restore state
     */
    init() {
        this.renderState(this.currentState, true);
        this.bindEvents();
    }

    /**
     * Binds all DOM event listeners
     */
    bindEvents() {
        // Handle state transitions via buttons
        this.transitionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetState = e.currentTarget.getAttribute('data-target');
                if (this.states[targetState]) {
                    this.transitionTo(targetState);
                }
            });
        });

        // Reset App flow
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                if(confirm("Are you sure you want to reset your voter journey?")) {
                    this.transitionTo('unregistered');
                }
            });
        }

        // Google Calendar 'Remind Me' Integration
        if (this.remindMeBtn) {
            this.remindMeBtn.addEventListener('click', () => this.generateCalendarLink());
        }
    }

    /**
     * Transitions between states with UI updates
     * @param {string} newStateKey - Target state key ('unregistered', 'registered', etc.)
     */
    transitionTo(newStateKey) {
        if (this.currentState === newStateKey) return;
        this.currentState = newStateKey;
        
        // Persist via LocalStorage
        localStorage.setItem('civicFlow_state', this.currentState);
        
        this.renderState(this.currentState, false);
    }

    /**
     * Updates DOM based on current state
     * @param {string} stateKey - State to render
     * @param {boolean} isInitialLoad - True if rendering on first load to skip transition delays
     */
    renderState(stateKey, isInitialLoad = false) {
        const targetStateConfig = this.states[stateKey];
        if (!targetStateConfig) return;

        // Update Progress Bar
        if (this.progressBar) {
            this.progressBar.style.width = targetStateConfig.progress;
        }

        // Handle active/hide classes for smooth transitions
        Object.values(this.states).forEach(config => {
            const el = document.getElementById(config.id);
            if (!el) return;

            if (config.id === targetStateConfig.id) {
                // Show new state
                el.classList.remove('hidden');
                // Small timeout to allow display:block to apply before animating opacity
                setTimeout(() => {
                    el.classList.add('active');
                }, isInitialLoad ? 0 : 50);
            } else {
                // Hide other states
                el.classList.remove('active');
                // Wait for fade out animation to finish before applying hidden
                if (!isInitialLoad) {
                    setTimeout(() => {
                         if (this.currentState !== Object.keys(this.states).find(key => this.states[key].id === config.id)) {
                             el.classList.add('hidden');
                         }
                    }, 400); // Matches CSS transition duration
                } else {
                     el.classList.add('hidden');
                }
            }
        });
    }

    /**
     * Generates and opens a dynamic Google Calendar Event Link
     * No API required. Generates standard url params based on dates.
     */
    generateCalendarLink() {
        // Set an arbitrary election date (e.g. November 3, current year)
        const year = new Date().getFullYear();
        const electionDate = `${year}1103T120000Z`; // Format: YYYYMMDDThhmmssZ
        const endDate = `${year}1103T200000Z`;
        
        const details = {
            action: 'TEMPLATE',
            text: encodeURIComponent('Election Day - Go Vote!'),
            dates: `${electionDate}/${endDate}`,
            details: encodeURIComponent('Reminder to head to the polls. Check CivicFlow for your ballot details.'),
            location: encodeURIComponent('Your Local Polling Station')
        };

        const gCalUrl = `https://calendar.google.com/calendar/render?action=${details.action}&text=${details.text}&dates=${details.dates}&details=${details.details}&location=${details.location}`;
        
        // Open in new tab
        window.open(gCalUrl, '_blank', 'noopener,noreferrer');
    }
}

// Bootstrap Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VoterJourney();
});
