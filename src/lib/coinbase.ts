import type { SignOptions } from "jsonwebtoken";
import { sign } from "jsonwebtoken";

const key_name = process.env.CDP_API_KEY_NAME as string;
const key_secret = process.env.CDP_API_KEY_PRIVATE_KEY as string;

if (!key_name || !key_secret) {
    throw new Error("No API key found");
}

function formatPrivateKey(key: string): string {
    if (!key) {
        throw new Error("Private key is undefined or empty");
    }

    const normalizedKey = key.replace(/\\n/g, '\n');
    
    const matches = normalizedKey.match(/-----BEGIN EC PRIVATE KEY-----([\s\S]*?)-----END EC PRIVATE KEY-----/);
    if (!matches) {
        throw new Error("Invalid key format: Missing proper BEGIN/END headers");
    }
    
    const keyContent = matches[1].replace(/[\r\n\s]+/g, '');
    
    const formattedKey = [
        "-----BEGIN EC PRIVATE KEY-----",
        keyContent,
        "-----END EC PRIVATE KEY-----"
    ].join('\n');
    
    
    return formattedKey;
}

export type CreateRequestParams = {
    request_method: "GET" | "POST";
    request_path: string;
};

function generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createRequest({
    request_method,
    request_path,
}: CreateRequestParams) {
    try {
        const host = "api.developer.coinbase.com";
        const url = `https://${host}${request_path}`;
        const uri = `${request_method} ${host}${request_path}`;

        if (!key_secret) {
            throw new Error("CDP_API_KEY_PRIVATE_KEY is not set");
        }

        const payload = {
            iss: "cdp",
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
        };

        const signOptions: SignOptions = {
            algorithm: "ES256",
            header: {
                alg: "ES256",
                kid: key_name,
                // @ts-expect-error: This is a Coinbase-specific header
                nonce: generateNonce(),
            },
        };

        const formattedKey = formatPrivateKey(key_secret);
        const jwt = sign(payload, formattedKey, signOptions);

        return { url, jwt };
    } catch (error) {
        console.error("Error in createRequest:", error);
        throw error;
    }
}