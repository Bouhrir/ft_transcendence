// checkJwt
export async function checkJwt() {
	const access = getAccessTokenFromCookies('access');
	const response = await fetch('http://localhost:81/auth/me/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${access}`
		}
	});
	const data = await response.json();
	localStorage.setItem('id', data.id);

	if (response.status === 401) {
		const refresh = getAccessTokenFromCookies('refresh');
		const refreshResponse = await fetch('http://localhost:81/token/refresh/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'refresh':refresh
			}),
		});

		const data = await refreshResponse.json();
		console.log(data);
		if (refreshResponse.ok) {
			document.cookie = `refresh=${data.refresh}; path=/`;
			document.cookie = `access=${data.access}; path=/`;
		} else {
			document.cookie = 'access=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
			document.cookie = 'refresh=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
			window.location.href = '#login';
		}
	}
	else{
		console.log('JWT is valid');
	}
}

export function getAccessTokenFromCookies(token) {
	const cookies = document.cookie.split(';');
	token += '=';
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(token)) {
			return cookie.substring(token.length);
		}
	}
	return null;
}

export function displayMsg(data){
	let Msg = '';
	for (const field in data) {
		if (data.hasOwnProperty(field)) {
			if (Array.isArray(data[field])) {
				Msg += `${field}: ${data[field].join(', ')}\n`;
			} else {
				Msg += `${field}: ${data[field]}\n`;
			}
		}
	}
	return Msg
}