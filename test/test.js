const setup2FA = async () => {
    const access = document.cookie.getItem('access');

    try {
        const response = await fetch('http://localhost:81/2fa/setup/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`, // Authorization header with JWT
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('qrCode').src = data.qr_code_image; // Set the QR code image in your HTML
            console.log("tootp");
            console.log('TOTP Secret:', data.totp_secret); // Optionally show the secret
        } else {
            console.error('Failed to set up 2FA:', response.statusText);
        }
    } catch (error) {
        console.error('Error setting up 2FA:', error);
    }
};

const verify2FA = async (otp) => {
    const access = document.cookie.getItem('access');
    

    try {
        const response = await fetch('http://localhost:81/2fa/verify/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp: otp }) // Send the OTP in the request body
        });

        if (response.ok) {
            const data = await response.json();
            console.log('2FA verification successful:', data);
            // You can proceed with further actions after verification
        } else {
            const errorData = await response.json();
            console.error('2FA verification failed:', errorData.error);
        }
    } catch (error) {
        console.error('Error verifying 2FA:', error);
    }
};

