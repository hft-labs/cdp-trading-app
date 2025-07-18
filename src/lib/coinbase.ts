import { generateJwt } from '@coinbase/cdp-sdk/auth';

const key_name = process.env.CDP_API_KEY_ID as string;
const key_secret = process.env.CDP_API_KEY_SECRET as string;

if (!key_name || !key_secret) {
    throw new Error("No API key found");
}

export type CreateRequestParams = {
    request_method: "GET" | "POST";
    request_path: string;
};

export async function createRequest({
    request_method,
    request_path,
}: CreateRequestParams) {
    try {
        const host = "api.developer.coinbase.com";
        const url = `https://${host}${request_path}`;
        const uri = `${request_method} ${host}${request_path}`;

        const jwt = await generateJwt({
            apiKeyId: key_name,
            apiKeySecret: key_secret,
            requestMethod: request_method,
            requestHost: host,
            requestPath: request_path,
            expiresIn: 120 // optional (defaults to 120 seconds)
          });

        return { url, jwt };
    } catch (error) {
        console.error("Error in createRequest:", error);
        throw error;
    }
}