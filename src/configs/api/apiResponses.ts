export type ApiResponseError = {
	message: string
	code: string
	action: string
	title: string
	errorType: string
}

export type ResponseMetadata = {
	status: number
	success: boolean
	message?: string
	error?: ApiResponseError
}

export type ApiResponse<T = undefined> = {
	metadata: ResponseMetadata
	data: T
}
