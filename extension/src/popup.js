/**
 * TestBloc Recorder - Popup Script
 *
 * Handles popup UI interactions and displays recording status
 */

// DOM Elements
const recordingState = document.getElementById('recording-state');
const idleState = document.getElementById('idle-state');
const stopButton = document.getElementById('stop-button');
const testNameEl = document.getElementById('test-name');

/**
 * Update the UI based on recording state
 */
function updateUI(state) {
  if (state.isRecording) {
    recordingState.classList.remove('hidden');
    stopButton.classList.remove('hidden');
    idleState.classList.add('hidden');
    testNameEl.textContent = state.testName || 'Unknown Test';
  } else {
    recordingState.classList.add('hidden');
    stopButton.classList.add('hidden');
    idleState.classList.remove('hidden');
  }
}

/**
 * Fetch current recording state from background script
 */
async function fetchRecordingState() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATE' });
    updateUI(state);
  } catch (error) {
    console.error('[TestBloc Popup] Error fetching state:', error);
    updateUI({ isRecording: false });
  }
}

/**
 * Stop the current recording
 */
async function handleStopRecording() {
  stopButton.disabled = true;
  stopButton.textContent = 'Stopping...';

  try {
    await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
      source: 'popup',
    });

    // Update UI immediately
    updateUI({ isRecording: false });
  } catch (error) {
    console.error('[TestBloc Popup] Error stopping recording:', error);
    stopButton.disabled = false;
    stopButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2"/>
      </svg>
      Stop Recording
    `;
  }
}

// Event listeners
stopButton.addEventListener('click', handleStopRecording);

// Listen for state changes from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'RECORDING_STATE_CHANGED') {
    updateUI(message.payload);
  }
});

// Initial state fetch
fetchRecordingState();
