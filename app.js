/**
 * CivicFlow - Global Election Assistant Logic
 * Zero-dependency Architecture 
 */

// Global 2026 Election Dataset
const ELECTION_DATA = {
    'India': {
        name: 'India',
        desc: 'Tamil Nadu/West Bengal State Elections',
        dateStr: '20260423T120000Z/20260423T200000Z',
        dateDisplay: 'April 23, 2026',
        registration: 'Check your local EC website for voter rolls.'
    },
    'USA': {
        name: 'USA',
        desc: 'Midterms',
        dateStr: '20261103T120000Z/20261103T200000Z',
        dateDisplay: 'November 3, 2026',
        registration: '~30 days prior. Check your state deadlines.'
    },
    'Brazil': {
        name: 'Brazil',
        desc: 'General Elections',
        dateStr: '20261004T120000Z/20261004T200000Z',
        dateDisplay: 'October 4, 2026',
        registration: 'Biometric registration usually required in advance.'
    },
    'UK': {
        name: 'UK',
        desc: 'Local Elections',
        dateStr: '20260507T120000Z/20260507T200000Z',
        dateDisplay: 'May 7, 2026',
        registration: 'April 20, 2026'
    }
};

class VoterManager {
    constructor() {
        // App states mapping to percentage completion and DOM node IDs
        this.states = {
            'selection':   { id: 'state-selection', progress: '33%' },
            'eligibility': { id: 'state-eligibility', progress: '66%' },
            'reminder':    { id: 'state-reminder', progress: '100%' }
        };
        
        // Restore persistent state or initialize defaults
        this.currentState = localStorage.getItem('civicFlow_state') || 'selection';
        this.selectedCountry = localStorage.getItem('civicFlow_country') || '';
        
        // Cache DOM elements
        this.liveRegion = document.getElementById('a11y-live-region');
        this.progressBar = document.getElementById('progress-bar');
        this.resetBtn = document.getElementById('reset-flow-btn');
        this.countrySelect = document.getElementById('country-select');
        
        this.continueEligibilityBtn = document.getElementById('continue-eligibility-btn');
        this.continueReminderBtn = document.getElementById('continue-reminder-btn');
        this.finishBtn = document.getElementById('finish-btn');
        this.backBtns = document.querySelectorAll('.state-back-btn');
        this.remindMeBtn = document.getElementById('remind-me-btn');

        // Dynamic Text Elements
        this.domDisplayCountry = document.getElementById('display-country-name');
        this.domRegistrationInfo = document.getElementById('display-registration-info');
        this.domElectionDesc = document.getElementById('display-election-desc');
        this.domElectionDate = document.getElementById('display-election-date');

        this.init();
    }

    init() {
        if (this.selectedCountry) {
            this.countrySelect.value = this.selectedCountry;
            this.populateCountryData(this.selectedCountry);
            this.continueEligibilityBtn.disabled = false;
        }

        this.renderState(this.currentState, true);
        this.bindEvents();
    }

