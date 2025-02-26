// Set a cookie
function setCookie(
	name: string,
	value: string,
	minutes: number,
	options?: {
		httpOnly?: boolean
		secure?: boolean
		// path?: string
		// domain?: string
		// sameSite?: 'strict' | 'lax' | 'none'
	}
) {
	const date = new Date()
	date.setTime(date.getTime() + minutes * 60 * 60 * 1000)
	const expires = 'expires=' + date.toUTCString()
	let cookie = name + '=' + value + ';' + expires + ';path=/'
	if (options?.httpOnly) cookie += ';HttpOnly'
	if (options?.secure) cookie += ';Secure'
	document.cookie = cookie
}

// Get a cookie
function getCookie(name: string) {
	const cookieName = name + '='
	const decodedCookie = decodeURIComponent(document.cookie)
	const cookieArray = decodedCookie.split(';')
	for (let i = 0; i < cookieArray.length; i++) {
		let cookie = cookieArray[i]
		while (cookie.charAt(0) === ' ') {
			cookie = cookie.substring(1)
		}
		if (cookie.indexOf(cookieName) === 0) {
			return cookie.substring(cookieName.length, cookie.length)
		}
	}
	return ''
}

// Delete a cookie
function deleteCookie(name: string) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}
