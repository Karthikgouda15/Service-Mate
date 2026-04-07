import { create } from 'zustand';

const useLocationStore = create((set) => ({
    coords: { lat: 12.9716, lng: 77.5946 }, // Default: Bangalore center
    address: 'Bangalore, Karnataka',
    isLocationSet: false,
    setCoords: (coords) => set({ coords, isLocationSet: true }),
    setAddress: (address) => set({ address }),
    getUserLocation: () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    set({
                        coords: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        isLocationSet: true
                    });
                },
                (error) => {
                    console.warn('Geolocation error:', error.message);
                    // Keep default Bangalore coords but mark as set so apps can proceed
                    set({ isLocationSet: true });
                },
                { timeout: 5000 }
            );
        } else {
            set({ isLocationSet: true });
        }
    }
}));

export default useLocationStore;
