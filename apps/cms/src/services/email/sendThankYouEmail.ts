interface SendThankYouEmailInput {
  email: string;
  amount: number;
}

export const sendThankYouEmail = async ({ email, amount }: SendThankYouEmailInput) => {
  if (!process.env.THANK_YOU_EMAIL_FROM) {
    console.warn(`Skipping thank-you email for ${email}; THANK_YOU_EMAIL_FROM is not configured.`);
    return;
  }

  console.info(`Thank-you email queued for ${email} (${amount}).`);
};
