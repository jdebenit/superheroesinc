import { useRef, useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state and interactions
 * Handles dialog ref, fullscreen state, and modal actions
 */
export const useModal = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const openModal = useCallback(() => {
        setIsFullScreen(false); // Reset to normal on open
        dialogRef.current?.showModal();
    }, []);

    const closeModal = useCallback(() => {
        dialogRef.current?.close();
    }, []);

    const toggleFullScreen = useCallback(() => {
        setIsFullScreen(prev => !prev);
    }, []);

    return {
        dialogRef,
        isFullScreen,
        openModal,
        closeModal,
        toggleFullScreen
    };
};
