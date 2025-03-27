document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const dobInput = document.getElementById('dob');
    // Removed countryInput reference
    const saveButton = document.getElementById('save');
    const statusElement = document.getElementById('status');

    // --- Function to display status messages ---
    const showStatus = (message, isError = false) => { /* ... (keep as before) ... */
        statusElement.textContent = message;
        statusElement.className = 'status-message';
        if (message) {
            statusElement.classList.add(isError ? 'error' : 'success');
        }
        if (message) {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'status-message';
            }, 3000);
        }
     };

    // --- Load saved data ---
    chrome.storage.sync.get(['userName', 'userDob'], (data) => { // Removed userCountry
        if (chrome.runtime.lastError) { /* ... (error handling) ... */
             console.error('Error loading data:', chrome.runtime.lastError);
             showStatus('Error loading settings.', true);
             return;
         }
        nameInput.value = data.userName || '';
        dobInput.value = data.userDob || '';
        // Removed country loading
    });

    // --- Save button event listener ---
    saveButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const dob = dobInput.value;
        // Removed country reading

        // --- Input Validation ---
        if (!dob) {
            showStatus('Please enter your Date of Birth.', true);
            return;
        }
        // Removed country validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(dob);
        if (birthDate > today) {
             showStatus('Date of Birth cannot be in the future.', true);
             return;
        }

        // --- Save data ---
        chrome.storage.sync.set({ userName: name, userDob: dob }, () => { // Removed userCountry
            if (chrome.runtime.lastError) { /* ... (error handling) ... */
                 console.error('Error saving data:', chrome.runtime.lastError);
                 showStatus('Error saving settings.', true);
             } else {
                console.log('Settings saved:', { name, dob });
                showStatus('Settings saved successfully!');
            }
        });
    });
});