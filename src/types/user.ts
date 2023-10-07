export type UserUniqueFields = {
    id?: number;
    username?: string;
    email?: string;
};

export type usersCreateInput = {
    username: string
    email: string
    password?: string | null
    verification_code?: string | null
    verificated_at?: Date | string | null
    verification_code_sent_at?: Date | string | null
}

export type UserUpdateInput = {
    username?: string;
    email?: string;
    password?: string | null;
    verification_code?: string | null;
    verificated_at?: Date | null;
    verification_code_sent_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
};