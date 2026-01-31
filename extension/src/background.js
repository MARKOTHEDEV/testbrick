/**
 * TestBloc Recorder - Background Service Worker
 *
 * Handles:
 * - Communication with TestBloc app (externally_connectable)
 * - Recording state management
 * - Tab management for recording sessions
 * - Relaying captured steps to backend API
 */

// Recording state
let recordingState = {
  isRecording: false,
  testId: null,
  testName: null,
  baseUrl: null,
  authToken: null,
  recordingTabId: null,
  testBlocTabId: null,
  apiBaseUrl: null,
};

// Badge colors
const BADGE_COLORS = {
  recording: '#ef4444', // red
  idle: '#6b7280',      // gray
};

/**
 * Update extension icon badge to show recording status
 */
function updateBadge() {
  if (recordingState.isRecording) {
    chrome.action.setBadgeText({ text: 'REC' });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.recording });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Save recording state to storage for persistence
 */
async function saveState() {
  await chrome.storage.local.set({ recordingState });
}

/**
 * Load recording state from storage
 */
async function loadState() {
  const result = await chrome.storage.local.get('recordingState');
  if (result.recordingState) {
    recordingState = result.recordingState;
    updateBadge();
  }
}

/**
 * Start a recording session
 */
async function startRecording(config) {
  const { testId, testName, baseUrl, authToken, apiBaseUrl, testBlocTabId } = config;

  // Store recording context
  recordingState = {
    isRecording: true,
    testId,
    testName,
    baseUrl,
    authToken,
    apiBaseUrl,
    testBlocTabId,
    recordingTabId: null,
  };

  // Open new tab to the project's baseUrl
  const tab = await chrome.tabs.create({
    url: baseUrl,
    active: true,
  });

  recordingState.recordingTabId = tab.id;

  await saveState();
  updateBadge();

  // Wait for the tab to fully load before injecting
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
    if (tabId === tab.id && changeInfo.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      injectRecorderUI(tab.id);
    }
  });

  return { success: true, tabId: tab.id };
}

/**
 * Inject the recorder UI into the recording tab
 */
async function injectRecorderUI(tabId) {
  try {
    // Inject the content script with recording context
    await chrome.tabs.sendMessage(tabId, {
      type: 'START_RECORDING',
      payload: {
        testId: recordingState.testId,
        testName: recordingState.testName,
        baseUrl: recordingState.baseUrl,
      },
    });

    console.log('[TestBloc] Recorder UI injected into tab:', tabId);
  } catch (error) {
    console.error('[TestBloc] Failed to inject recorder UI:', error);
  }
}

/**
 * Stop the current recording session
 */
async function stopRecording(source = 'unknown') {
  if (!recordingState.isRecording) {
    return { success: false, error: 'No active recording' };
  }

  const { recordingTabId, testBlocTabId } = recordingState;

  // Notify the recording tab to clean up
  if (recordingTabId) {
    try {
      await chrome.tabs.sendMessage(recordingTabId, {
        type: 'STOP_RECORDING',
      });
    } catch (error) {
      console.log('[TestBloc] Could not notify recording tab:', error.message);
    }
  }

  // Notify the TestBloc app that recording stopped
  if (testBlocTabId) {
    try {
      await chrome.tabs.sendMessage(testBlocTabId, {
        type: 'RECORDING_STOPPED',
        payload: {
          testId: recordingState.testId,
          stoppedBy: source,
        },
      });
    } catch (error) {
      console.log('[TestBloc] Could not notify TestBloc tab:', error.message);
    }
  }

  // Reset state
  recordingState = {
    isRecording: false,
    testId: null,
    testName: null,
    baseUrl: null,
    authToken: null,
    recordingTabId: null,
    testBlocTabId: null,
    apiBaseUrl: null,
  };

  await saveState();
  updateBadge();

  return { success: true };
}

/**
 * Send a captured step to the backend API
 */
async function sendStepToBackend(stepData) {
  if (!recordingState.authToken || !recordingState.apiBaseUrl) {
    console.error('[TestBloc] Missing auth token or API URL');
    return { success: false, error: 'Missing authentication' };
  }

  try {
    const response = await fetch(
      `${recordingState.apiBaseUrl}/tests/${recordingState.testId}/steps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${recordingState.authToken}`,
        },
        body: JSON.stringify(stepData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('[TestBloc] Step saved:', result);

    // Notify TestBloc app about the new step
    if (recordingState.testBlocTabId) {
      try {
        await chrome.tabs.sendMessage(recordingState.testBlocTabId, {
          type: 'STEP_RECORDED',
          payload: result,
        });
      } catch (error) {
        // TestBloc tab might be closed or navigated away
      }
    }

    return { success: true, step: result };
  } catch (error) {
    console.error('[TestBloc] Failed to save step:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TestBloc Background] Message received:', message.type, message);

  switch (message.type) {
    case 'GET_RECORDING_STATE':
      sendResponse(recordingState);
      break;

    case 'STEP_CAPTURED':
      // Content script captured a user action
      sendStepToBackend(message.payload)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'STOP_RECORDING':
      stopRecording(message.source || 'content-script')
        .then(sendResponse);
      return true;

    case 'RECORDING_TAB_CLOSED':
      // The recording tab was closed
      if (recordingState.isRecording) {
        stopRecording('tab-closed');
      }
      break;

    default:
      console.log('[TestBloc] Unknown message type:', message.type);
  }
});

/**
 * Handle messages from external sources (TestBloc web app)
 */
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[TestBloc Background] External message from:', sender.origin, message);

  switch (message.type) {
    case 'PING':
      // TestBloc app checking if extension is installed
      sendResponse({
        installed: true,
        version: chrome.runtime.getManifest().version,
        isRecording: recordingState.isRecording,
      });
      break;

    case 'START_RECORDING':
      startRecording({
        ...message.payload,
        testBlocTabId: sender.tab?.id,
      })
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'STOP_RECORDING':
      stopRecording('testbloc-app')
        .then(sendResponse);
      return true;

    case 'GET_RECORDING_STATE':
      sendResponse(recordingState);
      break;

    default:
      console.log('[TestBloc] Unknown external message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

/**
 * Handle tab removal - stop recording if recording tab is closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  if (recordingState.recordingTabId === tabId && recordingState.isRecording) {
    console.log('[TestBloc] Recording tab closed, stopping recording');
    stopRecording('tab-closed');
  }
});

/**
 * Handle tab updates - re-inject content script on navigation
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    recordingState.isRecording &&
    tabId === recordingState.recordingTabId &&
    changeInfo.status === 'complete'
  ) {
    // Tab navigated, re-inject recorder UI
    console.log('[TestBloc] Recording tab navigated, re-injecting UI');
    injectRecorderUI(tabId);
  }
});

// Initialize on install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TestBloc] Extension installed/updated');
  loadState();
});

// Load state on startup
loadState();
