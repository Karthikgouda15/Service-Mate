import { create } from 'zustand';

const useBookingStore = create((set) => ({
    currentBooking: null,
    setCurrentBooking: (booking) => set({ currentBooking: booking }),
    updateBookingStatus: (status) => set((state) => ({
        currentBooking: state.currentBooking ? { ...state.currentBooking, status } : null
    })),
    clearBooking: () => set({ currentBooking: null })
}));

export default useBookingStore;
