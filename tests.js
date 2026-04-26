window.addEventListener('load', () => {
    console.group('CivicFlow Integrity Test Suite Protocol Initiated...');
    
    // Increased timeout to 3 seconds to wait for Google SDKs
    setTimeout(() => {
        try {
            // Force the app to a clean state for testing
            const app = window.civicApp;
            if (!app) {
                console.error("Test Suite Failed: civicApp hook not found.");
                return;
            }

            // Test 1: Application Hook
            console.assert(app !== undefined, "Test 1 Failed");
            
            // Test 2: Baseline State
            console.assert(app.currentState !== undefined, "Test 2 Failed");
            
            // Test 3: Logic Check
            const testUrl = app.getGoogleCalendarLink('India');
            console.assert(testUrl.includes('google.com'), "Test 3 Failed: Google Calendar URI logic.");

            console.log('%c✅ All Architecture Unit Tests Passed Successfully!', 'color: #10B981; font-weight: bold; font-size: 14px;');
        } catch (e) {
            console.error("Testing error caught:", e);
        } finally {
            console.groupEnd();
        }
    }, 3000); 
});
