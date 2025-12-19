/**
 * Analytics Service
 * 
 * Centralized place to track user events.
 * Currently logs to console. Replace implementation with PostHog / Mixpanel SDK.
 */

const DEBUG = true; // Set to false in production

const log = (msg, data) => {
    if (DEBUG) {
        console.groupCollapsed(`%c[Analytics] ${msg}`, 'color: #6366f1; font-weight: bold;');
        console.log(data);
        console.groupEnd();
    }
}

export const Analytics = {
    identify: (userId, traits = {}) => {
        log('Identify', { userId, traits });
        // TODO: Mixpanel.identify(userId)
    },

    track: (eventName, properties = {}) => {
        log('Track', { eventName, properties });
        // TODO: Mixpanel.track(eventName, properties)
    },

    page: (pageName, properties = {}) => {
        log('Page View', { pageName, properties });
        // TODO: Mixpanel.track_pageview()
    }
};

export const EVENTS = {
    PAGELINE: 'Page View',
    INDIBUDDY_OPENED: 'IndiBuddy Opened',
    INDIBUDDY_COMPLETED_PROFILE: 'IndiBuddy Completed Profile',
    KYC_STARTED: 'KYC Started',
    KYC_STEP_1_COMPLETED: 'KYC Step 1 Completed',
    KYC_STEP_2_COMPLETED: 'KYC Step 2 Completed',
    KYC_COMPLETED: 'KYC Completed',
    MANDATE_INITIATED: 'Mandate Initiated',
    MANDATE_SUCCESS: 'Mandate Success',
    SIP_INTENT_CREATED: 'SIP Intent Created',
    SIP_ORDER_PLACED: 'SIP Order Placed',
    EXPERIMENT_EXPOSURE: 'Experiment Exposure'
};
