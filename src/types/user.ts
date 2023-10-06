export type User = {
    id?: number;
    username: string;
    email: string;
    password?: string | null;
    verification_code?: string | null;
    verificated_at?: Date | null;
    verification_code_sent_at?: Date | null;
    created_at?: Date;
    updated_at?: Date | null;
};

export type UserUniqueFields = {
    id?: number;
    username?: string;
    email?: string;
};