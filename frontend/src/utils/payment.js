// Placeholder for Payment utilities

export const processPayment = async (amount, currency = 'USD') => {
    console.log(`Processing payment of ${amount} ${currency}`);
    return { success: true, transactionId: 'TXN_' + Date.now() };
};
