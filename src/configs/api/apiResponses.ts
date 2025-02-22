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
    touramentDetails: any
  tokenString(arg0: string, tokenString: any): unknown
	metadata: ResponseMetadata
	data: T
}
