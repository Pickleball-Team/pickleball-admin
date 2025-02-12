/**
 * Set a value in session storage
 * @param key - The key to set the value under
 * @param value - The value to set
 */
export const setSessionStorage = (key: string, value: unknown) => {
	sessionStorage.setItem(key, JSON.stringify(value))
}

/**
 * Get a value from session storage
 * @param key - The key to get the value for
 * @returns The value stored under the key, or null if not found
 */
export const getSessionStorage = (key: string): unknown => {
	const value = sessionStorage.getItem(key)
	return value ? JSON.parse(value) : null
}

/**
 * Remove a value from session storage
 * @param key - The key to remove the value for
 */
export const removeSessionStorage = (key: string) => {
	sessionStorage.removeItem(key)
}

/**
 * Clear all values from session storage
 */
export const clearSessionStorage = () => {
	sessionStorage.clear()
}