    bindEvents() {
        // Handle dropdown selection
        this.countrySelect.addEventListener('change', (e) => {
            this.selectedCountry = e.target.value;
            localStorage.setItem('civicFlow_country', this.selectedCountry);
            this.populateCountryData(this.selectedCountry);
            this.continueEligibilityBtn.disabled = false;
            this.announce(`Country set to ${this.selectedCountry}`);
        });

        // Forward Progression
        this.continueEligibilityBtn.addEventListener('click', () => {
            if (this.selectedCountry) this.transitionTo('eligibility');
        });

        this.continueReminderBtn.addEventListener('click', () => {
            this.transitionTo('reminder');
        });
        
        this.finishBtn.addEventListener('click', () => {
            this.announce("Voter journey complete. Resetting.");
            this.resetFlow();
        });

        // Backward Progression
        this.backBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetState = e.currentTarget.getAttribute('data-target');
                if (this.states[targetState]) this.transitionTo(targetState);
            });
        });

        // Reset App flow
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetFlow());
        }

        // Google Calendar API Simulation
        if (this.remindMeBtn) {
            this.remindMeBtn.addEventListener('click', () => {
                if (this.selectedCountry) {
                    const link = this.getGoogleCalendarLink(this.selectedCountry);
                    window.open(link, '_blank', 'noopener,noreferrer');
                }
            });
        }
    }

    /**
     * Resets LocalStorage and returns to the initial state safely.
     */
    resetFlow() {
        localStorage.removeItem('civicFlow_state');
        localStorage.removeItem('civicFlow_country');
        this.selectedCountry = '';
        this.countrySelect.value = '';
        this.continueEligibilityBtn.disabled = true;
        this.transitionTo('selection');
        this.announce("Application reset to beginning.");
    }

    /**
     * Fills the DOM with dynamic data from ELECTION_DATA 
     * @param {string} countryKey 
     */
    populateCountryData(countryKey) {
        const data = ELECTION_DATA[countryKey];
        if (!data) return;

        if (this.domDisplayCountry) this.domDisplayCountry.textContent = data.name;
        if (this.domRegistrationInfo) this.domRegistrationInfo.textContent = data.registration;
        if (this.domElectionDesc) this.domElectionDesc.textContent = data.desc;
        if (this.domElectionDate) this.domElectionDate.textContent = data.dateDisplay;
    }

    /**
     * Accessibility: Update aria-live region to notify screen readers
     * @param {string} message 
     */
    announce(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    /**
     * View Transition Manager
     * @param {string} newStateKey 
     */
    transitionTo(newStateKey) {
        if (this.currentState === newStateKey) return;
        this.currentState = newStateKey;
        
        localStorage.setItem('civicFlow_state', this.currentState);
        this.renderState(this.currentState, false);
        
        // Announce new state
        const friendlyName = newStateKey.charAt(0).toUpperCase() + newStateKey.slice(1);
        this.announce(`Moved to ${friendlyName} step.`);
    }

    /**
     * Renders CSS transition classes
     * @param {string} stateKey 
     * @param {boolean} isInitialLoad 
     */
    renderState(stateKey, isInitialLoad = false) {
        const targetStateConfig = this.states[stateKey];
        if (!targetStateConfig) return;

        if (this.progressBar) {
            this.progressBar.style.width = targetStateConfig.progress;
        }

        // Update step labels
        ['selection', 'eligibility', 'reminder'].forEach(step => {
            const el = document.getElementById(`step-label-${step}`);
            if (el) {
                if (step === stateKey) {
                    el.classList.add('font-bold', 'text-primary');
                } else {
                    el.classList.remove('font-bold', 'text-primary');
                }
            }
        });

        Object.values(this.states).forEach(config => {
            const el = document.getElementById(config.id);
            if (!el) return;

            if (config.id === targetStateConfig.id) {
                el.classList.remove('hidden');
                setTimeout(() => {
                    el.classList.add('active');
                }, isInitialLoad ? 0 : 50);
            } else {
                el.classList.remove('active');
                if (!isInitialLoad) {
                    setTimeout(() => {
                         if (this.currentState !== Object.keys(this.states).find(key => this.states[key].id === config.id)) {
                             el.classList.add('hidden');
                         }
                    }, 400); 
                } else {
                     el.classList.add('hidden');
                }
            }
        });
    }

    /**
     * Generates standard Google Calendar parameters based on ELECTION_DATA schema
     * @param {string} country 
     * @returns {string} url
     */
    getGoogleCalendarLink(country) {
        const data = ELECTION_DATA[country];
        if (!data) return '#';

        const action = 'TEMPLATE';
        const text = encodeURIComponent(`Election Day in ${data.name}`);
        const dates = data.dateStr;
        const details = encodeURIComponent(`Remember to vote in the ${data.desc}! Registration info: ${data.registration}`);
        
        return `https://calendar.google.com/calendar/render?action=${action}&text=${text}&dates=${dates}&details=${details}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.civicApp = new VoterManager();
});
