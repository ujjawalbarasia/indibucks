import { useState, useEffect } from 'react';
import { Analytics } from '../services/analytics';

/**
 * useExperiment Hook
 * 
 * Assigns a user to a variant for a given experiment ID.
 * Persists assignment in localStorage to ensure consistency.
 * 
 * @param {string} experimentId - Unique ID for the experiment
 * @param {string[]} variants - Array of variant names, e.g. ['A', 'B']
 * @returns {string} - The assigned variant
 */
export const useExperiment = (experimentId, variants = ['A', 'B']) => {
    const [variant, setVariant] = useState(null);

    useEffect(() => {
        const storageKey = `EXP_${experimentId}`;
        let assigned = localStorage.getItem(storageKey);

        if (!assigned) {
            // Random assignment
            const randomIndex = Math.floor(Math.random() * variants.length);
            assigned = variants[randomIndex];
            localStorage.setItem(storageKey, assigned);

            // Track exposure only on first assignment
            Analytics.track('EXPERIMENT_EXPOSURE', {
                experimentId,
                variant: assigned
            });
        }

        setVariant(assigned);
    }, [experimentId, variants]);

    return variant;
};
