// mobileDetection.js

let _isMobile = window.innerWidth < 600; // Adjust the threshold as needed

const handleResize = () => {
  _isMobile = window.innerWidth < 600; // Adjust the threshold as needed
};

window.addEventListener('resize', handleResize);

export const isMobile = () => _isMobile;
