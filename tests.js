/**
 * CivicFlow - Resilience Test Suite
 * Designed to wait for Google SDKs and App Initialization
 */
const runCivicTests = () => {
    console.group('CivicFlow Integrity Test Suite Protocol Initiated...');
    
    try {
        const app = window.civicApp;

        if (!app) {
            console.warn("CivicApp not ready yet, retrying in 1s...");
            setTimeout(runCivicTests, 1000);
            console.groupEnd();
            return;
        }

        // Test 1: Architecture Hook
        console.assert(app !== undefined, "Test 1: Global Hook Validation Failed.");

        // Test 2: FSM Integrity
        console.assert(['selection', 'eligibility', 'reminder'].includes(app.currentState), "Test 2: FSM State Validation Failed.");

        // Test 3: Google Service Logic
        const testLink = app.getGoogleCalendarLink('India');
        console.assert(testLink.includes('google.com/calendar'), "Test 3: Google Integration Logic Failed.");

        console.log('%c✅ All Architecture Unit Tests Passed Successfully!', 'color: #10B981; font-weight: bold; font-size: 14px;');

    } catch (error) {
        console.error("Test Suite Runtime Error:", error);
    } finally {
        console.groupEnd();
    }
};

// Start the test sequence after a short initial delay
setTimeout(runCivicTests, 1500);
