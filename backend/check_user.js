const axios = require('axios');

async function testSignup() {
  try {
    const res = await axios.post('http://localhost:4000/api/auth/signup', {
      email: 'aimansuhaimi124@gmail.com',
      password: 'password123',
      name: 'Aiman',
      phone: '0123456789'
    });
    console.log("SUCCESS:", res.data);
  } catch (error) {
    console.error("HTTP STATUS:", error.response?.status);
    console.error("DATA ERROR:", error.response?.data);
    console.error("AXIOS ERROR:", error.message);
  }
}

testSignup();
