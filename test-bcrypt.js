const bcrypt = require('bcrypt');
const hash = '$2b$12$L7R2e/T.yP5C1G.x0v7.ue1K2l0i3/e7uK8Y8.z7g9o8p7q6r5s4t'; // Example hash for 'password'
bcrypt.compare('password', hash).then(res => {
  console.log('Bcrypt comparison result:', res);
  process.exit(0);
}).catch(err => {
  console.error('Bcrypt error:', err);
  process.exit(1);
});
