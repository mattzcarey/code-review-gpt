export interface UserBody {
    email: string ,
    userId: string,
    apiKey: string,
    name: string,
    pictureUrl?: string,
    repos?: [],
}

export type GetUserProps = {
    userId: string;
};

export type UpdateUserProps = {
    apiKey: string;
    userId: string;
};