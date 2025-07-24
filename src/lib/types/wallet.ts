import { Types } from 'mongoose';

// Extended Request interface for authenticated users
export interface AuthenticatedRequest extends Request {
    user: {
        _id: string | Types.ObjectId;
        email: string;
        [key: string]: unknown;
    };
}

// Request body interfaces
export interface AddFundsRequest {
    amount: number;
    description?: string;
    userId?: string | Types.ObjectId;
    uuid?: string;
    reference?: string; // Paystack transaction reference

}

export interface DeductFundsRequest {
    amount: number;
    description?: string;
    userId?: string | Types.ObjectId;
    reference?: string; // Unique reference for the transaction
}

// Paystack webhook event interface
export interface PaystackWebhookEvent {
    event: string;
    data: {
        reference: string;
        amount: number;
        customer: {
            email: string;
            [key: string]: unknown;
        };
        metadata: {
            user_id: string;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
}

// Response interfaces

export interface ErrorResponse {
    message: string;
    error?: string;
}
export interface transferRequest {
    name: string,
    account_number: string,
    bank_code: string,
    amount: number, // in naira
    reason: string,
}
export interface transactionRequest {
    reference: string;
    userId?: string | Types.ObjectId; // Optional user ID for additional context    
}

//transaction interface
export interface ITransaction {
    reference: string;
    amount: number;
    type: 'credit' | 'debit';
    date: Date;
    description?: string;
}