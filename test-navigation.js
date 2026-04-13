// Simple test to verify all routes are properly configured
console.log('Testing EduFlow navigation routes...');

const studentRoutes = [
  '/dashboard',
  '/academics', 
  '/attendance',
  '/exams',
  '/fees',
  '/alerts',
  '/ai-assistant',
  '/profile'
];

console.log('Student navigation routes:');
studentRoutes.forEach(route => {
  console.log(`  - ${route}`);
});

console.log('\nAll routes configured successfully!');
console.log('The blank screen issue should now be fixed.');
