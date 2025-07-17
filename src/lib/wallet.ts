import { Wallet, IWallet } from '../lib/models/Wallet';
import { ok, created, badRequest, serverError } from "@/lib/response";
import {
  AuthenticatedRequest,
  AddFundsRequest,
  DeductFundsRequest,
  PaystackWebhookEvent,
  ErrorResponse
}
  from '../lib/types/wallet';


// Get wallet for a specific user by userId
export const getWalletForUser = async (userId: string) => {
  try {

    if (!userId) {
      return badRequest('User ID is required');
    }

    const wallet = await Wallet.findOne({ user: userId }).lean();

    if (!wallet) {
      return badRequest('Wallet not found');
    }

    return wallet;
  } catch (err: unknown) {
    console.error('Error fetching wallet for user:', err);
    return serverError('Internal server error: ' + err);
  }
};

export const getWallet = async (req: AuthenticatedRequest,) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).lean();

    if (!wallet) {
      return badRequest('Wallet not found');
    }

    return wallet;
  } catch (error: unknown) {
    console.error('Error fetching wallet:', error);
    return serverError('Error fetching wallet: ' + error);
  }
};

export const createWallet = async (req: AuthenticatedRequest,) => {
  try {
    const walletExists = await Wallet.findOne({ user: req.user._id });

    if (walletExists) {
      return badRequest('Wallet already exists');
    }

    const wallet = new Wallet({ user: req.user._id });
    await wallet.save();

    return created({
      success: true,
      message: 'Wallet created successfully',
      data: wallet
    });
  } catch (error: unknown) {
    console.error('Error creating wallet:', error);
    return serverError('Error creating wallet: ' + error);
  }
};

export const addFunds = async (req: AddFundsRequest) => {
  try {
    const { amount, description = 'Funds added', userId, reference } = req;

    // Validate amount
    if (!amount || amount <= 0) {
      return badRequest('Invalid amount. Amount must be greater than 0');
    }

    if (!userId) {
      return badRequest('User ID is required');
    }

    const wallet = await Wallet.findOne({ user: userId });


    if (!wallet) {
      return badRequest('Wallet not found');
    }

    const amountInNaira = Math.floor(amount / 1);
    wallet.balance += amountInNaira;
    wallet.transactions.push({
      type: 'credit',
      amount: amountInNaira,
      description,
      reference
    });
    wallet.updatedAt = new Date();

    await wallet.save();

    return wallet;
  } catch (error: unknown) {
    console.error('Error adding funds:', error);
    return serverError('Error adding funds: ' + error);
  }
}

export const addFundPaystack = async (
  amount: number,
  reference: string
): Promise<IWallet | ErrorResponse> => {
  try {
    if (!amount || amount <= 0) {
      return { message: 'Invalid amount', error: 'Amount must be greater than 0' };
    }

    if (!reference) {
      return { message: 'Invalid reference', error: 'User reference is required' };
    }

    const wallet = await Wallet.findOne({ user: reference });

    if (!wallet) {
      return { message: 'Wallet not found', error: 'Invalid user reference' };
    }

    const newAmount = Math.floor(amount / 100);
    wallet.balance += newAmount;
    wallet.transactions.push({
      type: 'credit',
      amount: newAmount,
      description: 'Wallet credited via paystack'
    });
    wallet.updatedAt = new Date();

    return await wallet.save();
  } catch (error: unknown) {
    console.error('Error adding funds via Paystack:', error);
    return { message: 'Error adding funds' + error };
  }
};

export const deductFunds = async (req: DeductFundsRequest) => {

  try {
    const { amount, description = 'Funds deducted', userId } = req;

    // Validate amount
    if (!amount || amount <= 0) {
      return badRequest('Invalid amount. Amount must be greater than 0');
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return badRequest('Wallet not found');
    }

    if (wallet.balance < amount) {
      return badRequest('Insufficient balance');
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      description
    });
    wallet.updatedAt = new Date();

    await wallet.save();

    return ok({
      success: true,
      message: 'Funds deducted successfully',
      data: wallet
    });
  } catch (error: unknown) {
    console.error('Error deducting funds:', error);
    return serverError('Error deducting funds: ' + error);
  }
};

export const getTransactions = async (req: AuthenticatedRequest) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return badRequest('Wallet not found');
    }

    return ok({
      success: true,
      message: 'Transactions fetched successfully',
      data: { transactions: wallet.transactions }
    });
  } catch (error: unknown) {
    console.error('Error fetching transactions:', error);
    return serverError('Error fetching transactions: ' + error);
  }
};

// Webhook handler for Paystack
export const paystackWebhook = async (event: PaystackWebhookEvent) => {
  try {

    if (event.event === 'charge.success') {
      const { amount, customer, metadata } = event.data;

      if (!metadata?.user_id) {
        return badRequest('User ID not found in metadata');
      }

      const result = await addFundPaystack(amount, metadata.user_id);

      // Check if result is an error
      if ('message' in result && 'error' in result) {
        console.error(`Payment processing failed for ${customer.email}:`, result.error);
        return serverError('Error processing transaction: ' + result.error);
      }

      console.log(`Payment successful for ${customer.email}, amount: ${amount}`);
      return ok({
        success: true,
        message: 'Transaction processed successfully',
        data: result
      });
    }

    return ok({
      success: true,
      message: 'Event received'
    });
  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    return serverError('Error processing webhook: ' + error);
  }
};

// Utility function to check if result is an error
export const isErrorResponse = (result: IWallet | ErrorResponse): result is ErrorResponse => {
  return 'message' in result && 'error' in result;
};