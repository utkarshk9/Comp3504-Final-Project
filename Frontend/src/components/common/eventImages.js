export const EVENT_IMAGES = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=60'
];

export const getEventImage = (eventName) => {
    const index = eventName ? eventName.charCodeAt(0) % EVENT_IMAGES.length : 0;
    return EVENT_IMAGES[index];
}; 