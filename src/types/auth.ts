export type loginPayload = {
    email?: string;
    password?: string;
    refresh_token?: string;
}

export type verifyEmailPayload = {
    email: string,
    verification_code: string
}

export type verifyEmailResponse = {
    token: string,
    msg: string
}

export type resendVerificationEmailPayload = {
    email: string
}

export type changeUserPasswordBody = {
    token: string,
    password: string
}

export type changeUserPasswordResponse = {
    msg: string;
}