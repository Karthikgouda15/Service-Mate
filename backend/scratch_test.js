const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5002, // The server is running on PORT 5002 as per .env
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const loginData = JSON.parse(data);
        const token = loginData.token;
        console.log("Logged in:", loginData.user.email);
        
        // Now get bookings
        const getBookingsReq = http.request({
            hostname: 'localhost',
            port: 5002,
            path: '/api/bookings/provider/me',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                const bookings = JSON.parse(data2);
                console.log(`Found ${bookings.length} bookings.`);
                const booking = bookings.find(b => b.status === 'pending');
                if (!booking) {
                    console.log("No pending booking found.");
                    process.exit(0);
                }
                
                console.log(`Trying to accept booking: ${booking._id}`);
                const updateReq = http.request({
                    hostname: 'localhost',
                    port: 5002,
                    path: `/api/bookings/${booking._id}/status`,
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }, (res3) => {
                    let data3 = '';
                    res3.on('data', chunk => data3 += chunk);
                    res3.on('end', () => {
                        console.log("Status Code:", res3.statusCode);
                        console.log("Response:", data3);
                        process.exit(0);
                    });
                });
                updateReq.write(JSON.stringify({ status: 'confirmed' }));
                updateReq.end();
            });
        });
        getBookingsReq.end();
    });
});

req.write(JSON.stringify({ email: 'provider@servicemate.com', password: 'provider123' }));
req.end();
